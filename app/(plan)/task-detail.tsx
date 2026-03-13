import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, Briefcase, Calculator, CheckCircle2, ChevronLeft, ExternalLink, FileText, Globe, GraduationCap, Home, Plane, Sparkles } from "lucide-react-native";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PlanType = "tourism" | "study" | "work" | "immigration";

// 任务详情数据
const taskDetails: Record<string, {
  description: string;
  tips: string[];
  quickLinks?: { label: string; url: string; icon: string }[];
}> = {
  // 旅游任务
  "t1": {
    description: "确定你想前往的具体国家或地区。需要考虑目的地知名度、旅游季节、安全因素以及个人偏好。",
    tips: [
      "考虑季节因素：不同目的地最佳旅行时间不同",
      "了解签证政策：免签/落地签/需要签证",
      "评估预算：不同国家消费水平差异大",
      "考虑飞行时长：长途旅行需要更多准备"
    ]
  },
  "t2": {
    description: "明确你的出行日期和计划停留天数，这将直接影响行程规划和预算安排。",
    tips: [
      "提前规划可享受早鸟价",
      "注意目的地节假日价格波动",
      "考虑时差对身体的影响",
      "留出弹性时间应对突发情况"
    ]
  },
  "t3": {
    description: "根据目的地消费水平和个人需求，制定整体预算，包括机票、住宿、餐饮、交通、购物等。",
    tips: [
      "机票费用通常占预算30-40%",
      "住宿选择：酒店/民宿/青旅价格差异大",
      "预留10-15%作为应急备用金",
      "提前了解当地货币和支付方式"
    ],
    quickLinks: [
      { label: "预算计算器", url: "https://www.numbeo.com/cost-of-travel/", icon: "Calculator" }
    ]
  },
  "t4": {
    description: "了解目标国家对中国公民的签证政策，包括签证类型、所需材料、办理时长和费用。",
    tips: [
      "不同国家签证政策差异大",
      "提前3-6个月开始了解",
      "注意护照有效期要求",
      "了解是否需要面签或录指纹"
    ],
    quickLinks: [
      { label: "中国领事服务网", url: "https://cs.mfa.gov.cn/", icon: "Globe" }
    ]
  },
  "t5": {
    description: "根据签证要求准备相应材料，通常包括护照、照片、行程单、资金证明、在职证明等。",
    tips: [
      "材料准备要真实完整",
      "银行流水建议3-6个月",
      "在职证明需要公司盖章",
      "提前准备好翻译件（如需要）"
    ]
  },
  "t6": {
    description: "通过官方渠道预约递交签证材料的时间，部分国家需要提前预约才能办理。",
    tips: [
      "旺季预约可能需要等待2-4周",
      "预约时间要合理安排",
      "准备好预约确认信",
      "了解是否需要额外付费加急"
    ]
  },
  "t7": {
    description: "缴纳签证申请费用，注意不同签证类型费用不同，部分国家支持线上支付。",
    tips: [
      "费用通常不可退还",
      "保留缴费凭证",
      "注意支付方式和货币",
      "了解是否需要额外服务费"
    ]
  },
  "t8": {
    description: "预订往返机票，建议提前比较不同航空公司的价格和时间。",
    tips: [
      "提前1-2个月预订最佳",
      "比较直飞和转机价格",
      "注意行李额和退改签政策",
      "关注联程票优惠"
    ],
    quickLinks: [
      { label: "携程", url: "https://flights.ctrip.com/", icon: "Plane" },
      { label: "Google Flights", url: "https://www.google.com/flights", icon: "Plane" }
    ]
  },
  "t9": {
    description: "根据行程安排预订住宿，考虑位置、价格、设施和点评评分。",
    tips: [
      "位置选在交通便利处",
      "关注取消政策",
      "查看真实住客点评",
      "民宿可能需要额外清洁费"
    ]
  },
  "t10": {
    description: "购买旅行保险，覆盖医疗、行李延误、航班取消等风险。",
    tips: [
      "申根国家强制要求保险",
      "保额建议30万以上",
      "注意免责条款",
      "保存好保险单"
    ],
    quickLinks: [
      { label: "安联保险", url: "https://www.allianz.com.cn/", icon: "Globe" }
    ]
  },
  "t11": {
    description: "准备当地货币和了解支付方式，部分国家移动支付不普及。",
    tips: [
      "提前银行换取外币",
      "了解当地ATM分布",
      "准备一张国际信用卡",
      "注意汇率和手续费"
    ]
  },
  "t12": {
    description: "整理需要携带的物品清单，确保重要物品不遗漏。",
    tips: [
      "提前一周开始整理",
      "检查物品是否符合航空公司规定",
      "重要文件多备份电子版",
      "液体物品需符合100ml规定"
    ]
  },
  "t13": {
    description: "国际航班建议提前2-3小时到达机场，办理值机和出境手续。",
    tips: [
      "提前在线值机选座",
      "准备好转机相关材料",
      "注意航班变动信息",
      "了解禁止携带物品"
    ]
  },
  "t14": {
    description: "办理值机手续、行李托运和出境边检，准备好护照和签证材料。",
    tips: [
      "保管好登机牌和行李牌",
      "贵重物品随身携带",
      "了解海关申报规定",
      "准备好目的地入境卡"
    ]
  },

  // 留学任务
  "t1": {
    description: "确定你想要攻读的专业方向，这将是选校和申请的核心依据。",
    tips: [
      "结合兴趣和就业前景",
      "了解专业具体学习内容",
      "考虑跨专业申请的可行性",
      "了解该专业的录取难度"
    ]
  },
  "t2": {
    description: "收集目标院校的详细信息，包括排名、专业实力、地理位置、学费等。",
    tips: [
      "参考多种排名榜单",
      "了解真实的就业情况",
      "关注国际生比例",
      "查看校友评价"
    ],
    quickLinks: [
      { label: "QS排名", url: "https://www.topuniversities.com/", icon: "Globe" },
      { label: "院校库", url: "https://www.cucas.edu.cn/", icon: "GraduationCap" }
    ]
  },
  "t3": {
    description: "客观评估自己的学术背景与目标院校的匹配度，了解录取标准和竞争情况。",
    tips: [
      "对照往年录取数据",
      "评估GPA和标准化成绩",
      "了解软实力的重要性",
      "合理定位冲刺/稳妥/保底校"
    ]
  },
  "t4": {
    description: "确定最终申请的院校名单，建议采用梯队策略：冲刺、稳妥、保底。",
    tips: [
      "建议申请6-10所",
      "拉开档次差距",
      "注意各校截止日期",
      "考虑奖学金机会"
    ]
  },
  "t5": {
    description: "了解目标院校的语言成绩要求，确定需要参加哪种语言考试。",
    tips: [
      "英联邦通常接受雅思",
      "美国通常接受托福",
      "部分院校接受多邻国",
      "注意单项分数要求"
    ]
  },
  "t6": {
    description: "报名语言考试，提前规划考试时间，留出足够备考周期。",
    tips: [
      "建议提前2-3个月报名",
      "考点考位有限需早定",
      "可以拼分取最高",
      "注意成绩有效期"
    ],
    quickLinks: [
      { label: "雅思报名", url: "https://ielts.neea.cn/", icon: "BookOpen" },
      { label: "托福报名", url: "https://toefl.neea.cn/", icon: "BookOpen" }
    ]
  },
  "t7": {
    description: "制定系统的备考计划，包括词汇、听力、阅读、写作和口语。",
    tips: [
      "建议备考周期2-3个月",
      "每天保持2-3小时学习",
      "重点突破薄弱项",
      "做真题模拟练习"
    ]
  },
  "t8": {
    description: "参加正式考试并达到目标分数，如未达标可考虑再次考试。",
    tips: [
      "选择最佳考试状态",
      "注意考试当天时间",
      "成绩通常2周内出",
      "可多次考试取最优"
    ]
  },
  "t9": {
    description: "开具官方成绩单和在读证明，需要中英文版本并加盖学校公章。",
    tips: [
      "建议开具5-10份备用",
      "提前2周办理",
      "部分学校需要WES认证",
      "保持成绩单整洁"
    ]
  },
  "t10": {
    description: "撰写个人陈述（Personal Statement），展示你的学术兴趣、背景和动机。",
    tips: [
      "突出独特经历和观点",
      "避免泛泛而谈",
      "展示对专业的热情",
      "注意字数和格式要求"
    ],
    quickLinks: [
      { label: "PS范文参考", url: "https://www.personalstatement.net/", icon: "FileText" }
    ]
  },
  "t11": {
    description: "联系合适的推荐人，获取学术或职业推荐信。",
    tips: [
      "提前1个月联系推荐人",
      "选择了解你的推荐人",
      "提供必要材料辅助",
      "注意推荐信格式"
    ]
  },
  "t12": {
    description: "制作专业简历（CV），简洁展示教育背景、工作经验和技能。",
    tips: [
      "控制在一页以内",
      "突出相关经历",
      "使用动词开头",
      "保持格式统一"
    ]
  },
  "t13": {
    description: "如需准备GRE/GMAT成绩，根据目标院校要求决定是否参加考试。",
    tips: [
      "部分项目不强制要求",
      "高分可增强竞争力",
      "提前3-6个月准备",
      "注意成绩有效期"
    ]
  },
  "t14": {
    description: "在目标院校官网注册申请账号，开始填写在线申请。",
    tips: [
      "记录好账号密码",
      "注意各校账号要求",
      "提前准备好材料电子版",
      "避免最后一天提交"
    ]
  },
  "t15": {
    description: "仔细填写申请表，确保信息准确无误，上传所需材料。",
    tips: [
      "仔细检查每一项",
      "确保信息一致性",
      "文件格式符合要求",
      "提交前预览完整"
    ]
  },
  "t16": {
    description: "按照要求上传所有申请材料，确保文件清晰可读。",
    tips: [
      "文件大小注意限制",
      "PDF格式最稳妥",
      "命名规范清晰",
      "保留上传凭证"
    ]
  },
  "t17": {
    description: "缴纳申请费用，部分院校可申请费用减免。",
    tips: [
      "费用通常50-150美元",
      "保留缴费凭证",
      "注意支付方式",
      "确认支付成功"
    ]
  },
  "t18": {
    description: "定期登录申请系统跟进申请状态，了解材料是否齐全。",
    tips: [
      "每周查看1-2次",
      "注意邮件通知",
      "及时补充缺失材料",
      "保持联系方式畅通"
    ]
  },
  "t19": {
    description: "收到offer后仔细比较各校录取结果，做出最终选择。",
    tips: [
      "关注offer截止日期",
      "比较奖学金情况",
      "考虑学校整体实力",
      "做最终决定要果断"
    ]
  },
  "t20": {
    description: "确认入读后缴纳定金/占位费，保留缴费凭证。",
    tips: [
      "注意截止日期",
      "了解退款政策",
      "保留缴费凭证",
      "及时回复学校确认"
    ]
  },
  "t21": {
    description: "准备学生签证所需材料，包括护照、录取通知书、资金证明等。",
    tips: [
      "提前3个月开始准备",
      "资金证明要充足",
      "准备好面签材料",
      "了解面签常见问题"
    ]
  },
  "t22": {
    description: "预约签证面签时间，部分国家需要提前很久预约。",
    tips: [
      "提前2-4周预约",
      "选择合适的时间",
      "准备好预约确认信",
      "了解是否需要加急"
    ]
  },
  "t23": {
    description: "参加签证面签，保持诚实、自信，回答签证官问题。",
    tips: [
      "材料准备齐全",
      "穿着得体准时",
      "回答问题简洁诚实",
      "保持冷静自信"
    ]
  },
  "t24": {
    description: "获得签证后，检查签证信息是否正确，了解入境注意事项。",
    tips: [
      "仔细核对信息",
      "了解入境有效期限",
      "准备好入境材料",
      "了解可携带物品规定"
    ]
  },
  "t25": {
    description: "申请学校宿舍或校外租房，了解不同住宿方式的优缺点。",
    tips: [
      "学校宿舍数量有限",
      "校外租房提早了解",
      "注意合同条款",
      "考虑地理位置"
    ]
  },
  "t26": {
    description: "购买机票，建议比较不同航班的价格和时间。",
    tips: [
      "提前1-2个月购买",
      "关注学生机票",
      "考虑行李额需求",
      "注意入境日期限制"
    ]
  },
  "t27": {
    description: "购买医疗保险，了解覆盖范围和理赔流程。",
    tips: [
      "部分国家强制购买",
      "覆盖要全面",
      "了解理赔流程",
      "保留好保险单"
    ]
  },
  "t28": {
    description: "根据目标国家要求进行体检，准备相关体检证明。",
    tips: [
      "了解指定体检医院",
      "注意体检项目",
      "提前预约",
      "准备好照片和材料"
    ]
  },
  "t29": {
    description: "准备行李清单，整理需要携带的物品。",
    tips: [
      "提前一个月开始",
      "了解当地气候",
      "重要文件多备份",
      "注意违禁物品"
    ]
  }
};

const iconMap: Record<string, any> = {
  Calculator,
  Globe,
  Plane,
  BookOpen,
  GraduationCap,
  FileText,
  Home,
  Briefcase
};

export default function TaskDetailScreen() {
  const { taskId, taskTitle, type, planTitle, destination } = useLocalSearchParams<{
    taskId: string;
    taskTitle: string;
    type: PlanType;
    planTitle: string;
    destination: string;
  }>();

  const taskDetail = taskDetails[taskId] || {
    description: "这是一个待完成的任务，请按照规划完成相关步骤。",
    tips: [
      "仔细阅读任务要求",
      "按步骤完成各项准备",
      "如有疑问可咨询专业人士"
    ]
  };

  const typeLabels = {
    tourism: "旅游规划",
    study: "留学规划",
    work: "工作规划",
    immigration: "定居规划"
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("无法打开链接:", error);
    }
  };

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
          <View className="flex-row items-center gap-2 mb-3">
            <View className="px-2 py-1 bg-green-50 rounded-md">
              <Text className="text-xs font-medium text-green-700">{typeLabels[type]}</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">{taskTitle}</Text>
          <View className="flex-row items-center gap-2">
            <Globe size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500">{destination}</Text>
          </View>
        </View>

        {/* 任务描述 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={18} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900">任务说明</Text>
          </View>
          <Text className="text-sm text-gray-600 leading-6">
            {taskDetail.description}
          </Text>
        </View>

        {/* AI 建议 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-4">
            <Sparkles size={18} color="#8B5CF6" />
            <Text className="text-base font-semibold text-gray-900">AI 建议</Text>
          </View>
          <View className="gap-3">
            {taskDetail.tips.map((tip, index) => (
              <View key={index} className="flex-row gap-3">
                <View className="w-5 h-5 rounded-full bg-purple-50 items-center justify-center mt-0.5">
                  <Text className="text-xs font-medium text-purple-600">{index + 1}</Text>
                </View>
                <Text className="text-sm text-gray-600 flex-1 leading-5">{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 快捷入口 */}
        {taskDetail.quickLinks && taskDetail.quickLinks.length > 0 && (
          <View className="bg-white mx-4 mt-3 rounded-2xl p-5 mb-20">
            <View className="flex-row items-center gap-2 mb-4">
              <ExternalLink size={18} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900">快捷入口</Text>
            </View>
            <View className="gap-3">
              {taskDetail.quickLinks.map((link, index) => {
                const IconComponent = iconMap[link.icon] || Globe;
                return (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
                    activeOpacity={0.7}
                    onPress={() => handleOpenLink(link.url)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-white rounded-lg items-center justify-center">
                        <IconComponent size={20} color="#3B82F6" />
                      </View>
                      <Text className="text-base font-medium text-gray-900">{link.label}</Text>
                    </View>
                    <ExternalLink size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {!taskDetail.quickLinks && (
          <View className="bg-white mx-4 mt-3 rounded-2xl p-5 mb-20">
            <View className="flex-row items-center gap-3 text-gray-400">
              <CheckCircle2 size={20} color="#10B981" />
              <Text className="text-sm text-gray-500">这个任务不需要外部资源，按步骤完成即可</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
