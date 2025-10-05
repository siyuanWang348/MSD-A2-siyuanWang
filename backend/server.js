const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库设置
const dbPath = path.resolve(__dirname, './database/classSystem.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接错误:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        
        // 创建用户表
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )`);
        
        // 创建学生表
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            idNumber TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            className TEXT NOT NULL,
            gender TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            address TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )`);
        
        // 添加默认管理员用户
        db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
            if (!row) {
                const defaultAdmin = {
                    id: Date.now().toString(36),
                    username: 'admin',
                    password: 'admin123', // 实际应用中应该加密存储
                    role: 'admin',
                    createdAt: new Date().toISOString()
                };
                
                db.run(`INSERT INTO users (id, username, password, role, createdAt) 
                        VALUES (?, ?, ?, ?, ?)`,
                    [defaultAdmin.id, defaultAdmin.username, defaultAdmin.password, 
                     defaultAdmin.role, defaultAdmin.createdAt],
                    (err) => {
                        if (err) {
                            console.error('添加默认管理员失败:', err.message);
                        } else {
                            console.log('默认管理员创建成功: 用户名admin, 密码admin123');
                        }
                    }
                );
            }
        });
    }
});

// 使数据库实例在路由中可用
app.use((req, res, next) => {
    req.db = db;
    next();
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// 根路由
app.get('/', (req, res) => {
    res.send('班级成员管理系统API正在运行');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
    