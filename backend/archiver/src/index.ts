import { PrismaClient } from "@prisma/client";
import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
enum Side {
    YES = "YES",
    NO = "NO"
}

async function main() {
    try {
        const prisma = new PrismaClient();
        const kafka = new Kafka({
            clientId: "archiver",
            brokers: ["localhost:9092"],
        });
        const consumer: Consumer = kafka.consumer({ groupId: "archiver-group" });

        await consumer.connect();
        await consumer.subscribe({
            topic: "responses",
            fromBeginning: false,
        });

        await consumer.run({
            eachMessage: async ({ message }: EachMessagePayload) => {
                if (!message.value) return;

                const { type, data } = JSON.parse(message.value.toString());
                switch (type) {
                    case 'signup_response': {
                        const { user } = data;
                        if (user) {
                            await prisma.$transaction(async () => {
                                const inrBalance = await prisma.inrBalance.create({
                                    data: {
                                        available: user.balance.INR.available,
                                        locked: user.balance.INR.locked,
                                    },
                                });

                                await prisma.user.create({
                                    data: {
                                        id: user.id,
                                        username: user.username,
                                        email: user.email,
                                        password: user.password,
                                        role: user.role === "admin" ? "ADMIN" : "USER",
                                        userInrBalance: {
                                            connect: {
                                                id: inrBalance.id,
                                            },
                                        },
                                    },
                                });
                            });
                        }
                        break;
                    }
                    case 'create_market_response': {
                        const { market: marketData } = data;
                        if (marketData) {
                            await prisma.market.create({
                                data: {
                                    id: marketData.id,
                                    symbol: marketData.symbol,
                                    endTime: marketData.endTime,
                                    description: marketData.description,
                                    sourceOfTruth: marketData.sourceOfTruth,
                                    category: {
                                        connect: {
                                            id: marketData.categoryId,
                                        },
                                    },
                                    status: marketData.status,
                                    lastPrice: marketData.lastPrice,
                                    totalVolume: marketData.totalVolume,
                                },
                            });
                        }
                        break;
                    }
                    case 'create_category_response': {
                        const { category } = data;
                        if (category) {
                            await prisma.category.create({
                                data: {
                                    id: category.id,
                                    title: category.title,
                                    icon: category.icon,
                                    description: category.description,
                                },
                            });
                        }
                        break;
                    }
                    case 'onramp_inr_response': {
                        const { userId: onrampUserId, amount } = data;
                        if (onrampUserId && amount) {
                            const user = await prisma.user.findUnique({
                                where: { id: onrampUserId },
                                select: { inrBalanceId: true },
                            });

                            if (user?.inrBalanceId) {
                                await prisma.inrBalance.update({
                                    where: { id: user.inrBalanceId },
                                    data: {
                                        available: { increment: amount },
                                    },
                                });
                            }
                        }
                        break;
                    }
                    case 'buy_response': {
                        const { buyOrder } = data;
                        if (buyOrder) {
                            const marketData = await prisma.market.findFirst({
                                where: { symbol: buyOrder.marketSymbol },
                            });
                            if (!marketData) return;
                            await prisma.order.create({
                                data: {
                                    id: buyOrder.id,
                                    user: {
                                        connect: { id: buyOrder.userId },
                                    },
                                    market: {
                                        connect: { id: marketData.id },
                                    },
                                    side: buyOrder.side,
                                    quantity: buyOrder.quantity,
                                    remainingQuantity: buyOrder.remainingQty,
                                    price: buyOrder.price,
                                    status: buyOrder.status,
                                    timestamp: buyOrder.timestamp,
                                },
                            });
                        }
                        break;
                    }
                    case 'sell_response': {
                        const { sellOrder } = data;
                        if (sellOrder) {
                            const marketData = await prisma.market.findFirst({
                                where: { symbol: sellOrder.marketSymbol },
                            });
                            if (!marketData) return;
                            await prisma.order.create({
                                data: {
                                    id: sellOrder.id,
                                    user: {
                                        connect: { id: sellOrder.userId },
                                    },
                                    market: {
                                        connect: { id: marketData.id },
                                    },
                                    side: sellOrder.side,
                                    quantity: sellOrder.quantity,
                                    remainingQuantity: sellOrder.remainingQty,
                                    price: sellOrder.price,
                                    status: sellOrder.status,
                                    timestamp: sellOrder.timestamp,
                                },
                            });
                        }
                        break;
                    }
                    case 'mint_response': {
                        const { userId: mintUserId, quantity, symbol } = data;
                        const marketData = await prisma.market.findFirst({
                            where: { symbol },
                        });

                        if (marketData && mintUserId) {
                            await prisma.stockBalance.createMany({
                                data: [
                                    {
                                        userId: mintUserId,
                                        marketId: marketData.id,
                                        quantity,
                                        side: Side.YES,
                                        locked: 0,
                                    },
                                    {
                                        userId: mintUserId,
                                        marketId: marketData.id,
                                        quantity,
                                        side: Side.NO,
                                        locked: 0,
                                    },
                                ],
                            });
                        }
                        break;
                    }
                    case 'cancel_buy_order_response': {
                        const { orderId } = data;
                        await prisma.order.delete({
                            where: {
                                id: orderId
                            }
                        })
                        break;
                    }
                    case 'cancel_sell_order_response': {
                        const { orderId } = data;
                        await prisma.order.delete({
                            where: {
                                id: orderId
                            }
                        })
                        break;
                    }

                }
            },
        });

    } catch (error) {
        console.error("Failed to start archiver:", error);
    }
}

main();
