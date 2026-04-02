// ============================================
// Resources 模块 - 类型定义
// ============================================

/**
 */
export interface Resource {
  id: number;
  country: string;           // 国家，"全球"表示通用工具 App
  categoryId: number;        // 关联 tb_resource_category.id
  title: string;             // 资源标题
  description: string;       // 简短描述
  url: string;               // App 深链
  webUrl?: string;           // 降级 Web URL
  imageUrl?: string;         // 封面图 URL（分类资源用）
  logo?: string;             // App Logo 图标 URL（工具 App 用）
  isFeatured: boolean;        // 是否精选（精选展示为大卡片）
  meta?: {
    highlights?: string[];  // 工具 App 亮点标签
    [key: string]: any;
  };
  sortOrder: number;         // 同类别内展示顺序
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // JOIN tb_resource_category 返回
  categoryName?: string;     // 类别名称："签证办理" | "酒店住宿" | ...
}

/** 资源列表响应 */
export type ResourceListResponse = Resource[];

/** 资源分类 */
export interface ResourceCategory {
  id: number;
  name: string;            // 类别名称，如"签证办理"
  icon: string;            // Lucide 图标名称，如"ShieldAlert"
  color: string;           // 主题色，如"#3B82F6"
  sortOrder: number;       // 展示顺序
  isActive: boolean;
}

/** 分类列表响应 */
export type CategoryListResponse = ResourceCategory[];
