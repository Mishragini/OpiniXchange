import { Kafka, Message, Producer } from "kafkajs";

interface KafkaMessage {
    topic: string;
    messages: Message[];
}
export class KafkaManager {
    private producer: Producer;
    private static instance: KafkaManager
    private isInitialized: boolean = false;

    private constructor() {
        const kafka = new Kafka({
            clientId: "engine",
            brokers: ["localhost:9092"]
        });

        this.producer = kafka.producer();
        this.initialize();
    }

    private async initialize() {
        if (this.isInitialized) return;
        try {
            await this.producer.connect();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize KafkaManager:', error);
            throw error;
        }
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new KafkaManager()
        }
        return this.instance
    }

    public async sendToKafkaStream(message: KafkaMessage) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            await this.producer.send({
                topic: message.topic,
                messages: message.messages.map(msg => ({
                    key: msg.key,
                    value: typeof msg.value === 'string'
                        ? msg.value
                        : JSON.stringify(msg.value)
                }))
            });
        } catch (error) {
            console.error('Failed to send message to Kafka:', error);
            throw error;
        }
    }
}