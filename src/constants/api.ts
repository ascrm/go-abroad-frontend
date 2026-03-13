// API 地址配置
export const API_BASE_URL = 'http://192.168.31.183:8080/api';

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
    saveGenerated: '/plan/save-generated',
    
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
};
