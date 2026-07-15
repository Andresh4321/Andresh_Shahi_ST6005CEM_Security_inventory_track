"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminUser } from "@/lib/api/auth";
import { ArrowLeft, Mail, Phone, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AdminLayout from "@/app/pages/admin/AdminLayout";

export const dynamic = "force-dynamic";

type User = {
  _id?: string;
  id?: string;
  fullname: string;
  email: string;
  phone_number?: string;
  role?: string;
  createdAt?: string;
};

export default function ViewUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await getAdminUser(id as string);
        const userData = res.user || res.data || res;
        setUser(userData);
      } catch (err: any) {
        toast.error("Failed to load user details");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="animate-spin text-teal-600 mb-4" size={32} />
          <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/users" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <ArrowLeft size={24} />
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Not Found</h2>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View user information</p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-700 h-24"></div>

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white dark:border-gray-800">
                {(user.fullname?.[0] || "U").toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullname}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Shield size={16} className={user.role === "admin" ? "text-purple-600" : "text-blue-600"} />
                  <span className={`text-sm font-semibold capitalize ${user.role === "admin" ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {user.role || "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <Mail size={20} className="text-teal-700 dark:text-teal-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Phone size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Phone Number</p>
                  <p className="text-gray-900 dark:text-white font-medium">{user.phone_number || "Not provided"}</p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                  <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User ID</p>
                  <p className="text-gray-900 dark:text-white font-medium font-mono text-sm break-all">{user._id || user.id}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/users"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all text-center"
              >
                Back to Users
              </Link>
              <Link
                href={`/admin/EditUser/${user._id || user.id}`}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg font-medium shadow-lg hover:shadow-teal-600/25 transition-all text-center"
              >
                Edit User
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
