import { Router } from "express";
import { RedisKafkaManager } from "../redisKafkaManager";
import { OrderSchema } from "../inputSchema";
import { AuthenticatedRequest, authenticateToken } from "../middlewares/auth";

export const userRouter = Router();

userRouter.post("/onramp/inr", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { amount } = req.body;

    if (!amount || amount < 0) {
        res.json(400).json({ message: "Please send a valid amount to onramp." })
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'onramp_inr',
        payload: {
            token: req.token!,
            amount
        }
    })
    res.json(responseFromEngine)
})

userRouter.post("/buy", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const parsedResponse = OrderSchema.safeParse(req.body);
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return;
    }
    const { symbol, quantity, price, stockType } = parsedResponse.data;

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'buy',
        payload: {
            token: req.token!,
            symbol,
            quantity,
            price,
            stockType
        }
    })
    res.json(responseFromEngine)

})

userRouter.post("/sell", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const parsedResponse = OrderSchema.safeParse(req.body);
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return;
    }
    const { symbol, quantity, price, stockType } = parsedResponse.data;
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'sell',
        payload: {
            token: req.token!,
            symbol,
            quantity,
            price,
            stockType
        }
    })
    res.json(responseFromEngine)
})

userRouter.post("/cancel/buy", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string
    if (!orderId || !marketSymbol) {
        res.json(400).json({ message: 'Invalid request, provide orderId and marketSymbol as query.' })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'cancel_buy_order',
        payload: {
            token: req.token!,
            orderId,
            marketSymbol
        }
    })

    res.json(responseFromEngine)
})

userRouter.post("/cancel/sell", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string
    if (!orderId || !marketSymbol) {
        res.json(400).json({ message: 'Invalid request, provide orderId and marketSymbol as query.' })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'cancel_sell_order',
        payload: {
            token: req.token!,
            orderId,
            marketSymbol
        }
    })

    res.json(responseFromEngine)
})