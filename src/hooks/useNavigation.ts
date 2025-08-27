import { useState } from 'react';

export type Screen = 'folders' | 'books' | 'book-detail' | 'settings' | 'admin';

export interface NavigationState {
  currentScreen: Screen;
  selectedFolderId?: string;
  selectedBookId?: string;
  folderName?: string;
}

export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'folders'
  });

  const navigateToFolders = () => {
    setNavigationState({ currentScreen: 'folders' });
  };

  const navigateToBooks = (folderId: string, folderName: string) => {
    setNavigationState({
      currentScreen: 'books',
      selectedFolderId: folderId,
      folderName
    });
  };

  const navigateToBookDetail = (bookId: string) => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: 'book-detail',
      selectedBookId: bookId
    }));
  };

  const navigateToSettings = () => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: 'settings'
    }));
  };

  const navigateToAdmin = () => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: 'admin'
    }));
  };
  const goBack = () => {
    if (navigationState.currentScreen === 'book-detail') {
      setNavigationState(prev => ({
        ...prev,
        currentScreen: 'books',
        selectedBookId: undefined
      }));
    } else if (navigationState.currentScreen === 'books') {
      setNavigationState({ currentScreen: 'folders' });
    } else if (navigationState.currentScreen === 'settings' || navigationState.currentScreen === 'admin') {
      setNavigationState({ currentScreen: 'folders' });
    }
  };

  return {
    navigationState,
    navigateToFolders,
    navigateToBooks,
    navigateToBookDetail,
    navigateToSettings,
    navigateToAdmin,
    goBack
  };
};