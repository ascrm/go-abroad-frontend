import client from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ArticleResponse } from '@/src/types/home';

export const profileApi = {
  getMyArticles: (): Promise<ArticleResponse[]> => {
    return client.get(API_ENDPOINTS.profile.myArticles);
  },
  getMyFavoriteArticles: (): Promise<ArticleResponse[]> => {
    return client.get(API_ENDPOINTS.profile.myFavoriteArticles);
  },
  getMyBrowsedArticles: (): Promise<ArticleResponse[]> => {
    return client.get(API_ENDPOINTS.profile.myBrowsedArticles);
  },
};