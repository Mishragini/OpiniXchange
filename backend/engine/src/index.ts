require('dotenv').config()
import { createClient } from "redis"
import { Engine } from "./Engine"

async function main() {
    const queueClient = createClient()
    
    queueClient.on('error', (err) => {
        console.error('Redis Client Error:', err)
    })

    try {
        await queueClient.connect()
        console.log('Connected to Redis successfully')
        
        while (true) {
            try {
                const request = await queueClient.rPop('requests')
                if (request) {
                    const parsedRequest = JSON.parse(request)
                    await Engine.getInstance().processReq(parsedRequest)
                } 
            } catch (error) {
                console.error('Error processing request:', error)
                continue
            }
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error)
        process.exit(1)
    }
}

main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})