import { Router } from "express";
import { RedisKafkaManager } from "../redisKafkaManager";

export const admin_roter = Router()

admin_roter.post("/create/market", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1]
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const { symbol, description, endTime, sourceOfTruth } = req.body
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'create_market',
        payload: {
            token,
            symbol,
            endTime,
            description,
            sourceOfTruth
        }
    })
    res.json(responseFromEngine)
})

admin_roter.post('/mint', async (req, res) => {
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
