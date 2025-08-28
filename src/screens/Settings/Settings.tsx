import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Palette, Download, Info, LogOut, Moon, Sun, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, signOut, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    alert('Export functionality will be implemented soon!');
  };

  const handleAbout = () => {
    alert('MangaDesk v1.0.0\n\nYour personal manga reading companion.\nBuilt with React and Supabase.');
  };

  const handleProfile = () => {
    // TODO: Implement profile editing
    alert('Profile editing will be implemented soon!');
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await changePassword(newPassword);
      if (error) {
        alert('Error changing password: ' + error.message);
      } else {
        alert('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
      }
    } catch (error) {
      alert('Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden relative border dark:border-gray-800">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>

        {/* Settings List */}
        <div className="px-6 py-4 space-y-6 max-h-[500px] overflow-y-auto bg-white dark:bg-black">
          {/* Account Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Account
            </h2>
            <div className="space-y-2">
              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={handleProfile}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Profile</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Manage your account'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => setShowPasswordChange(!showPasswordChange)}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showPasswordChange && (
                <div className="ml-11 space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={passwordLoading || !newPassword || !confirmPassword}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-sm py-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => setShowNotifications(!showNotifications)}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reading reminders</p>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-10 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-sm transition-transform mt-1 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showNotifications && (
                <div className="ml-11 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                    />
                    Daily reading reminders
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Appearance
            </h2>
            <div className="space-y-2">
              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={() => setShowThemeOptions(!showThemeOptions)}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{theme} mode</p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showThemeOptions && (
                <div className="ml-11 space-y-2">
                  <button
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                      setShowThemeOptions(false);
                    }}
                    className="flex items-center justify-between w-full p-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Light
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                      setShowThemeOptions(false);
                    }}
                    className="flex items-center justify-between w-full p-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      Dark
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Data Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Data
            </h2>
            <div className="space-y-2">
              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={handleExportData}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Backup your library</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              About
            </h2>
            <div className="space-y-2">
              <Card className="hover:shadow-sm transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-700" onClick={handleAbout}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">About MangaDesk</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Card 
              className="hover:shadow-sm transition-shadow cursor-pointer border-red-200 dark:border-red-800 dark:bg-gray-900"
              onClick={handleSignOut}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-600">Sign Out</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      </div>
    </div>
  );
};