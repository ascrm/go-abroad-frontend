// ============================================
// Search 模块 - API 请求
// ============================================

import client from './client';
import { API_ENDPOINTS } from '../constants/api';

// ============================================
// 搜索相关类型
// ============================================

export interface ArticleSearchItem {
  id: number;
  title: string;
  description: string;
  tag: string;
  time: string;
}

export interface PlanSearchItem {
  id: number;
  title: string;
  description: string;
  tag: string;
}

export interface QuestionSearchItem {
  id: number;
  title: string;
  category: string;
  tag: string;
}

export interface UserSearchItem {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
}

export interface SearchResult {
  articles: ArticleSearchItem[];
  plans: PlanSearchItem[];
  questions: QuestionSearchItem[];
  users: UserSearchItem[];
}

// ============================================
// 搜索 API
// ============================================

/**
 * 搜索全部（文章、规划、问答、用户）
 */
export async function searchAll(keyword: string): Promise<SearchResult> {
  return client.get(API_ENDPOINTS.search.main, { params: { q: keyword } });
}