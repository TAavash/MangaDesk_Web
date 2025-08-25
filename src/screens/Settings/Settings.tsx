import React from 'react';
import { ArrowLeft, User, Bell, Palette, Download, Info, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../hooks/useAuth';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', description: user?.email || 'Manage your account' },
        { icon: Bell, label: 'Notifications', description: 'Reading reminders' }
      ]
    },
    {
      title: 'Appearance',
      items: [
        { icon: Palette, label: 'Theme', description: 'Light or dark mode' }
      ]
    },
    {
      title: 'Data',
      items: [
        { icon: Download, label: 'Export Data', description: 'Backup your library' }
      ]
    },
    {
      title: 'About',
      items: [
        { icon: Info, label: 'About MangaDesk', description: 'Version 1.0.0' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Settings List */}
        <div className="px-6 py-4 space-y-6 max-h-[500px] overflow-y-auto">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out */}
          <div className="pt-4 border-t border-gray-200">
            <Card 
              className="hover:shadow-sm transition-shadow cursor-pointer border-red-200"
              onClick={handleSignOut}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-600">Sign Out</h3>
                    <p className="text-sm text-gray-500">Sign out of your account</p>
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