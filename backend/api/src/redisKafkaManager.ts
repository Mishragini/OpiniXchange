import { Consumer, Kafka } from 'kafkajs';
import { createClient, RedisClientType } from 'redis';
import { RequestPayload } from './types';

export class RedisKafkaManager {
    private static instance: RedisKafkaManager;
    private queue: RedisClientType;
    private consumer: Consumer;
    private messageHandlers: Map<string, (value: any) => void>;
    private isInitialized: boolean = false;

    private constructor() {
        const kafka = new Kafka({
            clientId: 'api-server',
            brokers: ["localhost:9092"]
        });

        this.queue = createClient();
        this.consumer = kafka.consumer({ groupId: 'api-server-group' });
        this.messageHandlers = new Map();
    }

    private async initialize() {
        if (this.isInitialized) return;

        try {
            await this.queue.connect();
            await this.consumer.connect();
            await this.consumer.subscribe({
                topic: 'responses',
                fromBeginning: false
            });

            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    console.log(message, message.key, message.value?.toString())
                    if (!message.key || !message.value) return;

                    const correlationId = message.key.toString();
                    const handler = this.messageHandlers.get(correlationId);

                    if (handler) {
                        try {
                            const value = JSON.parse(message.value.toString());
                            handler(value);
                        } catch (error) {
                            console.error('Failed to parse message:', error);
                            handler({ error: 'Invalid response format' });
                        } finally {
                            this.messageHandlers.delete(correlationId);
                        }
                    }
                },
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize RedisKafkaManager:', error);
            throw error;
        }
    }

    public static getInstance(): RedisKafkaManager {
        if (!RedisKafkaManager.instance) {
            RedisKafkaManager.instance = new RedisKafkaManager();
        }
        return RedisKafkaManager.instance;
    }

    public async sendAndAwait(request: RequestPayload): Promise<any> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise(async (resolve, reject) => {
            const correlationId = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            console.log("correlationId", correlationId)

            const timeoutId = setTimeout(() => {
                if (this.messageHandlers.has(correlationId)) {
                    this.messageHandlers.delete(correlationId);
                    reject(new Error(`Request timed out for ${request.type}`));
                }
            }, 120000);

            this.messageHandlers.set(correlationId, (value) => {
                clearTimeout(timeoutId);
                resolve(value);
            });

            try {
                await this.queue.lPush('requests', JSON.stringify({
                    ...request,
                    correlationId
                }));
            } catch (error) {
                clearTimeout(timeoutId);
                this.messageHandlers.delete(correlationId);
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
                reject(new Error(`Failed to send request: ${errorMessage}`));
            }
        });
    }
}