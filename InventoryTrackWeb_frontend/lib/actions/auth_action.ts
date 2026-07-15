//server side processing for auth actions"
"use server";
import { success } from "zod";
import { register, login, admin, forgotPassword, resetPassword, updateUserImage } from "../api/auth"
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
