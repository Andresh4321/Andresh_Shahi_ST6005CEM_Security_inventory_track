"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { FileText, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  method: string;
  path: string;
  ip?: string;
  userAgent?: string;
  statusCode?: number;
  timestamp: string;
  details?: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 25 };
      if (methodFilter) params.method = methodFilter;
      if (statusFilter) params.statusCode = statusFilter;

      const res = await apiClient.get("/admin/audit", { params });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [methodFilter, statusFilter]);

  const getStatusColor = (code?: number) => {
    if (!code) return "text-gray-500";
    if (code >= 200 && code < 300) return "text-green-600 bg-green-50";
    if (code >= 400 && code < 500) return "text-yellow-600 bg-yellow-50";
    if (code >= 500) return "text-red-600 bg-red-50";
    return "text-gray-500";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-600 bg-blue-50";
      case "POST": return "text-green-600 bg-green-50";
      case "PUT": return "text-orange-600 bg-orange-50";
      case "DELETE": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500">Monitor all user activity and API requests</p>
          </div>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm bg-white"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm bg-white"
        >
          <option value="">All Status Codes</option>
          <option value="200">200 OK</option>
          <option value="201">201 Created</option>
          <option value="401">401 Unauthorized</option>
          <option value="403">403 Forbidden</option>
          <option value="404">404 Not Found</option>
          <option value="423">423 Locked</option>
          <option value="429">429 Rate Limited</option>
          <option value="500">500 Server Error</option>
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {pagination.total} total entries
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Path</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate">
                      {log.userEmail || "Anonymous"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate font-mono text-xs">
                      {log.path}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {log.ip || "-"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
