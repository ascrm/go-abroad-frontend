import { router } from "expo-router";
import { Mail, MapPin, Phone, X } from "lucide-react-native";
import React from "react";
import { Image } from "react-native";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.title}>关于我们</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>Go Abroad</Text>
          <Text style={styles.version}>版本 1.0.0</Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introTitle}>产品介绍</Text>
          <Text style={styles.introText}>
            Go Abroad 是一款专为出境旅行者打造的智能规划应用。我们致力于为用户提供便捷、高效的旅行规划体验，帮助用户轻松制定完美的旅行计划。
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>联系方式</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Mail size={18} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>客服邮箱</Text>
              <Text style={styles.infoValue}>ascrm88@foxmail.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Phone size={18} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>客服电话</Text>
              <Text style={styles.infoValue}>400-888-8888</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <MapPin size={18} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>公司地址</Text>
              <Text style={styles.infoValue}>四川省成都市成都信息工程大学学生宿舍六栋1007</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />


        <Text style={styles.copyright}>
          © 2026 Go Abroad. All rights reserved.
        </Text>
      </View>
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
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 22,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  introSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    paddingTop: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#374151',
  },
  termsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  termText: {
    fontSize: 15,
    color: '#374151',
  },
  termArrow: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 32,
    marginBottom: 24,
  },
});
