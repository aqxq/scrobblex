"use client"

import { X, Mail, Copy } from "lucide-react"
import { useState } from "react"

interface AddFundsModalProps {
  onClose: () => void
}

export default function AddFundsModal({ onClose }: AddFundsModalProps) {
  const [copied, setCopied] = useState(false)
  const email = "funds@scrobblex.dvsj.xyz"

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy email:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold">Add Funds</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Contact Support</h4>
            <p className="text-slate-400 mb-4">
              if you wanna add funds to your ScrobbleX account, email me idk.
            </p>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Email Address</p>
                <p className="font-mono text-lg">{email}</p>
              </div>
              <button
                onClick={copyEmail}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                title="Copy email address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-green-400 text-sm mt-2">Email address copied to clipboard!</p>}
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <h5 className="font-semibold mb-2">INCLUDE YOUR</h5>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>LAST.FM USERNAME!!!</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}