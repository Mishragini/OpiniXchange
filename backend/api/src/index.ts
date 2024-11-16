import express from 'express'
import { RedisKafkaManager } from './redisKafkaManager';
import { userRouter } from './routers/user';
import { adminRouter } from './routers/admin';
import { LoginSchema, SignupSchema } from './inputSchema';
import { AuthenticatedRequest, authenticateToken } from './middlewares/auth';

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedResponse = SignupSchema.safeParse(req.body)
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const { username, email, password, role } = parsedResponse.data;
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'signup',
        payload: {
            username,
            email,
            password,
            role
        }
    })
    res.json(responseFromEngine)

})

app.post("/login", async (req, res) => {
    const parsedResponse = LoginSchema.safeParse(req.body);
    if (!parsedResponse.success) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const { email, password } = parsedResponse.data;
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'login',
        payload: {
            email,
            password
        }
    })
    res.json(responseFromEngine)

})

app.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_me',
        payload: {
            token: req.token!
        }
    })

    res.json(responseFromEngine)
})

app.get("/markets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_all_markets',
        payload: {
            token: req.token!
        }
    })
    res.json(responseFromEngine)
})

app.get("/market/:marketSymbol", authenticateToken, async (req: AuthenticatedRequest, res) => {
    const marketSymbol = req.params.marketSymbol;

    if (!marketSymbol) {
        res.status(400).json({ message: 'Please provide market symbol as paramater' })
        return;
    }

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: "get_market",
        payload: {
            token: req.token!,
            marketSymbol
        }
    })
    res.json(responseFromEngine)
})

app.get('/orderbook/:symbol', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const symbol = req.params.symbol;

    if (!symbol) {
        res.status(400).json({ message: 'Please provide market symbol as paramater' })
        return;
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: "get_orderbook",
        payload: {
            token: req.token!,
            symbol
        }
    })
    res.json(responseFromEngine)
})

app.use("/user", userRouter)
app.use("/admin", adminRouter)


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})