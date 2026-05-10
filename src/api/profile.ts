import client from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface BrowseHistoryItem {
  id: number;
  title: string;
  author: string;
  views: string;
  thumbnailUrl?: string;
  sourceType: string;
  sourceId: number;
}

export const profileApi = {
  // 获取浏览历史
  getBrowseHistory: (): Promise<BrowseHistoryItem[]> => {
    return client.get(API_ENDPOINTS.profile.browseHistory);
  },
};