// ============================================
// Plan 模块 - API 请求
// ============================================

import type {
  CompleteTaskParams,
  CreatePhaseParams,
  CreatePlanParams,
  CreateTaskParams,
  Destination,
  GeneratePlanParams,
  GeneratePlanResponse,
  Phase,
  PhaseListResponse,
  Plan,
  PlanFormData,
  PlanListParams,
  PlanListResponse,
  PlanType,
  Task,
  TaskListResponse,
  UpdatePhaseParams,
  UpdatePlanParams,
  UpdateTaskParams,
} from '@/src/types';
import EventSource from 'react-native-sse';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/storage';
import client from './client';

// ============================================
// 规划相关 API
// ============================================

/**
 * 获取规划列表
 */
export async function getPlanList(params: PlanListParams = {}): Promise<PlanListResponse> {
  return client.get(API_ENDPOINTS.plan.list, { params });
}

/**
 * 获取规划详情
 */
export async function getPlanDetail(id: number): Promise<Plan> {
  return client.get(`${API_ENDPOINTS.plan.detail}/${id}`);
}

/**
 * 创建规划
 */
export async function createPlan(data: CreatePlanParams): Promise<Plan> {
  return client.post(API_ENDPOINTS.plan.create, data);
}

/**
 * 更新规划
 */
export async function updatePlan(data: UpdatePlanParams): Promise<Plan> {
  return client.put(`${API_ENDPOINTS.plan.update}/${data.id}`, {
    status: data.status,
  });
}

/**
 * 删除规划
 */
export async function deletePlan(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.plan.delete}/${id}`);
}

/**
 * 流式生成 AI 规划
 * 使用 react-native-sse 实现 GET 方式的流式接收
 */
export async function generatePlanStream(
  data: GeneratePlanParams,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
): Promise<void> {
  // 使用 GET 方式，参数通过 URL query 传递
  const params = new URLSearchParams({
    type: data.type,
    destination: JSON.stringify(data.destination),
    formData: JSON.stringify(data.formData),
  });
  const url = `${API_BASE_URL}${API_ENDPOINTS.plan.generateStream}?${params.toString()}`;

  const connect = async () => {
      const token = await storage.getAccessToken();
      const es: any = new EventSource(url, {
          method: 'GET',
          headers: {'Authorization': `Bearer ${token}`},
      });
      es.addEventListener('message', (event: any) => onChunk(event.data));
      es.addEventListener('done', () => onComplete());
  };

  await connect();
}

/**
 * 获取 status=generating 的规划（最多一条）
 * 进入 app 时调用，若存在则持久化到本地
 */
export async function getGeneratingPlan(): Promise<Plan | null> {
  return client.get(API_ENDPOINTS.plan.generatingPlan);
}

/**
 * 保存 AI 生成的规划
 */
export async function saveGeneratedPlan(generatedData: {
  type: PlanType;
  destination: Destination;
  formData: PlanFormData;
  content: string;
}): Promise<Plan> {
  return client.post(API_ENDPOINTS.plan.saveGenerated, generatedData);
}

// ============================================
// 阶段相关 API
// ============================================

/**
 * 获取规划下的阶段列表
 */
export async function getPhaseList(planId: number): Promise<PhaseListResponse> {
  return client.get(`${API_ENDPOINTS.plan.phaseList}/${planId}/phases`);
}

/**
 * 创建阶段
 */
export async function createPhase(data: CreatePhaseParams): Promise<Phase> {
  return client.post(API_ENDPOINTS.plan.phaseCreate, data);
}

/**
 * 更新阶段
 */
export async function updatePhase(data: UpdatePhaseParams): Promise<Phase> {
  return client.put(`${API_ENDPOINTS.plan.phaseUpdate}/${data.id}`, data);
}

/**
 * 删除阶段
 */
export async function deletePhase(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.plan.phaseDelete}/${id}`);
}

/**
 * 调整阶段顺序
 */
export async function reorderPhases(planId: number, phaseIds: number[]): Promise<void> {
  return client.put(`${API_ENDPOINTS.plan.phaseReorder}/${planId}/phases/reorder`, { phaseIds });
}

// ============================================
// 任务相关 API
// ============================================

/**
 * 获取阶段下的任务列表
 */
export async function getTaskList(phaseId: number): Promise<TaskListResponse> {
  return client.get(`${API_ENDPOINTS.plan.taskList}/${phaseId}/tasks`);
}

/**
 * 获取任务详情
 */
export async function getTaskDetail(id: number): Promise<Task> {
  return client.get(`${API_ENDPOINTS.plan.taskDetail}/${id}`);
}

/**
 * 创建任务
 */
export async function createTask(data: CreateTaskParams): Promise<Task> {
  return client.post(API_ENDPOINTS.plan.taskCreate, data);
}

/**
 * 更新任务
 */
export async function updateTask(data: UpdateTaskParams): Promise<Task> {
  return client.put(`${API_ENDPOINTS.plan.taskUpdate}/${data.id}`, data);
}

/**
 * 删除任务
 */
export async function deleteTask(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.plan.taskDelete}/${id}`);
}

/**
 * 完成任务/取消完成
 */
export async function completeTask(data: CompleteTaskParams): Promise<Task> {
  return client.put(`${API_ENDPOINTS.plan.taskComplete}/${data.id}/complete`, { status: data.status });
}

/**
 * 调整任务顺序
 */
export async function reorderTasks(phaseId: number, taskIds: number[]): Promise<void> {
  return client.put(`${API_ENDPOINTS.plan.taskReorder}/${phaseId}/tasks/reorder`, { taskIds });
}

/**
 * 获取任务的 AI 建议
 */
export async function getTaskAISuggestion(taskId: number): Promise<{ suggestion: string }> {
  return client.get(`${API_ENDPOINTS.plan.taskAISuggestion}/${taskId}/ai-suggestion`);
}
