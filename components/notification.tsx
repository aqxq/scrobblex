"use client"

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

interface NotificationProps {
  message: string
  type: string
  onClose: () => void
}

export function Notification({ message, type, onClose }: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-green-400"
      case "error":
        return "border-l-red-400"
      case "warning":
        return "border-l-yellow-400"
      default:
        return "border-l-blue-400"
    }
  }

  return (
    <div
      className={`bg-slate-800 border border-slate-700 border-l-4 ${getBorderColor()} rounded-lg p-4 shadow-lg min-w-80 animate-in slide-in-from-right-full duration-300`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-white">{message}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
