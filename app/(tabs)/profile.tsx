import { Bell, Bookmark, FileText, Folder, Search, Settings, User } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsModal } from "../../components/page/profile/SettingsModal";

export default function ProfileScreen() {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // Mock Data for Content
  const historyItems = [
    { id: 1, title: "英国留学签证办理指南", author: "官方发布", views: "1.2k" },
    { id: 2, title: "2024各国入境政策汇总", author: "留学助手", views: "3.4k" },
    { id: 3, title: "行李打包清单checklist", author: "Go Abroad", views: "800" },
    { id: 4, title: "美国F1签证申请全攻略", author: "官方发布", views: "2.1k" },
    { id: 5, title: "行前英语口语速成", author: "Go Abroad", views: "500" },
  ];

  const playlists = [
    { id: 1, title: "我的英国规划", count: 5 },
    { id: 2, title: "美国探亲准备", count: 2 },
    { id: 3, title: "澳洲旅游签证", count: 1 },
    { id: 4, title: "加拿大夏令营", count: 3 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* 1. Fixed Header */}
      <View className="bg-white px-4 py-3 z-20">
        <View className="flex-row justify-end items-center gap-4">
          <TouchableOpacity className="p-2">
            <Bell size={24} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Search size={24} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={() => setIsSettingsVisible(true)}>
            <Settings size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>

        {/* 2. Profile Info Section */}
        <View className="bg-white px-6 pb-8 pt-2 z-10">
          <View className="flex-row items-center mb-4">
            <View className="w-24 h-24 rounded-full border border-gray-200 bg-gray-200 overflow-hidden mr-5">
              {/* Avatar Placeholder */}
              <View className="w-full h-full bg-gray-300 items-center justify-center">
                <User size={40} color="#6B7280" />
              </View>
            </View>
            
            <View className="flex-1 justify-center">
              <Text className="text-2xl font-bold text-gray-900">未登录用户</Text>
              <Text className="text-gray-500 mt-1">@guest_user</Text>
            </View>
          </View>
        </View>

        {/* 3. History / Content Section */}
        <View className="py-6 px-4">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-lg font-bold text-gray-900">历史记录</Text>
            <Text className="text-sm text-blue-600 font-medium">查看全部</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
             {historyItems.map((item) => (
               <TouchableOpacity key={item.id} className="w-40 mr-3 bg-white p-3 rounded-xl">
                 <View className="w-full h-24 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    {/* Placeholder for Thumbnail */}
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                       <FileText size={24} color="#9CA3AF"/>
                    </View>
                 </View>
                 <Text className="text-sm font-semibold text-gray-800 leading-tight mb-1" numberOfLines={2}>{item.title}</Text>
                 <Text className="text-xs text-gray-500">{item.author} • {item.views} 阅读</Text>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </View>

        {/* 4. Playlists / Plans Section - Horizontal Scroll */}
        <View className="py-2 px-4 mb-4">
           <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-lg font-bold text-gray-900">规划列表</Text>
            <Text className="text-sm text-blue-600 font-medium">管理</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
            {playlists.map((playlist) => (
              <TouchableOpacity key={playlist.id} className="w-40 mr-3">
                 <View className="w-full h-24 bg-gray-200 rounded-xl mb-3 overflow-hidden relative">
                    {/* Placeholder for Cover */}
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                       <Folder size={32} color="#9CA3AF"/>
                    </View>
                    <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
                       <Text className="text-white text-xs font-medium">{playlist.count}</Text>
                    </View>
                 </View>
                 <Text className="text-sm font-semibold text-gray-800 leading-tight" numberOfLines={2}>{playlist.title}</Text>
                 <Text className="text-xs text-gray-500 mt-1">更新于昨天</Text>
              </TouchableOpacity>
            ))}
             {/* Add New Button */}
             <TouchableOpacity className="w-40 mr-3 h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center">
                <Text className="text-gray-400 font-medium">+ 新建规划</Text>
             </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 5. Menu Buttons - Horizontal Long Buttons */}
        <View className="px-4 pb-10">
           <View className="flex-col gap-3">
              <TouchableOpacity className="w-full h-14 bg-white rounded-xl  flex-row items-center px-4">
                 <FileText size={24} color="#000000" />
                 <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-gray-800">文档集合</Text>
                 </View>
              </TouchableOpacity>
              
              <TouchableOpacity className="w-full h-14 bg-white rounded-xl  flex-row items-center px-4">
                 <Bookmark size={24} color="#000000" />
                 <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-gray-800">收藏集合</Text>
                 </View>
              </TouchableOpacity>
           </View>
        </View>

      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal 
        visible={isSettingsVisible} 
        onClose={() => setIsSettingsVisible(false)} 
      />
    </SafeAreaView>
  );
}
