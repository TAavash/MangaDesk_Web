import React from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Folder } from '../../types';

interface BookManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onMove: (folderId: string) => void;
  onCopy: (folderId: string) => void;
}

export const BookManagementModal: React.FC<BookManagementModalProps> = ({
  isOpen,
  onClose,
  folders,
  onMove,
  onCopy
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Folder</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {folders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No other folders available
            </p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{folder.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{folder.count} books</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMove(folder.id)}
                    className="h-8 px-3 text-xs"
                  >
                    Move
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopy(folder.id)}
                    className="h-8 px-3 text-xs"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};