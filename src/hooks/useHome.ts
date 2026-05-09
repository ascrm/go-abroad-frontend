import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as homeApi from "@/src/api/home";
import type { Article, Question } from "@/src/types/home";
import type { InteractionParams } from "@/src/types/home";

// ============================================
// 文章列表（分页 + 无限滚动）
// ============================================
export function useArticleList() {
  return useInfiniteQuery({
    queryKey: ["articles"],
    queryFn: ({ pageParam = 1 }) =>
      homeApi.getArticleList({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      // 如果返回数据少于 pageSize，说明没有更多数据了
      if (lastPage.list.length < 10) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

// ============================================
// 问题列表（分页 + 无限滚动）
// ============================================
export function useQuestionList() {
  return useInfiniteQuery({
    queryKey: ["questions"],
    queryFn: ({ pageParam = 1 }) =>
      homeApi.getQuestionList({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.list.length < 10) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

// ============================================
// 收藏操作
// ============================================
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InteractionParams) =>
      homeApi.toggleFavorite(params),
    onMutate: async ({ targetId, targetType, action }) => {
      const queryKey = targetType === "article" ? ["articles"] : ["questions"];

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            list: page.list.map((item: Article | Question) => {
              if (item.id !== targetId) return item;
              const isFavoriting = action === "favorite" && !item.isFavorited;
              return {
                ...item,
                isFavorited: isFavoriting,
                favorites: isFavoriting ? (item.favorites || 0) + 1 : Math.max(0, (item.favorites || 0) - 1),
              };
            }),
          })),
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // 成功后不需要立即 invalidate，乐观更新已生效
      // 失败时才回滚并重新获取
    },
  });
}

// ============================================
// 文章详情
// ============================================
export function useArticleDetail(id: number) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => homeApi.getArticleDetail(id),
    enabled: !!id,
  });
}

// ============================================
// 问题详情
// ============================================
export function useQuestionDetail(id: number) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => homeApi.getQuestionDetail(id),
    enabled: !!id,
  });
}
