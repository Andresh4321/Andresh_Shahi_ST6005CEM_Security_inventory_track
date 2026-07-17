//server side processing for auth actions"
"use server";
import { register, login, admin, forgotPassword, resetPassword, updateUserImage, changePassword, setupMfa, verifyMfaSetup, disableMfa, sendEmailOtp, verifyEmailOtp } from "../api/auth"
import { setAuthToken, setUserData } from "../cookie";

export const handleRegister=async(FormData:any)=>{
    try{
        //how to get data from component
        const result=await register(FormData);

        //how to send back to component
        if(result.success){
            return {
                success:true,
                message:"Login successful",
                data:result.data
            };
        }
        return{
            success:false,message:result.message || "Login failed"
        }
    } catch(err:Error|any){
        return{
            success:false,
            message:err.message || "Login failed"
        }
    }
}

export const handleLogin=async(formData:any) =>{
    try{
    //how to get data from component
    const result=await login (formData);

    // Handle MFA required response
    if(result.mfaRequired){
        return {
            success: false,
            mfaRequired: true,
            message: "MFA verification required"
        };
    }

    // Handle password expired response
    if(result.passwordExpired){
        return {
            success: false,
            passwordExpired: true,
            message: "Password has expired. Please change your password."
        };
    }

    // Handle account locked response
    if(result.accountLocked){
        return {
            success: false,
            accountLocked: true,
            lockoutRemainingMinutes: result.lockoutRemainingMinutes || 15,
            message: result.message || "Account is temporarily locked"
        };
    }

    //how to sendback to component
    if(result.success){
        if (result.token) {
            await setAuthToken(result.token);
        }
        if (result.data) {
            await setUserData(result.data);
        }

         return {
                success:true,
                message:"Login successful",
                data:result.data,
                token: result.token
            };
        }
        return{
            success:false,message:result.message || "Login failed"
        }
    } catch(err:Error|any){
        return{
            success:false,
            message:err.message || "Login failed"
        }
    }
}

export const handleAdmin = async (formData: any) => {
    try {
        const res = await admin(formData); // may throw with informative message

        // If API returned a shape indicating failure, surface that message
        if (res && res.success === false) {
            return { success: false, message: res.message || JSON.stringify(res) };
        }

        // Normalize user and token from various possible shapes
        const user = res?.data?.user ?? res?.user ?? res?.data ?? res;
        const token = res?.data?.token ?? res?.token ?? undefined;

        if (!user || Object.keys(user).length === 0) {
            return { success: false, message: "Admin login succeeded but no user data was returned from server." };
        }

        // Ensure role exists
        const role = user.role ?? user?.data?.role ?? undefined;
        if (!role) {
            return { success: false, message: "Admin login succeeded but role information is missing from server response." };
        }

        // Save auth info if available
        const tokenToStore = token ?? res?.data ?? res;
        await setAuthToken(tokenToStore);
        await setUserData(user);

        return { success: true, message: "Admin Login successful", data: user };
    } catch (err: any) {
        return { success: false, message: err?.message ?? "Admin Login failed" };
    }
};
// Send forgot password
export const handleForgotPassword = async (email: string) => {
    try {
        const result = await forgotPassword(email);
        if (result.success) {
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to send reset email" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to send reset email" };
    }
};

// Reset password
export const handleResetPassword = async (token: string, password: string) => {
    try {
        const result = await resetPassword(token, password);
        if (result.success) {
            return { success: true, message: result.message };
        }
        return { success: false, message: result.message || "Failed to reset password" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to reset password" };
    }
};

// Update user profile image
export const handleUpdateUserImage = async (id: string, formData: FormData) => {
    try {
        const result = await updateUserImage(id, formData);
        return { success: true, data: result, message: 'Profile image updated successfully' };
    } catch (err: Error | any) {
        return { success: false, message: err.message || 'Failed to update profile image' };
    }
};

// Change password
export const handleChangePassword = async (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) => {
    try {
        const result = await changePassword(data);
        if (result.success) {
            return { success: true, message: result.message || "Password changed successfully" };
        }
        return { success: false, message: result.message || "Failed to change password" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to change password" };
    }
};

// Setup MFA - returns QR code data
export const handleSetupMfa = async () => {
    try {
        const result = await setupMfa();
        if (result.success) {
            return { success: true, data: result.data || result, message: "MFA setup initiated" };
        }
        return { success: false, message: result.message || "Failed to setup MFA" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to setup MFA" };
    }
};

// Verify MFA setup with TOTP token
export const handleVerifyMfaSetup = async (token: string) => {
    try {
        const result = await verifyMfaSetup(token);
        if (result.success) {
            return { success: true, message: result.message || "MFA enabled successfully" };
        }
        return { success: false, message: result.message || "Invalid verification code" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to verify MFA" };
    }
};

// Disable MFA
export const handleDisableMfa = async (token: string) => {
    try {
        const result = await disableMfa(token);
        if (result.success) {
            return { success: true, message: result.message || "MFA disabled successfully" };
        }
        return { success: false, message: result.message || "Failed to disable MFA" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to disable MFA" };
    }
};

// Send email OTP
export const handleSendEmailOTP = async () => {
    try {
        const result = await sendEmailOtp();
        if (result.success) {
            return { success: true, message: result.message || "OTP sent to your email" };
        }
        return { success: false, message: result.message || "Failed to send OTP" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to send OTP" };
    }
};

// Verify email OTP
export const handleVerifyEmailOTP = async (otp: string) => {
    try {
        const result = await verifyEmailOtp(otp);
        if (result.success) {
            return { success: true, message: result.message || "Email verified successfully" };
        }
        return { success: false, message: result.message || "Invalid OTP" };
    } catch (err: Error | any) {
        return { success: false, message: err.message || "Failed to verify OTP" };
    }
};
