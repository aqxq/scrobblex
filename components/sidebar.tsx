"use client"

import { TrendingUp, Store, Trophy, Briefcase, Coins, Music } from "lucide-react"
import type { Page } from "@/app/page"

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  isOpen: boolean
  onToggle: () => void
  userData: any
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: TrendingUp },
  { id: "market", name: "Market", icon: Store },
  { id: "portfolio", name: "Portfolio", icon: Briefcase },
  { id: "leaderboard", name: "Leaderboard", icon: Trophy },
]

export default function Sidebar({ currentPage, onPageChange, isOpen, userData }: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Music className="w-7 h-7 text-purple-500" />
          <span className="text-xl font-bold">ScrobbleX</span>
        </div>
      </div>

      <nav className="flex-1 p-5">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id as Page)}
                  className={`
                    w-full flex items-center gap-3 px-5 py-3 rounded-lg text-left transition-all duration-200
                    ${
                      currentPage === item.id
                        ? "bg-slate-800 text-purple-400 border-l-4 border-purple-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-5 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">M</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">mus1cluvr</div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Coins className="w-3 h-3 text-yellow-500" />
              <span>{userData.balance.toLocaleString()} SC</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
