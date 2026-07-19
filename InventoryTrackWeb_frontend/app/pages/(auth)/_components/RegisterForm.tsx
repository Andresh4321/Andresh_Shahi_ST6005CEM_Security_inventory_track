
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterData, registerSchema } from "../schema";
import { useTransition, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { handleRegister } from "@/lib/actions/auth_action";
import PasswordStrengthBar from "./PasswordStrengthBar";
import GoogleLoginButton from "./GoogleLoginButton";
import ReCaptcha from "./ReCaptcha";

export default function RegisterForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const [pending, startTransition] = useTransition();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const passwordValue = watch("password", "");

    const handleCaptchaVerify = useCallback((token: string | null) => {
        setCaptchaToken(token);
    }, []);

    const submit = async (values: RegisterData) => {
        try {
            const result = await handleRegister({ ...values, captchaToken });

            if (result.success) {
                router.push("/login");
            } else {
                setError("root", {
                    type: "server",
                    message: result.message || "Registration failed",
                });
            }
        } catch (err: any) {
            setError("root", {
                type: "server",
                message: err.message || "Registration failed",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
            {/* SERVER ERROR */}
            {errors.root?.message && (
                <p className="text-sm text-red-600 text-center">
                    {errors.root.message}
                </p>
            )}

            <div className="space-y-1">
                <label className="text-sm font-medium">Full name</label>
                <input
                    {...register("fullname")}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />
                {errors.fullname?.message && (
                    <p className="text-xs text-red-600">{errors.fullname.message}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                    type="email"
                    {...register("email")}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />
                {errors.email?.message && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>

             <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                    type="tel"
                    {...register("phone_number")}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />
                {errors.phone_number?.message && (
                    <p className="text-xs text-red-600">{errors.phone_number.message}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <input
                    type="password"
                    {...register("password")}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />
                <PasswordStrengthBar password={passwordValue} />
                {errors.password?.message && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Confirm password</label>
                <input
                    type="password"
                    {...register("confirmPassword")}
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />
                {errors.confirmPassword?.message && (
                    <p className="text-xs text-red-600">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            CAPTCHA - prevents automated bot registrations
            <ReCaptcha onVerify={handleCaptchaVerify} />

            <button
  type="submit"
  disabled={isSubmitting || pending || !captchaToken}
  className="h-10 w-full rounded-md bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
>
  {isSubmitting || pending ? "Creating account..." : "Create account"}
</button>

            {/* OAuth Divider */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-black/10 dark:border-white/15" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
            </div>

            {/* Google OAuth */}
            <GoogleLoginButton
                onError={(msg) => setError("root", { type: "server", message: msg })}
                onSuccess={() => {}}
            />

            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold hover:underline text-teal-500">
                    Log in
                </Link>
            </div>
        </form>
    );
}
