// ============================================
// Home 模块 - API 请求
// ============================================

import client from './client';
import { API_ENDPOINTS } from '../constants/api';
import type {
  Article,
  ArticleListParams,
  ArticleListResponse,
  CreateArticleParams,
  UpdateArticleParams,
  Question,
  QuestionListParams,
  QuestionListResponse,
  CreateQuestionParams,
  UpdateQuestionParams,
  Answer,
  AnswerListParams,
  AnswerListResponse,
  CreateAnswerParams,
  UpdateAnswerParams,
  Comment,
  CommentListParams,
  CommentListResponse,
  CreateCommentParams,
  InteractionParams,
  InteractionResponse,
  CheckInteractionParams,
  CheckInteractionResponse,
  HomeData,
} from '../types/home';

// ============================================
// 文章相关 API
// ============================================

/**
 * 获取文章列表
 */
export async function getArticleList(params: ArticleListParams = {}): Promise<ArticleListResponse> {
  return client.get(API_ENDPOINTS.home.articleList, { params });
}

/**
 * 获取文章详情
 */
export async function getArticleDetail(id: number): Promise<Article> {
  return client.get(`${API_ENDPOINTS.home.articleDetail}/${id}`);
}

/**
 * 获取推荐文章（首页展示）
 */
export async function getFeaturedArticles(): Promise<Article[]> {
  const response = await getArticleList({ isFeatured: true, pageSize: 5 });
  return response.list;
}

/**
 * 创建文章
 */
export async function createArticle(data: CreateArticleParams): Promise<Article> {
  return client.post(API_ENDPOINTS.home.articleCreate, data);
}

/**
 * 更新文章
 */
export async function updateArticle(data: UpdateArticleParams): Promise<Article> {
  return client.put(`${API_ENDPOINTS.home.articleUpdate}/${data.id}`, data);
}

/**
 * 删除文章
 */
export async function deleteArticle(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.home.articleDelete}/${id}`);
}

// ============================================
// 问答-问题相关 API
// ============================================

/**
 * 获取问题列表
 */
export async function getQuestionList(params: QuestionListParams = {}): Promise<QuestionListResponse> {
  return client.get(API_ENDPOINTS.home.questionList, { params });
}

/**
 * 获取问题详情
 */
export async function getQuestionDetail(id: number): Promise<Question> {
  return client.get(`${API_ENDPOINTS.home.questionDetail}/${id}`);
}

/**
 * 获取最新问题（首页展示）
 */
export async function getRecentQuestions(pageSize: number = 5): Promise<Question[]> {
  const response = await getQuestionList({ pageSize });
  return response.list;
}

/**
 * 创建问题
 */
export async function createQuestion(data: CreateQuestionParams): Promise<Question> {
  return client.post(API_ENDPOINTS.home.questionCreate, data);
}

/**
 * 更新问题
 */
export async function updateQuestion(data: UpdateQuestionParams): Promise<Question> {
  return client.put(`${API_ENDPOINTS.home.questionUpdate}/${data.id}`, data);
}

/**
 * 删除问题
 */
export async function deleteQuestion(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.home.questionDelete}/${id}`);
}

// ============================================
// 问答-回答相关 API
// ============================================

/**
 * 获取回答列表
 */
export async function getAnswerList(params: AnswerListParams): Promise<AnswerListResponse> {
  return client.get(API_ENDPOINTS.home.answerList, { params });
}

/**
 * 获取回答详情
 */
export async function getAnswerDetail(id: number): Promise<Answer> {
  return client.get(`${API_ENDPOINTS.home.answerDetail}/${id}`);
}

/**
 * 创建回答
 */
export async function createAnswer(data: CreateAnswerParams): Promise<Answer> {
  return client.post(API_ENDPOINTS.home.answerCreate, data);
}

/**
 * 更新回答
 */
export async function updateAnswer(data: UpdateAnswerParams): Promise<Answer> {
  return client.put(`${API_ENDPOINTS.home.answerUpdate}/${data.id}`, data);
}

/**
 * 删除回答
 */
export async function deleteAnswer(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.home.answerDelete}/${id}`);
}

// ============================================
// 问答-评论相关 API
// ============================================

/**
 * 获取评论列表
 */
export async function getCommentList(params: CommentListParams): Promise<CommentListResponse> {
  return client.get(API_ENDPOINTS.home.commentList, { params });
}

/**
 * 创建评论
 */
export async function createComment(data: CreateCommentParams): Promise<Comment> {
  return client.post(API_ENDPOINTS.home.commentCreate, data);
}

/**
 * 删除评论
 */
export async function deleteComment(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.home.commentDelete}/${id}`);
}

// ============================================
// 互动相关 API
// ============================================

/**
 * 收藏/取消收藏
 */
export async function toggleFavorite(params: InteractionParams): Promise<InteractionResponse> {
  return client.post(API_ENDPOINTS.home.favorite, params);
}

/**
 * 点赞/取消点赞
 */
export async function toggleLike(params: InteractionParams): Promise<InteractionResponse> {
  return client.post(API_ENDPOINTS.home.like, params);
}

/**
 * 关注/取消关注
 */
export async function toggleFollow(params: InteractionParams): Promise<InteractionResponse> {
  return client.post(API_ENDPOINTS.home.follow, params);
}

/**
 * 记录浏览
 */
export async function recordView(params: InteractionParams): Promise<InteractionResponse> {
  return client.post(API_ENDPOINTS.home.view, params);
}

/**
 * 检查互动状态
 */
export async function checkInteraction(params: CheckInteractionParams): Promise<CheckInteractionResponse> {
  return client.get(API_ENDPOINTS.home.checkInteraction, { params });
}

// ============================================
// 首页数据
// ============================================

/**
 * 获取首页数据
 */
export async function getHomeData(): Promise<HomeData> {
  const [featuredArticles, recentQuestions] = await Promise.all([
    getFeaturedArticles(),
    getRecentQuestions(5),
  ]);
  return { featuredArticles, recentQuestions };
}

/**
 * 批量获取文章详情
 */
export async function getArticleBatch(ids: number[]): Promise<ArticleItem[]> {
  return client.post(API_ENDPOINTS.home.articleBatch, { ids });
}

/**
 * 批量获取问题详情
 */
export async function getQuestionBatch(ids: number[]): Promise<QuestionItem[]> {
  return client.post(API_ENDPOINTS.home.questionBatch, { ids });
}

// 简化版类型用于批量查询
export interface ArticleItem {
  id: number;
  title: string;
  author: string;
  views: string;
  thumbnail: string;
}

export interface QuestionItem {
  id: number;
  title: string;
  author: string;
  views: string;
}
