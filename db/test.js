import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
dotenv.config({ path: join(__dirname, '../.env') });

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error("❌ MONGODB_URI không tồn tại trong .env");
    process.exit(1);
}
console.log("🔗 Đang kết nối MongoDB...");
console.log("📦 Database:", mongoURI.split('/')[3]?.split('?')[0] || 'test');

try {
    await mongoose.connect(mongoURI);
    console.log("✅ Kết nối thành công!");
    console.log("📊 Database đang dùng:", mongoose.connection.db.databaseName);
    
    // Test tạo collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📁 Collections hiện có:", collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log("👋 Đã đóng kết nối");
} catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
}