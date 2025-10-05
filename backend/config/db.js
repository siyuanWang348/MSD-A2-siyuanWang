const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 直接指定完整的数据库路径
const dbPath = 'C:\\Users\\28247\\Desktop\\class-member-management-system\\backend\\database.db';

// 打印调试信息
console.log('数据库文件路径:', dbPath);

// 确保数据库文件存在并可访问
function prepareDatabase() {
    return new Promise((resolve, reject) => {
        try {
            // 检查目录是否存在
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                console.log('创建数据库目录:', dbDir);
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // 检查文件是否存在，不存在则创建
            if (!fs.existsSync(dbPath)) {
                console.log('创建数据库文件:', dbPath);
                fs.writeFileSync(dbPath, '');
            }

            // 检查文件权限
            fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
            console.log('数据库文件权限检查通过');
            resolve();
        } catch (err) {
            console.error('数据库准备失败:', err.message);
            reject(err);
        }
    });
}

// 连接数据库
function connectDB() {
    return new Promise(async (resolve, reject) => {
        try {
            // 先确保数据库文件准备就绪
            await prepareDatabase();
            
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('数据库连接错误:', err.message);
                    console.error('错误代码:', err.code);
                    console.error('错误堆栈:', err.stack);
                    reject(err);
                } else {
                    console.log('数据库连接成功');
                    resolve(db);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

// 初始化数据库表结构
async function initializeDB() {
    try {
        const db = await connectDB();
        
        // 创建用户表（根据您的需求修改）
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        return new Promise((resolve, reject) => {
            db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('创建用户表错误:', err.message);
                    reject(err);
                } else {
                    console.log('用户表创建/验证成功');
                    resolve(db);
                }
            });
        });
    } catch (err) {
        throw err;
    }
}

module.exports = {
    connectDB,
    initializeDB
};
