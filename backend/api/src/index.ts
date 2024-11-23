import express from 'express'
import { RedisKafkaManager } from './redisKafkaManager';
import { userRouter } from './routers/user';
import { adminRouter } from './routers/admin';
import { LoginSchema, SignupSchema } from './inputSchema';
import { AuthenticatedRequest, authenticateToken } from './middlewares/auth';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}))

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
    if (responseFromEngine.data.success) {
        res.cookie('authToken', responseFromEngine.data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }
    res.json(responseFromEngine)

})

app.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});

app.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_me',
        payload: {
            token: req.token!
        }
    })

    res.json(responseFromEngine)
})

app.get('/categories', async (req, res) => {
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_all_categories'
    })
    res.json(responseFromEngine)
})

app.get("/markets", async (req, res) => {
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_all_markets',

    })
    res.json(responseFromEngine)
})

app.get("/market/:marketSymbol", async (req: AuthenticatedRequest, res) => {
    const marketSymbol = req.params.marketSymbol;

    if (!marketSymbol) {
        res.status(400).json({ message: 'Please provide market symbol as paramater' })
        return;
    }

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: "get_market",
        payload: {
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