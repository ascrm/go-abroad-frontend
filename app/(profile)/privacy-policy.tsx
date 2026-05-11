import { router } from "expo-router";
import { X } from "lucide-react-native";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.title}>隐私政策</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>隐私政策</Text>
        <Text style={styles.lastUpdated}>最后更新：2026年1月1日</Text>

        <Text style={styles.paragraph}>
          我们高度重视您的个人信息保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
        </Text>

        <Text style={styles.subTitle}>1. 信息收集</Text>
        <Text style={styles.paragraph}>
          我们收集您主动提供的信息，包括但不限于：账户注册信息、个人资料信息、旅行偏好设置等。我们还会收集您使用服务时的行为信息，以优化用户体验。
        </Text>

        <Text style={styles.subTitle}>2. 信息使用</Text>
        <Text style={styles.paragraph}>
          您的信息将用于：提供个性化旅行规划服务、改进产品功能、保障账户安全、发送服务通知等。我们不会将您的个人信息用于与您同意的目的无关的用途。
        </Text>

        <Text style={styles.subTitle}>3. 信息共享</Text>
        <Text style={styles.paragraph}>
          未经您的同意，我们不会与任何第三方共享您的个人信息，除非法律法规要求或保护我们的合法权益。
        </Text>

        <Text style={styles.subTitle}>4. 信息安全</Text>
        <Text style={styles.paragraph}>
          我们采用行业标准的安全措施保护您的个人信息，防止数据遭到未经授权的访问、使用或泄露。
        </Text>

        <Text style={styles.subTitle}>5. 您的权利</Text>
        <Text style={styles.paragraph}>
          您有权访问、更正、删除您的个人信息。如有任何问题，请联系我们的客服团队。
        </Text>

        <Text style={styles.subTitle}>6. 联系我们</Text>
        <Text style={styles.paragraph}>
          如对本隐私政策有任何疑问，请通过官方客服渠道与我们联系。
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 8,
  },
});
