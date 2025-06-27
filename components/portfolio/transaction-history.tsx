"use client"

import { ArrowUpRight, ArrowDownLeft, Clock, Music } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getTransactionsByDate } from "@/lib/portfolio-utils"
import type { Transaction } from "@/lib/types"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const transactionsByDate = getTransactionsByDate(transactions)
  const dates = Object.keys(transactionsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No trading history yet</h3>
        <p className="text-muted-foreground">Your artist trading history will appear here</p>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Trading History</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {dates.map((date) => (
          <div key={date}>
            <div className="px-4 py-2 bg-white/5 border-b border-white/5">
              <h4 className="text-sm font-medium text-muted-foreground">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
            </div>

            {transactionsByDate[date].map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg ${transaction.type === "buy" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  {transaction.type === "buy" ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                        transaction.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {transaction.type}
                    </span>
                    <span className="font-semibold">${transaction.symbol}</span>
                    <span className="text-muted-foreground">
                      {transaction.shares} shares @ {formatCurrency(transaction.price)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div
                  className={`text-right font-semibold ${
                    transaction.type === "buy" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {transaction.type === "buy" ? "-" : "+"}
                  {formatCurrency(transaction.total)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
