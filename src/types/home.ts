// ============================================
// Home 模块 - 数据类型定义
// ============================================

import type { User } from './auth';

// ============================================
// 文章相关类型
// ============================================

export interface Article {
  id: number;
  title: string;
  description?: string;
  content: string;
  image?: string;
  tag?: string;
  authorId: number;
  author?: User;
  views: number;
  favorites: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean; // 当前用户是否收藏
  isLiked?: boolean; // 当前用户是否点赞
  isFollowed?: boolean; // 当前用户是否关注了作者
}

export interface ArticleListParams {
  tag?: string;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ArticleListResponse {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateArticleParams {
  title: string;
  description?: string;
  content: string;
  image?: string;
  tag?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UpdateArticleParams extends CreateArticleParams {
  id: number;
}

// ============================================
// 问答-问题相关类型
// ============================================

export interface Question {
  id: number;
  title: string;
  authorId: number;
  author?: User;
  category?: string;
  views: number;
  repliesCount: number;
  isResolved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
  topAnswer?: TopAnswer;
  hasAnswers?: boolean;
}

export interface TopAnswer {
  author: {
    userId: number;
    username?: string;
    nickname?: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  repliesCount: number;
}

export interface QuestionListParams {
  category?: string;
  isResolved?: boolean;
  page?: number;
  pageSize?: number;
}

export interface QuestionListResponse {
  list: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateQuestionParams {
  title: string;
  category?: string;
}

export interface UpdateQuestionParams extends CreateQuestionParams {
  id: number;
}

// ============================================
// 问答-回答相关类型
// ============================================

export interface Answer {
  id: number;
  questionId: number;
  authorId: number;
  author?: User;
  content: string;
  likes: number;
  favorites: number;
  views: number;
  repliesCount: number;
  isOfficial: boolean;
  isBestAnswer: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean; // 当前用户是否点赞
  isFavorited?: boolean; // 当前用户是否收藏
  isFollowed?: boolean; // 当前用户是否关注了作者
}

export interface AnswerListParams {
  questionId: number;
  page?: number;
  pageSize?: number;
}

export interface AnswerListResponse {
  list: Answer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAnswerParams {
  questionId: number;
  content: string;
}

export interface UpdateAnswerParams extends CreateAnswerParams {
  id: number;
}

// ============================================
// 问答-评论相关类型
// ============================================

export interface Comment {
  id: number;
  answerId: number;
  parentId: number | null;
  author?: User;
  content: string;
  likes: number;
  repliesCount: number;
  replies: Comment[];
  createdAt: string;
  isLiked?: boolean;
}

export interface CommentListParams {
  answerId: number;
  page?: number;
  pageSize?: number;
}

export interface CommentListResponse {
  list: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCommentParams {
  answerId: number;
  parentId?: number;
  content: string;
}

// ============================================
// 互动相关类型
// ============================================

export type InteractionTargetType = 'article' | 'question' | 'answer' | 'user';
export type InteractionAction = 'favorite' | 'like' | 'follow' | 'view';

export interface InteractionParams {
  targetId: number;
  targetType: InteractionTargetType;
  action: InteractionAction;
}

export interface InteractionResponse {
  success: boolean;
  action: InteractionAction;
  isActive: boolean;
}

export interface CheckInteractionParams {
  targetId: number;
  targetType: InteractionTargetType;
}

export interface CheckInteractionResponse {
  isFavorited: boolean;
  isLiked: boolean;
  isFollowed: boolean;
}

// ============================================
// 首页数据
// ============================================

export interface HomeData {
  featuredArticles: Article[];
  recentQuestions: Question[];
}
