import { LayoutDashboard, Users, MessageSquare, Settings, FileText, BarChart3, Newspaper } from "lucide-react"

export const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Referrals", href: "/admin/referrals", icon: Users },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "News", href: "/admin/news", icon: Newspaper },
  { title: "Chatbot", href: "/admin/chatbot", icon: MessageSquare },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]
