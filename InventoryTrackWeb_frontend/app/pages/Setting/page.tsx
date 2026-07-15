"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Camera, Mail, Phone, MapPin, Building, Save } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import { uploadProfilePhoto, updateProfile } from '@/lib/api/auth';

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

        {/* Security Section */}
        <Card className="p-8 opacity-0 animate-fade-in stagger-2">
          <h3 className="font-display text-lg font-semibold mb-6">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth/reset-password'}>
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Not enabled</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable 2FA
              </Button>
            </div>
          </div>
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
                <p className="text-sm text-muted-foreground">Download your data in CSV format</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Export Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
