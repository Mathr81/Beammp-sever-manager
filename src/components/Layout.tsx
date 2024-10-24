import React from 'react';
import { Server, Users, Box, Zap, Settings as SettingsIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">BeamMP Manager</h1>
        </div>
        <nav className="mt-8">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setActiveTab('dashboard')}
          >
            <Server className="mr-3" size={20} />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setActiveTab('players')}
          >
            <Users className="mr-3" size={20} />
            Players
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setActiveTab('mods')}
          >
            <Box className="mr-3" size={20} />
            Mod Manager
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setActiveTab('actions')}
          >
            <Zap className="mr-3" size={20} />
            Server Actions
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon className="mr-3" size={20} />
            Settings
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};