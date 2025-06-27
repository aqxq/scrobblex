"use client"

export default function NewsTab() {
  const newsItems = [
    {
      title: "Taylor Swift's new album drives $TAYLOR up 15.3%",
      time: "2 hours ago",
      type: "positive",
      icon: "↗",
    },
    {
      title: "The Weeknd's streaming numbers decline, $WEEKND falls 7.2%",
      time: "4 hours ago",
      type: "negative",
      icon: "↘",
    },
    {
      title: "Kendrick Lamar announces tour dates, $KLAMAR surges",
      time: "6 hours ago",
      type: "positive",
      icon: "📅",
    },
    {
      title: "Billie Eilish collaborates with major brand, $BILLIE stable",
      time: "1 day ago",
      type: "neutral",
      icon: "🤝",
    },
    {
      title: "Post Malone's latest single hits #1, $POSTY gains momentum",
      time: "1 day ago",
      type: "positive",
      icon: "🎵",
    },
    {
      title: "Music industry reports record streaming numbers",
      time: "2 days ago",
      type: "neutral",
      icon: "📊",
    },
  ]

  return (
    <div className="space-y-4">
      {newsItems.map((item, index) => (
        <div
          key={index}
          className="bg-slate-700 rounded-lg p-5 hover:bg-slate-600 transition-colors border border-slate-600"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                item.type === "positive"
                  ? "bg-green-500/20 text-green-400"
                  : item.type === "negative"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-600 text-slate-400"
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white mb-1">{item.title}</div>
              <div className="text-sm text-slate-400">{item.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
