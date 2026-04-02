// ============================================
// Resources 模块 - API 请求
// ============================================

import type { ResourceListResponse } from '@/src/types/resource';
import { API_ENDPOINTS } from '../constants/api';
import client from './client';

/**
 * 获取指定国家的资源列表
 * 后端通过 JOIN 返回每条资源的 categoryName/categoryIcon/categoryColor
 * 前端按 categoryId 分组后渲染
 */
export async function getResourceList(country: string): Promise<ResourceListResponse> {
  return client.get(API_ENDPOINTS.resources.list, { params: { country } });
}
