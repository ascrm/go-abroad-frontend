// ============================================
// Plan 模块 - API 请求
// ============================================

import client from './client';
import { API_ENDPOINTS } from '../constants/api';
import type {
  Plan,
  PlanListParams,
  PlanListResponse,
  Phase,
  PhaseListResponse,
  Task,
  TaskListResponse,
  CreatePlanParams,
  UpdatePlanParams,
  CreatePhaseParams,
  UpdatePhaseParams,
  CreateTaskParams,
  UpdateTaskParams,
  CompleteTaskParams,
  GeneratePlanParams,
  GeneratePlanResponse,
  PlanFormData,
  Destination,
  PlanType,
} from '../types/plan';

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
  return client.put(`${API_ENDPOINTS.plan.update}/${data.id}`, data);
}

/**
 * 删除规划
 */
export async function deletePlan(id: number): Promise<void> {
  return client.delete(`${API_ENDPOINTS.plan.delete}/${id}`);
}

/**
 * 生成 AI 规划
 * 调用 AI 根据用户表单数据生成完整的规划（包含阶段和任务）
 */
export async function generatePlan(data: GeneratePlanParams): Promise<GeneratePlanResponse> {
  return client.post(API_ENDPOINTS.plan.generate, data);
}

/**
 * 保存 AI 生成的规划
 * 将 AI 生成的规划保存到数据库
 */
export async function saveGeneratedPlan(generatedData: {
  title: string;
  type: PlanType;
  destination: Destination;
  formData: PlanFormData;
  phases: {
    title: string;
    description?: string;
    tasks: {
      title: string;
      description?: string;
      aiSuggestion?: string;
    }[];
  }[];
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
  return client.put(`${API_ENDPOINTS.plan.taskComplete}/${data.id}/complete`, { isCompleted: data.isCompleted });
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
