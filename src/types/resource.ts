// ============================================
// Resources 模块 - 类型定义
// ============================================

/**
 * 单条出境资源（对应数据库 tb_resource + JOIN tb_resource_category）
 *
 * 所有条目（工具 App + 分类资源）都是这个结构：
 *   - logo      → 顶层 logo 字段（工具 App 展示 App 图标）
 *   - imageUrl  → 顶层封面图字段（分类资源展示封面图）
 *   - meta.highlights → string[]  （工具 App 亮点）
 *   - meta.cta  → string          （工具 App 按钮文案）
 *   - category_join → categoryName / categoryIcon / categoryColor
 *
 * 渲染时通过 country === "全球" 判断为横滑工具卡片，
 * 通过 country === 目标国家 + categoryName 分组展示分类资源。
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
  categoryIcon?: string;     // 类别图标名
  categoryColor?: string;    // 类别主题色，如"#3B82F6"
  categorySortOrder?: number;
}

/** 资源列表响应 */
export type ResourceListResponse = Resource[];
