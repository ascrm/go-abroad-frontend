// 通用分页响应
export interface PageR<T = any> {
  list: T;
  total: number;
  page: number;
  pageSize: number;
}