"use client"

import { Trophy, Medal, Award } from "lucide-react"

const mockLeaderboard = [
  { username: "sigma12", portfolioValue: 45000, totalReturn: 35.2, totalTrades: 156 },
  { username: "skib1dit0ilet", portfolioValue: 38000, totalReturn: 28.7, totalTrades: 134 },
  { username: "thosewhoknow", portfolioValue: 42000, totalReturn: 25.1, totalTrades: 189 },
  { username: "balkanrage", portfolioValue: 33000, totalReturn: 18.9, totalTrades: 98 },
  { username: "brawlStars", portfolioValue: 29000, totalReturn: 15.3, totalTrades: 87 },
  { username: "kevinheart", portfolioValue: 31000, totalReturn: 12.8, totalTrades: 76 },
  { username: "chimpanzinibanananini", portfolioValue: 27000, totalReturn: 8.4, totalTrades: 65 },
  { username: "brainr0t", portfolioValue: 25000, totalReturn: 5.2, totalTrades: 54 },
  { username: "boiiwhatyousayaboutPH0NK", portfolioValue: 23000, totalReturn: 2.1, totalTrades: 43 },
  { username: "tspmo", portfolioValue: 21000, totalReturn: -1.5, totalTrades: 32 },
]

export default function Leaderboard() {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
        )
    }
  }

  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600"
      case 1:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
      case 2:
        return "bg-gradient-to-r from-amber-600 to-amber-700"
      default:
        return "bg-slate-700"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-slate-400">Top performing traders this month</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Time Period:</label>
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="all-time">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <div className="grid grid-cols-5 gap-4 p-4 bg-slate-900 border-b border-slate-700 text-sm font-semibold text-slate-400 uppercase tracking-wide">
          <div>Rank</div>
          <div className="col-span-2">Trader</div>
          <div>Portfolio Value</div>
          <div>Total Return</div>
        </div>
        {mockLeaderboard.map((trader, index) => (
          <div
            key={trader.username}
            className="grid grid-cols-5 gap-4 p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors items-center"
          >
            <div className="flex items-center justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankClass(index)}`}>
                {index < 3 ? getRankIcon(index) : <span className="text-sm font-bold text-white">{index + 1}</span>}
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {trader.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="font-semibold">{trader.username}</div>
            </div>
            <div className="font-medium">${trader.portfolioValue.toLocaleString()}</div>
            <div className={`font-medium ${trader.totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trader.totalReturn >= 0 ? "+" : ""}
              {trader.totalReturn.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
