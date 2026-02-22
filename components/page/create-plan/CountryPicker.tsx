import countries from "i18n-iso-countries";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 国家代码到国旗 emoji 的映射
const countryCodeToFlag = (code: string): string => {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// 获取所有国家列表
const getCountryList = (): { code: string; name: string; enName: string; flag: string }[] => {
  const countryNamesZh = countries.getNames("zh");
  const countryNamesEn = countries.getNames("en");
  
  const list = Object.entries(countryNamesZh)
    .filter(([code]) => code !== "TW") // 排除台湾
    .map(([code, name]) => ({
    code,
    name: name as string,
    enName: countryNamesEn[code] || code, // Fallback to code if English name missing
    flag: countryCodeToFlag(code),
  }));
  
  // 按英文名称拼音首字母排序 (使用 enName)
  list.sort((a, b) => {
    return a.enName.localeCompare(b.enName);
  });
  
  return list;
};

interface CountryPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (countryCode: string, countryName: string) => void;
}

export default function CountryPicker({ visible, onClose, onSelect }: CountryPickerProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("CN");
  const [localeRegistered, setLocaleRegistered] = useState(false);

  // 注册中文 locale
  useEffect(() => {
    if (!localeRegistered) {
      try {
        const zhLocale = require("i18n-iso-countries/langs/zh.json");
        countries.registerLocale(zhLocale);
        setLocaleRegistered(true);
      } catch (e) {
        console.error("Failed to register locale:", e);
      }
    }
  }, [localeRegistered]);

  // 国家列表 - 依赖 localeRegistered，确保 locale 注册后再获取
  const allCountries = useMemo(() => {
    if (!localeRegistered) return [];
    return getCountryList();
  }, [localeRegistered]);

  const filteredCountries = useMemo(() => {
    if (!searchText.trim()) return allCountries;
    const search = searchText.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.enName.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search)
    );
  }, [allCountries, searchText]);

  const handleSelect = (code: string, name: string) => {
    setSelectedCountry(code);
    onSelect(code, name);
    onClose();
    setSearchText("");
  };

  const renderItem = ({ item }: { item: { code: string; name: string; enName: string; flag: string } }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry === item.code && styles.countryItemSelected,
      ]}
      onPress={() => handleSelect(item.code, item.name)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* 顶部搜索栏 */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="搜索国家..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </View>

          {/* 国家列表 */}
          <View style={styles.content}>
            <FlatList
              data={filteredCountries}
              renderItem={renderItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={filteredCountries.length === 0 ? styles.emptyContainer : null}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>未找到匹配的国家</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
  },
  clearButton: {
    fontSize: 16,
    color: "#9CA3AF",
    paddingLeft: 8,
  },
  cancelButton: {
    marginLeft: 12,
  },
  cancelText: {
    fontSize: 16,
    color: "#0076D6",
  },
  content: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  countryItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  countryCode: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
