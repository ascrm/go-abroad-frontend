/**
 * 去除HTML标签，保留纯文本
 * 用于列表预览时截取富文本内容
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    // 替换常见的块级标签为空格，避免粘连
    .replace(/<\/?(div|p|br|h[1-6]|li|tr)\s*>/gi, ' ')
    // 移除所有HTML标签
    .replace(/<[^>]+>/g, '')
    // 解码常见的HTML实体
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // 清理多余空格
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 截取纯文本并添加省略号
 */
export function truncateText(text: string, maxLength: number): string {
  const stripped = stripHtmlTags(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + '...';
}