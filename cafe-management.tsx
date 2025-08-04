"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Coffee, DollarSign, Plus, ShoppingCart, TrendingUp, Edit, Trash2, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types
interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  available: boolean
}

interface Order {
  id: string
  items: { menuItem: MenuItem; quantity: number }[]
  status: "pending" | "preparing" | "ready" | "completed"
  total: number
  customerName: string
  timestamp: Date
  tableNumber?: number
}

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  unit: string
  lastRestocked: Date
}

interface Staff {
  id: string
  name: string
  role: string
  email: string
  active: boolean
}

export default function CafeManagementSystem() {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard")
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [cafeInfo, setCafeInfo] = useState({
    name: "Brew & Bite Café",
    address: "123 Coffee Street, Bean City",
    phone: "(555) 123-4567",
    email: "info@brewandbite.com",
  })

  // Initialize with mock data
  useEffect(() => {
    // Mock menu items
    setMenuItems([
      { id: "1", name: "Espresso", price: 2.5, category: "Coffee", available: true },
      { id: "2", name: "Cappuccino", price: 3.5, category: "Coffee", available: true },
      { id: "3", name: "Latte", price: 4.0, category: "Coffee", available: true },
      { id: "4", name: "Croissant", price: 2.75, category: "Pastry", available: true },
      { id: "5", name: "Blueberry Muffin", price: 3.25, category: "Pastry", available: true },
      { id: "6", name: "Caesar Salad", price: 8.5, category: "Food", available: true },
    ])

    // Mock orders
    setOrders([
      {
        id: "1",
        items: [
          { menuItem: { id: "1", name: "Espresso", price: 2.5, category: "Coffee", available: true }, quantity: 2 },
          { menuItem: { id: "4", name: "Croissant", price: 2.75, category: "Pastry", available: true }, quantity: 1 },
        ],
        status: "preparing",
        total: 7.75,
        customerName: "John Doe",
        timestamp: new Date(),
        tableNumber: 5,
      },
      {
        id: "2",
        items: [
          { menuItem: { id: "2", name: "Cappuccino", price: 3.5, category: "Coffee", available: true }, quantity: 1 },
        ],
        status: "ready",
        total: 3.5,
        customerName: "Jane Smith",
        timestamp: new Date(Date.now() - 300000),
        tableNumber: 3,
      },
    ])

    // Mock inventory
    setInventory([
      {
        id: "1",
        name: "Coffee Beans",
        currentStock: 25,
        minStock: 10,
        unit: "kg",
        lastRestocked: new Date(Date.now() - 86400000),
      },
      {
        id: "2",
        name: "Milk",
        currentStock: 8,
        minStock: 15,
        unit: "liters",
        lastRestocked: new Date(Date.now() - 172800000),
      },
      {
        id: "3",
        name: "Sugar",
        currentStock: 5,
        minStock: 8,
        unit: "kg",
        lastRestocked: new Date(Date.now() - 259200000),
      },
      { id: "4", name: "Flour", currentStock: 12, minStock: 5, unit: "kg", lastRestocked: new Date() },
    ])

    // Mock staff
    setStaff([
      { id: "1", name: "Alice Johnson", role: "Manager", email: "alice@brewandbite.com", active: true },
      { id: "2", name: "Bob Wilson", role: "Barista", email: "bob@brewandbite.com", active: true },
      { id: "3", name: "Carol Davis", role: "Server", email: "carol@brewandbite.com", active: true },
    ])
  }, [])

  // Helper functions
  const getTodaysSales = () => {
    const today = new Date().toDateString()
    return orders
      .filter((order) => order.timestamp.toDateString() === today && order.status === "completed")
      .reduce((sum, order) => sum + order.total, 0)
  }

  const getTodaysOrders = () => {
    const today = new Date().toDateString()
    return orders.filter((order) => order.timestamp.toDateString() === today).length
  }

  const getLowStockItems = () => {
    return inventory.filter((item) => item.currentStock <= item.minStock)
  }

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem = { ...item, id: Date.now().toString() }
    setMenuItems([...menuItems, newItem])
  }

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id))
  }

  // Component for adding/editing menu items
  const MenuItemDialog = ({
    item,
    onSave,
  }: { item?: MenuItem; onSave: (item: Omit<MenuItem, "id"> | MenuItem) => void }) => {
    const [formData, setFormData] = useState({
      name: item?.name || "",
      price: item?.price || 0,
      category: item?.category || "",
      description: item?.description || "",
      available: item?.available ?? true,
    })

    const handleSubmit = () => {
      if (item) {
        onSave({ ...item, ...formData })
      } else {
        onSave(formData)
      }
    }

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coffee">Coffee</SelectItem>
                <SelectItem value="Tea">Tea</SelectItem>
                <SelectItem value="Pastry">Pastry</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Beverage">Beverage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Coffee className="h-8 w-8 text-amber-600" />
            {cafeInfo.name}
          </h1>
          <p className="text-gray-600">Café Management System</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${getTodaysSales().toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getTodaysOrders()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter((order) => order.status !== "completed").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{getLowStockItems().length}</div>
                </CardContent>
              </Card>
            </div>

            {getLowStockItems().length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Stock Alert:</strong>{" "}
                  {getLowStockItems()
                    .map((item) => item.name)
                    .join(", ")}{" "}
                  need restocking.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.tableNumber || "Takeaway"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "ready"
                                  ? "secondary"
                                  : order.status === "preparing"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.timestamp.toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {order.items.map((item) => `${item.quantity}x ${item.menuItem.name}`).join(", ")}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value: Order["status"]) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <MenuItemDialog onSave={addMenuItem} />
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.available ? "default" : "secondary"}>
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <MenuItemDialog
                                item={item}
                                onSave={(updatedItem) => updateMenuItem(item.id, updatedItem as MenuItem)}
                              />
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => deleteMenuItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {getLowStockItems().length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Stock Alert:</strong> The following items need restocking:{" "}
                  {getLowStockItems()
                    .map((item) => item.name)
                    .join(", ")}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Restocked</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.minStock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Badge variant={item.currentStock <= item.minStock ? "destructive" : "default"}>
                            {item.currentStock <= item.minStock ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.lastRestocked.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Sales Reports</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Sales Summary</CardTitle>
                  <CardDescription>Today's performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span className="font-bold">${getTodaysSales().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-bold">{getTodaysOrders()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order:</span>
                      <span className="font-bold">
                        ${getTodaysOrders() > 0 ? (getTodaysSales() / getTodaysOrders()).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                  <CardDescription>Most ordered items today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Espresso</span>
                      <Badge>2 orders</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cappuccino</span>
                      <Badge>1 order</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Croissant</span>
                      <Badge>1 order</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>Sales performance for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Weekly charts and detailed analytics would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Café Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cafe-name">Café Name</Label>
                    <Input
                      id="cafe-name"
                      value={cafeInfo.name}
                      onChange={(e) => setCafeInfo({ ...cafeInfo, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafe-address">Address</Label>
                    <Input
                      id="cafe-address"
                      value={cafeInfo.address}
                      onChange={(e) => setCafeInfo({ ...cafeInfo, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafe-phone">Phone</Label>
                    <Input
                      id="cafe-phone"
                      value={cafeInfo.phone}
                      onChange={(e) => setCafeInfo({ ...cafeInfo, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafe-email">Email</Label>
                    <Input
                      id="cafe-email"
                      value={cafeInfo.email}
                      onChange={(e) => setCafeInfo({ ...cafeInfo, email: e.target.value })}
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Staff Management
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staff.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role} • {member.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.active ? "default" : "secondary"}>
                            {member.active ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
