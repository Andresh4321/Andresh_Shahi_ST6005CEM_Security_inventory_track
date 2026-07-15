"use client";

import { useEffect, useState } from "react";
import { getAllAdminUsers, deleteAdminUser } from "@/lib/api/auth";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner"

export const dynamic = "force-dynamic";

// Wrapper component to avoid server component issues
function DeleteUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllAdminUsers(1, 100);
      setUsers(res.users || res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await deleteAdminUser(userId);
      setUsers((s) => s.filter((u) => (u._id || u.id) !== userId));
      toast.success(`User "${userName}" deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Delete Users</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently remove users from the system</p>
      </div>

      {/* Warning Alert */}
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Caution</p>
          <p className="text-sm text-red-700 dark:text-red-200">Deleting a user is permanent and cannot be undone. User data will be lost.</p>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u, idx) => {
            const userId = u._id || u.id || "";
            return (
              <div
                key={userId || idx}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{u.fullname}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Phone: {u.phone_number || "Not provided"}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(userId, u.fullname)}
                  disabled={deletingId === userId}
                  className="ml-4 px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap border border-red-200 dark:border-red-800"
                >
                  {deletingId === userId ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-b border-red-600"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DeleteUsersContent
