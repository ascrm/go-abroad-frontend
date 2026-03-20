import * as planApi from "@/src/api/plan";
import type { Plan } from "@/src/types/plan";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import PlanList from "../../components/page/plan/PlanList";

export default function PlanScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);

  // 加载规划列表
  const loadPlans = useCallback(async () => {
    const response = await planApi.getPlanList({ pageSize: 20 });
    setPlans(response.list);
  }, []);

  // 监听页面聚焦，刷新列表（包括首次）
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  const handlePlanPress = useCallback((plan: Plan) => {
    router.push({
      pathname: "/(plan)/plan-detail",
      params: { id: String(plan.id) },
    });
  }, []);

  const hasPlans = plans.length > 0;

  // 重点展示：status=generating 的规划（业务保证最多一条）
  const featuredPlan = plans.find((p) => p.status === "generating");
  // 其余列表排除 featuredPlan
  const listPlans = featuredPlan ? plans.filter((p) => p.id !== featuredPlan.id) : plans;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      {hasPlans ? (
        <PlanList
          featuredPlan={featuredPlan ?? undefined}
          plans={listPlans}
          onCreatePlan={() => router.push("/(plan)/create-plan")}
          onPlanPress={handlePlanPress}
          onStart={async (plan) => {
            await planApi.updatePlan({ id: plan.id, status: "generating" });
            loadPlans();
          }}
          onDelete={async (plan) => {
            Alert.alert("确认删除", `确定要删除规划「${plan.title}」吗？`, [
              { text: "取消", style: "cancel" },
              {
                text: "删除",
                style: "destructive",
                onPress: async () => {
                  await planApi.deletePlan(plan.id);
                  loadPlans();
                },
              },
            ]);
          }}
        />
      ) : (
        <PlanEmptyState onCreatePlan={() => router.push("/(plan)/create-plan")} />
      )}
    </SafeAreaView>
  );
}
