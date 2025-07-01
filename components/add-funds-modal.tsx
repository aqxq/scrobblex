"use client"

import { X, Mail } from "lucide-react"

interface AddFundsModalProps {
  onClose: () => void
}

export default function AddFundsModal({ onClose }: AddFundsModalProps) {
  const copyEmail = () => {
    navigator.clipboard.writeText("funds@dvsj.xyz")
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add Funds</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-4">
          <Mail className="w-16 h-16 mx-auto text-purple-500" />
          <h3 className="text-lg font-semibold">Email for Funds</h3>
          <p className="text-slate-400">To add funds to your account, please email us at:</p>

          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-mono text-purple-400">funds@dvsj.xyz</span>
              <button
                onClick={copyEmail}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Include your username in the email.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}