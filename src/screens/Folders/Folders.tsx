import React, { useState } from 'react';
import { Edit3, FolderPlus, BookOpen, Settings as SettingsIcon, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBar } from '../../components/StatusBar/StatusBar';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FolderCard } from '../../components/FolderCard/FolderCard';
import { AddFolderModal } from '../../components/AddFolderModal/AddFolderModal';
import { useFolders } from '../../hooks/useFolders';
import { useAuth } from '../../hooks/useAuth';

interface FoldersProps {
  onFolderClick: (folderId: string, folderName: string) => void;
  onSettingsClick: () => void;
  onAdminClick: () => void;
}

export const Folders: React.FC<FoldersProps> = ({ onFolderClick, onSettingsClick, onAdminClick }) => {
  const { isAdmin } = useAuth();
  const {
    folders,
    searchQuery,
    setSearchQuery,
    isEditing,
    setIsEditing,
    addFolder,
    deleteFolder,
    updateFolder
  } = useFolders();

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      {/* Mobile Container */}
      <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden relative border dark:border-gray-800">
        {/* Status Bar */}
        <StatusBar />

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              MangaDesk
            </h1>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAdminClick}
                  className="h-8 w-8 p-0"
                  title="Admin Dashboard"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="h-8 w-8 p-0"
              >
                <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={`h-8 px-3 text-sm font-medium transition-colors ${
                  isEditing 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search your collections..."
          />
        </div>

        {/* Folders List */}
        <div className="flex-1 px-6 py-4 space-y-3 max-h-[500px] overflow-y-auto">
          {folders.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No folders yet</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Your First Folder
              </Button>
            </div>
          ) : (
            folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                isEditing={isEditing}
                onDelete={deleteFolder}
                onUpdate={updateFolder}
                onClick={() => onFolderClick(folder.id, folder.name)}
              />
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-white dark:bg-black">
          <div className="flex items-center justify-center gap-8">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
            >
              <FolderPlus className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-blue-600">Add Folder</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsEditing(!isEditing)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <Edit3 className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Manage</span>
            </Button>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      </div>

      {/* Add Folder Modal */}
      <AddFolderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addFolder}
      />
    </div>
  );
};