import client from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface BrowseHistoryItem {
  id: number;
  sourceType: 'article' | 'question';
  sourceId: number;
  browsedAt: string;
}

export const profileApi = {
  getBrowseHistory: (): Promise<BrowseHistoryResponse> => {
    return client.get(API_ENDPOINTS.profile.browseHistory);
  },
  getPlaylists: (): Promise<BrowseHistoryResponse> => {
    return client.get(API_ENDPOINTS.profile.playlists);
  },
};

export interface BrowseHistoryResponse {
  list: BrowseHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
};