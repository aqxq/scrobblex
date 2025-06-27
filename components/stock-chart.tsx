"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function StockChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [activeRange, setActiveRange] = useState("1W")

  const ranges = [
    { id: "1D", label: "1D" },
    { id: "1W", label: "1W" },
    { id: "1M", label: "1M" },
    { id: "3M", label: "3M" },
  ]

  const generateChartData = (range: string) => {
    const now = new Date()
    const data = { labels: [] as string[], prices: [] as number[] }
    let days: number
    let basePrice = 24.35

    switch (range) {
      case "1D":
        days = 1
        break
      case "1W":
        days = 7
        break
      case "1M":
        days = 30
        break
      case "3M":
        days = 90
        break
      default:
        days = 7
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      if (range === "1D") {
        data.labels.push(
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        )
      } else {
        data.labels.push(
          date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        )
      }

      const volatility = 0.02
      const change = (Math.random() - 0.5) * volatility
      basePrice = basePrice * (1 + change)
      data.prices.push(Number(basePrice.toFixed(2)))
    }

    return data
  }

  const updateChart = (range: string) => {
    if (!chartInstance.current) return

    const newData = generateChartData(range)
    chartInstance.current.data.labels = newData.labels
    chartInstance.current.data.datasets[0].data = newData.prices
    chartInstance.current.update("active")
  }

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const { labels, prices } = generateChartData(activeRange)

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "KLAMAR Price",
            data: prices,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#10b981",
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(30, 41, 59, 0.9)",
            titleColor: "#ffffff",
            bodyColor: "#cbd5e1",
            borderColor: "#475569",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `$${context.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
            },
          },
          y: {
            display: true,
            position: "right",
            grid: {
              color: "rgba(71, 85, 105, 0.3)",
            },
            ticks: {
              color: "#64748b",
              callback: (value) => "$" + Number(value).toFixed(2),
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    updateChart(activeRange)
  }, [activeRange])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex gap-1 bg-slate-950 rounded-lg p-1">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => setActiveRange(range.id)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeRange === range.id
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
