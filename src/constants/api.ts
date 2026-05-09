// API 地址配置
export const API_BASE_URL = 'http://172.20.10.3:8080/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    sendCode: '/auth/sendCode',
    socialLogin: '/auth/social/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  user: {
    info: '/user/info',
    update: '/user/update',
  },
  plan: {
    list: '/plan/list',
    detail: '/plan',
    create: '/plan',
    update: '/plan',
    delete: '/plan',
    generate: '/plan/generate',
    generateStream: '/plan/generate/stream',
    saveGenerated: '/plan/save-generated',
    
    generatingPlan: '/plan/generating', // 获取 status=generating 的规划（最多一条）
    
    phaseList: '/phase', // {planId}/phases
    phaseCreate: '/phase',
    phaseUpdate: '/phase',
    phaseDelete: '/phase',
    phaseReorder: '/phase', // {planId}/phases/reorder
    
    taskList: '/task', // {phaseId}/tasks
    taskDetail: '/task',
    taskCreate: '/task',
    taskUpdate: '/task',
    taskDelete: '/task',
    taskComplete: '/task', // {id}/complete
    taskReorder: '/task', // {phaseId}/tasks/reorder
    taskAISuggestion: '/task', // {taskId}/ai-suggestion
  },
  home: {
    // 文章
    articleList: '/home/article/list',
    articleDetail: '/home/article',
    articleCreate: '/home/article',
    articleUpdate: '/home/article',
    articleDelete: '/home/article',

    // 问答-问题
    questionList: '/home/question/list',
    questionDetail: '/home/question',
    questionCreate: '/home/question',
    questionUpdate: '/home/question',
    questionDelete: '/home/question',

    // 问答-回答
    answerList: '/home/answer/list',
    answerDetail: '/home/answer',
    answerCreate: '/home/answer',
    answerUpdate: '/home/answer',
    answerDelete: '/home/answer',

    // 互动（收藏、点赞、关注、浏览）
    favorite: '/home/interaction/favorite',
    like: '/home/interaction/like',
    follow: '/home/interaction/follow',
    view: '/home/interaction/view',
    checkInteraction: '/home/interaction/check',
  },
  resources: {
    list: '/resources/list',      // 按国家获取资源列表（按分类聚合，含工具 App）
    categories: '/resources/categories', // 获取资源分类列表
  },
};
