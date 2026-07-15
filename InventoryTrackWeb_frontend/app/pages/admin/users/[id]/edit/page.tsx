"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getAdminUser, updateAdminUser } from "@/lib/api/auth";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await getAdminUser(id as string);
        const userData = res.user || res.data || res;
        reset({
          fullname: userData.fullname,
          email: userData.email,
          phone_number: userData.phone_number || userData.phone,
        });
      } catch (err: any) {
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateAdminUser(id as string, data);
      toast.success("User updated successfully");
      router.push("/admin/users");
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin text-teal-600 mb-4" size={32} />
        <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit User</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update user information</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                {...register("fullname", { required: "Name is required" })}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                placeholder="Enter full name"
              />
              {errors.fullname && (
                <p className="text-xs text-red-500 font-medium">{String(errors.fullname.message)}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{String(errors.email.message)}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
              <input
                {...register("phone_number")}
                className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                placeholder="Enter phone number"
              />
              {errors.phone_number && (
                <p className="text-xs text-red-500 font-medium">{String(errors.phone_number.message)}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/users"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium shadow-lg hover:shadow-teal-600/25 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
