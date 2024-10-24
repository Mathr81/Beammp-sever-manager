import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PlayerList } from './components/PlayerList';
import { ModManager } from './components/ModManager';
import { ServerActions } from './components/ServerActions';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'players' && <PlayerList />}
      {activeTab === 'mods' && <ModManager />}
      {activeTab === 'actions' && <ServerActions />}
      {activeTab === 'settings' && <Settings />}
    </Layout>
  );
};

export default App;