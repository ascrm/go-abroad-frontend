// ============================================
// Resources 模块 - API 请求
// ============================================

import client from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Resource, ResourceCategory } from '../types/resource';

/**
 * 获取资源列表
 * @param country 国家名称（"全球" 返回工具 App，其他返回该国分类资源）
 */
export async function getResourceList(country: string): Promise<Resource[]> {
  return client.get(API_ENDPOINTS.resources.list, { params: { country } });
}

/**
 * 获取资源分类列表（按 sortOrder 排序）
 */
export async function getCategoryList(): Promise<ResourceCategory[]> {
  return client.get(API_ENDPOINTS.resources.categories);
}
