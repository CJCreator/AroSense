import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingSpinner';
import SettingsIcon from '../components/icons/SettingsIcon';
import { ThemeCustomizer } from '../components/ThemeCustomizer';
import { NotificationCenter } from '../components/NotificationCenter';
import { useHealthReminders } from '../hooks/useHealthReminders';
import { ThemeCustomizer } from '../components/ThemeCustomizer';
import { NotificationCenter } from '../components/NotificationCenter';
import { useHealthReminders } from '../hooks/useHealthReminders';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
}

const SettingsPageModern: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: { email: true, push: true, reminders: true },
    privacy: { shareData: false, analytics: true },
    preferences: { theme: 'light', language: 'en', timezone: 'UTC' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.user_metadata?.name || '',
    email: currentUser?.email || ''
  });
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const { reminders, notificationPermission, requestNotificationPermission } = useHealthReminders();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const { reminders, notificationPermission, requestNotificationPermission } = useHealthReminders();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Mock save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Mock save profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile saved:', profileForm);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sophisticated-grey-50 to-gray-50">
        <Card className="text-center p-8">
          <SettingsIcon className="w-16 h-16 text-sophisticated-grey-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access settings.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sophisticated-grey-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-sophisticated-grey-500 to-sophisticated-grey-600 rounded-2xl flex items-center justify-center">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card variant="elevated">
            <CardHeader title="Profile Information" subtitle="Update your personal details" />
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit" variant="primary" loading={isLoading}>
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card variant="elevated">
            <CardHeader title="Notifications" subtitle="Choose how you want to be notified" />
            <CardContent>
              <div className="space-y-1">
                <ToggleSwitch
                  checked={settings.notifications.email}
                  onChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))}
                  label="Email notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.push}
                  onChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked }
                  }))}
                  label="Push notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.reminders}
                  onChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, reminders: checked }
                  }))}
                  label="Health reminders"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card variant="elevated">
            <CardHeader title="Privacy & Data" subtitle="Control your data sharing preferences" />
            <CardContent>
              <div className="space-y-1">
                <ToggleSwitch
                  checked={settings.privacy.shareData}
                  onChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, shareData: checked }
                  }))}
                  label="Share anonymized health data for research"
                />
                <ToggleSwitch
                  checked={settings.privacy.analytics}
                  onChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, analytics: checked }
                  }))}
                  label="Allow analytics to improve the app"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <ThemeCustomizer />

          {/* Health Reminders */}
          <Card variant="elevated">
            <CardHeader title="Health Reminders" subtitle="Manage your health notifications and reminders" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">Browser Notifications</h4>
                    <p className="text-sm text-gray-600">Allow notifications for health reminders</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${
                      notificationPermission === 'granted' ? 'text-green-600' : 
                      notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {notificationPermission === 'granted' ? 'Enabled' : 
                       notificationPermission === 'denied' ? 'Blocked' : 'Not Set'}
                    </span>
                    {notificationPermission !== 'granted' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={requestNotificationPermission}
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">Active Reminders</h4>
                    <p className="text-sm text-gray-600">{reminders.filter(r => r.enabled).length} reminders active</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setShowNotificationCenter(true)}
                  >
                    Manage Reminders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card variant="elevated">
            <CardHeader title="App Preferences" subtitle="Customize your app experience" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <ThemeCustomizer />

          {/* Data Management */}
          <Card variant="elevated">
            <CardHeader title="Data Management" subtitle="Export or delete your data" />
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    Export My Data
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Download Health Report
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    These actions cannot be undone. Please be certain before proceeding.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="error" className="flex-1">
                      Delete All Health Data
                    </Button>
                    <Button variant="error" className="flex-1">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveSettings}
              loading={isLoading}
            >
              Save All Settings
            </Button>
          </div>
        </div>
        
        {/* Notification Center Modal */}
        <NotificationCenter
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
        />
      </div>
    </div>
  );
};

export default SettingsPageModern;