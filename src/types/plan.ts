// ============================================
// Plan 模块 - 数据类型定义
// ============================================

// 规划类型
export type PlanType = 'tourism' | 'study' | 'work' | 'immigration';

// 规划状态
export type PlanStatus = 'draft' | 'generating' | 'paused' | 'completed';

// 任务/阶段状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high';

// 目的地（支持精确到城市）
export interface Destination {
  country?: string;      // 国家
  province?: string;      // 省/州
  city?: string;          // 城市
  district?: string;      // 区/县
  detail?: string;        // 详细地址
}

// 表单数据 - 旅游
export interface TourismFormData {
  destination: Destination;
  travelBudget: string;
  travelDays: string;
  companions: string;
  passportStatus: string;
  profession: string;
}

// 表单数据 - 留学
export interface StudyFormData {
  destination: Destination;
  targetDegree: string;
  currentBackground: string;
  languageAbility: string;
  financialAbility: string;
  targetMajor: string;
  timePlan: string;
}

// 表单数据 - 工作
export interface WorkFormData {
  destination: Destination;
  jobField: string;
  certificates: string;
  languageSkill: string;
  workExperience: string;
  familyAccompany: string;
  jobStatus: string;
}

// 表单数据 - 定居
export interface ImmigrationFormData {
  destination: Destination;
  assetOverview: string;
  age: string;
  coreBackground: string;
  immigrationPurpose: string;
  targetPreference: string;
}

// 规划表单数据联合类型
export type PlanFormData = TourismFormData | StudyFormData | WorkFormData | ImmigrationFormData;

// ============================================
// API 请求参数类型
// ============================================

// 创建规划请求
export interface CreatePlanParams {
  title: string;
  type: PlanType;
  destination: Destination;
  formData: PlanFormData;
  description?: string;
  startDate?: string;
  endDate?: string;
  planDate?: string;
}

// 更新规划请求
export interface UpdatePlanParams {
  id: number;
  title?: string;
  destination?: Destination;
  formData?: PlanFormData;
  status?: PlanStatus;
  description?: string;
  startDate?: string;
  endDate?: string;
  planDate?: string;
}

// 规划列表查询参数
export interface PlanListParams {
  type?: PlanType;
  status?: PlanStatus;
  page?: number;
  pageSize?: number;
}

// 创建阶段请求
export interface CreatePhaseParams {
  planId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  planDate?: string;
  reminderTime?: string;
  isMilestone?: boolean;
  sortOrder?: number;
}

// 更新阶段请求
export interface UpdatePhaseParams {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  planDate?: string;
  reminderTime?: string;
  isMilestone?: boolean;
  sortOrder?: number;
}

// 附件
export interface Attachment {
  name: string;
  url: string;
  type?: string;
}

// 创建任务请求
export interface CreateTaskParams {
  phaseId: number;
  title: string;
  description?: string;
  aiSuggestion?: string;
  formData?: Record<string, any>;
  status?: TaskStatus;
  priority?: TaskPriority;
  reminderTime?: string;
  attachments?: Attachment[];
  startDate?: string;
  endDate?: string;
  planDate?: string;
  sortOrder?: number;
}

// 更新任务请求
export interface UpdateTaskParams {
  id: number;
  title?: string;
  description?: string;
  aiSuggestion?: string;
  formData?: Record<string, any>;
  status?: TaskStatus;
  priority?: TaskPriority;
  reminderTime?: string;
  attachments?: Attachment[];
  startDate?: string;
  endDate?: string;
  planDate?: string;
  sortOrder?: number;
}

// 完成任务请求
export interface CompleteTaskParams {
  id: number;
  status: TaskStatus;
}

// ============================================
// API 响应数据类型
// ============================================

// 规划详情
export interface Plan {
  id: number;
  userId: number;
  title: string;
  type: PlanType;
  destination: Destination;
  status: PlanStatus;
  formData: PlanFormData;
  coverImage?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  planDate?: string;
  phases?: Phase[];
  resource?: RecommendedResource[];
  createdAt: string;
  updatedAt: string;
}

// 推荐资源
export interface RecommendedResource {
  title: string;
  description: string;
  coverImage?: string;
  url: string;
  webUrl?: string;
  category: string;
  cta?: string;
}

// 阶段
export interface Phase {
  id: number;
  planId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  planDate?: string;
  reminderTime?: string;
  isMilestone?: boolean;
  sortOrder: number;
  tasks?: Task[];
  createdAt: string;
}

// 任务
export interface Task {
  id: number;
  phaseId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  aiSuggestion?: string;
  formData?: Record<string, any>;
  reminderTime?: string;
  attachments?: Attachment[];
  startDate?: string;
  endDate?: string;
  planDate?: string;
  sortOrder: number;
}

// 规划列表响应
export interface PlanListResponse {
  list: Plan[];
  total: number;
  page: number;
  pageSize: number;
}

// 阶段列表响应
export interface PhaseListResponse {
  list: Phase[];
  total: number;
}

// 任务列表响应
export interface TaskListResponse {
  list: Task[];
  total: number;
}

// 生成规划请求（调用 AI）
export interface GeneratePlanParams {
  type: PlanType;
  destination: Destination;
  formData: PlanFormData;
}

// 生成规划响应
export interface GeneratePlanResponse {
  plan: Plan;
}
