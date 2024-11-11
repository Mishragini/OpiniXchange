import { Router } from "express";
import { RedisKafkaManager } from "../redisKafkaManager";

export const admin_router = Router()

admin_router.post('/create/category', async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const { title, icon, description } = req.body
    if (!title || !icon || !description) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'create_category',
        payload: {
            token,
            title,
            icon,
            description
        }
    })
    res.json(responseFromEngine)
})

admin_router.post("/create/market", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const { symbol, description, endTime, sourceOfTruth, categoryTitle } = req.body
    if (!symbol || !description || !endTime || !sourceOfTruth) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'create_market',
        payload: {
            token,
            symbol,
            endTime,
            description,
            sourceOfTruth,
            categoryTitle
        }
    })
    res.json(responseFromEngine)
})

admin_router.post('/mint', async (req, res) => {
    const { symbol, quantity, price } = req.body
    const token = req.headers["authorization"]?.split(' ')[1]
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    if (!symbol || !quantity || !price) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'mint',
        payload: {
            token,
            symbol,
            quantity,
            price,
        }
    })
    res.json(responseFromEngine)
})
