import React from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="flex items-center justify-between w-full px-6 py-3 bg-white/80 backdrop-blur-md border-b border-black/10">
      <div className="flex items-center gap-1">
        <span className="text-[17px] font-semibold text-black">
          {currentTime}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
};