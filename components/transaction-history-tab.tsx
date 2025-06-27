"use client"

import { History } from "lucide-react"
import type { Transaction } from "@/app/page"

interface TransactionHistoryTabProps {
  userData: any
}

export default function TransactionHistoryTab({ userData }: TransactionHistoryTabProps) {
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      let dateKey

      if (isSameDay(transactionDate, today)) {
        dateKey = "today"
      } else if (isSameDay(transactionDate, yesterday)) {
        dateKey = "yesterday"
      } else {
        dateKey = transactionDate.toDateString()
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(transaction)
    })

    return groups
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const formatDateHeader = (dateKey: string) => {
    if (dateKey === "today") return "Today"
    if (dateKey === "yesterday") return "Yesterday"

    const date = new Date(dateKey)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (userData.transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h4 className="text-xl font-semibold mb-2">No Transaction History</h4>
        <p className="text-slate-400">Your trading history will appear here</p>
      </div>
    )
  }

  const groupedTransactions = groupTransactionsByDate(userData.transactions)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date} className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-600">
            <h3 className="text-lg font-semibold">{formatDateHeader(date)}</h3>
            <span className="text-sm text-slate-400">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-slate-600">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4 hover:bg-slate-600 transition-colors">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {transaction.type === "buy" ? "↓" : "↑"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded uppercase ${
                        transaction.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {transaction.type}
                    </span>
                    <span className="font-semibold">${transaction.symbol}</span>
                    <span className="text-slate-400">{transaction.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{transaction.shares} shares</span>
                    <span>@ ${transaction.price.toFixed(2)}</span>
                    <span>{formatTime(transaction.date)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-lg font-semibold ${
                      transaction.type === "buy" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {transaction.type === "buy" ? "-" : "+"}${transaction.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
