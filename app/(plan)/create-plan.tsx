import { router } from "expo-router";
import { useEffect } from "react";

// 重定向到新的分页创建流程
export default function CreatePlanScreen() {
  useEffect(() => {
    router.replace("/(plan)/create-plan-type");
  }, []);

  return null;
}