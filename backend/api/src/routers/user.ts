import { Router } from "express";
import { RedisKafkaManager } from "../redisKafkaManager";

export const user_router = Router();

user_router.post("/onramp/inr", async (req, res) => {
    const { amount } = req.body;
    const token = req.headers["authorization"]?.split(' ')[1]
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'onramp_inr',
        payload: {
            token,
            amount
        }
    })
    res.json(responseFromEngine)
})

user_router.post("/buy", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    const { symbol, quantity, price, stockType } = req.body
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'buy',
        payload: {
            token,
            symbol,
            quantity,
            price,
            stockType
        }
    })
    res.json(responseFromEngine)

})

user_router.post("/sell", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    const { symbol, quantity, price, stockType } = req.body
    if (!symbol || !quantity || !price || !stockType) {
        res.status(400).json({ message: "Invalid inputs" })
        return;
    }
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'sell',
        payload: {
            token,
            symbol,
            quantity,
            price,
            stockType
        }
    })
    res.json(responseFromEngine)
})

user_router.post("/cancel/buy", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string
    if (!orderId || !marketSymbol) {
        res.json(400).json({ message: 'Invalid request, provide orderId and marketSymbol as query.' })
        return
    }
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'cancel_buy_order',
        payload: {
            token,
            orderId,
            marketSymbol
        }
    })

    res.json(responseFromEngine)
})

user_router.post("/cancel/sell", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string
    if (!orderId || !marketSymbol) {
        res.json(400).json({ message: 'Invalid request, provide orderId and marketSymbol as query.' })
        return
    }
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'cancel_sell_order',
        payload: {
            token,
            orderId,
            marketSymbol
        }
    })

    res.json(responseFromEngine)
})