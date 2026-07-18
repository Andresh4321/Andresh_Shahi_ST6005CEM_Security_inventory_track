"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Camera, Mail, Phone, MapPin, Building, Save, Shield, Key, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { uploadProfilePhoto, updateProfile, changePassword, setupMfa, verifyMfaSetup, disableMfa, sendEmailOtp, verifyEmailOtp } from '@/lib/api/auth';
import PasswordStrengthBar from '../(auth)/_components/PasswordStrengthBar';

const Settings = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const resolveProfileImageUrl = (src?: string) => {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const normalized = src.startsWith("/") ? src : `/${src}`;
    if (!baseUrl) return normalized;
    return `${baseUrl.replace(/\/$/, "")}${normalized}`;
  };

  const fallbackAvatar = "/default-avatar.svg";

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('inventorytrack_user') || localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileImage(parsedUser.profileImage || '');
      setFullName(parsedUser.fullname || parsedUser.fullName || '');
      setPhoneNumber(parsedUser.phone_number || parsedUser.phoneNumber || parsedUser.phone || '');
    }
  }, []);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const payload = {
        fullname: fullName.trim(),
        phone_number: phoneNumber.trim(),
      };

      const result = await updateProfile(user.id || user._id, payload);
      const updated = result.data || result.user || result;

      const updatedUser = {
        ...user,
        ...updated,
        fullname: updated?.fullname ?? payload.fullname,
        phone_number: updated?.phone_number ?? payload.phone_number,
      };

      setUser(updatedUser);
      localStorage.setItem('inventorytrack_user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('userImage', file);

      const result = await uploadProfilePhoto(formData);

      if (result.success) {
        const updatedUser = {
          ...user,
          profileImage: result.imageUrl || result.data?.profileImage || result.data?.user?.profileImage,
        };
        setUser(updatedUser);
        setProfileImage(updatedUser.profileImage);
        localStorage.setItem('inventorytrack_user', JSON.stringify(updatedUser));

        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile image",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Settings" subtitle="Manage your account preferences">
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Section */}
        <Card className="p-8 opacity-0 animate-fade-in">
          <div className="flex items-start gap-8">
            {/* Profile Image */}
            <div className="shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-primary flex items-center justify-center overflow-hidden shadow-lg">
                  <img 
                    src={resolveProfileImageUrl(profileImage) || fallbackAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = fallbackAvatar;
                    }}
                  />
                </div>
                <label 
                  htmlFor="profile-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                  <input 
                    id="profile-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Click to upload
              </p>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {user.fullname || user.fullName || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  user.role === 'admin' || user.isAdmin 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-success/20 text-success'
                }`}>
                  {user.role === 'admin' || user.isAdmin ? 'Administrator' : 'User'}
                </span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Manage your profile information, security settings, and preferences.
              </p>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-1">
          <h3 className="font-display text-lg font-semibold mb-6">Account Information</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input 
                  value={user.email || ''} 
                  readOnly 
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </label>
                <Input 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  Role
                </label>
                <Input 
                  value={user.role === 'admin' || user.isAdmin ? 'Administrator' : 'User'} 
                  readOnly 
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {user.address && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Address
                </label>
                <Input 
                  value={user.address || ''} 
                  readOnly 
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Profile information is managed by your administrator. 
              Contact your admin to update your account details.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleProfileSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Change Password Section */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-2">
          <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <Key className="w-5 h-5" /> Change Password
          </h3>
          <ChangePasswordSection toast={toast} />
        </Card>

        {/* MFA Section */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-2">
          <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Two-Factor Authentication (MFA)
          </h3>
          <MfaSection toast={toast} user={user} />
        </Card>

        {/* Email Verification Section */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-2">
          <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email Verification
          </h3>
          <EmailVerificationSection toast={toast} user={user} />
        </Card>

        {/* App Preferences */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-3">
          <h3 className="font-display text-lg font-semibold mb-6">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about low stock and production</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-muted-foreground">Download all your personal data (GDPR compliant)</p>
              </div>
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  const { apiClient } = await import('@/lib/api/client');
                  const res = await apiClient.get('/user/data/export');
                  const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `inventorytrack_data_export_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast({ title: "Success", description: "Data exported successfully" });
                } catch (err: any) {
                  toast({ title: "Error", description: err.message || "Failed to export data", variant: "destructive" });
                }
              }}>
                Export Data
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Data Import</p>
                <p className="text-sm text-muted-foreground">Import previously exported data (materials)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const importData = JSON.parse(text);
                    const { apiClient } = await import('@/lib/api/client');
                    const res = await apiClient.post('/user/data/import', importData);
                    if (res.data.success) {
                      toast({ title: "Success", description: res.data.message });
                    } else {
                      toast({ title: "Error", description: res.data.message, variant: "destructive" });
                    }
                  } catch (err: any) {
                    toast({ title: "Error", description: err.message || "Failed to import data", variant: "destructive" });
                  }
                };
                input.click();
              }}>
                Import Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// ===== CHANGE PASSWORD SUB-COMPONENT =====
function ChangePasswordSection({ toast }: { toast: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setIsChanging(true);
    try {
      const result = await changePassword({ currentPassword, newPassword, confirmNewPassword });
      toast({ title: "Success", description: result.message || "Password changed successfully" });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to change password", variant: "destructive" });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Password must be 8+ characters with uppercase, lowercase, number, and special character. Cannot reuse last 5 passwords. Expires every 90 days.
      </p>
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Password</label>
        <Input
          type={showPasswords ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">New Password</label>
        <Input
          type={showPasswords ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
        <PasswordStrengthBar password={newPassword} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm New Password</label>
        <Input
          type={showPasswords ? "text" : "password"}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Confirm new password"
        />
        {confirmNewPassword && newPassword !== confirmNewPassword && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showPwd" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} />
        <label htmlFor="showPwd" className="text-sm text-muted-foreground">Show passwords</label>
      </div>
      <Button onClick={handleChangePassword} disabled={isChanging}>
        <Lock className="w-4 h-4 mr-2" />
        {isChanging ? "Changing..." : "Change Password"}
      </Button>
    </div>
  );
}

// ===== MFA SUB-COMPONENT =====
function MfaSection({ toast, user }: { toast: any; user: any }) {
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [qrCode, setQrCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const handleSetupMfa = async () => {
    setIsSettingUp(true);
    try {
      const result = await setupMfa();
      setQrCode(result.data?.qrCode || result.qrCode);
      setMfaSecret(result.data?.secret || result.secret);
      setShowSetup(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!verifyToken || verifyToken.length !== 6) {
      toast({ title: "Error", description: "Enter a valid 6-digit code", variant: "destructive" });
      return;
    }
    try {
      await verifyMfaSetup(verifyToken);
      setMfaEnabled(true);
      setShowSetup(false);
      setQrCode('');
      setMfaSecret('');
      setVerifyToken('');
      toast({ title: "Success", description: "MFA enabled successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDisableMfa = async () => {
    if (!disableToken || disableToken.length !== 6) {
      toast({ title: "Error", description: "Enter your current TOTP code to disable MFA", variant: "destructive" });
      return;
    }
    try {
      await disableMfa(disableToken);
      setMfaEnabled(false);
      setShowDisable(false);
      setDisableToken('');
      toast({ title: "Success", description: "MFA disabled" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-red-400'}`} />
        <p className="font-medium">{mfaEnabled ? 'MFA Enabled' : 'MFA Not Enabled'}</p>
        {mfaEnabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
      </div>

      {!mfaEnabled && !showSetup && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Enable Two-Factor Authentication using a TOTP app (Google Authenticator, Authy, etc.) for an extra layer of security.
          </p>
          <Button onClick={handleSetupMfa} disabled={isSettingUp}>
            <Shield className="w-4 h-4 mr-2" />
            {isSettingUp ? "Setting up..." : "Enable MFA"}
          </Button>
        </div>
      )}

      {showSetup && (
        <div className="space-y-4 p-4 border rounded-lg">
          <p className="text-sm font-medium">Scan this QR code with your authenticator app:</p>
          {qrCode && <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 mx-auto border rounded" />}
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded font-mono break-all">
            Manual Key: {mfaSecret}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter 6-digit verification code:</label>
            <Input
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleVerifyMfa}>Verify & Enable</Button>
            <Button variant="outline" onClick={() => { setShowSetup(false); setQrCode(''); setMfaSecret(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {mfaEnabled && !showDisable && (
        <Button variant="outline" onClick={() => setShowDisable(true)} className="text-red-500">
          Disable MFA
        </Button>
      )}

      {showDisable && (
        <div className="space-y-3 p-4 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Enter your current TOTP code to confirm disabling MFA:</p>
          <Input
            value={disableToken}
            onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <div className="flex gap-2">
            <Button onClick={handleDisableMfa} variant="outline" className="text-red-600 border-red-300">Confirm Disable</Button>
            <Button variant="outline" onClick={() => setShowDisable(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== EMAIL VERIFICATION SUB-COMPONENT =====
function EmailVerificationSection({ toast, user }: { toast: any; user: any }) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(user?.emailVerified || false);

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      await sendEmailOtp();
      setOtpSent(true);
      toast({ title: "Success", description: "OTP sent to your email" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: "Error", description: "Enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      await verifyEmailOtp(otp);
      setVerified(true);
      setOtpSent(false);
      toast({ title: "Success", description: "Email verified!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${verified ? 'bg-green-500' : 'bg-yellow-400'}`} />
        <p className="font-medium">{verified ? 'Email Verified' : 'Email Not Verified'}</p>
        {verified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-yellow-500" />}
      </div>

      {!verified && !otpSent && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">Verify your email address by receiving a one-time code.</p>
          <Button onClick={handleSendOtp} disabled={isSending}>
            <Mail className="w-4 h-4 mr-2" />
            {isSending ? "Sending..." : "Send Verification OTP"}
          </Button>
        </div>
      )}

      {otpSent && !verified && (
        <div className="space-y-3 p-4 border rounded-lg">
          <p className="text-sm">Enter the 6-digit OTP sent to your email:</p>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <div className="flex gap-2">
            <Button onClick={handleVerifyOtp} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button variant="outline" onClick={handleSendOtp} disabled={isSending}>
              Resend
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
