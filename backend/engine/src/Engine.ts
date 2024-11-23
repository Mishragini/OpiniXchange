import { KafkaManager } from "./kafkaManager";
import { Category, Market, MarketStatus, Order, Orderbook, OrderStatus, Side, User } from "./types/inMemoryDb";
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const secretKey = process.env.JWT_SECRET || "secretKey"

export class Engine {
    private static instance: Engine
    private usersMap: Map<string, User>
    private marketsMap: Map<string, Market>
    private categoriesMap: Map<string, Category>
    private buyOrders: Map<string, Order[]>;
    private sellOrders: Map<string, Order[]>;

    private constructor() {
        this.usersMap = new Map()
        this.marketsMap = new Map()
        this.categoriesMap = new Map()
        this.buyOrders = new Map()
        this.sellOrders = new Map()
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Engine()
        }
        return this.instance
    }

    private findUserByEmail(email: string): User | null {
        for (const user of this.usersMap.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    private findUserByUsername(username: string): User | null {
        for (const user of this.usersMap.values()) {
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

            const user = this.usersMap.get(decoded.userId);
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

    private async sendMarketUpdate(market: Market) {
        console.log(`inside sendMarketUpdate`)
        const category = this.categoriesMap.get(market.categoryId);

        const marketUpdate = {
            type: 'market_update',
            marketSymbol: market.symbol,
            data: {
                status: market.status,
                lastPrice: market.status,
                totalVolume: market.totalVolume,
                category
            }
        }
        await KafkaManager.getInstance().sendToKafkaStream({
            topic: 'market-updates',
            messages: [{
                key: market.symbol,
                value: JSON.stringify(marketUpdate)
            }]
        })
        console.log(`market update sent `)
    }

    private createOrderbookData(symbol: string) {
        const sellOrders = this.sellOrders.get(symbol) || [];

        const yesOrders = sellOrders.filter(order => order.side === Side.YES && order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.FILLED);
        const noOrders = sellOrders.filter(order => order.side === Side.NO && order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.FILLED);

        const yesOrderBook: Orderbook = {};
        const noOrderBook: Orderbook = {};

        for (const order of yesOrders) {
            const price = order.price;
            if (!yesOrderBook[price]) {
                yesOrderBook[price] = { quantity: 0 };
            }
            yesOrderBook[price].quantity += order.remainingQty;
        }

        for (const order of noOrders) {
            const price = order.price;
            if (!noOrderBook[price]) {
                noOrderBook[price] = { quantity: 0 };
            }
            noOrderBook[price].quantity += order.remainingQty;
        }

        return {
            yesOrderBook,
            noOrderBook
        };
    }

    private async sendOrderbookUpdate(symbol: string) {
        const orderbookData = this.createOrderbookData(symbol);

        const orderbookUpdate = {
            type: 'orderbook_update',
            data: {
                success: true,
                marketSymbol: symbol,
                data: orderbookData
            }
        };

        await KafkaManager.getInstance().sendToKafkaStream({
            topic: 'orderbook-updates',
            messages: [{
                key: symbol,
                value: JSON.stringify(orderbookUpdate)
            }]
        })
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
                case 'get_all_categories':
                    await this.handleGetAllCategories(request);
                    break;
                case 'get_market':
                    await this.handleGetMarket(request);
                    break;
                case 'create_market':
                    await this.handleCreateMarket(request);
                    break;
                case 'create_category':
                    await this.handleCreateCategory(request);
                    break;
                case 'onramp_inr':
                    await this.handleOnrampInr(request);
                    break;
                case 'buy':
                    await this.handleBuy(request);
                    break;
                case 'sell':
                    await this.handleSell(request);
                    break;
                case 'get_orderbook':
                    await this.handleGetOrderbook(request);
                    break;
                case 'mint':
                    await this.handleMint(request);
                    break;
                case 'get_me':
                    await this.handleGetMe(request);
                    break;
                case 'cancel_buy_order':
                    await this.handleCancelBuyOrder(request);
                    break;
                case 'cancel_sell_order':
                    await this.handleCancelSellOrder(request);
                    break;
                case 'get_user_market_orders':
                    await this.handleGetUserOrders(request);
                    break;
                default:
                    throw new Error(`Unsupported request type: ${(request as any).type}`);
            }

        } catch (error) {
            console.error('Error processing request:', error);
            throw error;
        }
    }

    private async handleGetUserOrders(request: any) {
        const { correlationId } = request;
        const { token, marketSymbol } = request.payload;

        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const userBuyMarketOrders = this.buyOrders.get(marketSymbol)?.filter(order => order.userId === userId);



            const userSellMarketOrders = this.sellOrders.get(marketSymbol)?.filter(order => order.userId === userId);

            const responsePayload = {
                type: "get_user_market_orders_response",
                data: {
                    success: true,
                    userBuyMarketOrders,
                    userSellMarketOrders,
                    message: 'Orders fetched successfully'
                }
            }
            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        } catch (error) {
            const responsePayload = {
                type: "get_user_market_orders_response",
                data: {
                    success: false,
                    message: 'Failed to fetch orders.'
                }
            }
            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleCancelBuyOrder(request: any) {
        const { correlationId } = request;
        const { token, orderId, marketSymbol } = request.payload;
        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const user = this.usersMap.get(userId);
            if (!user) {
                throw new Error("User not found");

            }

            const orderToCancel = this.buyOrders.get(marketSymbol)
                ?.find(order => order.id === orderId && order.userId === userId)
            if (!orderToCancel) {
                throw new Error("Order to cancel not found.");
            }
            const refund = orderToCancel.price * orderToCancel.remainingQty;
            user.balance.INR.available += refund;
            user.balance.INR.locked -= refund;

            orderToCancel.status = OrderStatus.CANCELLED;

            const responsePayload = {
                type: 'cancel_buy_order_response',
                data: {
                    success: true,
                    cancelledOrderId: orderId,
                    message: `Cancelled order ${orderId} successfully`,
                    buyOrders: this.buyOrders.values()
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            const responsePayload = {
                type: 'cancel_buy_order_response',
                data: {
                    success: false,
                    message: `Failed to cancel the order`,
                    error: errorMessage
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleCancelSellOrder(request: any) {
        const { correlationId } = request;
        const { token, orderId, marketSymbol } = request.payload;
        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const user = this.usersMap.get(userId);
            if (!user) {
                throw new Error("User not found");

            }

            const orderToCancel = this.sellOrders.get(marketSymbol)
                ?.find(order => order.id === orderId && order.userId === userId)
            if (!orderToCancel) {
                throw new Error("Order to cancel not found.");
            }
            const refund = orderToCancel.remainingQty;
            user.balance.stocks[marketSymbol as string][orderToCancel.side as Side]!.quantity += refund;
            user.balance.stocks[marketSymbol as string][orderToCancel.side as Side]!.locked -= refund;

            orderToCancel.status = OrderStatus.CANCELLED;

            await this.sendOrderbookUpdate(marketSymbol)
            const responsePayload = {
                type: 'cancel_sell_order_response',
                data: {
                    success: true,
                    cancelledOrderId: orderId,
                    message: `Cancelled order ${orderId} successfully`,
                    sellOrders: this.sellOrders.values()
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            const responsePayload = {
                type: 'cancel_sell_order_response',
                data: {
                    success: false,
                    message: `Failed to cancel the order`,
                    error: errorMessage
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetOrderbook(request: any) {
        const { correlationId } = request;
        const { token, symbol } = request.payload;

        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const market = Array.from(this.marketsMap.values()).find(m => m.symbol === symbol && m.status === MarketStatus.ACTIVE);
            if (!market) {
                throw new Error(`Active market ${symbol} not found`);
            }

            const orderbookData = this.createOrderbookData(symbol);

            const responsePayload = {
                type: 'get_orderbook_response',
                data: {
                    success: true,
                    data: orderbookData
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'get_orderbook_response',
                data: {
                    success: false,
                    data: {
                        message: 'Failed to get orderbook',
                        error: errorMessage
                    }
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }
    private async handleSell(request: any) {
        const { correlationId } = request;
        const { token, symbol, quantity, price, stockType } = request.payload;
        const priceInPaise = price * 100

        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const seller = this.usersMap.get(userId);
            if (!seller) {
                throw new Error("seller not found in the database");
            }

            if (!seller.balance.stocks) {
                seller.balance.stocks = {};
            }

            if (!seller.balance.stocks[symbol]) {
                seller.balance.stocks[symbol] = {};
            }

            const stockBalance = seller.balance.stocks[symbol];
            const stockTypeKey = stockType as Side;

            if (!stockBalance[stockTypeKey]) {
                stockBalance[stockTypeKey] = {
                    quantity: 0,
                    locked: 0
                };
            }


            const market = Array.from(this.marketsMap.values()).find(m => m.symbol === symbol && m.status === MarketStatus.ACTIVE)

            if (!market) {
                throw new Error(`Active market with symbol ${symbol} not found`);
            }

            const sellerStockBalance = seller.balance.stocks[symbol][stockType as Side];
            if (!sellerStockBalance || sellerStockBalance.quantity < quantity) {
                throw new Error("You don't have sufficient stocks to sell");
            }

            const sellOrder: Order = {
                id: uuidv4(),
                userId,
                marketSymbol: symbol,
                side: stockType as Side,
                quantity,
                remainingQty: quantity,
                price: priceInPaise,
                status: OrderStatus.PENDING,
                timestamp: new Date()
            }

            sellerStockBalance.quantity -= quantity;
            sellerStockBalance.locked += quantity;

            let matchingResult = {
                filledQty: 0,
                totalValue: 0,
                matches: [] as Array<{ quantity: number, price: number }>
            }

            const buyOrders = this.buyOrders.get(symbol) || [];
            const matchingBuyOrders = buyOrders?.filter(order =>
                order.side === stockType &&
                order.price >= priceInPaise &&
                order.status !== OrderStatus.FILLED &&
                order.status !== OrderStatus.CANCELLED &&
                order.userId !== userId
            ).sort((a, b) => b.price - a.price)

            for (const buyOrder of matchingBuyOrders) {
                if (sellOrder.remainingQty === 0) break;
                const matchedQuantity = Math.min(buyOrder.remainingQty, sellOrder.remainingQty);
                const matchPrice = buyOrder.price;

                sellOrder.remainingQty -= matchedQuantity;

                buyOrder.remainingQty -= matchedQuantity;
                if (buyOrder.remainingQty === 0) {
                    buyOrder.status = OrderStatus.FILLED;
                } else {
                    buyOrder.status = OrderStatus.PARTIALLY_FILLED;
                }

                const buyer = this.usersMap.get(buyOrder.userId);
                if (!buyer) {
                    throw new Error("Could not find Buyer");
                }
                const matchValue = matchPrice * matchedQuantity;

                seller.balance.INR.available += matchValue;
                buyer.balance.INR.locked -= matchValue;

                if (!buyer.balance.stocks[symbol]) {
                    buyer.balance.stocks[symbol] = {}
                }

                if (!buyer.balance.stocks[symbol][stockType as Side]) {
                    buyer.balance.stocks[symbol][stockType as Side] = {
                        quantity: 0,
                        locked: 0
                    }
                }
                buyer.balance.stocks[symbol][stockType as Side]!.quantity += matchedQuantity
                sellerStockBalance.locked -= matchedQuantity;

                matchingResult.filledQty += matchedQuantity;
                matchingResult.totalValue += matchValue;
                matchingResult.matches.push({ quantity: matchedQuantity, price: matchPrice / 100 });

                if (buyOrder.remainingQty === 0) {
                    buyOrder.status = OrderStatus.FILLED;
                } else {
                    buyOrder.status = OrderStatus.PARTIALLY_FILLED
                }
            }

            if (sellOrder.remainingQty === 0) {
                sellOrder.status = OrderStatus.FILLED
            } else {
                if (matchingResult.matches.length > 0) {
                    sellOrder.status = OrderStatus.PARTIALLY_FILLED;
                }
                const existingSellOrders = this.sellOrders.get(symbol) || [];
                existingSellOrders.push(sellOrder);
                this.sellOrders.set(symbol, existingSellOrders)
                await this.sendOrderbookUpdate(symbol)
            }

            const responsePayload = {
                type: 'sell_response',
                data: {
                    success: true,
                    seller,
                    sellOrder,
                    filledQuantity: matchingResult.filledQty,
                    totalValue: matchingResult.totalValue,
                    matches: matchingResult.matches
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        } catch (error) {
            const responsePayload = {
                type: 'sell_response',
                data: {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to process sell order'
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleBuy(request: any) {
        const { correlationId } = request;
        const { token, symbol, quantity, price, stockType } = request.payload;
        const priceInPaise = price * 100

        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const user = this.usersMap.get(userId);
            if (!user) {
                throw new Error('User not found')
            }

            const market = Array.from(this.marketsMap.values())
                .find(m => m.symbol === symbol);

            if (!market) {
                throw new Error('Market not found')
            }
            if (market.status !== MarketStatus.ACTIVE) {
                throw new Error('Market is not active');
            }

            const requiredFunds = quantity * priceInPaise;
            if (user.balance.INR.available < requiredFunds) {
                throw new Error("Insufficient funds");
            }

            const buyOrder: Order = {
                id: uuidv4(),
                userId,
                marketSymbol: symbol,
                side: stockType as Side,
                quantity,
                remainingQty: quantity,
                price: priceInPaise,
                status: OrderStatus.PENDING,
                timestamp: new Date()
            }
            user.balance.INR.available -= requiredFunds;
            user.balance.INR.locked += requiredFunds;

            let matchingResult = {
                filledQty: 0,
                totalValue: 0,
                matches: [] as Array<{ quantity: number, price: number }>
            }

            const sellOrders = this.sellOrders.get(symbol) || [];
            const matchedSellOrders = sellOrders
                .filter(order =>
                    order.side === stockType &&
                    order.price <= priceInPaise &&
                    order.status !== OrderStatus.FILLED &&
                    order.status !== OrderStatus.CANCELLED &&
                    order.userId !== userId
                ).sort((a, b) => a.price - b.price)

            for (const sellOrder of matchedSellOrders) {
                if (buyOrder.remainingQty === 0) break;
                const matchedQuantity = Math.min(sellOrder.remainingQty, buyOrder.remainingQty);
                const matchPrice = sellOrder.price;

                sellOrder.remainingQty -= matchedQuantity;
                if (sellOrder.remainingQty === 0) {
                    sellOrder.status = OrderStatus.FILLED;
                } else {
                    sellOrder.status = OrderStatus.PARTIALLY_FILLED;
                }
                buyOrder.remainingQty -= matchedQuantity;

                const seller = this.usersMap.get(sellOrder.userId);
                const matchValue = matchPrice * matchedQuantity;

                if (!user.balance.stocks[symbol]) {
                    user.balance.stocks[symbol] = {}
                }

                if (!user.balance.stocks[symbol][stockType as Side]) {
                    user.balance.stocks[symbol][stockType as Side] = {
                        quantity: 0,
                        locked: 0
                    }
                }

                const sellerPosition = seller?.balance.stocks[symbol]?.[stockType as Side];
                if (!sellerPosition) {
                    throw new Error('Seller position not found');
                }

                user.balance.stocks[symbol][stockType as Side]!.quantity += matchedQuantity;
                sellerPosition.locked -= matchedQuantity;

                user.balance.INR.locked -= matchValue;
                seller.balance.INR.available += matchValue;

                matchingResult.filledQty += matchedQuantity;
                matchingResult.totalValue += matchValue;
                matchingResult.matches.push({ quantity: matchedQuantity, price: matchPrice / 100 })

                if (sellOrder.remainingQty === 0) {
                    sellOrder.status = OrderStatus.FILLED;
                } else {
                    sellOrder.status = OrderStatus.PARTIALLY_FILLED;
                }
            }
            if (buyOrder.remainingQty === 0) {
                buyOrder.status = OrderStatus.FILLED;
                user.balance.INR.available += requiredFunds - matchingResult.totalValue;
                user.balance.INR.locked = 0;
                await this.sendOrderbookUpdate(symbol);
            } else {
                if (matchingResult.matches.length > 0) {
                    console.log(`when matched`)
                    if (buyOrder.side === Side.YES)
                        market.lastYesPrice = matchingResult.matches[matchingResult.matches.length - 1].price;
                    if (buyOrder.side === Side.NO)
                        market.lastNoPrice = matchingResult.matches[matchingResult.matches.length - 1].price;
                    market.totalVolume += matchingResult.filledQty;
                    await this.sendMarketUpdate(market);
                    await this.sendOrderbookUpdate(symbol);

                    buyOrder.status = OrderStatus.PARTIALLY_FILLED;
                }
            }
            const existingBuyOrders = this.buyOrders.get(symbol) || [];
            existingBuyOrders.push(buyOrder);
            this.buyOrders.set(symbol, existingBuyOrders);
            const message = (matchingResult.matches.length === 0) ? "Buy order placed"
                : (buyOrder.remainingQty === 0) ? "Buy order completed" : `Buy order partially filled and order placed for ${buyOrder.remainingQty}`
            const responsePayload = {
                type: 'buy_response',
                data: {
                    success: true,
                    buyOrder,
                    buyer: user,
                    totalValue: matchingResult.totalValue / 100,
                    matches: matchingResult.matches,
                    message
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        } catch (error) {
            const responsePayload = {
                type: 'buy_response',
                data: {
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to process buy order'
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleOnrampInr(request: any) {
        const { correlationId } = request;
        const { token, amount } = request.payload;
        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const db_user = this.usersMap.get(userId);
            if (!db_user) {
                throw new Error('user not found in the database')
            }

            db_user.balance.INR.available += amount * 100;

            const responsePayload = {
                type: 'onramp_inr_response',
                data: {
                    success: true,
                    user: db_user,
                    amount,
                    message: `Onramped ${amount} INR to ${userId} successfully`
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occured'
            const responsePayload = {
                type: 'onramp_inr_response',
                data: {
                    success: false,
                    message: "Failed to onramp INR",
                    error: errorMessage
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: "responses",
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleCreateCategory(request: any) {
        const { correlationId } = request;
        const { token, title, icon, description } = request.payload
        try {
            const userId = this.verifyTokenAndGetUserId(token);

            const db_user = this.usersMap.get(userId);
            if (!db_user) {
                throw new Error('user not found in the database')
            }
            if (db_user.role.toLowerCase() !== "admin") {
                throw new Error("only admins have the permission to create a m")
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
                    category: newCategory,
                    message: "Category created successfully!"
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
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

            await KafkaManager.getInstance().sendToKafkaStream({
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

            const db_user = this.usersMap.get(userId);
            if (!db_user) {
                throw new Error('user not found in the database')
            }
            console.log(db_user.role);
            if (db_user.role.toLocaleLowerCase() !== "admin") {
                throw new Error("only admins have the permission to create a market ")
            }
            const db_category = this.getCategoryfromTitle(categoryTitle)
            if (!db_category) {
                throw new Error("Category not found")
            }
            const marketId = uuidv4()
            const newMarket: Market = {
                id: marketId,
                symbol,
                endTime,
                description,
                sourceOfTruth,
                categoryId: db_category.id,
                categoryTitle: db_category.title,
                status: MarketStatus.ACTIVE,
                createdBy: userId,
                lastYesPrice: 5,
                lastNoPrice: 5,
                totalVolume: 0,
                timestamp: new Date()
            }
            this.marketsMap.set(marketId, newMarket)

            const responsePayload = {
                type: 'create_market_response',
                data: {
                    success: true,
                    market: newMarket,
                    message: "Market created successfully"
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
            const responsePayload = {
                type: 'create_market_response',
                data: {
                    success: false,
                    message: `Market creation failed. ${errorMessage}`
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
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
        const { marketSymbol } = request.payload;

        try {
            const market = Array.from(this.marketsMap.values()).find(m => m.symbol === marketSymbol);

            if (!market) {
                const responsePayload = {
                    type: 'get_market_response',
                    data: {
                        success: false,
                        message: `Market with symbol "${marketSymbol}" not found.`
                    }
                };

                await KafkaManager.getInstance().sendToKafkaStream({
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

            await KafkaManager.getInstance().sendToKafkaStream({
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

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });
        }
    }

    private async handleGetAllCategories(request: any) {
        const { correlationId } = request
        try {

            const categories = Array.from(this.categoriesMap.values());

            const responsePayload = {
                type: 'get_all_categories_response',
                data: {
                    success: true,
                    categories,
                    message: "Categories retrieved successfully!"
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'get_all_categories_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
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
        try {

            const markets = Array.from(this.marketsMap.values());

            const responsePayload = {
                type: 'get_all_markets_response',
                data: {
                    success: true,
                    markets,
                    message: "Markets retrieved successfully!"
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const responsePayload = {
                type: 'get_all_categories_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            };

            await KafkaManager.getInstance().sendToKafkaStream({
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
            this.usersMap.set(userId, newUser)
            const responsePayload = {
                type: 'signup_response',
                data: {
                    success: true,
                    user: newUser,
                    message: "Signed up successfully!"
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
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
            await KafkaManager.getInstance().sendToKafkaStream({
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
                    user: db_user,
                    message: "Logged in successfully!"
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
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
            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }
    private async handleGetMe(request: any) {
        const { correlationId } = request;
        const { token } = request.payload;
        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const user = this.usersMap.get(userId);
            if (!user) {
                throw new Error("User bot found");
            }
            const responsePayload = {
                type: 'get_me_response',
                data: {
                    success: true,
                    user
                }
            }
            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            const responsePayload = {
                type: 'get_me_response',
                data: {
                    success: false,
                    message: errorMessage
                }
            }
            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleMint(request: any) {
        const { correlationId } = request;
        const { token, symbol, quantity, price } = request.payload;
        const priceInPaise = price * 100
        try {
            const userId = this.verifyTokenAndGetUserId(token);
            const user = this.usersMap.get(userId);
            if (!user) {
                throw new Error('User not found in the database.')
            }
            if (user.role.toLowerCase() !== "admin") {
                throw new Error("Only admins can mint tokens");

            }
            const market = Array.from(this.marketsMap.values()).find(m => m.symbol === symbol && m.status === MarketStatus.ACTIVE);
            if (!market) {
                throw new Error(`Active market with symbol ${symbol} does not exist`);

            }
            const userBalance = user.balance.INR.available!;
            const totalCost = 2 * quantity * priceInPaise;
            if (userBalance < 2 * quantity * priceInPaise) {
                throw new Error("Insufficient INR balance");
            }
            user.balance.INR.available -= totalCost;
            user.balance.INR.locked += totalCost;

            if (!user.balance.stocks[symbol]) {
                user.balance.stocks[symbol] = {
                    YES: { quantity: 0, locked: 0 },
                    NO: { quantity: 0, locked: 0 }
                };
            }
            user.balance.stocks[symbol].YES!.quantity += quantity;
            user.balance.stocks[symbol].NO!.quantity += quantity;
            user.balance.INR.locked -= totalCost;

            const responsePayload = {
                type: 'mint_response',
                data: {
                    success: true,
                    mintUser: user,
                    quantity,
                    symbol,
                    message: `Minted ${quantity} yes and ${quantity} no tokens of ${symbol} to ${userId}`
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occured'
            const responsePayload = {
                type: 'mint_response',
                data: {
                    success: false,
                    data: {
                        message: `Minted failed`,
                        error: errorMessage
                    }
                }
            }

            await KafkaManager.getInstance().sendToKafkaStream({
                topic: 'responses',
                messages: [{
                    key: correlationId,
                    value: JSON.stringify(responsePayload)
                }]
            })
        }
    }
}