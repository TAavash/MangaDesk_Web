import React from 'react';
import { Search, Menu } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search folders..." 
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 gap-3 transition-all duration-200 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500/20">
        <Menu className="w-5 h-5 text-gray-500" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
        />
        
        <Search className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
};