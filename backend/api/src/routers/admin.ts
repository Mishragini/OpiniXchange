import { Router } from "express";
import { RedisKafkaManager } from "../redisKafkaManager";
import { CategorySchema, MarketSchema, MintSchema } from "../inputSchema";
import { AuthenticatedRequest, authenticateToken } from "../middlewares/auth";

export const adminRouter = Router()

adminRouter.post('/create/category', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const parsedResponse = CategorySchema.safeParse(req.body)
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const { title, icon, description } = parsedResponse.data;

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'create_category',
        payload: {
            token: req.token!,
            title,
            icon,
            description
        }
    })
    res.json(responseFromEngine)
})

adminRouter.post("/create/market", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const parsedResponse = MarketSchema.safeParse(req.body);
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const { symbol, description, endTime, sourceOfTruth, categoryTitle } = parsedResponse.data

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'create_market',
        payload: {
            token: req.token!,
            symbol,
            endTime,
            description,
            sourceOfTruth,
            categoryTitle
        }
    })
    res.json(responseFromEngine)
})

adminRouter.post('/mint', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const parsedResponse = MintSchema.safeParse(req.body)
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const { symbol, quantity, price } = parsedResponse.data

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'mint',
        payload: {
            token: req.token!,
            symbol,
            quantity,
            price,
        }
    })
    res.json(responseFromEngine)
})
