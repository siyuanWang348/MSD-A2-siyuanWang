// 后端API地址
const API_URL = 'http://localhost:3000/api';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查用户是否已登录，如果未登录则跳转到登录页
    if (!isLoggedIn() && !window.location.pathname.includes('index.html') && 
        !window.location.pathname.includes('register.html')) {
        window.location.href = 'index.html';
        return;
    }

    // 如果用户已登录，显示用户信息
    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('user'));
        const currentUserEl = document.getElementById('current-user');
        if (currentUserEl) {
            currentUserEl.textContent = user.username;
        }
    }

    // 设置登出事件监听
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logout);
    }

    // 移动端菜单切换
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 通知关闭按钮
    const closeNotification = document.getElementById('close-notification');
    if (closeNotification) {
        closeNotification.addEventListener('click', hideNotification);
    }

    // 滚动时导航栏效果
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 10) {
                navbar.classList.add('py-2', 'shadow-lg');
                navbar.classList.remove('py-3', 'shadow-md');
            } else {
                navbar.classList.add('py-3', 'shadow-md');
                navbar.classList.remove('py-2', 'shadow-lg');
            }
        }
    });
});

// 检查用户是否已登录
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// 登出
function logout() {
    // 清除登录状态
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 显示通知
    showNotification('已登出', '您已成功退出登录', 'info');
    
    // 跳转到登录页
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
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
    
    // 3秒后自动隐藏
    setTimeout(hideNotification, 3000);
}

// 隐藏通知
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.className = 'fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center max-w-sm hidden';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 格式化班级名称
function formatClassName(classCode) {
    const classMap = {
        'class1': '一班',
        'class2': '二班',
        'class3': '三班'
    };
    return classMap[classCode] || classCode;
}

// 带认证的API请求
async function apiRequest(url, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${url}`, options);
        const responseData = await response.json();
        
        if (!response.ok) {
            // 如果是401未授权，需要重新登录
            if (response.status === 401) {
                logout();
                throw new Error('登录已过期，请重新登录');
            }
            throw new Error(responseData.message || '操作失败');
        }
        
        return responseData;
    } catch (error) {
        showNotification('操作失败', error.message, 'error');
        throw error;
    }
}
    