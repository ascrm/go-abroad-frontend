import { router, useLocalSearchParams } from "expo-router";
import { Briefcase, Check, CheckCircle2, ChevronLeft, Circle, GraduationCap, Home, MapPin, MoreVertical, Plane, Share2 } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlanType = "tourism" | "study" | "work" | "immigration";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

const typeConfig = {
  tourism: { 
    icon: Plane, 
    label: "旅游", 
    color: "#3B82F6", 
    bgColor: "#EBF5FF",
    phases: [
      {
        id: "p1",
        title: "前期规划",
        description: "确定行程方向和目标",
        tasks: [
          { id: "t1", title: "确定出行目的地", completed: true },
          { id: "t2", title: "确定出行时间和天数", completed: true },
          { id: "t3", title: "制定初步预算", completed: false },
        ]
      },
      {
        id: "p2",
        title: "签证准备",
        description: "办理旅行签证",
        tasks: [
          { id: "t4", title: "了解目的地签证要求", completed: false },
          { id: "t5", title: "准备签证材料", completed: false },
          { id: "t6", title: "预约递交签证", completed: false },
          { id: "t7", title: "缴纳签证费用", completed: false },
        ]
      },
      {
        id: "p3",
        title: "行前准备",
        description: "预订和准备工作",
        tasks: [
          { id: "t8", title: "预订往返机票", completed: false },
          { id: "t9", title: "预订住宿", completed: false },
          { id: "t10", title: "购买旅行保险", completed: false },
          { id: "t11", title: "准备当地货币/银行卡", completed: false },
        ]
      },
      {
        id: "p4",
        title: "出发当天",
        description: "开始你的旅程",
        tasks: [
          { id: "t12", title: "整理行李清单", completed: false },
          { id: "t13", title: "提前到达机场", completed: false },
          { id: "t14", title: "办理值机和出境手续", completed: false },
        ]
      },
    ]
  },
  study: { 
    icon: GraduationCap, 
    label: "留学", 
    color: "#8B5CF6", 
    bgColor: "#F5F3FF",
    phases: [
      {
        id: "p1",
        title: "选校定位",
        description: "确定目标院校和专业",
        tasks: [
          { id: "t1", title: "确定留学专业方向", completed: true },
          { id: "t2", title: "收集目标院校信息", completed: true },
          { id: "t3", title: "评估自身背景与院校匹配度", completed: false },
          { id: "t4", title: "确定申请院校List", completed: false },
        ]
      },
      {
        id: "p2",
        title: "语言考试",
        description: "准备并完成语言考试",
        tasks: [
          { id: "t5", title: "确定目标院校语言要求", completed: false },
          { id: "t6", title: "报名语言考试(雅思/托福)", completed: false },
          { id: "t7", title: "制定备考计划", completed: false },
          { id: "t8", title: "参加考试并达到目标分数", completed: false },
        ]
      },
      {
        id: "p3",
        title: "申请材料准备",
        description: "准备各项申请材料",
        tasks: [
          { id: "t9", title: "开具成绩单和在读证明", completed: false },
          { id: "t10", title: "撰写个人陈述(PS)", completed: false },
          { id: "t11", title: "准备推荐信", completed: false },
          { id: "t12", title: "制作简历(CV)", completed: false },
          { id: "t13", title: "准备GRE/GMAT(如需)", completed: false },
        ]
      },
      {
        id: "p4",
        title: "提交申请",
        description: "完成院校申请",
        tasks: [
          { id: "t14", title: "注册院校申请账号", completed: false },
          { id: "t15", title: "填写申请表", completed: false },
          { id: "t16", title: "上传申请材料", completed: false },
          { id: "t17", title: "缴纳申请费用", completed: false },
        ]
      },
      {
        id: "p5",
        title: "等待offer",
        description: "等待录取结果",
        tasks: [
          { id: "t18", title: "跟进申请状态", completed: false },
          { id: "t19", title: "收到offer后确认入读", completed: false },
          { id: "t20", title: "缴纳定金/占位费", completed: false },
        ]
      },
      {
        id: "p6",
        title: "签证办理",
        description: "办理学生签证",
        tasks: [
          { id: "t21", title: "准备签证材料", completed: false },
          { id: "t22", title: "预约签证面签", completed: false },
          { id: "t23", title: "参加面签", completed: false },
          { id: "t24", title: "获得签证", completed: false },
        ]
      },
      {
        id: "p7",
        title: "行前准备",
        description: "出发前的准备工作",
        tasks: [
          { id: "t25", title: "申请住宿", completed: false },
          { id: "t26", title: "购买机票", completed: false },
          { id: "t27", title: "购买保险", completed: false },
          { id: "t28", title: "体检(视具体国家而定)", completed: false },
          { id: "t29", title: "准备行李", completed: false },
        ]
      },
    ]
  },
  work: { 
    icon: Briefcase, 
    label: "工作", 
    color: "#F59E0B", 
    bgColor: "#FFFBEB",
    phases: [
      {
        id: "p1",
        title: "职业规划",
        description: "明确职业目标",
        tasks: [
          { id: "t1", title: "确定目标行业和岗位", completed: true },
          { id: "t2", title: "了解目标国家就业市场", completed: true },
          { id: "t3", title: "评估自身技能和经验", completed: false },
        ]
      },
      {
        id: "p2",
        title: "资质准备",
        description: "准备职业资质认证",
        tasks: [
          { id: "t4", title: "了解目标国家职业资格要求", completed: false },
          { id: "t5", title: "准备学历认证", completed: false },
          { id: "t6", title: "考取当地职业证书(如需)", completed: false },
          { id: "t7", title: "提升语言能力", completed: false },
        ]
      },
      {
        id: "p3",
        title: "求职准备",
        description: "准备求职材料",
        tasks: [
          { id: "t8", title: "制作英文简历", completed: false },
          { id: "t9", title: "准备求职信", completed: false },
          { id: "t10", title: "整理作品集", completed: false },
          { id: "t11", title: "注册招聘网站账号", completed: false },
        ]
      },
      {
        id: "p4",
        title: "求职投递",
        description: "寻找工作机会",
        tasks: [
          { id: "t12", title: "投递简历", completed: false },
          { id: "t13", title: "参加面试", completed: false },
          { id: "t14", title: "收到offer", completed: false },
        ]
      },
      {
        id: "p5",
        title: "签证办理",
        description: "办理工作签证",
        tasks: [
          { id: "t15", title: "准备签证材料", completed: false },
          { id: "t16", title: "雇主提交申请", completed: false },
          { id: "t17", title: "获得签证", completed: false },
        ]
      },
      {
        id: "p6",
        title: "行前准备",
        description: "出发前的准备",
        tasks: [
          { id: "t18", title: "预订机票", completed: false },
          { id: "t19", title: "寻找住宿", completed: false },
          { id: "t20", title: "准备行李", completed: false },
        ]
      },
    ]
  },
  immigration: { 
    icon: Home, 
    label: "定居", 
    color: "#10B981", 
    bgColor: "#ECFDF5",
    phases: [
      {
        id: "p1",
        title: "了解移民项目",
        description: "选择合适的移民途径",
        tasks: [
          { id: "t1", title: "了解各移民项目要求", completed: true },
          { id: "t2", title: "评估自身条件适合的项目", completed: true },
          { id: "t3", title: "选择目标国家和项目", completed: false },
        ]
      },
      {
        id: "p2",
        title: "材料准备",
        description: "准备移民申请材料",
        tasks: [
          { id: "t4", title: "准备身份证明文件", completed: false },
          { id: "t5", title: "准备学历和工作证明", completed: false },
          { id: "t6", title: "准备资产证明", completed: false },
          { id: "t7", title: "准备语言考试成绩", completed: false },
          { id: "t8", title: "无犯罪证明", completed: false },
        ]
      },
      {
        id: "p3",
        title: "提交申请",
        description: "递交移民申请",
        tasks: [
          { id: "t9", title: "在线递交申请", completed: false },
          { id: "t10", title: "缴纳申请费用", completed: false },
          { id: "t11", title: "完成体检", completed: false },
        ]
      },
      {
        id: "p4",
        title: "等待审批",
        description: "等待移民局审批",
        tasks: [
          { id: "t12", title: "补充材料(如需)", completed: false },
          { id: "t13", title: "等待面试通知(如需)", completed: false },
          { id: "t14", title: "获得移民签证", completed: false },
        ]
      },
      {
        id: "p5",
        title: "登陆定居",
        description: "完成登陆和安家",
        tasks: [
          { id: "t15", title: "购买机票", completed: false },
          { id: "t16", title: "寻找住宿", completed: false },
          { id: "t17", title: "开设银行账户", completed: false },
          { id: "t18", title: "办理社保卡", completed: false },
          { id: "t19", title: "购买医疗保险", completed: false },
        ]
      },
    ]
  },
};

export default function PlanDetailScreen() {
  const { id, type, title, destination } = useLocalSearchParams<{
    id: string;
    type: PlanType;
    title: string;
    destination: string;
  }>();

  const planType = type || "tourism";
  const config = typeConfig[planType];
  const Icon = config.icon;
  const phases = config.phases;

  const [tasks, setTasks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        initial[task.id] = task.completed;
      });
    });
    return initial;
  });

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(phases.map(p => p.id))
  );

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const getPhaseProgress = (phase: typeof phases[0]) => {
    const completedCount = phase.tasks.filter(t => tasks[t.id]).length;
    const total = phase.tasks.length;
    return { completedCount, total, percentage: Math.round((completedCount / total) * 100) };
  };

  const getOverallProgress = () => {
    const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = phases.reduce((sum, p) => 
      sum + p.tasks.filter(t => tasks[t.id]).length, 0);
    return { completedTasks, totalTasks, percentage: Math.round((completedTasks / totalTasks) * 100) };
  };

  const overall = getOverallProgress();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">规划详情</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="p-1">
            <Share2 size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity className="p-1">
            <MoreVertical size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 基本信息卡片 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View 
              className="w-14 h-14 rounded-xl items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon size={28} color={config.color} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500">{destination}</Text>
              </View>
            </View>
          </View>

          {/* 整体进度 */}
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700">总体进度</Text>
              <Text className="text-sm font-semibold" style={{ color: config.color }}>
                {overall.completedTasks}/{overall.totalTasks} 任务
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${overall.percentage}%`,
                  backgroundColor: config.color 
                }}
              />
            </View>
          </View>
        </View>

        {/* 阶段时间线 */}
        <View className="p-4 pb-20">
          {phases.map((phase, index) => {
            const progress = getPhaseProgress(phase);
            const isCompleted = progress.completedCount === progress.total;
            const isInProgress = progress.completedCount > 0 && !isCompleted;
            const isExpanded = expandedPhases.has(phase.id);

            return (
              <View key={phase.id} className="mb-3">
                {/* 阶段标题 - 可点击展开/收起任务列表 */}
                <TouchableOpacity 
                  className="bg-white rounded-t-xl"
                  activeOpacity={0.7}
                  onPress={() => togglePhase(phase.id)}
                >
                  <View className="flex-row items-center gap-3 p-4">
                    {/* 时间线节点 */}
                    <View className="items-center">
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ 
                          backgroundColor: isCompleted 
                            ? "#10B981" 
                            : isInProgress 
                              ? "#10B98120" 
                              : "#F3F4F6"
                        }}
                      >
                        {isCompleted ? (
                          <Check size={16} color="#FFFFFF" />
                        ) : (
                          <Text 
                            className="text-sm font-semibold"
                            style={{ color: isInProgress ? "#10B981" : "#9CA3AF" }}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      {index < phases.length - 1 && (
                        <View 
                          className="w-0.5 flex-1 my-1"
                          style={{ 
                            backgroundColor: isCompleted ? "#10B981" : "#E5E7EB",
                            minHeight: 20
                          }}
                        />
                      )}
                    </View>

                    {/* 阶段内容 */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {phase.title}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {phase.description}
                      </Text>
                    </View>

                    {/* 圆形进度指示器 - 绿色 */}
                    <View className="items-center">
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center border-2"
                        style={{ 
                          borderColor: "#10B981",
                          backgroundColor: isCompleted ? "#10B981" : 'transparent'
                        }}
                      >
                        {isCompleted ? (
                          <Check size={16} color="#FFFFFF" />
                        ) : (
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: "#10B981" }}
                          >
                            {progress.percentage}%
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 任务列表 - 展开/收起 */}
                {isExpanded && (
                  <View className="bg-white rounded-b-xl border-t border-gray-50">
                    {phase.tasks.map((task) => {
                      const isTaskCompleted = tasks[task.id];
                      return (
                        <View
                          key={task.id}
                          className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-50"
                        >
                          {/* 点击 icon 切换完成状态 */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => toggleTask(task.id)}
                          >
                            {isTaskCompleted ? (
                              <CheckCircle2 size={20} color="#10B981" />
                            ) : (
                              <Circle size={20} color="#D1D5DB" />
                            )}
                          </TouchableOpacity>
                          {/* 点击文字进入任务详情 */}
                          <TouchableOpacity 
                            className="flex-1"
                            activeOpacity={0.7}
                            onPress={() => router.push({
                              pathname: "/task-detail",
                              params: { 
                                taskId: task.id, 
                                taskTitle: task.title,
                                type,
                                planTitle: title,
                                destination
                              }
                            })}
                          >
                            <Text 
                              className={`text-sm ${
                                isTaskCompleted ? "text-gray-400 line-through" : "text-gray-700"
                              }`}
                            >
                              {task.title}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
