// 后端API地址
const API_URL = 'http://localhost:3000/api';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查用户是否已登录，如果已登录则跳转到仪表盘
    if (isLoggedIn() && window.location.pathname.includes('index.html') || 
        window.location.pathname.includes('register.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 注册表单提交
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 通知关闭按钮
    const closeNotification = document.getElementById('close-notification');
    if (closeNotification) {
        closeNotification.addEventListener('click', hideNotification);
    }
});

// 检查用户是否已登录
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '登录失败');
        }
        
        // 保存token和用户信息
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 显示成功通知并跳转
        showNotification('登录成功', `欢迎回来，${data.user.username}`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        showNotification('登录失败', error.message, 'error');
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '注册失败');
        }
        
        // 显示成功通知并跳转登录页
        showNotification('注册成功', '您可以使用新账号登录了', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showNotification('注册失败', error.message, 'error');
    }
}

// 显示通知
function showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.getElementById('notification-icon');
    
    if (!notification) return;
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // 设置图标和颜色
    if (type === 'success') {
        notificationIcon.className = 'fa fa-check-circle text-green-500';
        notification.className = 'fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-sm bg-green-50 border-l-4 border-green-500';
    } else if (type === 'error') {
        notificationIcon.className = 'fa fa-times-circle text-red-500';
        notification.className = 'fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-sm bg-red-50 border-l-4 border-red-500';
    } else {
        notificationIcon.className = 'fa fa-info-circle text-blue-500';
        notification.className = 'fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center max-w-sm bg-blue-50 border-l-4 border-blue-500';
    }
}

// 隐藏通知
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.className = 'fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center max-w-sm hidden';
    }
}
    