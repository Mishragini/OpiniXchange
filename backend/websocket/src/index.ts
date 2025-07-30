import { WebSocket, WebSocketServer } from 'ws'
import { Consumer, Kafka } from 'kafkajs'

interface WebSocketClient extends WebSocket {
    subscribedMarkets: Set<string>
}
class WSServer {
    private static instance: WSServer;
    private wss: WebSocketServer;
    private consumer: Consumer;
    private clients: Set<WebSocketClient>;

    private constructor() {
        this.wss = new WebSocketServer({ port: 8080 });
        this.clients = new Set()

        const kafka = new Kafka({
            clientId: 'ws-server',
            brokers: [process.env.KAFKA_BROKERS || "kafka:9092"]
        })

        this.consumer = kafka.consumer({ groupId: "websocker-server-group" })
        this.initialize()
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new WSServer();
        }
        return this.instance;
    }

    private async initialize() {
        this.wss.on('connection', (ws: WebSocketClient) => {
            console.log('client connected');
            ws.subscribedMarkets = new Set();
            this.clients.add(ws);

            ws.on('message', (message: string) => {
                console.log(`inside on message`, message)
                try {
                    console.log(message);
                    const data = JSON.parse(message);
                    console.log(data)
                    if (data.type === 'subscribe') {
                        console.log('subscribing', data.marketSymbol)
                        ws.subscribedMarkets.add(data.marketSymbol)
                        console.log('subscribed')

                    } else if (data.type === 'unsubscribe') {
                        console.log('unsubscribing', data.marketSymbol)
                        ws.subscribedMarkets.delete(data.marketSymbol)
                    }
                } catch (error) {
                    console.error('Error proccessing the websocket message', error)
                }
            })

            ws.on('close', () => {
                console.log('client disconnected');
                this.clients.delete(ws)
            })

        })
        await this.consumer.connect();
        await this.consumer.subscribe({ topics: ['market-updates', 'orderbook-updates'], fromBeginning: false })

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                console.log("topic", topic)
                console.log(`inside consumer`)
                if (!message.value || !message.key) return;
                const data = JSON.parse(message.value.toString());
                const marketSymbol = message.key.toString();
                this.broadcast(topic, data, marketSymbol)
            }
        })
    }

    private async broadcast(topic: string, data: any, marketSymbol: string) {
        console.log("marketSymbol", marketSymbol)

        this.clients.forEach(client => {
            if (client.subscribedMarkets.has(marketSymbol)) {
                console.log('inside subscribed market check')
                console.log(client.subscribedMarkets)
                const payload = {
                    topic,
                    data
                }
                client.send(JSON.stringify(payload))
            }
        });

    }
}

async function main() {
    try {
        const wsServer = WSServer.getInstance();
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

main();



