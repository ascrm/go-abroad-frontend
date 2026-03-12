import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import PlanList from "../../components/page/plan/PlanList";

export default function PlanScreen() {
  // 模拟数据，后续替换为真实数据
  const [plans] = useState([
    {
      id: "1",
      type: "study" as const,
      destination: "美国",
      title: "赴美读研规划",
      createdAt: "2026-03-10",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "tourism" as const,
      destination: "日本",
      title: "日本7日游",
      createdAt: "2026-03-12",
      status: "generating" as const,
    },
  ]);

  const hasPlans = plans.length > 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {hasPlans ? (
        <PlanList 
          plans={plans} 
          onCreatePlan={() => router.push("/(plan)/create-plan")}
          onPlanPress={(plan) => router.push({
            pathname: "/(plan)/plan-detail",
            params: { 
              id: plan.id, 
              type: plan.type, 
              title: plan.title, 
              destination: plan.destination 
            }
          })}
        />
      ) : (
        <PlanEmptyState onCreatePlan={() => router.push("/(plan)/create-plan")} />
      )}
    </SafeAreaView>
  );
}
