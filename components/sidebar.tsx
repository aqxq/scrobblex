"use client"

import { Music, TrendingUp, Briefcase, Trophy, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import type { Page } from "@/components/main-dashboard"

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  isOpen: boolean
  onToggle: () => void
  user: any
}

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle, user }: SidebarProps) {
  const { logout } = useAuth()

  const menuItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: TrendingUp },
    { id: "market" as Page, label: "Market", icon: Music },
    { id: "portfolio" as Page, label: "Portfolio", icon: Briefcase },
    { id: "leaderboard" as Page, label: "Leaderboard", icon: Trophy },
  ]

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">ScrobbleX</h1>
            </div>
          </div>

          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.profileImageUrl || "/placeholder.svg"} alt={user?.displayName} />
                <AvatarFallback className="bg-purple-500 text-white">
                  {user?.displayName?.charAt(0) || <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-xs text-slate-400 truncate">@{user?.lastfmUsername}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">${user?.balance?.toLocaleString() || "0"}</p>
                <p className="text-xs text-slate-400">Balance</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-400">{user?.scrobbleCoins?.toLocaleString() || "0"}</p>
                <p className="text-xs text-slate-400">Scrobble Coins</p>
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-sm text-slate-300">{user?.totalScrobbles?.toLocaleString() || "0"} total scrobbles</p>
            </div>
          </div>

          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <Button
                      variant={currentPage === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left ${currentPage === item.id
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                      onClick={() => {
                        onPageChange(item.id)
                        if (window.innerWidth < 1024) onToggle()
                      }}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-6 border-t border-slate-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
