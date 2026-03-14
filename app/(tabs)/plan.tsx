import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import PlanList from "../../components/page/plan/PlanList";
import * as planApi from "@/src/api/plan";
import type { Plan } from "@/src/types/plan";

export default function PlanScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载规划列表
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await planApi.getPlanList({ pageSize: 20 });
      setPlans(response.list);
    } catch (error) {
      console.error("加载规划列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // 监听页面聚焦，刷新列表
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  const hasPlans = plans.length > 0;

  const handlePlanPress = (plan: Plan) => {
    router.push({
      pathname: "/(plan)/plan-detail",
      params: { id: String(plan.id) }
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {!loading && (
        hasPlans ? (
          <PlanList
            plans={plans}
            onCreatePlan={() => router.push("/(plan)/create-plan")}
            onPlanPress={handlePlanPress}
          />
        ) : (
          <PlanEmptyState onCreatePlan={() => router.push("/(plan)/create-plan")} />
        )
      )}
    </SafeAreaView>
  );
}
