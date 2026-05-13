import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, Briefcase, Calculator, ChevronLeft, Clock, Edit2, ExternalLink, FileText, Globe, GraduationCap, Home, Paperclip, Plane, Sparkles, Calendar, AlertCircle, Eye } from "lucide-react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import { Animated, Linking, ScrollView, Text, TouchableOpacity, View, Alert, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as planApi from "@/src/api/plan";
import * as FileSystem from "expo-file-system/legacy";
import type { Attachment, Task, TaskPriority, TaskStatus } from "@/src/types/plan";
import {
  requestNotificationPermissions,
  scheduleTaskReminder,
  cancelTaskReminder,
} from "@/src/utils/notifications";

const typeConfig = {
  tourism: { icon: Plane, label: "旅游规划", color: "#3B82F6", bgColor: "#EBF5FF" },
  study: { icon: GraduationCap, label: "留学规划", color: "#8B5CF6", bgColor: "#F5F3FF" },
  work: { icon: Briefcase, label: "工作规划", color: "#F59E0B", bgColor: "#FFFBEB" },
  immigration: { icon: Home, label: "定居规划", color: "#10B981", bgColor: "#ECFDF5" },
};

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "待开始", color: "#6B7280", bgColor: "#F3F4F6" },
  in_progress: { label: "进行中", color: "#3B82F6", bgColor: "#EBF5FF" },
  completed: { label: "已完成", color: "#10B981", bgColor: "#ECFDF5" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: "低", color: "#10B981", bgColor: "#ECFDF5" },
  medium: { label: "中", color: "#F59E0B", bgColor: "#FFFBEB" },
  high: { label: "高", color: "#EF4444", bgColor: "#FEF2F2" },
};

const iconMap: Record<string, any> = {
  Plane, Globe, Calculator, BookOpen, FileText, GraduationCap, Briefcase, Home
};

// iconMap 已预留用于快捷入口功能

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [tempReminderDate, setTempReminderDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // 时间选择器动画
  const pickerAnim = useRef(new Animated.Value(0)).current;
  const pickerTranslateY = pickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // 加载任务详情
  const loadTaskDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await planApi.getTaskDetail(Number(id));
      setTask(data);
      if (data.aiSuggestion) {
        setAiSuggestion(data.aiSuggestion);
      }
    } catch (error) {
      console.error("加载任务详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 首次加载
  useEffect(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  // 当任务加载完成后，如果有提醒时间则调度通知
  useEffect(() => {
    if (task?.reminderTime) {
      scheduleTaskReminder(
        task.id,
        task.title,
        new Date(task.reminderTime)
      );
    }
  }, [task?.id, task?.reminderTime, task?.title]);

  // 获取 AI 建议
  const handleGetAISuggestion = async () => {
    if (!id) return;
    setAiSuggestionLoading(true);
    try {
      const response = await planApi.getTaskAISuggestion(Number(id));
      setAiSuggestion(response.suggestion);
      setTask(prev => prev ? { ...prev, aiSuggestion: response.suggestion } : null);
    } catch (error) {
      console.error("获取 AI 建议失败:", error);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  // 更新提醒时间
  const handleUpdateReminderTime = async (date: Date) => {
    if (!id || !task) return;
    setReminderLoading(true);
    try {
      const reminderTime = date.toISOString();
      const updated = await planApi.updateTask({
        id: Number(id),
        reminderTime,
      });
      setTask(prev => prev ? { ...prev, reminderTime: updated.reminderTime } : null);

      // 调度或取消系统通知提醒
      if (updated.reminderTime) {
        await scheduleTaskReminder(
          Number(id),
          task.title,
          new Date(updated.reminderTime)
        );
      } else {
        // 清除提醒时间时，取消已调度的通知
        await cancelTaskReminder(Number(id));
      }
    } catch (error) {
      console.error("更新提醒时间失败:", error);
      Alert.alert("更新失败", "无法保存提醒时间，请重试");
    } finally {
      setReminderLoading(false);
      closePicker(() => {
        // 关闭后的回调
      });
    }
  };

  // 关闭picker
  const closePicker = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(pickerAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowDatePicker(false);
      callback?.();
    });
  };

  // 显示picker
  const openPicker = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(pickerAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("无法打开链接:", error);
    }
  };

  // 附件预览/下载
  const handleAttachmentPress = async (attachment: Attachment) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${attachment.name}`;

      // 下载文件到本地
      const downloadResult = await FileSystem.downloadAsync(attachment.url, fileUri);

      if (downloadResult.uri) {
        // 根据文件类型选择打开方式
        const isImage = attachment.type?.startsWith("image/") ||
          /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.name);
        const isPdf = attachment.type === "application/pdf" || attachment.name.toLowerCase().endsWith(".pdf");

        if (isImage || isPdf) {
          // 对于图片和PDF，使用 Linking 打开
          await Linking.openURL(downloadResult.uri);
        } else {
          // 对于其他文件，显示一个选项菜单
          Alert.alert(
            attachment.name,
            "文件已下载到本地",
            [
              { text: "用其他应用打开", onPress: () => Linking.openURL(downloadResult.uri) },
              { text: "关闭", style: "cancel" }
            ]
          );
        }
      }
    } catch (error) {
      console.error("打开附件失败:", error);
      Alert.alert("打开失败", "无法打开附件，请检查网络连接后重试");
    }
  };

  if (loading || !task) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = typeConfig.tourism;
  const typeLabel = config.label;
  const taskStatus = task.status || "pending";
  const taskPriority = task.priority || "medium";
  const taskStatusInfo = statusConfig[taskStatus];
  const taskPriorityInfo = priorityConfig[taskPriority];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">任务详情</Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 基本信息 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-3 flex-wrap">
            <View className="px-2 py-1 bg-green-50 rounded-md">
              <Text className="text-xs font-medium text-green-700">{typeLabel}</Text>
            </View>
            <View className={`px-2 py-1 rounded-md`} style={{ backgroundColor: taskStatusInfo.bgColor }}>
              <Text className="text-xs font-medium" style={{ color: taskStatusInfo.color }}>{taskStatusInfo.label}</Text>
            </View>
            <View className={`px-2 py-1 rounded-md`} style={{ backgroundColor: taskPriorityInfo.bgColor }}>
              <Text className="text-xs font-medium" style={{ color: taskPriorityInfo.color }}>{taskPriorityInfo.label}优先级</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">{task.title}</Text>
          {task.description && (
            <Text className="text-sm text-gray-500 leading-6">{task.description}</Text>
          )}
        </View>

        {/* 日期信息 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-4">
            <Calendar size={18} color="#3B82F6" />
            <Text className="text-base font-semibold text-gray-900">日期信息</Text>
          </View>
          <View className="gap-3">
            {task.startDate && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center">
                    <Calendar size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-sm text-gray-500">开始日期</Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">{formatDate(task.startDate)}</Text>
              </View>
            )}
            {task.endDate && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg bg-orange-50 items-center justify-center">
                    <Calendar size={16} color="#F59E0B" />
                  </View>
                  <Text className="text-sm text-gray-500">结束日期</Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">{formatDate(task.endDate)}</Text>
              </View>
            )}
            {task.planDate && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center">
                    <Sparkles size={16} color="#8B5CF6" />
                  </View>
                  <Text className="text-sm text-gray-500">计划日期</Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">{formatDate(task.planDate)}</Text>
              </View>
            )}
            {/* 提醒时间 - 可点击编辑 */}
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => {
                // 初始化临时日期为当前提醒时间或现在+1小时
                const initialDate = task.reminderTime
                  ? new Date(task.reminderTime)
                  : new Date(Date.now() + 60 * 60 * 1000);
                setTempReminderDate(initialDate);
                setShowDatePicker(true);
                openPicker();
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center">
                  <Clock size={16} color="#EF4444" />
                </View>
                <Text className="text-sm text-gray-500">提醒时间</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-medium text-gray-900">
                  {task.reminderTime ? formatDateTime(task.reminderTime) : "未设置"}
                </Text>
                <Edit2 size={14} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            {!task.startDate && !task.endDate && !task.planDate && !task.reminderTime && (
              <Text className="text-sm text-gray-400">暂无日期信息</Text>
            )}
          </View>
        </View>

        {/* 附件 */}
        {task.attachments && task.attachments.length > 0 && (
          <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
            <View className="flex-row items-center gap-2 mb-4">
              <Paperclip size={18} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900">附件</Text>
              <Text className="text-xs text-gray-400 ml-1">({task.attachments.length})</Text>
            </View>
            <View className="gap-3">
              {task.attachments.map((attachment: Attachment, index: number) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
                  activeOpacity={0.7}
                  onPress={() => handleAttachmentPress(attachment)}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 bg-white rounded-lg items-center justify-center">
                      <FileText size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>{attachment.name}</Text>
                      {attachment.type && (
                        <Text className="text-xs text-gray-400 mt-0.5">{attachment.type}</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Eye size={16} color="#3B82F6" />
                    <ExternalLink size={18} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* AI 建议 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#8B5CF6" />
              <Text className="text-base font-semibold text-gray-900">AI 建议</Text>
            </View>
            {!aiSuggestion && (
              <TouchableOpacity
                onPress={handleGetAISuggestion}
                disabled={aiSuggestionLoading}
                className="px-3 py-1.5 bg-purple-50 rounded-lg"
              >
                <Text className="text-xs font-medium text-purple-600">
                  {aiSuggestionLoading ? "生成中..." : "获取建议"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {aiSuggestion ? (
            <View className="gap-3">
              {aiSuggestion.split('\n').filter(t => t.trim()).map((tip, index) => (
                <View key={index} className="flex-row gap-3">
                  <View className="w-5 h-5 rounded-full bg-purple-50 items-center justify-center mt-0.5">
                    <Text className="text-xs font-medium text-purple-600">{index + 1}</Text>
                  </View>
                  <Text className="text-sm text-gray-600 flex-1 leading-5">{tip}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row items-center gap-2 py-4">
              <AlertCircle size={16} color="#D1D5DB" />
              <Text className="text-sm text-gray-400">点击"获取建议"按钮获取 AI 智能建议</Text>
            </View>
          )}
        </View>

        {/* 底部空隙 */}
        <View className="h-10" />
      </ScrollView>

      {/* 底部弹出时间选择器 */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Animated.View style={pickerStyles.pickerOverlay}>
          <Animated.View style={[pickerStyles.pickerBackdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => closePicker()}
            />
          </Animated.View>
          <Animated.View style={[pickerStyles.pickerContainer, { transform: [{ translateY: pickerTranslateY }] }]}>
            <Animated.View style={pickerStyles.pickerContent}>
              <View style={pickerStyles.pickerHandle} />
              <View style={pickerStyles.pickerHeader}>
                <TouchableOpacity onPress={() => closePicker()}>
                  <Text style={pickerStyles.pickerCancel}>取消</Text>
                </TouchableOpacity>
                <Text style={pickerStyles.pickerTitle}>设置提醒时间</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (tempReminderDate) {
                      handleUpdateReminderTime(tempReminderDate);
                    }
                  }}
                  disabled={reminderLoading || !tempReminderDate}
                >
                  <Text style={[pickerStyles.pickerSave, reminderLoading && pickerStyles.pickerSaveDisabled]}>
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

      {/* Android DateTimePicker */}
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
    </SafeAreaView>
  );
}

// ============================================
// 时间选择器样式
// ============================================
const pickerStyles = StyleSheet.create({
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
});
