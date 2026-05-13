import * as planApi from "@/src/api/plan";
import type { Phase, Plan, Task } from "@/src/types/plan";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import { usePlanStore } from "@/src/stores/planStore";
import {
  Calendar, MapPin, Plane, GraduationCap, Briefcase, Home,
  ChevronRight, Check, Target, Sparkles, Bell, Trophy, Paperclip, Clock, Flag
} from "lucide-react-native";
import { formatDate, formatDateTime } from "@/src/utils/time";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  scheduleTaskReminder,
  cancelTaskReminder,
} from "@/src/utils/notifications";

// ============================================
// Design System - Monochrome with Animation
// ============================================
const COLORS = {
  primary: "#18181B",
  onPrimary: "#FFFFFF",
  secondary: "#27272A",
  accent: "#3F3F46",
  background: "#FAFAFA",
  foreground: "#0A0A0A",
  muted: "#F4F4F5",
  border: "#E4E4F7",
  cardBg: "#FFFFFF",
  textPrimary: "#18181B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  destructive: "#18181B",
  success: "#22C55E",
  successLight: "#F0FDF4",
  warning: "#71717A",
  warningLight: "#F4F4F5",
  info: "#3F3F46",
  infoLight: "#F4F4F5",
  // 日期相关颜色
  dateStart: "#6366F1",     // 开始日期 - 靛蓝
  datePlan: "#8B5CF6",      // 计划日期 - 紫色
  dateEnd: "#F59E0B",       // 结束日期 - 琥珀
  dateRemind: "#EF4444",    // 提醒时间 - 红色
  // 优先级颜色
  priorityHigh: "#EF4444",
  priorityMedium: "#F59E0B",
  priorityLow: "#22C55E",
};

// ============================================
// 工具函数
// ============================================
const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  } catch {
    return null;
  }
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "低", color: COLORS.priorityLow, bg: "#F0FDF4" },
  medium: { label: "中", color: COLORS.priorityMedium, bg: "#FFFBEB" },
  high: { label: "高", color: COLORS.priorityHigh, bg: "#FEF2F2" },
};

// ============================================
// 骨架屏组件
// ============================================
function SkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonHeader}>
          <Animated.View style={[styles.skeletonBadge, { opacity }]} />
          <Animated.View style={[styles.skeletonBadgeSmall, { opacity }]} />
        </View>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
        <View style={styles.skeletonTimeline}>
          {[1, 2, 3].map((i) => (
            <Animated.View key={i} style={[styles.skeletonDot, { opacity }]} />
          ))}
        </View>
        <Animated.View style={[styles.skeletonProgress, { opacity }]} />
        <View style={styles.skeletonStats}>
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

function SkeletonPhaseCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return (
    <View style={styles.skeletonPhaseCard}>
      <View style={styles.skeletonTabs}>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.skeletonTab, { opacity }]} />
        ))}
      </View>
      <View style={styles.skeletonTasks}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonTaskRow}>
            <Animated.View style={[styles.skeletonTaskDot, { opacity }]} />
            <Animated.View style={[styles.skeletonTaskText, { opacity }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  tourism: { icon: Plane, label: "旅游", color: "#18181B", bg: "#F4F4F5" },
  study: { icon: GraduationCap, label: "留学", color: "#18181B", bg: "#F4F4F5" },
  work: { icon: Briefcase, label: "工作", color: "#18181B", bg: "#F4F4F5" },
  immigration: { icon: Home, label: "定居", color: "#18181B", bg: "#F4F4F5" },
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: "已完成", bg: "#F0FDF4", text: "#22C55E" },
  generating: { label: "进行中", bg: "#F0FDF4", text: "#22C55E" },
  paused: { label: "已暂停", bg: "#FEF2F2", text: "#DC2626" },
  draft: { label: "待开始", bg: "#F4F4F5", text: "#71717A" },
  archived: { label: "已归档", bg: "#F4F4F5", text: "#A1A1AA" },
};

// ============================================
// 时间线组件
// ============================================
function PlanTimeline({ plan }: { plan: Plan }) {
  const startDate = plan.startDate ? new Date(plan.startDate) : null;
  const planDate = plan.planDate ? new Date(plan.planDate) : null;

  if (!startDate || !planDate) {
    return null;
  }

  const now = new Date();
  const totalDuration = planDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progressPercent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  // 颜色判断：小于33%绿色，33%-66%黄色，大于66%红色
  let progressColor = COLORS.success;
  if (progressPercent >= 33 && progressPercent <= 66) {
    progressColor = COLORS.priorityMedium; // 黄色
  } else if (progressPercent > 66) {
    progressColor = COLORS.priorityHigh; // 红色
  }

  const formatDateStr = (d: Date) => {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineTrack}>
        <View style={styles.timelineNode}>
          <View style={[styles.timelineDot, { backgroundColor: COLORS.dateStart }]} />
          <Text style={styles.timelineDate}>{formatDateStr(startDate)}</Text>
          <Text style={styles.timelineLabel}>开始</Text>
        </View>

        <View style={styles.timelineLineContainer}>
          {/* 背景线 */}
          <View style={styles.timelineBgLine} />
          {/* 填充进度 */}
          <View style={[styles.timelineProgressLine, { width: `${progressPercent}%`, backgroundColor: progressColor }]} />
          {/* 当前时间点 */}
          <View style={[styles.timelineCurrentDot, { left: `${progressPercent}%`, backgroundColor: progressColor }]} />
        </View>

        <View style={styles.timelineNode}>
          <View style={[styles.timelineDot, { backgroundColor: COLORS.datePlan }]} />
          <Text style={[styles.timelineDate, { color: COLORS.datePlan }]}>{formatDateStr(planDate)}</Text>
          <Text style={[styles.timelineLabel, { color: COLORS.datePlan }]}>计划</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================
// 子组件 - Tab切换器
// ============================================
function PhaseTabSwitcher({ phases, selectedPhaseId, onPhaseSelect }: {
  phases: Phase[];
  selectedPhaseId: number | null;
  onPhaseSelect: (phaseId: number) => void;
}) {
  return (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {phases.map((phase) => {
          const isSelected = phase.id === selectedPhaseId;
          return (
            <TouchableOpacity
              key={phase.id}
              style={styles.tabItem}
              onPress={() => onPhaseSelect(phase.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={isSelected ? { selected: true } : {}}
              accessibilityLabel={`阶段: ${phase.title}`}
            >
              <Text style={[styles.tabItemText, isSelected && styles.tabItemTextSelected]}>
                {phase.title}
              </Text>
              {phase.isMilestone && (
                <View style={styles.milestoneIcon}>
                  <Flag size={10} color={COLORS.datePlan} />
                </View>
              )}
              {isSelected && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================
// 子组件 - 带动画的任务列表
// ============================================
function TaskListView({ phase, selectedTaskId, onTaskSelect, onTaskComplete }: {
  phase: Phase | null;
  selectedTaskId: number | null;
  onTaskSelect?: (taskId: number, phaseId: number) => void;
  onTaskComplete?: (taskId: number, phaseId: number) => void;
}) {
  if (!phase || !phase.tasks || phase.tasks.length === 0) {
    return (
      <View style={styles.emptyTaskContainer}>
        <Text style={styles.emptyTaskText}>该阶段暂无任务</Text>
      </View>
    );
  }

  let pendingIndex = 1;

  return (
    <View style={styles.taskListContainer}>
      {phase.tasks.map((task) => {
        const isCompleted = task.status === 'completed';
        const currentPendingIndex = isCompleted ? 0 : pendingIndex++;

        return (
          <AnimatedTaskRow
            key={task.id}
            task={task}
            pendingIndex={currentPendingIndex}
            isSelected={task.id === selectedTaskId}
            onSelect={() => onTaskSelect?.(task.id, phase.id)}
            onComplete={() => onTaskComplete?.(task.id, phase.id)}
          />
        );
      })}
    </View>
  );
}

// 动画任务行组件
function AnimatedTaskRow({ task, pendingIndex, isSelected, onSelect, onComplete }: {
  task: Task;
  pendingIndex: number;
  isSelected: boolean;
  onSelect?: () => void;
  onComplete?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.status === 'completed' ? 1 : 0)).current;

  useEffect(() => {
    if (task.status === 'completed') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
      ]).start();
      Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 8 }).start();
    }
  }, [task.status]);

  const priority = priorityConfig[task.priority || 'medium'];
  const planEndDate = formatShortDate(task.endDate);
  const hasReminder = !!task.reminderTime;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const isCompleted = task.status === 'completed';

  return (
    <Animated.View style={[styles.taskRow, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.taskRowMain, isSelected && styles.taskRowMainSelected]}
        onPress={onSelect}
        activeOpacity={0.7}
        accessibilityLabel={`选择任务: ${task.title}`}
        accessibilityRole="button"
      >
        <Animated.View style={[
          styles.taskIndexDot,
          isCompleted ? styles.taskIndexDotCompleted : styles.taskIndexDotPending,
          { transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] }) }] }
        ]}>
          {isCompleted ? (
            <Check size={11} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <Text style={styles.taskIndexText}>{pendingIndex}</Text>
          )}
        </Animated.View>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            {/* 优先级标签 */}
            <View style={[styles.priorityTag, { backgroundColor: priority.bg }]}>
              <Text style={[styles.priorityTagText, { color: priority.color }]}>{priority.label}</Text>
            </View>
            {/* 提醒图标 */}
            {hasReminder && (
              <View style={styles.reminderIcon}>
                <Bell size={10} color={COLORS.dateRemind} />
              </View>
            )}
            {/* 附件图标 */}
            {hasAttachments && (
              <View style={styles.attachmentIcon}>
                <Paperclip size={10} color={COLORS.textMuted} />
                <Text style={styles.attachmentCount}>{task.attachments!.length}</Text>
              </View>
            )}
            {/* 计划结束日期 */}
            {planEndDate && (
              <View style={styles.taskEndDate}>
                <Calendar size={10} color={COLORS.datePlan} />
                <Text style={styles.taskEndDateText}>{planEndDate}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// 子组件 - 当前任务卡片
// ============================================
function CurrentTaskDetailCard({ task, onComplete, onBellPress }: {
  task: Task | null;
  onComplete?: () => void;
  onBellPress?: (task: Task) => void;
}) {
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  if (!task) return null;

  const handleComplete = () => {
    onComplete?.();
  };

  const suggestion = "建议先完成语言考试备考，这将为后续申请材料准备打下坚实基础。";
  const priority = priorityConfig[task.priority || 'medium'];
  const startDate = formatShortDate(task.startDate);
  const endDate = formatShortDate(task.endDate);
  const planDate = formatShortDate(task.planDate);

  return (
    <View style={styles.taskDetailCard}>
      <View style={styles.taskDetailTopBar}>
        <View style={styles.taskDetailBadge}>
          <Target size={13} color={COLORS.textSecondary} />
          <Text style={styles.taskDetailBadgeText}>当前任务</Text>
        </View>
        <View style={styles.taskDetailActions}>
          {task.reminderTime && (
            <View style={[styles.reminderBadge, { backgroundColor: COLORS.dateRemind + '15' }]}>
              <Clock size={12} color={COLORS.dateRemind} />
              <Text style={[styles.reminderBadgeText, { color: COLORS.dateRemind }]}>
                {formatDateTime(task.reminderTime)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => onBellPress?.(task)}
            activeOpacity={0.7}
            accessibilityLabel="设置提醒"
            accessibilityRole="button"
          >
            <Bell size={18} color={task.reminderTime ? "#3B82F6" : "#93C5FD"} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.taskDetailTitle}>{task.title}</Text>

      {/* 任务元信息 */}
      <View style={styles.taskDetailMeta}>
        <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
          <Text style={[styles.priorityBadgeText, { color: priority.color }]}>{priority.label}优先级</Text>
        </View>
        {task.attachments && task.attachments.length > 0 && (
          <View style={styles.attachmentBadge}>
            <Paperclip size={12} color={COLORS.textSecondary} />
            <Text style={styles.attachmentBadgeText}>{task.attachments.length}个附件</Text>
          </View>
        )}
      </View>

      {/* 日期信息 */}
      <View style={styles.taskDateInfo}>
        {startDate && (
          <View style={styles.taskDateItem}>
            <Calendar size={12} color={COLORS.dateStart} />
            <Text style={styles.taskDateLabel}>开始</Text>
            <Text style={[styles.taskDateValue, { color: COLORS.dateStart }]}>{startDate}</Text>
          </View>
        )}
        {planDate && (
          <View style={styles.taskDateItem}>
            <Sparkles size={12} color={COLORS.datePlan} />
            <Text style={styles.taskDateLabel}>计划</Text>
            <Text style={[styles.taskDateValue, { color: COLORS.datePlan }]}>{planDate}</Text>
          </View>
        )}
        {endDate && (
          <View style={styles.taskDateItem}>
            <Calendar size={12} color={COLORS.dateEnd} />
            <Text style={styles.taskDateLabel}>结束</Text>
            <Text style={[styles.taskDateValue, { color: COLORS.dateEnd }]}>{endDate}</Text>
          </View>
        )}
      </View>

      {task.description && (
        <Text style={styles.taskDetailDesc}>{task.description}</Text>
      )}

      {showAiSuggestion && (
        <Animated.View style={styles.aiSuggestionBox}>
          <View style={styles.aiSuggestionHeader}>
            <Sparkles size={14} color={COLORS.textSecondary} />
            <Text style={styles.aiSuggestionTitle}>智能建议</Text>
          </View>
          <Text style={styles.aiSuggestionText}>{suggestion}</Text>
        </Animated.View>
      )}

      {task.status === 'completed' ? (
        <View style={[styles.completeBtn, styles.completeBtnDisabled]}>
          <Check size={18} color="#22C55E" strokeWidth={2.5} />
          <Text style={[styles.completeBtnText, styles.completeBtnTextDisabled]}>已完成</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={handleComplete}
          activeOpacity={0.8}
          accessibilityLabel="标记任务完成"
          accessibilityRole="button"
        >
          <Check size={18} color={COLORS.onPrimary} strokeWidth={2.5} />
          <Text style={styles.completeBtnText}>完成</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// 子组件 - 恭喜完成卡片
// ============================================
function CompletionCelebrationCard() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
    Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.celebrationCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.celebrationIconContainer}>
        <Trophy size={32} color={COLORS.success} />
      </View>
      <Text style={styles.celebrationTitle}>恭喜！</Text>
      <Text style={styles.celebrationSubtitle}>你已经完成了所有规划任务</Text>
      <View style={styles.celebrationStats}>
        <View style={styles.celebrationStatItem}>
          <Check size={16} color={COLORS.success} />
          <Text style={styles.celebrationStatText}>全部完成</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================
// 主页面
// ============================================
export default function PlanScreen() {
  const { plans, fetchPlans } = usePlanStore();
  const [generatingPlan, setGeneratingPlan] = useState<Plan | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const phasesRef = useRef<Phase[]>([]);
  // 提醒时间选择器状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempReminderDate, setTempReminderDate] = useState<Date | null>(null);
  const [currentBellTask, setCurrentBellTask] = useState<Task | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  // 时间选择器动画
  const pickerAnim = useRef(new Animated.Value(0)).current;
  const pickerTranslateY = pickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    phasesRef.current = phases;
  }, [phases]);

  const getSelectedPhase = useCallback(() => {
    if (!selectedPhaseId) {
      return phases.find(p => p.tasks && !p.tasks.every(t => t.status === 'completed')) || phases[0] || null;
    }
    return phases.find(p => p.id === selectedPhaseId) || null;
  }, [phases, selectedPhaseId]);

  const loadPlanData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchPlans(true);
      const plan = await planApi.getGeneratingPlan();

      if (plan) {
        const phaseRes = await planApi.getPhaseList(plan.id);
        const phaseList = Array.isArray(phaseRes) ? phaseRes : (phaseRes?.list || []);

        const phasesWithTasks = await Promise.all(
          phaseList.map(async (phase: Phase) => {
            const taskRes = await planApi.getTaskList(phase.id);
            const taskList = Array.isArray(taskRes) ? taskRes : (taskRes?.list || []);
            return { ...phase, tasks: taskList };
          })
        );

        setGeneratingPlan(plan);
        setPhases(phasesWithTasks);

        const defaultPhase = phasesWithTasks.find(p => p.tasks && !p.tasks.every(t => t.status === 'completed')) || phasesWithTasks[0];
        if (defaultPhase) {
          setSelectedPhaseId(defaultPhase.id);
          // 默认选中第一个未完成的任务
          const firstPendingTask = defaultPhase.tasks?.find(t => t.status !== 'completed');
          if (firstPendingTask) {
            setSelectedTaskId(firstPendingTask.id);
          }
        }
      } else {
        setGeneratingPlan(null);
        setPhases([]);
      }

      setLoading(false);
      setIsHydrated(true);
      Animated.timing(contentFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch (error) {
      console.error("加载规划失败:", error);
      setLoading(false);
      setIsHydrated(true);
    }
  }, [fetchPlans, contentFadeAnim]);

  useFocusEffect(
    useCallback(() => {
      contentFadeAnim.setValue(0);
      setIsHydrated(false);
      loadPlanData();
    }, [loadPlanData, contentFadeAnim])
  );

  const handleTaskSelect = (taskId: number, phaseId: number) => {
    setSelectedTaskId(taskId);
    setSelectedPhaseId(phaseId);
  };

  const handleTaskComplete = async (taskId: number, phaseId: number) => {
    try {
      const task = phases.flatMap(p => p.tasks || []).find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await planApi.completeTask({ id: taskId, status: newStatus });

      setPhases(prev => prev.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          tasks: phase.tasks?.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
          ),
        };
      }));

      // 延迟2秒后自动跳转到第一个未完成的任务
      setTimeout(() => {
        const currentPhases = phasesRef.current;
        for (const phase of currentPhases) {
          const pendingTask = phase.tasks?.find(t => t.status !== 'completed');
          if (pendingTask) {
            setSelectedTaskId(pendingTask.id);
            setSelectedPhaseId(phase.id);
            break;
          }
        }
      }, 2000);
    } catch (error) {
      console.error("更新任务状态失败:", error);
    }
  };

  const handlePhaseSelect = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
  };

  // 闹钟按钮点击处理
  const handleBellPress = (task: Task) => {
    const initialDate = task.reminderTime
      ? new Date(task.reminderTime)
      : new Date(Date.now() + 60 * 60 * 1000);
    setTempReminderDate(initialDate);
    setCurrentBellTask(task);
    setShowDatePicker(true);
    // 显示动画
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(pickerAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  };

  const closePicker = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(pickerAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowDatePicker(false);
      callback?.();
    });
  };

  // 更新提醒时间
  const handleUpdateReminderTime = async (date: Date) => {
    if (!currentBellTask) return;
    setReminderLoading(true);
    try {
      const reminderTime = date.toISOString();
      const updated = await planApi.updateTask({
        id: currentBellTask.id,
        reminderTime,
      });
      // 更新本地任务数据
      setPhases(prev => prev.map(phase => ({
        ...phase,
        tasks: phase.tasks?.map(t =>
          t.id === currentBellTask.id ? { ...t, reminderTime: updated.reminderTime } : t
        ),
      })));
      // 调度系统通知
      if (updated.reminderTime) {
        await scheduleTaskReminder(currentBellTask.id, currentBellTask.title, new Date(updated.reminderTime));
      } else {
        await cancelTaskReminder(currentBellTask.id);
      }
    } catch (error) {
      console.error("更新提醒时间失败:", error);
      Alert.alert("更新失败", "无法保存提醒时间，请重试");
    } finally {
      setReminderLoading(false);
      closePicker(() => {
        setCurrentBellTask(null);
      });
    }
  };

  const getProgress = () => {
    if (phases.length === 0) return { completed: 0, total: 0, percent: 0 };
    const allTasks = phases.flatMap(p => p.tasks || []);
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCurrentTask = useCallback(() => {
    if (!selectedTaskId) return null;
    for (const phase of phases) {
      const task = phase.tasks?.find(t => t.id === selectedTaskId);
      if (task) return task;
    }
    return null;
  }, [phases, selectedTaskId]);

  const getGlobalCurrentTask = useCallback(() => {
    return getCurrentTask();
  }, [getCurrentTask]);

  const isAllCompleted = useCallback(() => {
    if (phases.length === 0) return false;
    const allTasks = phases.flatMap(p => p.tasks || []);
    return allTasks.length > 0 && allTasks.every(t => t.status === 'completed');
  }, [phases]);

  const hasPlansButNoGenerating = !loading && isHydrated && plans.length > 0 && !generatingPlan;

  if (!loading && !generatingPlan && plans.length === 0) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState
          onCreatePlan={() => router.push("/(plan)/create-plan")}
          colors={COLORS}
        />
      </SafeAreaView>
    );
  }

  if (hasPlansButNoGenerating) {
    return (
      <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState
          onViewPlans={() => router.push("/(plan)/plan-list")}
          colors={COLORS}
          hasPlans={true}
        />
      </SafeAreaView>
    );
  }

  const progress = getProgress();
  const type = generatingPlan ? (typeConfig[generatingPlan.type as string] || typeConfig.tourism) : null;
  const status = generatingPlan ? (statusConfig[generatingPlan.status as string] || statusConfig.draft) : null;
  const IconComp = type?.icon;
  const destinationText = generatingPlan?.destination.country ||
    generatingPlan?.destination.city ||
    generatingPlan?.destination.province || "";
  const selectedPhase = getSelectedPhase();
  const globalCurrentTask = getGlobalCurrentTask();
  const allCompleted = isAllCompleted();

  const showSkeleton = loading && !generatingPlan;
  const showContent = isHydrated || (!loading && (generatingPlan || !showSkeleton));

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={true}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>出国规划</Text>
          <TouchableOpacity
            style={styles.allPlansBtn}
            activeOpacity={0.7}
            onPress={() => router.push("/(plan)/plan-list")}
            accessibilityLabel="查看所有规划"
            accessibilityRole="button"
          >
            <Text style={styles.allPlansText}>所有规划</Text>
            <ChevronRight size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 骨架屏 */}
        {showSkeleton && (
          <View style={styles.featuredSection}>
            <SkeletonCard />
            <SkeletonPhaseCard />
          </View>
        )}

        {/* 实际内容 */}
        {showContent && generatingPlan && type && status && (
          <Animated.View style={[styles.featuredSection, { opacity: contentFadeAnim }]}>
            {/* 主卡片 */}
            <TouchableOpacity
              style={styles.mainCard}
              activeOpacity={0.95}
              onPress={() => router.push({ pathname: "/(plan)/plan-detail", params: { id: String(generatingPlan.id) } })}
              accessibilityLabel={`查看 ${generatingPlan.title} 详情`}
              accessibilityRole="link"
            >
              <View style={styles.mainCardContent}>
                <View style={styles.mainCardHeader}>
                  <View style={styles.typeBadge}>
                    <IconComp size={14} color={COLORS.textSecondary} />
                    <Text style={styles.typeLabel}>{type.label}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                <Text style={styles.planTitle}>{generatingPlan.title}</Text>
                <View style={styles.destinationRow}>
                  <MapPin size={13} color={COLORS.textMuted} />
                  <Text style={styles.destinationText}>{destinationText}</Text>
                </View>

                {/* 时间线 */}
                <PlanTimeline plan={generatingPlan} />

                {/* 进度条 */}
                {progress.total > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                      <Animated.View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress.percent}%</Text>
                  </View>
                )}

                {/* 统计数据 */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{progress.completed}</Text>
                    <Text style={styles.statLabel}>已完成</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{progress.total - progress.completed}</Text>
                    <Text style={styles.statLabel}>待完成</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{phases.length}</Text>
                    <Text style={styles.statLabel}>阶段</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* 阶段+任务卡片 */}
            {phases.length > 0 && (
              <View style={styles.phaseTaskCard}>
                <PhaseTabSwitcher
                  phases={phases}
                  selectedPhaseId={selectedPhaseId}
                  onPhaseSelect={handlePhaseSelect}
                />

                <TaskListView
                  phase={selectedPhase}
                  selectedTaskId={selectedTaskId}
                  onTaskSelect={handleTaskSelect}
                  onTaskComplete={handleTaskComplete}
                />
              </View>
            )}

            {/* 当前任务卡片 或 恭喜完成卡片 */}
            {allCompleted ? (
              <CompletionCelebrationCard />
            ) : globalCurrentTask ? (
              <CurrentTaskDetailCard
                task={globalCurrentTask}
                onComplete={() => {
                  const phase = phases.find(p => p.tasks?.some(t => t.id === globalCurrentTask.id));
                  if (phase) {
                    handleTaskComplete(globalCurrentTask.id, phase.id);
                  }
                }}
                onBellPress={handleBellPress}
              />
            ) : null}

            {/* 提醒时间选择器 */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={tempReminderDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  closePicker();
                  if (event.type === 'set' && date) {
                    handleUpdateReminderTime(date);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {/* 底部弹出时间选择器 */}
            {showDatePicker && Platform.OS === 'ios' && (
              <Animated.View style={styles.pickerOverlay}>
                <Animated.View style={[styles.pickerBackdrop, { opacity: backdropAnim }]}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={() => closePicker()}
                  />
                </Animated.View>
                <Animated.View style={[styles.pickerContainer, { transform: [{ translateY: pickerTranslateY }] }]}>
                  <Animated.View style={[styles.pickerContent]}>
                    <View style={styles.pickerHandle} />
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => closePicker()}>
                        <Text style={styles.pickerCancel}>取消</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerTitle}>设置提醒时间</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (tempReminderDate) {
                            handleUpdateReminderTime(tempReminderDate);
                          }
                        }}
                        disabled={reminderLoading || !tempReminderDate}
                      >
                        <Text style={[styles.pickerSave, reminderLoading && styles.pickerSaveDisabled]}>
                          {reminderLoading ? "保存中..." : "保存"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempReminderDate || new Date()}
                      mode="datetime"
                      display="spinner"
                      onChange={(event: DateTimePickerEvent, date?: Date) => {
                        if (date) {
                          setTempReminderDate(date);
                        }
                      }}
                      minimumDate={new Date()}
                    />
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary, letterSpacing: -0.5 },
  allPlansBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.muted,
    borderRadius: 20,
  },
  allPlansText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },

  // Loading
  loadingContainer: { padding: 40, alignItems: "center" },
  loadingText: { fontSize: 14, color: COLORS.textMuted },

  // Skeleton Card
  skeletonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonContent: { padding: 20 },
  skeletonHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  skeletonBadge: { width: 70, height: 24, borderRadius: 8, backgroundColor: COLORS.muted },
  skeletonBadgeSmall: { width: 60, height: 24, borderRadius: 12, backgroundColor: COLORS.muted },
  skeletonTitle: { width: "70%", height: 24, borderRadius: 6, backgroundColor: COLORS.muted, marginBottom: 10 },
  skeletonSubtitle: { width: "45%", height: 16, borderRadius: 4, backgroundColor: COLORS.muted, marginBottom: 18 },
  skeletonTimeline: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 18, gap: 8 },
  skeletonDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.muted },
  skeletonProgress: { width: "100%", height: 6, borderRadius: 3, backgroundColor: COLORS.muted, marginBottom: 18 },
  skeletonStats: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.muted, borderRadius: 12 },
  skeletonStat: { width: 50, height: 30, borderRadius: 6, backgroundColor: COLORS.border },

  // Skeleton Phase Card
  skeletonPhaseCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonTabs: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, gap: 24 },
  skeletonTab: { width: 50, height: 20, borderRadius: 4, backgroundColor: COLORS.muted },
  skeletonTasks: { padding: 20 },
  skeletonTaskRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  skeletonTaskDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.muted, marginRight: 14 },
  skeletonTaskText: { flex: 1, height: 18, borderRadius: 4, backgroundColor: COLORS.muted },

  // Featured Section
  featuredSection: { paddingHorizontal: 20, gap: 16 },

  // Main Card
  mainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainCardContent: { padding: 20 },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.muted,
  },
  typeLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  planTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  destinationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
  destinationText: { fontSize: 14, color: COLORS.textSecondary },

  // Timeline
  timelineContainer: { marginBottom: 16 },
  timelineTrack: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
  timelineNode: { alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  timelineDate: { fontSize: 12, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 },
  timelineLabel: { fontSize: 10, color: COLORS.textMuted },
  timelineLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginTop: 4, marginHorizontal: 8 },
  timelineLineContainer: { flex: 1, height: 20, position: "relative", marginTop: 2, marginHorizontal: 8 },
  timelineBgLine: { position: "absolute", top: 9, left: 0, right: 0, height: 2, backgroundColor: COLORS.border, borderRadius: 1 },
  timelineProgressLine: { position: "absolute", top: 9, left: 0, height: 2, borderRadius: 1 },
  timelineCurrentDot: { position: "absolute", top: 4, width: 12, height: 12, borderRadius: 6, marginLeft: -6 },

  // Progress
  progressSection: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.muted, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3, backgroundColor: COLORS.primary },
  progressText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },

  // Stats Row
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 12, paddingHorizontal: 8, backgroundColor: COLORS.muted, borderRadius: 12 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  // Phase + Task Card
  phaseTaskCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },

  // Tab Switcher
  tabContainer: { borderBottomWidth: 0, position: "relative" },
  tabScrollContent: { paddingHorizontal: 16, gap: 24 },
  tabItem: { paddingVertical: 14, alignItems: "center", position: "relative" },
  tabItemText: { fontSize: 14, fontWeight: "500", color: COLORS.textMuted },
  tabItemTextSelected: { color: COLORS.textPrimary, fontWeight: "600" },
  tabIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: COLORS.primary, borderRadius: 1 },
  tabMovingIndicator: { display: "none" }, // 使用tabIndicator代替移动指示器
  milestoneIcon: { position: "absolute", top: 8, right: -4 },

  // Task List
  taskListContainer: { padding: 20 },
  emptyTaskContainer: { padding: 32, alignItems: "center" },
  emptyTaskText: { fontSize: 14, color: COLORS.textMuted },
  taskRow: { marginBottom: 16 },
  taskRowMain: { flexDirection: "row", alignItems: "flex-start" },
  taskRowMainSelected: { backgroundColor: COLORS.muted, borderRadius: 12, padding: 8, margin: -8 },
  taskIndexDot: {
    width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
    marginRight: 14, marginTop: 1,
  },
  taskIndexDotPending: { backgroundColor: COLORS.primary },
  taskIndexDotCompleted: { backgroundColor: COLORS.success },
  taskIndexText: { fontSize: 12, fontWeight: "600", color: COLORS.onPrimary },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "500", color: COLORS.textPrimary, flex: 1, lineHeight: 22 },
  taskTitleCompleted: { color: COLORS.textMuted },
  taskMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 6 },
  priorityTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityTagText: { fontSize: 10, fontWeight: "600" },
  reminderIcon: { padding: 2 },
  attachmentIcon: { flexDirection: "row", alignItems: "center", gap: 2, padding: 2 },
  attachmentCount: { fontSize: 10, color: COLORS.textMuted },
  taskDateRange: { fontSize: 11, color: COLORS.textMuted },
  taskEndDate: { flexDirection: "row", alignItems: "center", gap: 3 },
  taskEndDateText: { fontSize: 10, color: COLORS.datePlan, fontWeight: "500" },

  // Task Detail Card
  taskDetailCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  taskDetailTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  taskDetailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.muted,
  },
  taskDetailBadgeText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  taskDetailActions: { flexDirection: "row", gap: 4, alignItems: "center" },
  taskDetailActionBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.muted,
    alignItems: "center", justifyContent: "center",
  },
  bellButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.muted,
    alignItems: "center", justifyContent: "center",
  },
  taskDetailTitle: {
    fontSize: 18, fontWeight: "700", color: COLORS.textPrimary,
    marginBottom: 10, letterSpacing: -0.2,
  },
  taskDetailMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityBadgeText: { fontSize: 11, fontWeight: "600" },
  attachmentBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.muted },
  attachmentBadgeText: { fontSize: 11, color: COLORS.textSecondary },
  reminderBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  reminderBadgeText: { fontSize: 11, fontWeight: "500" },
  taskDateInfo: { flexDirection: "row", gap: 16, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  taskDateItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  taskDateLabel: { fontSize: 11, color: COLORS.textMuted },
  taskDateValue: { fontSize: 12, fontWeight: "600" },
  taskDetailDesc: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 16,
  },

  // AI Suggestion Box
  aiSuggestionBox: {
    backgroundColor: COLORS.muted, borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  aiSuggestionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  aiSuggestionTitle: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  aiSuggestionText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Complete Button
  completeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 14, backgroundColor: COLORS.primary,
  },
  completeBtnDisabled: {
    backgroundColor: "#DCFCE7", // 浅绿色背景
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  completeBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.onPrimary },
  completeBtnTextDisabled: { color: "#22C55E" },

  // Celebration Card
  celebrationCard: {
    backgroundColor: COLORS.cardBg, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.success, padding: 28, alignItems: "center",
  },
  celebrationIconContainer: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.successLight,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  celebrationTitle: { fontSize: 24, fontWeight: "700", color: COLORS.success, marginBottom: 8 },
  celebrationSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: "center" },
  celebrationStats: { flexDirection: "row", alignItems: "center", gap: 16 },
  celebrationStatItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  celebrationStatText: { fontSize: 14, fontWeight: "600", color: COLORS.success },

  // DateTimePicker Modal
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  pickerCancel: {
    fontSize: 17,
    color: '#9CA3AF',
  },
  pickerSave: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  pickerSaveDisabled: {
    color: '#C4B5FE',
  },
  picker: {
    height: 216,
  },
});
