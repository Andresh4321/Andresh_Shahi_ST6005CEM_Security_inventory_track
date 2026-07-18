"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Ban, Activity } from "lucide-react";

interface SecurityAlert {
  _id: string;
  type: string;
  severity: string;
  message: string;
  details: {
    ip?: string;
    userEmail?: string;
    endpoint?: string;
    attemptCount?: number;
  };
  acknowledged: boolean;
  createdAt: string;
}

interface DashboardStats {
  alertsLast24h: number;
  criticalAlerts: number;
  failedLoginsLast24h: number;
  blockedIPsLast7d: number;
  alertsByType: Record<string, number>;
}

interface BlockedIP {
  _id: string;
  ip: string;
  failedAttempts: number;
  blockedUntil: string;
  lastAttempt: string;
}

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "alerts" | "blocked">("dashboard");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes, ipsRes] = await Promise.all([
        apiClient.get("/admin/security/alerts").catch(() => ({ data: { data: [] } })),
        apiClient.get("/admin/security/dashboard").catch(() => ({ data: { data: null } })),
        apiClient.get("/admin/security/blocked-ips").catch(() => ({ data: { data: [] } })),
      ]);

      setAlerts(alertsRes.data.data || []);
      setStats(statsRes.data.data || null);
      setBlockedIPs(ipsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch security data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.put(`/admin/security/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, acknowledged: true } : a));
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const acknowledgeAll = async () => {
    try {
      await apiClient.put("/admin/security/alerts/acknowledge-all");
      setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    } catch (error) {
      console.error("Failed to acknowledge all:", error);
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      await apiClient.delete(`/admin/security/blocked-ips/${encodeURIComponent(ip)}`);
      setBlockedIPs(prev => prev.filter(b => b.ip !== ip));
    } catch (error) {
      console.error("Failed to unblock IP:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-700 bg-red-100 border-red-200";
      case "high": return "text-orange-700 bg-orange-100 border-orange-200";
      case "medium": return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "low": return "text-blue-700 bg-blue-100 border-blue-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "brute_force": return "🔓";
      case "ip_blocked": return "🚫";
      case "account_locked": return "🔒";
      case "suspicious_activity": return "⚠️";
      case "rate_limit_exceeded": return "⏱️";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
            <p className="text-sm text-gray-500">Real-time security alerts and threat monitoring</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: "dashboard" as const, label: "Dashboard", icon: Activity },
          { id: "alerts" as const, label: "Alerts", icon: AlertTriangle },
          { id: "blocked" as const, label: "Blocked IPs", icon: Ban },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Alerts (24h)</p>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.alertsLast24h}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Critical Unresolved</p>
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-600">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Failed Logins (24h)</p>
              <Ban className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.failedLoginsLast24h}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">IPs Blocked (7d)</p>
              <Ban className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{stats.blockedIPsLast7d}</p>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={acknowledgeAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Acknowledge All
              </button>
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No security alerts. System is secure.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert._id}
                  className={`bg-white rounded-lg border p-4 ${alert.acknowledged ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTypeIcon(alert.type)}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
                        {alert.details.ip && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">IP: {alert.details.ip}</p>
                        )}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert._id)}
                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blocked IPs Tab */}
      {activeTab === "blocked" && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {blockedIPs.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No IPs currently blocked.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IP Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Failed Attempts</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Blocked Until</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blockedIPs.map(ip => (
                  <tr key={ip._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{ip.ip}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{ip.failedAttempts}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(ip.blockedUntil).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => unblockIP(ip.ip)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
