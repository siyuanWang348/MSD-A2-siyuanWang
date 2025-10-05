const jwt = require('jsonwebtoken');

// 验证JWT令牌的中间件
exports.auth = (req, res, next) => {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // 验证令牌
        const decoded = jwt.verify(token, 'your-secret-key'); // 使用与生成令牌相同的密钥
        
        // 将用户信息添加到请求对象
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: '无效的令牌或令牌已过期' });
    }
};

// 检查管理员权限的中间件
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: '没有管理员权限' });
    }
};
    