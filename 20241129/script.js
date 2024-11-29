// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelector('.carousel-dots');
    let currentSlide = 0;
    
    // 确保第一张图片显示
    slides[0].classList.add('active');
    
    // 创建轮播点
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    });
    
    // 显示当前幻灯片
    function showSlide(n) {
        // 先隐藏所有幻灯片
        slides.forEach(slide => {
            slide.style.display = 'none';
            slide.classList.remove('active');
        });
        document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        
        // 计算要显示的幻灯片索引
        currentSlide = (n + slides.length) % slides.length;
        
        // 显示当前幻灯片
        slides[currentSlide].style.display = 'block';
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
        }, 10);
        dots.children[currentSlide].classList.add('active');
    }
    
    // 下一张幻灯片
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // 上一张幻灯片
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // 直接跳转到指定幻灯片
    function goToSlide(n) {
        showSlide(n);
    }
    
    // 添加按钮事件监听
    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);
    
    // 自动播放
    setInterval(nextSlide, 5000);
    
    // 初始化显示第一张幻灯片
    showSlide(0);
});

// 汉堡菜单
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'block' ? 'none' : 'block';
});

// 页面滚动动画
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('.about, .carousel-section');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.75) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// 修改JWT工具类
class JWTUtil {
    static generateToken(apiKey) {
        try {
            const [id, secret] = apiKey.split('.');
            
            const now = Date.now();
            const payload = {
                api_key: id,
                exp: now + 3600 * 1000,  // 1小时后过期
                timestamp: now
            };
            
            const header = {
                alg: "HS256",
                sign_type: "SIGN"
            };
            
            // 使用完整的JWT格式
            const encodedHeader = btoa(JSON.stringify(header));
            const encodedPayload = btoa(JSON.stringify(payload));
            
            // 使用HMAC SHA256进行签名
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = CryptoJS.HmacSHA256(signatureInput, secret);
            const encodedSignature = CryptoJS.enc.Base64.stringify(signature);
            
            return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
        } catch (error) {
            console.error('Error generating token:', error);
            return null;
        }
    }
}

// 修改APIClient类
class APIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    }

    async generateResponse(messages) {
        try {
            // 生成JWT token
            const token = JWTUtil.generateToken('24b0a8d66d6f0ac9f5b8f413a2fea037.ErSGxylL2H6EdVLL');
            if (!token) {
                throw new Error('Failed to generate token');
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个智能助手，会为用户提供友好、专业的帮助。"
                        },
                        ...messages
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API call failed:', error);
            return '抱歉，我遇到了一些问题，请稍后再试。';
        }
    }
}

// 修改ChatBot类
class ChatBot {
    constructor() {
        // 初始化DOM元素
        this.button = document.getElementById('aiChatButton');
        this.window = document.getElementById('aiChatWindow');
        this.messages = document.getElementById('chatMessages');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.closeBtn = document.getElementById('closeBtn');
        this.minimizeBtn = document.getElementById('minimizeBtn');

        // API配置
        this.apiKey = '24b0a8d66d6f0ac9f5b8f413a2fea037.ErSGxylL2H6EdVLL';
        this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

        // 绑定事件处理器
        this.button.addEventListener('click', () => this.toggleWindow());
        this.closeBtn.addEventListener('click', () => this.hideWindow());
        this.minimizeBtn.addEventListener('click', () => this.hideWindow());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 添加欢迎消息
        this.addMessage({
            type: 'ai',
            content: '你好！我是AI助手。请问有什么我可以帮你的吗？'
        });

        console.log('ChatBot initialized');
    }

    generateToken() {
        try {
            const [id, secret] = this.apiKey.split('.');
            
            const now = Date.now();
            const payload = {
                api_key: id,
                exp: now + 3600 * 1000,
                timestamp: now
            };

            // 使用Base64编码
            function base64UrlEncode(str) {
                let base64 = btoa(JSON.stringify(str));
                return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            }

            // 创建header和payload
            const header = {
                alg: "HS256",
                sign_type: "SIGN"
            };

            const encodedHeader = base64UrlEncode(header);
            const encodedPayload = base64UrlEncode(payload);

            // 创建签名
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = CryptoJS.HmacSHA256(signatureInput, secret);
            const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            // 返回完整的JWT token
            const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
            console.log('Generated token:', token); // 调试用
            return token;

        } catch (error) {
            console.error('Error generating token:', error);
            return null;
        }
    }

    async sendMessage() {
        const content = this.input.value.trim();
        if (!content) return;

        // 添加用户消息
        this.addMessage({
            type: 'user',
            content: content
        });

        // 清空输入框
        this.input.value = '';

        // 显示加载状态
        this.showTyping();

        try {
            const token = this.generateToken();
            if (!token) throw new Error('Failed to generate token');

            console.log('Sending request with token:', token); // 调试用

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个友好的AI助手，会提供专业、准确的回答。"
                        },
                        {
                            role: "user",
                            content: content
                        }
                    ],
                    temperature: 0.7,
                    top_p: 1.0
                })
            });

            console.log('Response status:', response.status); // 调试用

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data); // 调试用
            
            // 移除加载状态
            this.hideTyping();

            // 添加AI回复
            this.addMessage({
                type: 'ai',
                content: data.choices[0].message.content
            });
        } catch (error) {
            console.error('Error:', error);
            this.hideTyping();
            this.addMessage({
                type: 'ai',
                content: '抱歉，我遇到了一些问题，请稍后再试。'
            });
        }
    }

    // UI相关方法
    toggleWindow() {
        if (this.window.style.display === 'flex') {
            this.hideWindow();
        } else {
            this.showWindow();
        }
    }

    showWindow() {
        this.window.style.display = 'flex';
        this.input.focus();
    }

    hideWindow() {
        this.window.style.display = 'none';
    }

    addMessage({ type, content }) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const time = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messages.appendChild(typingDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    hideTyping() {
        const typingDiv = this.messages.querySelector('.typing');
        if (typingDiv) {
            typingDiv.remove();
        }
    }
}

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    window.chatBot = new ChatBot();
}); 