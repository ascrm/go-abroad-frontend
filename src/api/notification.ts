import client from './client';
import type { PageR } from '../types/common';

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  isPinned: boolean;
  relatedId?: number;
  relatedType?: string;
  actor?: {
    userId: number;
    nickname: string;
    avatar?: string;
  };
  time: string;
  createdAt: string;
}

export interface NotificationListResponse extends PageR<NotificationResponse[]> {}

// 获取通知列表
export async function getNotificationList(page = 1, pageSize = 20): Promise<NotificationListResponse> {
  return client.get('/notification/list', { params: { page, pageSize } });
}

// 获取未读通知数量
export async function getUnreadCount(): Promise<{ count: number }> {
  return client.get('/notification/unread-count');
}

// 标记全部已读
export async function markAllAsRead(): Promise<void> {
  return client.put('/notification/read-all');
}

// 标记单条已读
export async function markAsRead(id: number): Promise<void> {
  return client.put(`/notification/read/${id}`);
}

// 切换置顶状态
export async function togglePin(id: number): Promise<void> {
  return client.put(`/notification/pin/${id}`);
}

// 删除通知
export async function deleteNotification(id: number): Promise<void> {
  return client.delete(`/notification/${id}`);
}