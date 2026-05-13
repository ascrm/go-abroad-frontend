import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/src/api/profile";
import { getPlanList } from "@/src/api/plan";
import type { UserType } from "@/src/types/auth";

// ============================================
// 用户信息
// ============================================
export function useUserProfile() {
  return useQuery({
    queryKey: ["profile", "user"],
    queryFn: async () => {
      const userStr = await storage.getUser();
      if (userStr) {
        return JSON.parse(userStr) as UserType;
      }
      return null;
    },
    staleTime: 1000 * 60 * 5, // 5分钟内不重新请求
  });
}

// ============================================
// 我创作的文章
// ============================================
export function useMyArticles() {
  return useQuery({
    queryKey: ["profile", "myArticles"],
    queryFn: () => profileApi.getMyArticles(),
    staleTime: 1000 * 60 * 2, // 2分钟内不重新请求
  });
}

// ============================================
// 我收藏的文章
// ============================================
export function useMyFavoriteArticles() {
  return useQuery({
    queryKey: ["profile", "myFavoriteArticles"],
    queryFn: () => profileApi.getMyFavoriteArticles(),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// 我浏览过的文章
// ============================================
export function useMyBrowsedArticles() {
  return useQuery({
    queryKey: ["profile", "myBrowsedArticles"],
    queryFn: () => profileApi.getMyBrowsedArticles(),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// 规划列表
// ============================================
export function useMyPlans() {
  return useQuery({
    queryKey: ["profile", "plans"],
    queryFn: () => getPlanList({ page: 1, pageSize: 10 }),
    staleTime: 1000 * 60 * 2,
  });
}