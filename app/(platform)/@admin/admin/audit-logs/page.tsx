"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
} from "lucide-react";
import { AdminGuard } from "../../../../components/auth/PermissionGuard";
import { AuditLog } from "../../../../lib/types/auth";

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: "1",
        userId: "user-1",
        action: "LOGIN",
        resource: "AUTH",
        details: { ip: "192.168.1.100", userAgent: "Mozilla/5.0..." },
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        userId: "user-2",
        action: "CREATE",
        resource: "MENU_ITEM",
        resourceId: "menu-123",
        details: { itemName: "Cappuccino", price: 4.5 },
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:25:00Z",
      },
      {
        id: "3",
        userId: "user-1",
        action: "UPDATE",
        resource: "USER_PROFILE",
        resourceId: "user-3",
        details: { field: "role", oldValue: "BARISTA", newValue: "MANAGER" },
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:20:00Z",
      },
      {
        id: "4",
        userId: "user-3",
        action: "DELETE",
        resource: "INVENTORY_ITEM",
        resourceId: "inv-456",
        details: { itemName: "Expired Milk", reason: "Expired product" },
        ipAddress: "192.168.1.102",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        timestamp: "2024-01-15T10:15:00Z",
      },
      {
        id: "5",
        userId: "user-2",
        action: "EXPORT",
        resource: "REPORTS",
        details: {
          reportType: "SALES_REPORT",
          format: "PDF",
          dateRange: "2024-01-01 to 2024-01-15",
        },
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:10:00Z",
      },
      {
        id: "6",
        userId: "user-1",
        action: "LOGIN_FAILED",
        resource: "AUTH",
        details: { reason: "Invalid password", attempts: 3 },
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:05:00Z",
      },
    ];

    setAuditLogs(mockLogs);
    setLoading(false);
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesResource =
      resourceFilter === "all" || log.resource === resourceFilter;

    const matchesDate =
      (!startDate || log.timestamp >= startDate) &&
      (!endDate || log.timestamp <= endDate);

    return matchesSearch && matchesAction && matchesResource && matchesDate;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-green-100 text-green-800";
      case "LOGOUT":
        return "bg-blue-100 text-blue-800";
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "EXPORT":
        return "bg-purple-100 text-purple-800";
      case "LOGIN_FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getResourceBadgeColor = (resource: string) => {
    switch (resource) {
      case "AUTH":
        return "bg-blue-100 text-blue-800";
      case "MENU_ITEM":
        return "bg-green-100 text-green-800";
      case "USER_PROFILE":
        return "bg-purple-100 text-purple-800";
      case "INVENTORY_ITEM":
        return "bg-orange-100 text-orange-800";
      case "REPORTS":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const exportLogs = () => {
    // Implementation for exporting audit logs
    console.log("Exporting audit logs...");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor system activity and security events
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
                <option value="LOGIN_FAILED">Login Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource
              </label>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Resources</option>
                <option value="AUTH">Authentication</option>
                <option value="MENU_ITEM">Menu Items</option>
                <option value="USER_PROFILE">User Profiles</option>
                <option value="INVENTORY_ITEM">Inventory</option>
                <option value="REPORTS">Reports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {log.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getResourceBadgeColor(
                          log.resource
                        )}`}
                      >
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.resourceId && (
                          <div className="mb-1">
                            <span className="font-medium">ID:</span>{" "}
                            {log.resourceId}
                          </div>
                        )}
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span>{" "}
                            {String(value)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredLogs.length}</span> of{" "}
            <span className="font-medium">{auditLogs.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
