const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper to simulate response format
const mockResponse = (data, code = 20000) => ({ code, message: 'success', data });

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  res.json(mockResponse({
    accessToken: 'mock-token-123',
    refreshToken: 'mock-refresh-token-123',
    user: { id: 1, username: 'test', email: 'test@example.com' }
  }));
});

app.post('/api/auth/register', (req, res) => {
  res.json(mockResponse({ id: 1 }));
});

app.post('/api/auth/sendCode', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.post('/api/auth/social/login', (req, res) => {
  res.json(mockResponse({
    accessToken: 'mock-social-token-123',
    user: { id: 1, username: 'socialuser', email: 'social@example.com' }
  }));
});

app.post('/api/auth/refresh', (req, res) => {
  res.json(mockResponse({ accessToken: 'mock-refreshed-token' }));
});

app.post('/api/auth/logout', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Plan endpoints
app.get('/api/plan/list', (req, res) => {
  res.json(mockResponse({
    list: [
      {
        id: 1,
        title: '日本关西7日深度游',
        status: 'completed',
        type: 'tourism',
        destination: { country: '日本', city: '大阪' },
        createdAt: '2026-04-15',
        phases: [
          { id: 1, title: '行程规划', order: 1, tasks: [
            { id: 1, title: '办理签证', isCompleted: true },
            { id: 2, title: '预订机票', isCompleted: true },
            { id: 3, title: '预订酒店', isCompleted: true }
          ]},
          { id: 2, title: '行前准备', order: 2, tasks: [
            { id: 4, title: '兑换日元', isCompleted: true },
            { id: 5, title: '购买流量卡', isCompleted: true }
          ]}
        ]
      },
      {
        id: 2,
        title: '欧洲留学申请计划',
        status: 'generating',
        type: 'study',
        destination: { country: '法国', city: '巴黎' },
        createdAt: '2026-05-01',
        phases: [
          { id: 3, title: '选校定位', order: 1, tasks: [
            { id: 6, title: '确定申请院校', isCompleted: true },
            { id: 7, title: '准备语言考试', isCompleted: false }
          ]},
          { id: 4, title: '材料准备', order: 2, tasks: [
            { id: 8, title: '撰写个人陈述', isCompleted: false },
            { id: 9, title: '获取推荐信', isCompleted: false }
          ]}
        ]
      },
      {
        id: 3,
        title: '澳大利亚打工旅行',
        status: 'draft',
        type: 'work',
        destination: { country: '澳大利亚', city: '悉尼' },
        createdAt: '2026-05-05',
        phases: []
      }
    ],
    total: 3,
    page: 1,
    pageSize: 20
  }));
});

app.get('/api/plan/generating', (req, res) => {
  res.json(mockResponse({
    id: 2,
    title: '欧洲留学申请计划',
    type: 'study',
    status: 'generating',
    destination: { country: '法国', city: '巴黎', province: '法兰西岛' },
    createdAt: '2026-05-01',
    updatedAt: '2026-05-08'
  }));
});

app.post('/api/plan', (req, res) => {
  res.json(mockResponse({ id: 3, title: '新计划', status: 'draft' }));
});

app.get('/api/plan/:id', (req, res) => {
  res.json(mockResponse({
    id: parseInt(req.params.id) || 1,
    title: '日本关西7日深度游',
    type: 'tourism',
    status: 'completed',
    destination: { country: '日本', city: '大阪', province: '关西' },
    createdAt: '2026-04-15',
    updatedAt: '2026-05-01',
    phases: [
      {
        id: 1,
        title: '行程规划',
        order: 1,
        tasks: [
          { id: 1, title: '办理签证', isCompleted: true },
          { id: 2, title: '预订机票', isCompleted: true },
          { id: 3, title: '预订酒店', isCompleted: true }
        ]
      },
      {
        id: 2,
        title: '行前准备',
        order: 2,
        tasks: [
          { id: 4, title: '兑换日元', isCompleted: true },
          { id: 5, title: '购买流量卡', isCompleted: true }
        ]
      }
    ]
  }));
});

app.put('/api/plan/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/plan/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.post('/api/plan/generate', (req, res) => {
  res.json(mockResponse({ planId: 3, status: 'generating' }));
});

app.post('/api/plan/save-generated', (req, res) => {
  res.json(mockResponse({ id: 4, title: 'AI生成的计划' }));
});

// Phase endpoints
app.get('/api/plan/:planId/phases', (req, res) => {
  res.json(mockResponse([
    { id: 1, title: '行程规划', order: 1, tasks: [
      { id: 1, title: '办理签证', isCompleted: true },
      { id: 2, title: '预订机票', isCompleted: true },
      { id: 3, title: '预订酒店', isCompleted: true }
    ]},
    { id: 2, title: '行前准备', order: 2, tasks: [
      { id: 4, title: '兑换日元', isCompleted: true },
      { id: 5, title: '购买流量卡', isCompleted: false }
    ]}
  ]));
});

app.post('/api/phase', (req, res) => {
  res.json(mockResponse({ id: 10, title: '新阶段' }));
});

app.put('/api/phase/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/phase/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.put('/api/plan/:planId/phases/reorder', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Task endpoints
app.get('/api/phase/:phaseId/tasks', (req, res) => {
  res.json(mockResponse([
    { id: 1, title: '办理签证', completed: false },
    { id: 2, title: '预订机票', completed: true }
  ]));
});

app.get('/api/task/:id', (req, res) => {
  res.json(mockResponse({ id: 1, title: '办理签证', completed: false, description: '需要准备材料' }));
});

app.post('/api/task', (req, res) => {
  res.json(mockResponse({ id: 20, title: '新任务' }));
});

app.put('/api/task/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/task/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.post('/api/task/:id/complete', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.put('/api/phase/:phaseId/tasks/reorder', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.get('/api/task/:taskId/ai-suggestion', (req, res) => {
  res.json(mockResponse({ suggestion: '建议：提前预约可以节省时间' }));
});

// Home endpoints - Articles
app.get('/api/home/article/list', (req, res) => {
  res.json(mockResponse({
    list: [
      {
        id: 1,
        title: '日本关西7日深度游攻略｜京都大阪奈良完整路线',
        description: '这篇攻略包含关西地区最经典的路线规划，从大阪到京都再到奈良，带你体验最地道的日本文化。',
        content: `<h2>行程概览</h2>
<p>本次行程为<strong>7天6晚</strong>的关西深度游，涵盖大阪、京都、奈良三大核心城市。</p>

<h3>Day 1：抵达大阪</h3>
<ul>
<li>下午抵达关西机场，乘坐南海电铁前往难波</li>
<li>入住道顿堀附近酒店，傍晚漫步心斋桥</li>
<li>品尝金龙拉面，感受大阪夜市氛围</li>
</ul>

<h3>Day 2：大阪城与购物</h3>
<p>上午游览<strong>大阪城公园</strong>，登天守阁俯瞰城市全景。下午前往<em>心斋桥</em>和<em>戎桥筋</em>购物，晚上可以在道顿堀品尝各种美食。</p>

<blockquote>建议购买大阪周游卡，可以免费进入多个景点并无限乘坐地铁</blockquote>

<h3>Day 3：京都岚山</h3>
<ul>
<li>乘坐JR前往岚山</li>
<li>游览岚山竹林和渡月桥</li>
<li>品尝岚山豆腐料理</li>
<li>下午前往金阁寺</li>
</ul>

<h3>Day 4：京都东山</h3>
<p>游览<strong>清水寺</strong>、<strong>二年坂三年坂</strong>，体验传统京都风貌。傍晚前往祇园花见小路，感受艺伎文化。</p>

<h3>Day 5：奈良一日游</h3>
<p>从京都乘坐近铁前往奈良，游览<em>奈良公园</em>与可爱的小鹿互动，参观<strong>东大寺</strong>大佛殿。</p>

<h3>Day 6：大阪环球影城</h3>
<p>全天游览日本环球影城（USJ），推荐游玩项目：哈利波特魔法世界、蜘蛛侠惊魂历险记。</p>

<h3>Day 7：返程</h3>
<p>上午可以在黑门市场品尝新鲜海鲜，下午前往关西机场返程。</p>

<h2>交通指南</h2>
<p>建议购买<strong>关西周游券（Kansai Thru Pass）</strong>，可无限乘坐地铁、公交和部分私铁，有效期分为1日、2日、3日、4日券。</p>

<h2>住宿推荐</h2>
<ol>
<li><strong>大阪：</strong>道顿堀附近，交通便利，购物美食丰富</li>
<li><strong>京都：</strong>四条河原町周边，传统与现代结合</li>
</ol>

<h2>美食推荐</h2>
<ul>
<li>拉面：金龙拉面、道顿堀一兰</li>
<li>寿司：黑门市场的大起水产</li>
<li>和果子：京都的藤利兵卫</li>
<li>烤肉：大阪的牛角吃到饱</li>
</ul>

<h2>注意事项</h2>
<p>日本电压为100V，不需要转换插头。但建议提前购买<strong>流量卡</strong>或租借随身WiFi，便于导航和翻译。</p>`,
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        tag: '日本',
        authorId: 1,
        author: { id: 1, username: '旅行达人', nickname: '小七', avatar: '' },
        views: 12580,
        favorites: 892,
        isPublished: true,
        isFeatured: true,
        publishedAt: '2026-05-01T10:00:00Z',
        createdAt: '2026-05-01T10:00:00Z',
        updatedAt: '2026-05-01T10:00:00Z',
        isFavorited: false,
        isLiked: true
      },
      {
        id: 2,
        title: '欧洲15天自由行：巴黎到罗马经典路线分享',
        description: '从巴黎到罗马，穿越阿尔卑斯山，探访最浪漫的欧洲城市。这份攻略涵盖交通、住宿、景点门票等实用信息。',
        content: '欧洲15天自由行完整攻略，包含详细路线规划...',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        tag: '欧洲',
        authorId: 2,
        author: { id: 2, username: '欧洲通', nickname: '欧洲小王子', avatar: '' },
        views: 8934,
        favorites: 567,
        isPublished: true,
        isFeatured: false,
        publishedAt: '2026-04-28T10:00:00Z',
        createdAt: '2026-04-28T10:00:00Z',
        updatedAt: '2026-04-28T10:00:00Z',
        isFavorited: true,
        isLiked: false
      },
      {
        id: 3,
        title: '东南亚背包客指南：3周穿越泰老柬',
        description: '超详细的东南亚背包客攻略，包含签证办理、机票预订、住宿推荐和实用 Tips。',
        content: '东南亚3周背包客攻略...',
        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
        tag: '东南亚',
        authorId: 3,
        author: { id: 3, username: '背包客小K', nickname: '小K在路上', avatar: '' },
        views: 6789,
        favorites: 345,
        isPublished: true,
        isFeatured: true,
        publishedAt: '2026-04-25T10:00:00Z',
        createdAt: '2026-04-25T10:00:00Z',
        updatedAt: '2026-04-25T10:00:00Z',
        isFavorited: false,
        isLiked: false
      },
      {
        id: 4,
        title: '新西兰南岛自驾14天：寻找中土世界的美景',
        description: '《指环王》同款路线，带你穿越新西兰南岛，探访霍比屯、冰川湖和星空小镇。',
        content: '新西兰南岛自驾攻略...',
        image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
        tag: '大洋洲',
        authorId: 4,
        author: { id: 4, username: '户外爱好者', nickname: '山野追光', avatar: '' },
        views: 4567,
        favorites: 234,
        isPublished: true,
        isFeatured: false,
        publishedAt: '2026-04-20T10:00:00Z',
        createdAt: '2026-04-20T10:00:00Z',
        updatedAt: '2026-04-20T10:00:00Z',
        isFavorited: false,
        isLiked: false
      },
      {
        id: 5,
        title: '冰岛环岛全攻略：追寻极光与火山的奇幻之旅',
        description: '从雷克雅未克出发，沿着1号公路环岛一周，探访瀑布、冰川、温泉和黑沙滩。',
        content: '冰岛环岛完整攻略...',
        image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
        tag: '北欧',
        authorId: 5,
        author: { id: 5, username: '极光猎人', nickname: '冰岛小猪', avatar: '' },
        views: 3456,
        favorites: 189,
        isPublished: true,
        isFeatured: true,
        publishedAt: '2026-04-15T10:00:00Z',
        createdAt: '2026-04-15T10:00:00Z',
        updatedAt: '2026-04-15T10:00:00Z',
        isFavorited: false,
        isLiked: false
      }
    ],
    total: 5,
    page: 1,
    pageSize: 10
  }));
});

app.get('/api/home/article/:id', (req, res) => {
  res.json(mockResponse({
    id: 1,
    title: '日本关西7日深度游攻略｜京都大阪奈良完整路线',
    description: '这篇攻略包含关西地区最经典的路线规划，从大阪到京都再到奈良，带你体验最地道的日本文化。',
    content: `<h2>行程概览</h2>
<p>本次行程为<strong>7天6晚</strong>的关西深度游，涵盖大阪、京都、奈良三大核心城市。</p>

<h3>Day 1：抵达大阪</h3>
<ul>
<li>下午抵达关西机场，乘坐南海电铁前往难波</li>
<li>入住道顿堀附近酒店，傍晚漫步心斋桥</li>
<li>品尝金龙拉面，感受大阪夜市氛围</li>
</ul>

<h3>Day 2：大阪城与购物</h3>
<p>上午游览<strong>大阪城公园</strong>，登天守阁俯瞰城市全景。下午前往<em>心斋桥</em>和<em>戎桥筋</em>购物，晚上可以在道顿堀品尝各种美食。</p>

<blockquote>建议购买大阪周游卡，可以免费进入多个景点并无限乘坐地铁</blockquote>

<h3>Day 3：京都岚山</h3>
<ul>
<li>乘坐JR前往岚山</li>
<li>游览岚山竹林和渡月桥</li>
<li>品尝岚山豆腐料理</li>
<li>下午前往金阁寺</li>
</ul>

<h3>Day 4：京都东山</h3>
<p>游览<strong>清水寺</strong>、<strong>二年坂三年坂</strong>，体验传统京都风貌。傍晚前往祇园花见小路，感受艺伎文化。</p>

<h3>Day 5：奈良一日游</h3>
<p>从京都乘坐近铁前往奈良，游览<em>奈良公园</em>与可爱的小鹿互动，参观<strong>东大寺</strong>大佛殿。</p>

<h3>Day 6：大阪环球影城</h3>
<p>全天游览日本环球影城（USJ），推荐游玩项目：哈利波特魔法世界、蜘蛛侠惊魂历险记。</p>

<h3>Day 7：返程</h3>
<p>上午可以在黑门市场品尝新鲜海鲜，下午前往关西机场返程。</p>

<h2>交通指南</h2>
<p>建议购买<strong>关西周游券（Kansai Thru Pass）</strong>，可无限乘坐地铁、公交和部分私铁，有效期分为1日、2日、3日、4日券。</p>

<h2>住宿推荐</h2>
<ol>
<li><strong>大阪：</strong>道顿堀附近，交通便利，购物美食丰富</li>
<li><strong>京都：</strong>四条河原町周边，传统与现代结合</li>
</ol>

<h2>美食推荐</h2>
<ul>
<li>拉面：金龙拉面、道顿堀一兰</li>
<li>寿司：黑门市场的大起水产</li>
<li>和果子：京都的藤利兵卫</li>
<li>烤肉：大阪的牛角吃到饱</li>
</ul>

<h2>注意事项</h2>
<p>日本电压为100V，不需要转换插头。但建议提前购买<strong>流量卡</strong>或租借随身WiFi，便于导航和翻译。</p>`,
    author: { id: 1, username: '旅行达人', nickname: '小七', avatar: '', email: 'xiaoci@example.com' },
    views: 12580,
    favorites: 892,
    isPublished: true,
    isFeatured: true,
    publishedAt: '2026-05-01T10:00:00Z',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    isFavorited: false,
    isLiked: true,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    tag: '日本',
    authorId: 1
  }));
});

app.post('/api/home/article', (req, res) => {
  res.json(mockResponse({ id: 10 }));
});

app.put('/api/home/article/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/home/article/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Home endpoints - Questions
app.get('/api/home/question/list', (req, res) => {
  res.json(mockResponse({
    list: [
      {
        id: 1,
        title: '如何申请日本旅游签证？需要准备哪些材料？',
        content: '计划今年暑假去日本旅行，第一次申请签证，想知道需要准备哪些材料？有没有大神可以分享一下经验？',
        authorId: 1,
        author: { id: 1, username: '想去日本', nickname: '东京梦', avatar: '' },
        category: '签证',
        views: 2345,
        repliesCount: 12,
        isResolved: true,
        isDeleted: false,
        createdAt: '2026-05-05T10:00:00Z',
        updatedAt: '2026-05-06T10:00:00Z',
        isFavorited: false
      },
      {
        id: 2,
        title: '欧洲签证申请被拒了，想知道原因可能是什么？',
        content: '上周申请法国签证被拒，使馆给的理由是"旅行目的不明确"，这种情况应该怎么申诉或者重新申请？',
        authorId: 2,
        author: { id: 2, username: '欧洲控', nickname: '巴黎小熊', avatar: '' },
        category: '签证',
        views: 1890,
        repliesCount: 8,
        isResolved: false,
        isDeleted: false,
        createdAt: '2026-05-04T10:00:00Z',
        updatedAt: '2026-05-04T10:00:00Z',
        isFavorited: true
      },
      {
        id: 3,
        title: '第一次去泰国，需要换多少泰铢比较合适？',
        content: '准备和朋友一起去泰国曼谷和清迈，大概7天左右。想知道需要换多少泰铢？哪些地方可以刷卡或用支付宝？',
        authorId: 3,
        author: { id: 3, username: '背包客', nickname: '泰兰德追光', avatar: '' },
        category: '货币',
        views: 1567,
        repliesCount: 15,
        isResolved: false,
        isDeleted: false,
        createdAt: '2026-05-03T10:00:00Z',
        updatedAt: '2026-05-03T10:00:00Z',
        isFavorited: false
      },
      {
        id: 4,
        title: '新西兰打工旅行签证怎么申请？有什么条件要求？',
        content: '听说新西兰每年有1000个打工旅行签证名额，想知道申请条件是什么？英语成绩要求多少分？',
        authorId: 4,
        author: { id: 4, username: '海外党', nickname: '中土世界探险家', avatar: '' },
        category: '签证',
        views: 3456,
        repliesCount: 23,
        isResolved: true,
        isDeleted: false,
        createdAt: '2026-05-02T10:00:00Z',
        updatedAt: '2026-05-02T10:00:00Z',
        isFavorited: false
      },
      {
        id: 5,
        title: '在日本旅行时，手机流量卡怎么选择比较好？',
        content: '准备去日本自由行，需要解决网络问题。不知道是该买流量卡还是租随身WiFi？有什么推荐吗？',
        authorId: 5,
        author: { id: 5, username: '数码达人', nickname: '科技小熊', avatar: '' },
        category: '通讯',
        views: 987,
        repliesCount: 6,
        isResolved: true,
        isDeleted: false,
        createdAt: '2026-05-01T10:00:00Z',
        updatedAt: '2026-05-01T10:00:00Z',
        isFavorited: false
      },
      {
        id: 6,
        title: '冰岛环岛自驾需要提前预订住宿吗？',
        content: '计划6月去冰岛自驾，听说那边住宿很紧张，需要提前多久预订？有没有好的住宿推荐？',
        authorId: 6,
        author: { id: 6, username: '自驾游爱好者', nickname: '极光猎人', avatar: '' },
        category: '住宿',
        views: 1234,
        repliesCount: 9,
        isResolved: false,
        isDeleted: false,
        createdAt: '2026-04-30T10:00:00Z',
        updatedAt: '2026-04-30T10:00:00Z',
        isFavorited: false
      }
    ],
    total: 6,
    page: 1,
    pageSize: 10
  }));
});

app.get('/api/home/question/:id', (req, res) => {
  res.json(mockResponse({
    id: 1,
    title: '如何申请日本旅游签证？需要准备哪些材料？',
    content: `<p>计划今年暑假去<strong>日本旅行</strong>，第一次申请签证，想知道需要准备哪些材料？</p>
<p>具体情况：</p>
<ul>
<li>计划7月中旬出发，停留7天</li>
<li>户籍在 北京，单身，无房</li>
<li>有稳定工作，年薪约15万</li>
</ul>
<p>听说日本签证比较复杂，需要准备的材料很多。想问问大神们：</p>
<ol>
<li>自己办理和找旅行社代办哪个更好？</li>
<li>资产证明方面需要多少银行流水？</li>
<li>有没有什么坑需要避开？</li>
</ol>
<p>先谢谢大家了！🙏</p>`,
    authorId: 1,
    author: { id: 1, username: '想去日本', nickname: '东京梦', avatar: '' },
    category: '签证',
    views: 2345,
    repliesCount: 12,
    isResolved: true,
    isDeleted: false,
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-05-06T10:00:00Z',
    isFavorited: false,
    answers: [
      {
        id: 1,
        questionId: 1,
        authorId: 10,
        author: { id: 10, username: '签证专家', nickname: '签证小能手', avatar: '' },
        content: `<p>日本旅游签证需要准备以下材料：</p>

<h3>基础材料</h3>
<ol>
<li><strong>护照原件</strong>（有效期6个月以上）</li>
<li><strong>签证申请表</strong>（正反面打印，手写填写）</li>
<li><strong>照片</strong>（白底2寸，尺寸4.5cm×4.5cm）</li>
<li><strong>身份证复印件</strong>（正反面在同一张A4纸上）</li>
<li><strong>户口簿复印件</strong>（全部页面）</li>
</ol>

<h3>资产证明</h3>
<ul>
<li>银行流水（<em>近6个月</em>，余额10万以上）</li>
<li>房产证复印件（可选，非必须）</li>
<li>车辆行驶证复印件（可选）</li>
</ul>

<h3>工作证明</h3>
<ul>
<li>在职证明（盖公章）</li>
<li>营业执照复印件（盖公章）</li>
</ul>

<h3>行程材料</h3>
<ul>
<li>往返机票预订单</li>
<li>酒店预订单</li>
<li>行程安排表</li>
</ul>

<blockquote>如果是单次签证，建议提前1个月申请。资产证明方面，你的情况应该够了，但银行流水最好显示稳定收入。</blockquote>

<h3>我的建议</h3>
<p>自己办理其实不难，就是准备材料麻烦。如果第一次办，建议找靠谱的旅行社，他们知道每种情况怎么处理。</p>`,
        likes: 45,
        repliesCount: 3,
        isOfficial: true,
        isBestAnswer: true,
        isDeleted: false,
        createdAt: '2026-05-05T12:00:00Z',
        updatedAt: '2026-05-05T12:00:00Z',
        isLiked: true
      },
      {
        id: 2,
        questionId: 1,
        authorId: 11,
        author: { id: 11, username: '日本通', nickname: '东京漂移手', avatar: '' },
        content: '补充一下，如果走旅行社的话，他们会帮你整理材料，比较省心。资产证明方面，一般要求年收入10万以上流水。',
        likes: 23,
        repliesCount: 1,
        isOfficial: false,
        isBestAnswer: false,
        isDeleted: false,
        createdAt: '2026-05-05T14:00:00Z',
        updatedAt: '2026-05-05T14:00:00Z',
        isLiked: false
      }
    ]
  }));
});

app.post('/api/home/question', (req, res) => {
  res.json(mockResponse({ id: 10 }));
});

app.put('/api/home/question/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/home/question/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Home endpoints - Answers
app.get('/api/home/answer/list', (req, res) => {
  res.json(mockResponse({
    list: [
      {
        id: 1,
        questionId: parseInt(req.query.questionId) || 1,
        authorId: 10,
        author: { id: 10, username: '签证专家', nickname: '签证小能手', avatar: '' },
        content: `<p>日本旅游签证需要准备以下材料：</p>

<h3>基础材料</h3>
<ol>
<li><strong>护照原件</strong>（有效期6个月以上）</li>
<li><strong>签证申请表</strong>（正反面打印，手写填写）</li>
<li><strong>照片</strong>（白底2寸，尺寸4.5cm×4.5cm）</li>
<li><strong>身份证复印件</strong>（正反面在同一张A4纸上）</li>
<li><strong>户口簿复印件</strong>（全部页面）</li>
</ol>

<h3>资产证明</h3>
<ul>
<li>银行流水（<em>近6个月</em>，余额10万以上）</li>
<li>房产证复印件（可选，非必须）</li>
<li>车辆行驶证复印件（可选）</li>
</ul>

<h3>工作证明</h3>
<ul>
<li>在职证明（盖公章）</li>
<li>营业执照复印件（盖公章）</li>
</ul>

<h3>行程材料</h3>
<ul>
<li>往返机票预订单</li>
<li>酒店预订单</li>
<li>行程安排表</li>
</ul>

<blockquote>如果是单次签证，建议提前1个月申请。资产证明方面，你的情况应该够了，但银行流水最好显示稳定收入。</blockquote>

<h3>我的建议</h3>
<p>自己办理其实不难，就是准备材料麻烦。如果第一次办，建议找靠谱的旅行社，他们知道每种情况怎么处理。</p>`,
        likes: 45,
        repliesCount: 3,
        isOfficial: true,
        isBestAnswer: true,
        isDeleted: false,
        createdAt: '2026-05-05T12:00:00Z',
        updatedAt: '2026-05-05T12:00:00Z',
        isLiked: true
      },
      {
        id: 2,
        questionId: parseInt(req.query.questionId) || 1,
        authorId: 11,
        author: { id: 11, username: '日本通', nickname: '东京漂移手', avatar: '' },
        content: '补充一下，如果走旅行社的话，他们会帮你整理材料，比较省心。资产证明方面，一般要求年收入10万以上流水。',
        likes: 23,
        repliesCount: 1,
        isOfficial: false,
        isBestAnswer: false,
        isDeleted: false,
        createdAt: '2026-05-05T14:00:00Z',
        updatedAt: '2026-05-05T14:00:00Z',
        isLiked: false
      }
    ],
    total: 2,
    page: 1,
    pageSize: 20
  }));
});

app.get('/api/home/answer/:id', (req, res) => {
  res.json(mockResponse({ id: 1, content: '需要准备材料', author: '达人A' }));
});

app.post('/api/home/answer', (req, res) => {
  res.json(mockResponse({ id: 10 }));
});

app.put('/api/home/answer/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.delete('/api/home/answer/:id', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Interaction endpoints
app.post('/api/home/interaction/favorite', (req, res) => {
  res.json(mockResponse({ success: true, favorited: true }));
});

app.post('/api/home/interaction/like', (req, res) => {
  res.json(mockResponse({ success: true, liked: true }));
});

app.post('/api/home/interaction/follow', (req, res) => {
  res.json(mockResponse({ success: true, following: true }));
});

app.post('/api/home/interaction/view', (req, res) => {
  res.json(mockResponse({ success: true }));
});

app.get('/api/home/interaction/check', (req, res) => {
  res.json(mockResponse({ favorited: false, liked: false, following: false }));
});

// Resources endpoints
app.get('/api/resources/list', (req, res) => {
  res.json(mockResponse({
    日本: [
      { id: 1, name: 'Japan Travel', category: '工具App', description: '日本旅行必备App' },
      { id: 2, name: '换乘案内', category: '交通', description: '日本公共交通查询' }
    ],
    欧洲: [
      { id: 3, name: 'RailEurope', category: '交通', description: '欧洲铁路查询' }
    ]
  }));
});

app.get('/api/resources/categories', (req, res) => {
  res.json(mockResponse(['旅行工具', '交通', '美食', '住宿', '签证']));
});

// User endpoints
app.get('/api/user/info', (req, res) => {
  res.json(mockResponse({ id: 1, username: 'test', email: 'test@example.com', avatar: '' }));
});

app.put('/api/user/update', (req, res) => {
  res.json(mockResponse({ success: true }));
});

// Fallback for all other requests
app.use((req, res) => {
  console.log(`Mock server received: ${req.method} ${req.path}`);
  res.json(mockResponse({}));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}/api`);
  console.log(`API_BASE_URL should be: http://localhost:${PORT}/api`);
});