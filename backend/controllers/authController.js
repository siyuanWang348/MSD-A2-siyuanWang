const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// 生成JWT令牌
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        'your-secret-key', // 实际应用中应该使用环境变量存储密钥
        { expiresIn: '24h' }
    );
};

// 注册新用户
exports.register = (req, res) => {
    const db = req.db;
    const { username, password, role } = req.body;
    
    // 检查必要字段
    if (!username || !password || !role) {
        return res.status(400).json({ message: '请填写所有必填字段' });
    }
    
    // 检查角色是否有效
    if (role !== 'teacher' && role !== 'admin') {
        return res.status(400).json({ message: '无效的角色' });
    }
    
    // 检查用户名是否已存在
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        
        if (row) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        
        // 创建新用户
        const user = {
            id: uuidv4(),
            username,
            password, // 实际应用中应该加密存储密码
            role,
            createdAt: new Date().toISOString()
        };
        
        db.run(
            'INSERT INTO users (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
            [user.id, user.username, user.password, user.role, user.createdAt],
            function(err) {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                
                // 生成令牌
                const token = generateToken(user);
                
                res.status(201).json({
                    message: '注册成功',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                });
            }
        );
    });
};

// 用户登录
exports.login = (req, res) => {
    const db = req.db;
    const { username, password } = req.body;
    
    // 查找用户
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        
        // 检查用户是否存在
        if (!user) {
            return res.status(401).json({ message: '用户名或密码不正确' });
        }
        
        // 检查密码是否正确（实际应用中应该使用加密验证）
        if (user.password !== password) {
            return res.status(401).json({ message: '用户名或密码不正确' });
        }
        
        // 生成令牌
        const token = generateToken(user);
        
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    });
};

// 获取当前用户信息
exports.getCurrentUser = (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        createdAt: req.user.createdAt
    });
};
    