import { KafkaManager } from "./kafkaManager";
import { Category, Market, MarketStatus, User } from "./types/inMemoryDb";
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const secretKey = process.env.JWT_SECRET || "secretKey"

export class Engine {
    private static instance: Engine
    private usesrMap: Map<string, User>
    private marketsMap: Map<string, Market>
    private categoriesMap: Map<string, Category>

    private constructor() {
        this.usesrMap = new Map()
        this.marketsMap = new Map()
        this.categoriesMap = new Map()
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Engine()
        }
        return this.instance
    }

    private findUserByEmail(email: string): User | null {
        for (const user of this.usesrMap.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    private findUserByUsername(username: string): User | null {
        for (const user of this.usesrMap.values()) {
            if (user.username === username) {
                return user;
            }
        }
        return null;
    }
    private verifyTokenAndGetUserId(token: string): string {
        try {
            const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
            if (!decoded.userId) {
                throw new Error('Invalid token: missing user ID');
            }

            const user = this.usesrMap.get(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            return decoded.userId;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    private getCategoryfromTitle(title: string) {
        const category = Array.from(this.categoriesMap.values()).find(c => c.title === title)
        return category;
    }

    public async processReq(request: any) {
        try {
            switch (request.type) {
                case 'signup':
                    await this.handleSignUp(request);
                    break;
                case 'login':
                    await this.handleLogin(request);
                    break;
                case 'get_all_markets':
                    await this.handleGetAllMarkets(request);
                    break;
                case 'get_market':
                    await this.handleGetMarket(request);
                    break;
                case 'create_market':
                    await this.handleCreateMarket(request);
                    break;
                case 'create_category':
                    await this.handleCreateCategory(request)
                default:
                    throw new Error(`Unsupported request type: ${(request as any).type}`);
            }

        } catch (error) {
            console.error('Error processing request:', error);
            throw error;
        }
    }

    private async handleCreateCategory(request: any) {
        const { correlationId } = request;
        const { token, title, icon, description } = request.payload
        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const db_user = this.usesrMap.get(userId);
            if (!db_user) {
                throw new Error('user not found in the database')
            }
            if (db_user.role !== "admin") {
                throw new Error("only admins have the permission to create a market ")
            }
            const db_category = this.getCategoryfromTitle(title);
            if (db_category) {
                throw new Error("category already exists")
            }
            const categoryId = uuidv4()
            const newCategory: Category = {
                id: categoryId,
                title,
                icon,
                description
            }
            this.categoriesMap.set(categoryId, newCategory)

            const responsePayload = {
                type: 'create_category_response',
                data: {
                    success: true,
                    categoryId,
                    message: "Category created successfully!"
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'create_category_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleCreateMarket(request: any) {
        const { correlationId } = request;
        const { token, symbol, endTime, description, sourceOfTruth, categoryTitle } = request.payload;

        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const db_user = this.usesrMap.get(userId);
            if (!db_user) {
                throw new Error('user not found in the database')
            }
            if (db_user.role !== "admin") {
                throw new Error("only admins have the permission to create a market ")
            }
            const db_category = this.getCategoryfromTitle(categoryTitle)
            if (!db_category) {
                throw new Error("Ctegory not found")
            }
            const marketId = uuidv4()
            const newMarket: Market = {
                id: marketId,
                symbol,
                endTime,
                description,
                sourceOfTruth,
                categoryId: db_category.id,
                status: MarketStatus.active
            }
            this.marketsMap.set(marketId, newMarket)

            const responsePayload = {
                type: 'create_market_response',
                data: {
                    success: true,
                    marketId,
                    message: "Market created successfully"
                }
            }

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        } catch (error) {
            const responsePayload = {
                type: 'create_market_response',
                data: {
                    success: false,
                    message: "Market creation failed"
                }
            }

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetMarket(request: any) {
        const { correlationId } = request;
        const { token, marketSymbol } = request.payload;

        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const market = Array.from(this.marketsMap.values()).find(m => m.symbol === marketSymbol);

            if (!market) {
                const responsePayload = {
                    type: 'get_market_response',
                    data: {
                        success: false,
                        message: `Market with symbol "${marketSymbol}" not found.`
                    }
                };

                await KafkaManager.getInstance().sendToApi({
                    topic: 'responses',
                    messages: [{
                        key: correlationId,
                        value: JSON.stringify(responsePayload)
                    }]
                });
                return;
            }

            const responsePayload = {
                type: 'get_market_response',
                data: {
                    success: true,
                    market: market,
                    message: "Market retrieved successfully!"
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'get_market_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleGetAllMarkets(request: any) {
        const { correlationId } = request
        const { token } = request.payload;
        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const markets = Array.from(this.marketsMap.values());

            const responsePayload = {
                type: 'get_all_markets_response',
                data: {
                    success: true,
                    markets,
                    message: "Markets retrieved successfully!"
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'get_all_markets_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            };

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleSignUp(request: any) {
        const { correlationId } = request
        const { username, email, password, role } = request.payload;
        console.log("correlationId", correlationId)
        try {
            if (this.findUserByUsername(username)) {
                throw new Error('Username already exists')
            }
            if (this.findUserByEmail(email)) {
                throw new Error('Email already registered')
            }
            const userId = uuidv4()
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser: User = {
                id: userId,
                username,
                email,
                password: hashedPassword,
                role,
                balance: {
                    INR: {
                        available: 0,
                        locked: 0
                    },
                    stocks: {}
                }
            }
            this.usesrMap.set(userId, newUser)
            const responsePayload = {
                type: 'signup_response',
                data: {
                    success: true,
                    userId,
                    message: "Signed up successfully!"
                }
            }

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error ocurred'
            const responsePayload = {
                type: 'signup_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            }
            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleLogin(request: any) {
        const { correlationId } = request;

        const { email, password } = request.payload;
        try {
            const db_user = this.findUserByEmail(email)
            if (!db_user) {
                throw new Error("User does not exist. You may need to signup first.");
            }
            const passwordMatched = await bcrypt.compare(password, db_user.password)
            if (!passwordMatched) {
                throw new Error("Incorrect Password")
            }

            const token = jwt.sign({ userId: db_user.id }, secretKey)

            const responsePayload = {
                type: 'login_response',
                data: {
                    success: true,
                    token,
                    message: "Logged in successfully!"
                }
            }

            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error ocurred'
            const responsePayload = {
                type: 'login_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            }
            await KafkaManager.getInstance().sendToApi({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }
}