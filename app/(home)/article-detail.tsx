import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChevronLeft, Share2 } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArticleDetailScreen() {
  const { id, title, description, tag, date, image, views, favorites } = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
    tag: string;
    date: string;
    image: string;
    views: string;
    favorites: string;
  }>();

  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => setIsFavorite(!isFavorite)}
            className="p-1"
          >
            {isFavorite ? (
              <BookmarkCheck size={20} color="#3B82F6" fill="#3B82F6" />
            ) : (
              <Bookmark size={20} color="#374151" />
            )}
          </TouchableOpacity>
          <TouchableOpacity className="p-1">
            <Share2 size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 封面图 */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl">
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: 220 }}
            contentFit="cover"
          />
        </View>

        {/* 内容区域 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl">
          {/* 标签和时间 */}
          <View className="flex-row items-center justify-between px-5 pt-5">
            <View className="flex-row items-center gap-2">
              <View className="bg-blue-50 px-2 py-1 rounded-md">
                <Text className="text-xs font-medium text-blue-600">{tag}</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-400">{date}</Text>
          </View>

          {/* 标题 */}
          <Text className="text-[32px] font-bold text-gray-900 px-5 mt-4 leading-snug">
            {title}
          </Text>

          {/* 描述 */}
          <Text className="text-sm text-gray-500 px-5 mt-3 leading-relaxed">
            {description}
          </Text>

          {/* 分割线 */}
          <View className="h-1 bg-gray-100 mx-5 mt-5" />

          {/* 文章正文 - 富文本 */}
          <View className="px-5 py-6">
            <Text className="text-base text-gray-700 leading-7">
              <Text className="text-lg font-bold text-gray-900">前言</Text>
              {'\n\n'}
              出国留学是人生中重要的决定，需要做好充分的准备。本文将为你提供2024年留学申请的全面攻略，帮助你从选校到拿到offer的完整过程。
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">一、选校定位</Text>
              {'\n\n'}
              <Text className="font-semibold text-gray-900">1.1 确定专业方向</Text>
              {'\n\n'}
              首先，你需要明确自己的兴趣和职业规划，选择适合自己的专业方向。建议考虑以下因素：
              {'\n'}
              • 个人兴趣与爱好
              {'\n'}
              • 专业的就业前景
              {'\n'}
              • 自身学术背景
              {'\n'}
              • 专业的录取难度
              {'\n\n'}
              <Text className="font-semibold text-gray-900">1.2 了解目标院校</Text>
              {'\n\n'}
              收集目标院校的详细信息，包括：
              {'\n'}
              • 学校排名和专业排名
              {'\n'}
              • 学费和生活费
              {'\n'}
              • 地理位置和就业机会
              {'\n'}
              • 国际生比例
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">二、申请材料准备</Text>
              {'\n\n'}
              <Text className="font-semibold text-gray-900">2.1 学术材料</Text>
              {'\n'}
              • 成绩单
              {'\n'}
              • 在读证明/毕业证书
              {'\n'}
              • 语言成绩（雅思/托福）
              {'\n'}
              • GRE/GMAT成绩（如需要）
              {'\n\n'}
              <Text className="font-semibold text-gray-900">2.2 文书材料</Text>
              {'\n'}
              • 个人陈述（Personal Statement）
              {'\n'}
              • 推荐信
              {'\n'}
              • 简历
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">三、申请流程</Text>
              {'\n\n'}
              <Text className="font-semibold text-gray-900">3.1 时间规划</Text>
              {'\n\n'}
              建议按照以下时间节点进行准备：
              {'\n'}
              • 提前1年开始准备
              {'\n'}
              • 提前6-9个月准备文书
              {'\n'}
              • 提前3-6个月提交申请
              {'\n\n'}
              <Text className="font-semibold text-gray-900">3.2 网申填写</Text>
              {'\n\n'}
              注意仔细核对每一项信息，确保准确无误。
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">四、面试技巧</Text>
              {'\n\n'}
              部分院校需要面试，以下是一些建议：
              {'\n'}
              1. 提前准备常见问题
              {'\n'}
              2. 保持自信和专业
              {'\n'}
              3. 展示你的独特优势
              {'\n'}
              4. 及时跟进面试结果
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">五、offer选择</Text>
              {'\n\n'}
              收到offer后，需要考虑：
              {'\n'}
              • 学校综合实力
              {'\n'}
              • 奖学金情况
              {'\n'}
              • 专业排名
              {'\n'}
              • 就业前景
              {'\n\n'}
              <Text className="text-lg font-bold text-gray-900">总结</Text>
              {'\n\n'}
              留学申请是一个复杂的过程，需要提前规划和准备。希望本文能够帮助到你，祝你申请顺利！
              {'\n\n'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
