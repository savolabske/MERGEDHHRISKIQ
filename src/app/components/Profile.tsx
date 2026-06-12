import { useState } from 'react';
import { User, Mail, Lock, MapPin, Briefcase, Phone, Save, Eye, EyeOff, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const [formData, setFormData] = useState({
    firstName: 'Amina',
    lastName: 'Mohamed',
    email: 'amina.mohamed@undp.org',
    role: 'Field Coordinator',
    location: 'Mogadishu, Somalia',
    phone: '+252 61 234 5678',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Validate email format
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if trying to update password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    toast.success('Profile updated successfully');
    
    // Clear password fields after successful update
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile picture uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    toast.success('Profile picture removed');
  };

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-page-title mb-1">My Profile</h1>
          <p className="text-sm sm:text-sm text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full rounded-full" />
              ) : (
                'AM'
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {profileImage 
                  ? 'Upload a new image to replace your current profile picture'
                  : 'Upload an image or your initials will be displayed'
                }
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <label
                  htmlFor="profileImage"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-base font-medium hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Upload Image</span>
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-xl text-base font-medium hover:bg-destructive-text transition-colors cursor-pointer ml-2"
                  >
                    <X size={18} />
                    <span>Remove Image</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                First Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Enter first name"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Last Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="name@undp.org"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Role
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Your role"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Your location"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="+252 XX XXX XXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-2">Security</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Update your password to keep your account secure
          </p>
          
          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-muted-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-muted-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-muted-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-base font-medium hover:bg-primary-hover transition-colors"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}