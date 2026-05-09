import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Table, TableWrapper, Row, Rows, Cell, Text, View } from 'react-native';

interface HtmlRendererProps {
  html: string;
}

// 解析HTML标签的正则
const BLOCK_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'li', 'table', 'tr', 'blockquote', 'br', 'img'];
const INLINE_ELEMENTS = ['strong', 'b', 'em', 'i', 'u', 'a', 'span'];

interface ParsedNode {
  type: 'block' | 'inline' | 'text';
  tag?: string;
  content?: string;
  children?: ParsedNode[];
  attrs?: Record<string, string>;
}

// 解析HTML字符串为节点树
function parseHtml(html: string): ParsedNode[] {
  const nodes: ParsedNode[] = [];

  function parse(html: string): ParsedNode[] {
    const result: ParsedNode[] = [];
    let remaining = html.trim();

    while (remaining.length > 0) {
      // 找到下一个标签
      const tagMatch = remaining.match(/^<(\/?)([\w]+)([^>]*)>/);

      if (!tagMatch) {
        // 纯文本 - 找到第一个标签之前的所有内容
        const textEnd = remaining.search(/<\/?[\w]+[^>]*>/);
        const text = textEnd === -1 ? remaining : remaining.substring(0, textEnd);
        if (text.trim()) {
          result.push({ type: 'text', content: text });
        }
        if (textEnd === -1) break;
        remaining = remaining.substring(text.length);
        continue;
      }

      const [, isClosing, tagName, attrStr] = tagMatch;
      const tag = tagName.toLowerCase();
      const attrs: Record<string, string> = {};

      // 解析属性
      if (attrStr) {
        const attrMatches = attrStr.matchAll(/(\w+)(?:=["']([^"']*)["'])?/g);
        for (const match of attrMatches) {
          attrs[match[1]] = match[2] || '';
        }
      }

      if (isClosing) {
        remaining = remaining.substring(tagMatch[0].length);
        continue;
      }

      // 自闭合标签
      if (['br', 'img', 'hr', 'input'].includes(tag)) {
        result.push({ type: 'block', tag, attrs });
        remaining = remaining.substring(tagMatch[0].length);
        continue;
      }

      // 找到对应的闭合标签
      const openTag = `<${tag}`;
      const closeTag = `</${tag}>`;
      let startPos = tagMatch[0].length;
      let depth = 1;

      let nextClose = remaining.indexOf(closeTag, startPos);
      let nextOpen = remaining.indexOf(openTag, startPos);

      while (depth > 0 && startPos < remaining.length) {
        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          startPos = nextOpen + openTag.length;
          nextOpen = remaining.indexOf(openTag, startPos);
        } else {
          depth--;
          if (depth === 0) {
            const innerContent = remaining.substring(tagMatch[0].length, nextClose);
            result.push({
              type: BLOCK_ELEMENTS.includes(tag) ? 'block' : 'inline',
              tag,
              attrs,
              children: parse(innerContent),
            });
            remaining = remaining.substring(nextClose + closeTag.length);
            break;
          }
          nextClose = remaining.indexOf(closeTag, nextClose + closeTag.length);
        }
      }

      if (depth > 0) {
        // 没有找到闭合标签，当作自闭合处理
        remaining = remaining.substring(tagMatch[0].length);
      }
    }

    return result;
  }

  return parse(html);
}

// 渲染文本（处理内联样式）
function renderInlineText(content: string): { text: string; styles: any[] }[] {
  const parts: { text: string; styles: any[] }[] = [];
  let remaining = content;

  const patterns = [
    { regex: /<strong[^>]*>(.*?)<\/strong>/is, style: { fontWeight: 'bold' } },
    { regex: /<b[^>]*>(.*?)<\/b>/is, style: { fontWeight: 'bold' } },
    { regex: /<em[^>]*>(.*?)<\/em>/is, style: { fontStyle: 'italic' } },
    { regex: /<i[^>]*>(.*?)<\/i>/is, style: { fontStyle: 'italic' } },
    { regex: /<u[^>]*>(.*?)<\/u>/is, style: { textDecorationLine: 'underline' } },
    { regex: /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/is, style: { color: '#3B82F6', textDecorationLine: 'underline' } },
  ];

  while (remaining.length > 0) {
    let earliest: { index: number; length: number; match: RegExpExecArray; pattern: typeof patterns[0] } | null = null;

    for (const pattern of patterns) {
      const match = pattern.regex.exec(remaining);
      if (match && match.index < (earliest?.index ?? Infinity)) {
        earliest = { index: match.index, length: match[0].length, match, pattern };
      }
    }

    if (earliest) {
      if (earliest.index > 0) {
        parts.push({ text: earliest.match.input.substring(0, earliest.index), styles: [] });
      }
      parts.push({ text: earliest.match[1] || earliest.match[2], styles: [earliest.pattern.style] });
      remaining = remaining.substring(earliest.index + earliest.length);
    } else {
      parts.push({ text: remaining, styles: [] });
      break;
    }
  }

  return parts.length > 0 ? parts : [{ text: content, styles: [] }];
}

// 获取段落缩进样式
function getParagraphIndent(attrs: Record<string, string>): number {
  const style = attrs.style || '';
  const match = style.match(/text-indent:\s*([^;]+)/);
  if (match) {
    const value = match[1];
    if (value.includes('2em')) return 2;
    if (value.includes('1em')) return 1;
  }
  return 0;
}

export function HtmlRenderer({ html }: HtmlRendererProps) {
  const nodes = useMemo(() => parseHtml(html), [html]);

  const renderNode = (node: ParsedNode, index: number): React.ReactNode => {
    if (node.type === 'text') {
      const parts = renderInlineText(node.content || '');
      return parts.map((part, i) => (
        <Text key={`${index}-${i}`} style={part.styles}>
          {part.text}
        </Text>
      ));
    }

    switch (node.tag) {
      case 'h1':
        return (
          <Text key={index} style={styles.h1}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Text>
        );
      case 'h2':
        return (
          <View key={index} style={styles.h2Container}>
            <Text style={styles.h2}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'h3':
        return (
          <View key={index} style={styles.h3Container}>
            <Text style={styles.h3}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'h4':
      case 'h5':
      case 'h6':
        return (
          <Text key={index} style={styles.h4}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Text>
        );
      case 'p':
        const indent = getParagraphIndent(node.attrs || {});
        return (
          <Text key={index} style={[styles.paragraph, indent > 0 && { textIndent: indent === 2 ? 32 : 16 }]}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Text>
        );
      case 'ul':
        return (
          <View key={index} style={styles.ul}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </View>
        );
      case 'ol':
        return (
          <View key={index} style={styles.ol}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </View>
        );
      case 'li':
        return (
          <View key={index} style={styles.li}>
            <Text style={styles.liBullet}>•</Text>
            <Text style={styles.liContent}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'blockquote':
        return (
          <View key={index} style={styles.blockquote}>
            <View style={styles.blockquoteBar} />
            <Text style={styles.blockquoteContent}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'img':
        const src = node.attrs?.src || node.attrs?.['data-src'] || '';
        const alt = node.attrs?.alt || '';
        if (src) {
          return (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: src }}
                alt={alt}
                style={styles.image}
                contentFit="contain"
              />
            </View>
          );
        }
        return null;
      case 'table':
        return (
          <View key={index} style={styles.tableContainer}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </View>
        );
      case 'tr':
        return (
          <View key={index} style={styles.tr}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </View>
        );
      case 'th':
        return (
          <View key={index} style={[styles.th]}>
            <Text style={styles.thText}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'td':
        return (
          <View key={index} style={[styles.td]}>
            <Text style={styles.tdText}>
              {node.children?.map((child, i) => renderNode(child, i))}
            </Text>
          </View>
        );
      case 'br':
        return <Text key={index}>{'\n'}</Text>;
      case 'div':
      case 'span':
        return (
          <Text key={index}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Text>
        );
      default:
        return (
          <Text key={index}>
            {node.children?.map((child, i) => renderNode(child, i))}
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {nodes.map((node, index) => renderNode(node, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 36,
  },
  h2Container: {
    marginTop: 24,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 30,
  },
  h3Container: {
    marginTop: 20,
    marginBottom: 10,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
    marginBottom: 12,
  },
  ul: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  ol: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  li: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  liBullet: {
    fontSize: 16,
    color: '#3B82F6',
    marginRight: 12,
    lineHeight: 28,
  },
  liContent: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
  },
  blockquote: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  blockquoteBar: {
    width: 0,
    marginRight: 0,
  },
  blockquoteContent: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  imageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: '100%',
    height: 200,
  },
  tableContainer: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  th: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  thText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  td: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tdText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
});
