import express from 'express'
import { RedisKafkaManager } from './redisKafkaManager';
import { user_router } from './routers/user';
import { admin_roter } from './routers/admin';

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
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
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Invalid inputs" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: 'login',
        payload: {
            email,
            password
        }
    })
    res.json(responseFromEngine)

})

app.get("/markets", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1];
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = RedisKafkaManager.getInstance().sendAndAwait({
        type: 'get_all_markets',
        payload: {
            token
        }
    })
    res.json(responseFromEngine)
})

app.get("market/:marketSymbol", async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1];
    const marketSymbol = req.params.marketSymbol;

    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }

    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: "get_market",
        payload: {
            token,
            marketSymbol
        }
    })
    res.json(responseFromEngine)
})

app.get('/orderbook/:symbol', async (req, res) => {
    const token = req.headers["authorization"]?.split(' ')[1];
    const symbol = req.params.symbol;
    if (!token) {
        res.json(403).json({ message: "Unauthorized" })
        return
    }
    const responseFromEngine = await RedisKafkaManager.getInstance().sendAndAwait({
        type: "get_orderbook",
        payload: {
            token,
            symbol
        }
    })
    res.json(responseFromEngine)
})

app.use("/user", user_router)
app.use("/admin", admin_roter)


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})