import http from "http";
import { createApp } from "./app.js";
import { setupSocketIO } from "./socket/socket.js";
import { testConnection } from "./config/database.js";
import { config } from "./config/env.js";
async function bootstrap() {
    try {
        console.log("-----------------------------------------");
        console.log("🚀 Starting NearMeet PostgreSQL Backend...");
        console.log("-----------------------------------------");
        // 1. Verify PostgreSQL connection
        console.log("🔍 Checking PostgreSQL connection...");
        await testConnection();
        // 2. Create Express app
        const app = createApp();
        const server = http.createServer(app);
        // 3. Attach Socket.IO
        const io = setupSocketIO(server);
        // 4. Start HTTP & WebSocket server
        server.listen(config.port, () => {
            console.log(`✅ NearMeet Server running on http://localhost:${config.port}`);
            console.log(`📡 Socket.IO initialized for real-time chat`);
            console.log(`🔌 API Health: http://localhost:${config.port}/api/health`);
        });
    }
    catch (error) {
        console.error("❌ Fatal startup error:", error);
        process.exit(1);
    }
}
bootstrap();
