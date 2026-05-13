import { API_ENDPOINTS } from '../constants/api';
import { User } from '../types/auth';
import client from './client';

export interface UserUpdateParams {
  nickname?: string;
  username?: string;
  avatar?: string;
  bgUrl?: string;
  gender?: 0 | 1 | 2;
  birthday?: string;  // 格式：YYYY-MM-DD
  bio?: string;
}

export const userApi = {
  // 获取用户信息
  getInfo: (): Promise<User> => {
    return client.get(API_ENDPOINTS.user.info);
  },

  // 更新用户信息
  update: (data: UserUpdateParams): Promise<User> => {
    return client.put(API_ENDPOINTS.user.update, data);
  },

  // 上传头像图片到MinIO
  uploadAvatar: async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    formData.append('file', {
      uri,
      name: filename,
      type: 'image/jpeg',
    } as any);
    const url = await client.post(API_ENDPOINTS.resources.uploadImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return url;
  },
};
