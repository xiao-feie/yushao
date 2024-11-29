const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 启用CORS
app.use(cors());

// 代理配置
app.use('/api', createProxyMiddleware({
    target: 'https://api.moonshot.cn',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/v1'
    }
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
}); 