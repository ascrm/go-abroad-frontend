import {
  Check,
  Clock,
  ExternalLink,
  Languages,
  Map,
  MessageCircle,
  ShieldAlert,
  Wallet,
  Zap
} from "lucide-react-native";

// 1. 通用工具资源 (Common Tools)
export const commonToolsResources = [
  { 
    id: 1, 
    title: "Google Maps", 
    desc: "地图导航、路线规划、实时路况", 
    url: "https://www.google.com/maps", 
    icon: Map, 
    badge: "ESSENTIAL",
    meta: { time: "实时", location: "全球" } 
  },
  { 
    id: 2, 
    title: "WhatsApp", 
    desc: "国际版微信，海外最主流的即时通讯工具", 
    url: "https://www.whatsapp.com", 
    icon: MessageCircle, 
    badge: "COMMUNICATION",
    meta: { time: "即时", location: "全球" } 
  },
  { 
    id: 3, 
    title: "Google Translate", 
    desc: "即时拍照翻译，看不懂菜单路标时的救星", 
    url: "https://translate.google.com", 
    icon: Languages, 
    badge: "ESSENTIAL",
    meta: { time: "实时", location: "全球" } 
  },
  { 
    id: 4, 
    title: "Wise (TransferWise)", 
    desc: "国际汇款，汇率透明，手续费低", 
    url: "https://wise.com", 
    icon: Wallet, 
    badge: "FINANCE",
    meta: { time: "1-2工作日", location: "全球" } 
  },
];

// 2. 应急与生存工具
export const emergencyResources = [
  { 
    id: 1, 
    title: "中国领事保护", 
    desc: "+86-10-12308 (24小时热线)", 
    url: "tel:+861012308", 
    icon: ShieldAlert, 
    badge: "EMERGENCY",
    meta: { time: "24小时", location: "全球" } 
  },
  { 
    id: 2, 
    title: "iMoney", 
    desc: "实时汇率计算器，出国换汇必备", 
    url: "https://www.imocha.cn", 
    icon: Zap, 
    badge: "TOOLS",
    meta: { time: "实时", location: "全球" } 
  },
  { 
    id: 3, 
    title: "World Time Buddy", 
    desc: "时差管理，协调跨国会议和联系家人", 
    url: "https://www.worldtimebuddy.com", 
    icon: Clock, 
    badge: "TOOLS",
    meta: { time: "实时", location: "全球" } 
  },
];
