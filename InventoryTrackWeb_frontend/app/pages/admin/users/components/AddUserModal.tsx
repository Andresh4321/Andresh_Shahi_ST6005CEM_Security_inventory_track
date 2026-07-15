"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminUser } from "@/lib/api/auth";
import { registerSchema, RegisterData } from "@/app/pages/(auth)/schema";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddUserModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterData) => {
        try {
            await createAdminUser(data);
            toast.success("User created successfully");
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Failed to create user");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-lg text-foreground">Add New User</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <input {...register("fullname")} className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all" placeholder="John Doe" />
                        {errors.fullname && <p className="text-xs text-red-500 font-medium">{errors.fullname.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <input {...register("email")} type="email" className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all" placeholder="john@example.com" />
                        {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                        <input {...register("phone_number")} className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all" placeholder="1234567890" />
                        {errors.phone_number && <p className="text-xs text-red-500 font-medium">{errors.phone_number.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <input {...register("password")} type="password" className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all" placeholder="••••••" />
                            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Confirm</label>
                            <input {...register("confirmPassword")} type="password" className="w-full h-10 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all" placeholder="••••••" />
                            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                            {isSubmitting ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
