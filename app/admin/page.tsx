"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, TrendingUp, DollarSign, Activity, Plus, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface DashboardStats {
  totalUsers: number
  totalStocks: number
  totalTrades: number
  totalVolume: number
}

interface User {
  id: string
  lastfm_username: string
  display_name: string
  balance: number
  lastfm_verified: boolean
  is_admin: boolean
  created_at: string
}

interface Stock {
  id: string
  symbol: string
  artist_name: string
  current_price: number
  genre: string
  is_active: boolean
  market_cap: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStocks: 0,
    totalTrades: 0,
    totalVolume: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [newStock, setNewStock] = useState({
    symbol: "",
    artist_name: "",
    genre: "",
    current_price: "",
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardData()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      })

      if (!response.ok) {
        router.push("/login")
        return
      }

      const data = await response.json()
      if (!data.user.isAdmin) {
        router.push("/")
        return
      }
    } catch (error) {
      router.push("/login")
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, stocksRes] = await Promise.all([
        fetch("/api/admin/dashboard", { credentials: "include" }),
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/stocks", { credentials: "include" }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats({
          totalUsers: statsData.userStats?.total || 0,
          totalStocks: statsData.stockStats?.total || 0,
          totalTrades: statsData.tradeStats?.total || 0,
          totalVolume: statsData.tradeStats?.volume || 0,
        })
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (stocksRes.ok) {
        const stocksData = await stocksRes.json()
        setStocks(stocksData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async () => {
    try {
      const response = await fetch("/api/admin/stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...newStock,
          current_price: Number.parseFloat(newStock.current_price),
        }),
      })

      if (response.ok) {
        setIsAddStockOpen(false)
        setNewStock({ symbol: "", artist_name: "", genre: "", current_price: "" })
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Failed to add stock:", error)
    }
  }

  const toggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_admin: !isAdmin }),
      })
      fetchDashboardData()
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.lastfm_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.artist_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to App
          </Button>
        </div>
      </div>
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8 px-6">
          {["dashboard", "users", "stocks", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Stocks</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalStocks}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Trades</CardTitle>
                  <Activity className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${stats.totalVolume.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Last.fm</TableHead>
                    <TableHead className="text-slate-400">Balance</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Admin</TableHead>
                    <TableHead className="text-slate-400">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800">
                      <TableCell className="text-white">{user.display_name}</TableCell>
                      <TableCell className="text-slate-400">{user.lastfm_username}</TableCell>
                      <TableCell className="text-white">${user.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={user.lastfm_verified ? "default" : "secondary"}>
                          {user.lastfm_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => toggleUserAdmin(user.id, user.is_admin)}
                        />
                      </TableCell>
                      <TableCell className="text-slate-400">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === "stocks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Stock Management</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700"
                  />
                </div>
                <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Stock</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Add a new artist stock to the platform
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="symbol" className="text-white">
                          Symbol
                        </Label>
                        <Input
                          id="symbol"
                          value={newStock.symbol}
                          onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                          placeholder="DRAKE"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="artist_name" className="text-white">
                          Artist Name
                        </Label>
                        <Input
                          id="artist_name"
                          value={newStock.artist_name}
                          onChange={(e) => setNewStock({ ...newStock, artist_name: e.target.value })}
                          placeholder="Drake"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="genre" className="text-white">
                          Genre
                        </Label>
                        <Input
                          id="genre"
                          value={newStock.genre}
                          onChange={(e) => setNewStock({ ...newStock, genre: e.target.value })}
                          placeholder="Hip-Hop"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-white">
                          Initial Price
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newStock.current_price}
                          onChange={(e) => setNewStock({ ...newStock, current_price: e.target.value })}
                          placeholder="25.00"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <Button onClick={handleAddStock} className="w-full bg-purple-600 hover:bg-purple-700">
                        Add Stock
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="bg-slate-900 border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Symbol</TableHead>
                    <TableHead className="text-slate-400">Artist</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400">Genre</TableHead>
                    <TableHead className="text-slate-400">Market Cap</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.id} className="border-slate-800">
                      <TableCell className="font-mono text-white">{stock.symbol}</TableCell>
                      <TableCell className="text-white">{stock.artist_name}</TableCell>
                      <TableCell className="text-white">${stock.current_price.toFixed(2)}</TableCell>
                      <TableCell className="text-slate-400">{stock.genre}</TableCell>
                      <TableCell className="text-white">${stock.market_cap?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={stock.is_active ? "default" : "secondary"}>
                          {stock.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}