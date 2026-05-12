import OptionsMenu from "@/components/page/home/OptionsMenu";
import type { Article, Question } from "@/src/types/home";
import { formatRelativeTime } from "@/src/utils/time";
import { stripHtmlTags } from "@/src/utils/html";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Bookmark,
  ChartNoAxesColumn,
  EllipsisVertical,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useArticleList, useQuestionList, useToggleFavorite } from "@/src/hooks/useHome";

type TabType = "recommend" | "qa";

// ============================================
// 骨架屏组件
// ============================================
function ArticleSkeleton({ isFirst }: { isFirst: boolean }) {
  return (
    <View style={[styles.skeletonCard, isFirst && styles.skeletonCardFirst]}>
      {isFirst && <View style={styles.skeletonImage} />}
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonTag} />
          <View style={styles.skeletonTime} />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={[styles.skeletonTitle, { width: "75%" }]} />
        {!isFirst && (
          <View style={[styles.skeletonRow, { marginTop: 12 }]}>
            <View style={styles.skeletonThumbItem} />
          </View>
        )}
      </View>
    </View>
  );
}

function QuestionSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonTag} />
          <View style={styles.skeletonTime} />
        </View>
        <View style={[styles.skeletonTitle, { width: "85%" }]} />
        <View style={[styles.skeletonTitle, { width: "60%", marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ============================================
// 按压缩放动画
// ============================================
function AnimatedPressable({ onPress, children, style }: any) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      onPress={onPress}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// ============================================
// 收藏按钮动画
// ============================================
function AnimatedBookmark({ filled, count, onPress }: { filled: boolean; count: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 10, stiffness: 400 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 10, stiffness: 400 }); }, 100);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Animated.View style={animatedStyle}>
        <View style={styles.actionBtn}>
          <Bookmark size={16} color={filled ? "#3B82F6" : "#9CA3AF"} fill={filled ? "#3B82F6" : "none"} />
          <Text style={[styles.actionCount, filled && styles.actionCountActive]}>{count}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ============================================
// X 风格 Tab 切换器
// ============================================
function XTabSwitcher({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  const tabs = [
    { key: "recommend" as TabType, label: "推荐" },
    { key: "qa" as TabType, label: "问答" },
  ];
  const indicatorPosition = useSharedValue(activeTab === "recommend" ? 0 : 1);
  const SCREEN_W = Dimensions.get("window").width;
  const CONTENT_W = SCREEN_W - 48;
  const TAB_W = CONTENT_W / 2;

  const handleTabPress = (tab: TabType) => {
    indicatorPosition.value = withTiming(tab === "recommend" ? 0 : 1, { duration: 200 });
    onTabChange(tab);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * TAB_W }],
    width: TAB_W,
  }));

  return (
    <View style={styles.tabWrapper}>
      <View style={[styles.tabContainer, { width: CONTENT_W }]}>
        <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} style={styles.tabBtn} onPress={() => handleTabPress(tab.key)} activeOpacity={0.7}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// 文章大卡片
// ============================================
function ArticleLargeCard({ article, onToggleFavorite, onPress, onShowOptions }: {
  article: Article;
  onToggleFavorite: () => void;
  onPress: () => void;
  onShowOptions: () => void;
}) {
  // 获取作者首字
  const getAvatarText = (nickname?: string) => {
    if (!nickname) return '游';
    return nickname.charAt(0);
  };

  return (
    <AnimatedPressable onPress={onPress} style={styles.articleCardWrapper}>
      <View style={[styles.articleCard, styles.articleCardLarge]}>
        {article.image && <Image source={{ uri: article.image }} style={styles.articleImageLarge} contentFit="cover" />}
        <View style={styles.articleContentLarge}>
          {/* 第一行：作者信息 + 更多按钮 */}
          <View style={styles.articleHeaderRow}>
            {article.author && (
              <View style={styles.authorRowLarge}>
                {article.author.avatar ? (
                  <Image source={{ uri: article.author.avatar }} style={styles.avatarLarge} contentFit="cover" />
                ) : (
                  <View style={styles.avatarLargePlaceholder}>
                    <Text style={styles.avatarTextLarge}>{getAvatarText(article.author.nickname)}</Text>
                  </View>
                )}
                <Text style={styles.authorNameLarge} numberOfLines={1}>
                  {article.author.nickname || "旅行用户"}
                </Text>
              </View>
            )}
            <Pressable onPress={onShowOptions} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.moreBtnIcon}>
              <EllipsisVertical size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* 第二行：标题 */}
          <Text style={styles.articleTitleLarge} numberOfLines={2}>{article.title}</Text>

          {/* 第三行：描述 */}
          {article.description && <Text style={styles.articleDescLarge} numberOfLines={2}>{article.description}</Text>}

          {/* 第四行：底部 - 左侧收藏/浏览，右侧标签 */}
          <View style={styles.articleFooterRow}>
            <View style={styles.articleActions}>
              <AnimatedBookmark filled={article.isFavorited || false} count={article.favorites} onPress={onToggleFavorite} />
              <View style={styles.actionBtn}>
                <ChartNoAxesColumn size={16} color="#9CA3AF" />
                <Text style={styles.actionCount}>{article.views}</Text>
              </View>
            </View>
            {article.tag && (
              <View style={styles.tagBlue}>
                <Text style={styles.tagTextBlue}>{article.tag}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============================================
// 文章小卡片（右侧缩略图）
// ============================================
function ArticleSmallCard({ article, onToggleFavorite, onPress, onShowOptions }: {
  article: Article;
  onToggleFavorite: () => void;
  onPress: () => void;
  onShowOptions: () => void;
}) {
  // 获取作者首字
  const getAvatarText = (nickname?: string) => {
    if (!nickname) return '游';
    return nickname.charAt(0);
  };

  return (
    <AnimatedPressable onPress={onPress} style={styles.articleCardWrapper}>
      <View style={[styles.articleCard, styles.articleCardSmall]}>
        {/* 第一行：作者信息 + 更多按钮 */}
        <View style={styles.smallCardRow1}>
          <View style={styles.authorRowSmall}>
            {article.author ? (
              <>
                {article.author.avatar ? (
                  <Image source={{ uri: article.author.avatar }} style={styles.avatarSmall} contentFit="cover" />
                ) : (
                  <View style={styles.avatarSmallPlaceholder}>
                    <Text style={styles.avatarTextSmallCard}>{getAvatarText(article.author.nickname)}</Text>
                  </View>
                )}
                <Text style={styles.authorNameSmallCard} numberOfLines={1}>
                  {article.author.nickname || "旅行用户"}
                </Text>
              </>
            ) : (
              <Text style={styles.authorNameSmallCard}>旅行用户</Text>
            )}
          </View>
          <Pressable onPress={onShowOptions} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.moreBtnIconSmall}>
            <EllipsisVertical size={16} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* 第二行：标题+描述 + 缩略图 */}
        <View style={styles.smallCardRow2}>
          <View style={styles.smallCardTextContent}>
            <Text style={styles.articleTitleSmall} numberOfLines={2}>{article.title}</Text>
            {article.description && <Text style={styles.articleDescSmall} numberOfLines={2}>{article.description}</Text>}
          </View>
          {article.image && (
            <View style={styles.articleThumbWrapper}>
              <Image source={{ uri: article.image }} style={styles.articleThumb} contentFit="cover" />
            </View>
          )}
        </View>

        {/* 第三行：收藏/浏览 + 标签 */}
        <View style={styles.smallCardRow3}>
          <View style={styles.articleActionsSmall}>
            <AnimatedBookmark filled={article.isFavorited || false} count={article.favorites} onPress={onToggleFavorite} />
            <View style={styles.actionBtnSmall}>
              <ChartNoAxesColumn size={14} color="#9CA3AF" />
              <Text style={styles.actionCountSmall}>{article.views}</Text>
            </View>
          </View>
          {article.tag && (
            <View style={styles.tagBlueSmall}>
              <Text style={styles.tagTextBlueSmall}>{article.tag}</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============================================
// 问题卡片
// ============================================
function QuestionCard({ question, onPress }: {
  question: Question;
  onPress: () => void;
}) {
  // 获取作者首字
  const getAvatarText = (nickname?: string) => {
    if (!nickname) return '游';
    return nickname.charAt(0);
  };

  // 格式化浏览数，超过1000显示为"1.2k"格式
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return String(count);
  };

  return (
    <AnimatedPressable onPress={onPress} style={styles.questionCardWrapper}>
      <View style={styles.questionCard}>
        {/* 第一行：问题标题 */}
        <Text style={styles.questionTitle} numberOfLines={2}>{question.title}</Text>

        {/* 如果有回答，显示回答摘要 */}
        {question.topAnswer && (
          <>
            {/* 第二行：回答作者信息 */}
            <View style={styles.answerAuthorRow}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarTextSmall}>{getAvatarText(question.topAnswer.author?.nickname)}</Text>
              </View>
              <Text style={styles.authorNameSmall} numberOfLines={1}>
                {question.topAnswer.author?.nickname || "旅行用户"}
              </Text>
            </View>

            {/* 第三行：回答内容摘要 */}
            <Text style={styles.answerContent} numberOfLines={2}>
              {question.topAnswer.content}
            </Text>
          </>
        )}

        {/* 底部统计 */}
        <View style={styles.questionFooter}>
          <View style={styles.questionStats}>
            <View style={styles.statItem}>
              <ThumbsUp size={14} color="#9CA3AF" />
              <Text style={styles.statText}>{formatCount(question.topAnswer?.likes || 0)}</Text>
            </View>
            <View style={[styles.statItem, { marginLeft: 12 }]}>
              <MessageCircle size={14} color="#9CA3AF" />
              <Text style={styles.statText}>{formatCount(question.repliesCount)}</Text>
            </View>
            <View style={[styles.statItem, { marginLeft: 12 }]}>
              <ChartNoAxesColumn size={14} color="#9CA3AF" />
              <Text style={styles.statText}>{formatCount(question.views)}</Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============================================
// 空状态
// ============================================
function EmptyState({ isQA }: { isQA: boolean }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        {isQA ? <MessageCircle size={40} color="#D1D5DB" /> : <Sparkles size={40} color="#D1D5DB" />}
      </View>
      <Text style={styles.emptyTitle}>{isQA ? "暂无问答内容" : "暂无推荐内容"}</Text>
      <Text style={styles.emptySubtitle}>{isQA ? "快来提问吧" : "去看看其他内容"}</Text>
    </Animated.View>
  );
}

// ============================================
// 加载更多 Footer
// ============================================
function LoadingFooter({ hasMore, isLoading }: { hasMore: boolean; isLoading: boolean }) {
  if (!hasMore) return null;
  if (!isLoading) return null;
  return (
    <View style={styles.loadingFooter}>
      <Text style={styles.loadingText}>加载中...</Text>
    </View>
  );
}

// ============================================
// 固定添加按钮
// ============================================
function FixedAddButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View style={[styles.fixedAddBtn, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={styles.fixedAddBtnInner}>
          <Plus size={24} color="#FFFFFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ============================================
// 首页 Screen
// ============================================
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("recommend");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuDirection, setMenuDirection] = useState<"down" | "up">("down");
  const buttonRefs = useRef<Record<number, View | null>>({});

  // TanStack Query - 文章列表
  const {
    data: articleData,
    isLoading: articleLoading,
    isFetching: articleFetching,
    hasNextPage: hasArticleNextPage,
    fetchNextPage: fetchArticleNextPage,
    isFetchingNextPage: isFetchingArticleNextPage,
    refetch: refetchArticles,
  } = useArticleList();

  // TanStack Query - 问题列表
  const {
    data: questionData,
    isLoading: questionLoading,
    isFetching: questionFetching,
    hasNextPage: hasQuestionNextPage,
    fetchNextPage: fetchQuestionNextPage,
    isFetchingNextPage: isFetchingQuestionNextPage,
    refetch: refetchQuestions,
  } = useQuestionList();

  // 收藏 mutation
  const toggleFavorite = useToggleFavorite();

  // 展开所有页面的数据
  const allArticles = articleData?.pages.flatMap((p) => p.list) ?? [];
  const allQuestions = questionData?.pages.flatMap((p) => p.list) ?? [];

  const isLoading = activeTab === "recommend" ? articleLoading : questionLoading;
  const isFetching = activeTab === "recommend" ? articleFetching : questionFetching;

  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  }, [activeTab]);

  const handleToggleFavorite = useCallback((id: number, type: "article" | "question") => {
    toggleFavorite.mutate({ targetId: id, targetType: type, action: "favorite" });
  }, [toggleFavorite]);

  const showOptions = useCallback((id: number) => {
    setSelectedId(id);
    if (buttonRefs.current[id]) {
      buttonRefs.current[id].measureInWindow((x, y, width, height) => {
        const screenHeight = Dimensions.get("window").height;
        const menuHeight = 160;
        if (y + height + menuHeight > screenHeight - 80) {
          setMenuDirection("up");
          setMenuPosition({ x: x + width - 160, y: y - menuHeight - 8 });
        } else {
          setMenuDirection("down");
          setMenuPosition({ x: x + width - 160, y: y + height + 8 });
        }
      });
    }
    setModalVisible(true);
  }, []);

  const onRefresh = useCallback(async () => {
    if (activeTab === "recommend") {
      await refetchArticles();
    } else {
      await refetchQuestions();
    }
  }, [activeTab, refetchArticles, refetchQuestions]);

  const onEndReached = useCallback(() => {
    if (activeTab === "recommend") {
      if (hasArticleNextPage && !isFetchingArticleNextPage) {
        fetchArticleNextPage();
      }
    } else {
      if (hasQuestionNextPage && !isFetchingQuestionNextPage) {
        fetchQuestionNextPage();
      }
    }
  }, [activeTab, hasArticleNextPage, hasQuestionNextPage, isFetchingArticleNextPage, isFetchingQuestionNextPage, fetchArticleNextPage, fetchQuestionNextPage]);

  // ============================================
  // 渲染文章列表
  // ============================================
  const renderArticleList = () => {
    if (articleLoading) {
      return (
        <View style={styles.contentList}>
          <ArticleSkeleton isFirst={true} />
          {Array.from({ length: 3 }).map((_, i) => <ArticleSkeleton key={i} isFirst={false} />)}
        </View>
      );
    }

    if (allArticles.length === 0) {
      return <EmptyState isQA={false} />;
    }

    return (
      <FlatList
        data={allArticles}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) =>
          index === 0 ? (
            <ArticleLargeCard
              article={item}
              onToggleFavorite={() => handleToggleFavorite(item.id, "article")}
              onPress={() => router.push({ pathname: "/(home)/article-detail", params: { id: String(item.id) } })}
              onShowOptions={() => showOptions(item.id)}
            />
          ) : (
            <ArticleSmallCard
              article={item}
              onToggleFavorite={() => handleToggleFavorite(item.id, "article")}
              onPress={() => router.push({ pathname: "/(home)/article-detail", params: { id: String(item.id) } })}
              onShowOptions={() => showOptions(item.id)}
            />
          )
        }
        contentContainerStyle={styles.flatListContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          <LoadingFooter hasMore={hasArticleNextPage || false} isLoading={isFetchingArticleNextPage || false} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingArticleNextPage}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    );
  };

  // ============================================
  // 渲染问题列表
  // ============================================
  const renderQuestionList = () => {
    if (questionLoading) {
      return (
        <View style={styles.contentList}>
          {Array.from({ length: 4 }).map((_, i) => <QuestionSkeleton key={i} />)}
        </View>
      );
    }

    if (allQuestions.length === 0) {
      return <EmptyState isQA={true} />;
    }

    return (
      <FlatList
        data={allQuestions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            onPress={() => router.push({ pathname: "/(home)/qa-detail", params: { id: String(item.id) } })}
          />
        )}
        contentContainerStyle={styles.flatListContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          <LoadingFooter hasMore={hasQuestionNextPage || false} isLoading={isFetchingQuestionNextPage || false} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingQuestionNextPage}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* 顶部 Logo + 搜索按钮 */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <Image source={require("@/assets/images/logo.png")} style={styles.logoImg} contentFit="contain" />
            <Text style={styles.logoText}>GoAbroad</Text>
          </View>
          <TouchableOpacity
            style={styles.searchIconBtn}
            activeOpacity={0.7}
            onPress={() => router.push("/(home)/search")}
          >
            <Search size={22} color="#000000" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* X 风格 Tab 切换 */}
      <Animated.View entering={FadeInDown.duration(400).delay(50)}>
        <XTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
      </Animated.View>

      {/* 内容区域 */}
      <Animated.View
        key={activeTab}
        entering={FadeIn.duration(250)}
        layout={Layout.duration(200)}
        style={styles.contentSection}
      >
        {activeTab === "recommend" ? renderArticleList() : renderQuestionList()}
      </Animated.View>

      <OptionsMenu
        visible={modalVisible}
        position={menuPosition}
        direction={menuDirection}
        onClose={() => setModalVisible(false)}
      />

      {/* 固定添加按钮 */}
      <FixedAddButton onPress={() => router.push("/(home)/write-article")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoImg: { width: 28, height: 28 },
  logoText: { fontSize: 18, fontWeight: "700", color: "#000000", letterSpacing: -0.3 },
  searchIconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  // Tab
  tabWrapper: { paddingHorizontal: 24, marginBottom: 16 },
  tabContainer: { flexDirection: "row", position: "relative" },
  tabIndicator: { position: "absolute", bottom: 0, height: 2, backgroundColor: "#3B82F6", borderRadius: 1 },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  tabText: { fontSize: 15, fontWeight: "500", color: "#9CA3AF" },
  tabTextActive: { color: "#000000", fontWeight: "700" },
  // 内容
  contentSection: { flex: 1, paddingHorizontal: 24 },
  contentList: { gap: 16 },
  flatListContent: { paddingBottom: 100 },
  // 文章卡片
  articleCardWrapper: { marginBottom: 16 },
  // 大卡片标题行（作者+更多按钮）
  articleHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  // 更多按钮
  moreBtnIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  moreBtnIconSmall: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  // 大卡片作者信息
  authorRowLarge: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarLarge: { width: 28, height: 28, borderRadius: 14 },
  avatarLargePlaceholder: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F0F9FF", alignItems: "center", justifyContent: "center" },
  avatarTextLarge: { fontSize: 12, fontWeight: "600", color: "#0EA5E9" },
  authorNameLarge: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  // 小卡片作者信息
  authorRowSmall: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  avatarSmall: { width: 22, height: 22, borderRadius: 11 },
  avatarSmallPlaceholder: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F0F9FF", alignItems: "center", justifyContent: "center" },
  avatarTextSmallCard: { fontSize: 10, fontWeight: "600", color: "#0EA5E9" },
  authorNameSmallCard: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  articleCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  articleCardLarge: {},
  // 小卡片三行布局
  articleCardSmall: { flexDirection: "column", padding: 16 },
  smallCardRow1: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  smallCardRow2: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  smallCardRow3: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  smallCardTextContent: { flex: 1 },
  articleImageLarge: { width: "100%", height: 200 },
  articleContentLarge: { padding: 20 },
  articleContentSmall: { flex: 1, padding: 16, flexShrink: 0 },
  articleThumbWrapper: { width: 96, height: 96, marginLeft: 12 },
  articleThumb: { width: 96, height: 96, borderRadius: 12 },
  articleMeta: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  articleTitleLarge: { fontSize: 18, fontWeight: "700", color: "#111827", lineHeight: 24 },
  articleTitleSmall: { fontSize: 15, fontWeight: "600", color: "#111827", lineHeight: 20 },
  articleDescLarge: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginTop: 8 },
  articleDescSmall: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginTop: 6 },
  articleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  articleFooterSmall: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 },
  articleActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, minWidth: 44, minHeight: 44, justifyContent: "center" },
  actionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  actionCountActive: { color: "#3B82F6" },
  moreBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  moreBtnSmall: { position: "absolute", top: 12, right: 12, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  moreBtnInline: { marginLeft: "auto", minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  // 问题卡片
  questionCardWrapper: { marginBottom: 16 },
  questionCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  questionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  questionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", lineHeight: 22 },
  questionContent: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginTop: 8, marginBottom: 12 },
  questionFooter: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  authorInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F9FF", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "600", color: "#0EA5E9" },
  authorName: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  questionStats: { flexDirection: "row", alignItems: "center" },
  // 回答摘要样式
  answerAuthorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  avatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#F0F9FF", alignItems: "center", justifyContent: "center" },
  avatarTextSmall: { fontSize: 11, fontWeight: "600", color: "#0EA5E9" },
  authorNameSmall: { fontSize: 13, color: "#6B7280", fontWeight: "500", flex: 1 },
  answerContent: { fontSize: 14, color: "#374151", lineHeight: 20, marginTop: 8 },
  questionFooter: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  questionStats: { flexDirection: "row", alignItems: "center" },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, color: "#9CA3AF" },
  // 分类标签
  categoryTag: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryTagText: { fontSize: 12, fontWeight: "600", color: "#3B82F6" },
  // 蓝色标签
  tagBlue: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagTextBlue: { fontSize: 12, fontWeight: "600", color: "#3B82F6" },
  tagBlueSmall: { backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  tagTextBlueSmall: { fontSize: 11, fontWeight: "600", color: "#3B82F6" },
  // 文章底部行
  articleFooterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  articleFooterRowSmall: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  articleActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  articleActionsSmall: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, minWidth: 44, minHeight: 44, justifyContent: "center" },
  actionBtnSmall: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 36, minHeight: 36, justifyContent: "center" },
  actionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  actionCountSmall: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
  actionCountActive: { color: "#3B82F6" },
  timeText: { fontSize: 12, color: "#9CA3AF" },
  // 空状态
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#374151", marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: "#9CA3AF" },
  // 加载更多
  loadingFooter: { paddingVertical: 20, alignItems: "center" },
  loadingText: { fontSize: 14, color: "#9CA3AF" },
  // 固定添加按钮
  fixedAddBtn: { position: "absolute", bottom: 24, right: 24 },
  fixedAddBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // 骨架屏
  skeletonCard: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 16 },
  skeletonCardFirst: {},
  skeletonImage: { width: "100%", height: 200, backgroundColor: "#F3F4F6" },
  skeletonBody: { padding: 16 },
  skeletonRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  skeletonTag: { width: 50, height: 22, borderRadius: 6, backgroundColor: "#F3F4F6" },
  skeletonTime: { width: 60, height: 14, borderRadius: 4, backgroundColor: "#F3F4F6" },
  skeletonTitle: { height: 18, borderRadius: 6, backgroundColor: "#F3F4F6", marginBottom: 8 },
  skeletonThumbItem: { width: 96, height: 96, borderRadius: 12, backgroundColor: "#F3F4F6" },
});
