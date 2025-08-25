import React, { useState } from 'react';
import { ChevronRight, Trash2, Edit3 } from 'lucide-react';
import { Folder } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface FolderCardProps {
  folder: Folder;
  isEditing: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Folder>) => void;
  onClick: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isEditing,
  onDelete,
  onUpdate,
  onClick
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdate(folder.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(folder.name);
      setIsEditingName(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 bg-white">
      <CardContent className="p-0">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-3 px-4 py-3 flex-1 cursor-pointer"
            onClick={!isEditing ? onClick : undefined}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-transparent outline-none border-b border-blue-500 text-gray-900 font-medium"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-gray-900 font-medium text-left">
                {folder.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pr-4">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(folder.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-500 font-medium min-w-[20px] text-right">
                  {folder.count}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};