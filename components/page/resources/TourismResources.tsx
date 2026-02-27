import {
  Building2,
  Car,
  Check,
  Coffee,
  Languages,
  Map,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Ticket,
  Train,
  Utensils,
  Wallet,
  Zap
} from "lucide-react-native";

// 1. 官方与合规资源
export const officialResources = [
  { id: 1, title: "日本 e-Visa", desc: "电子签申请", url: "https://www.evisa.go.jp", icon: Plane, badge: "OFFICIAL", meta: { time: "3-5工作日", location: "全球" } },
  { id: 2, title: "Visit Japan Web", desc: "日本入境审查及海关申报电子系统，替代纸质版申报单。", url: "https://www.vjw.go.jp", icon: ShieldCheck, badge: "OFFICIAL", meta: { time: "即时生成", location: "全日主要机场" } },
  { id: 3, title: "泰国旅游局", desc: "官方旅游资讯", url: "https://www.tourismthailand.org", icon: Building2, badge: "OFFICIAL", meta: { time: "实时", location: "全球" } },
  { id: 4, title: "英国 GOV.UK", desc: "签证申请入口", url: "https://www.gov.uk/browse/visas-immigration", icon: ShieldCheck, badge: "OFFICIAL", meta: { time: "不确定", location: "全球" } },
  { id: 5, title: "美国 CDC", desc: "健康与旅行警告", url: "https://wwwnc.cdc.gov/travel", icon: ShieldCheck, badge: "OFFICIAL", meta: { time: "实时", location: "美国" } },
];

// 2. 住宿与安家速达
export const stayResources = [
  { id: 1, title: "Booking.com", desc: "全球酒店", url: "https://www.booking.com", icon: MapPin, badge: "HOT", meta: { time: "即时确认", location: "全球" } },
  { id: 2, title: "Airbnb", desc: "特色民宿", url: "https://www.airbnb.com", icon: Building2, badge: "POPULAR", meta: { time: "即时确认", location: "全球" } },
  { id: 3, title: "Agoda", desc: "亚洲酒店", url: "https://www.agoda.com", icon: MapPin, badge: "RECOMMENDED", meta: { time: "即时确认", location: "亚洲" } },
  { id: 4, title: "星野集团", desc: "日式温泉", url: "https://www.hoshinoresorts.com", icon: Building2, badge: "LUXURY", meta: { time: "需预约", location: "日本" } },
  { id: 5, title: "万豪官网", url: "https://www.marriott.com", desc: "国际连锁", icon: Building2, badge: "OFFICIAL", meta: { time: "即时确认", location: "全球" } },
  { id: 6, title: "jalan", desc: "日本旅行网", url: "https://www.jalan.net", icon: Building2, badge: "RECOMMENDED", meta: { time: "需预约", location: "日本" } },
];

// 3. 交通与移动枢纽
export const transportResources = [
  { id: 1, title: "Skyscanner", desc: "机票比价", url: "https://www.skyscanner.com", icon: Plane, badge: "TOOLS", meta: { time: "实时", location: "全球" } },
  { id: 2, title: "Google Maps", desc: "地图导航", url: "https://www.google.com/maps", icon: Map, badge: "ESSENTIAL", meta: { time: "实时", location: "全球" } },
  { id: 3, title: "Uber", desc: "网约车", url: "https://www.uber.com", icon: Car, badge: "ESSENTIAL", meta: { time: "实时", location: "全球" } },
  { id: 4, title: "JR Pass", desc: "铁路通票", url: "https://www.japanrailpass.com", icon: Train, badge: "OFFICIAL", meta: { time: "3工作日", location: "日本" } },
  { id: 5, title: "Eurail", desc: "欧铁通票", url: "https://www.eurail.com", icon: Train, badge: "OFFICIAL", meta: { time: "3工作日", location: "欧洲" } },
  { id: 6, title: "携程国际", desc: "机票酒店", url: "https://flights.ctrip.com", icon: Plane, badge: "CHINESE", meta: { time: "实时", location: "全球" } },
];

// 4. 体验与门票直达
export const experienceResources = [
  { id: 1, title: "Klook", desc: "门票预订", url: "https://www.klook.com", icon: Ticket, badge: "POPULAR", meta: { time: "即时确认", location: "全球" } },
  { id: 2, title: "GetYourGuide", desc: "当地体验", url: "https://www.getyourguide.com", icon: Ticket, badge: "POPULAR", meta: { time: "需预约", location: "全球" } },
  { id: 3, title: "Tabelog", desc: "餐厅点评", url: "https://www.tabelog.com", icon: Utensils, badge: "LOCAL", meta: { time: "实时", location: "日本" } },
  { id: 4, title: "OpenTable", desc: "餐厅预订", url: "https://www.opentable.com", icon: Coffee, badge: "POPULAR", meta: { time: "需预约", location: "美国/欧洲" } },
  { id: 5, title: "迪士尼官网", desc: "门票套餐", url: "https://www.disney.com", icon: Ticket, badge: "OFFICIAL", meta: { time: "需预约", location: "全球" } },
  { id: 6, title: "环球影城", desc: "门票快速通", url: "https://www.usj.co.jp", icon: Ticket, badge: "OFFICIAL", meta: { time: "需预约", location: "日本/美国" } },
];

// 5. 应急与生存工具
export const utilityResources = [
  { id: 1, title: "iMoney", desc: "汇率计算", url: "https://www.imocha.cn", icon: Wallet, badge: "TOOLS", meta: { time: "实时", location: "全球" } },
  { id: 2, title: "Google Translate", desc: "即时翻译", url: "https://translate.google.com", icon: Languages, badge: "ESSENTIAL", meta: { time: "实时", location: "全球" } },
  { id: 3, title: "中国领事保护", desc: "紧急热线", url: "tel:+861012308", icon: Phone, badge: "EMERGENCY", meta: { time: "24小时", location: "全球" } },
  { id: 4, title: "ATM Finder", desc: "取现点", url: "https://www.mastercard.com", icon: Zap, badge: "TOOLS", meta: { time: "实时", location: "全球" } },
];
