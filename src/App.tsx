import React from 'react';
import { useTheme } from './hooks/useTheme';
import { Auth } from './components/Auth';
import { Folders } from './screens/Folders';
import { Books } from './screens/Books';
import { BookDetail } from './screens/BookDetail';
import { Settings } from './screens/Settings';
import { Admin } from './screens/Admin';
import { useNavigation } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const {
    navigationState,
    navigateToFolders,
    navigateToBooks,
    navigateToBookDetail,
    navigateToSettings,
    navigateToAdmin,
    goBack
  } = useNavigation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderCurrentScreen = () => {
    switch (navigationState.currentScreen) {
      case 'folders':
        return (
          <Folders
            onFolderClick={navigateToBooks}
            onSettingsClick={navigateToSettings}
            onAdminClick={navigateToAdmin}
          />
        );
      
      case 'books':
        return (
          <Books
            folderId={navigationState.selectedFolderId!}
            folderName={navigationState.folderName!}
            onBack={goBack}
            onBookClick={navigateToBookDetail}
          />
        );
      
      case 'book-detail':
        return (
          <BookDetail
            bookId={navigationState.selectedBookId!}
            folderId={navigationState.selectedFolderId!}
            onBack={goBack}
          />
        );
      
      case 'settings':
        return (
          <Settings
            onBack={goBack}
          />
        );
      
      case 'admin':
        return (
          <Admin
            onBack={goBack}
          />
        );
      
      default:
        return <Folders onFolderClick={navigateToBooks} onSettingsClick={navigateToSettings} onAdminClick={navigateToAdmin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentScreen()}
    </div>
  );
};