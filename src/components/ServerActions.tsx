import React, { useState } from 'react';
import { RefreshCw, Power, PowerOff, MessageSquare, Map, Users, AlertTriangle, Terminal, X } from 'lucide-react';
import { performPowerAction, sendCommand, changeMap } from '../services/api';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onClick, color }) => (
  <div 
    className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${color}`}
    onClick={onClick}
  >
    <div className="flex items-center mb-4">
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')} mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const AVAILABLE_MAPS = [
  '/levels/gridmap_v2/info.json',
  '/levels/automation_test_track/info.json',
  '/levels/east_coast_usa/info.json',
  '/levels/hirochi_raceway/info.json',
  '/levels/italy/info.json',
  '/levels/jungle_rock_island/info.json',
  '/levels/industrial/info.json',
  '/levels/small_island/info.json',
  '/levels/smallgrid/info.json',
  '/levels/utah/info.json',
  '/levels/west_coast_usa/info.json',
  '/levels/driver_training/info.json',
  '/levels/derby/info.json'
];

export const ServerActions: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [popup, setPopup] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMapChange = async () => {
    setPopup({
      title: "Change Map",
      content: (
        <div>
          <select
            id="mapSelect"
            className="w-full p-2 mb-4 border rounded"
          >
            {AVAILABLE_MAPS.map((map, index) => (
              <option key={index} value={map}>
                {map.split('/')[2]}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              onClick={async () => {
                const select = document.getElementById('mapSelect') as HTMLSelectElement;
                await changeMap(select.value);
                showNotification('Map change initiated successfully', 'success');
                setPopup(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Validate
            </button>
          </div>
        </div>
      )
    });
  };

  const performAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'restart':
          await performPowerAction('restart');
          showNotification('Server restart initiated successfully', 'success');
          break;
        case 'stop':
          await performPowerAction('stop');
          showNotification('Server stop initiated successfully', 'success');
          break;
        case 'start':
          await performPowerAction('start');
          showNotification('Server start initiated successfully', 'success');
          break;
        case 'broadcast':
          setPopup({
            title: "Broadcast Message",
            content: (
              <div>
                <input
                  type="text"
                  id="broadcastInput"
                  className="w-full p-2 mb-4 border rounded"
                  placeholder="Enter message to broadcast"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      const input = document.getElementById('broadcastInput') as HTMLInputElement;
                      await sendCommand(`say ${input.value}`);
                      showNotification('Message broadcasted successfully', 'success');
                      setPopup(null);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            )
          });
          break;
        case 'change_map':
          await handleMapChange();
          break;
        case 'kick_all':
          if (confirm('Are you sure you want to kick all players?')) {
            await sendCommand('kickall');
            showNotification('All players have been kicked', 'success');
          }
          break;
        case 'custom_command':
          setPopup({
            title: "Custom Command",
            content: (
              <div>
                <input
                  type="text"
                  id="commandInput"
                  className="w-full p-2 mb-4 border rounded"
                  placeholder="Enter custom command"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      const input = document.getElementById('commandInput') as HTMLInputElement;
                      await sendCommand(input.value);
                      showNotification('Command executed successfully', 'success');
                      setPopup(null);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Execute
                  </button>
                </div>
              </div>
            )
          });
          break;
        default:
          throw new Error('Unknown action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showNotification('Failed to perform action', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {notification.message}
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{popup.title}</h3>
              <button onClick={() => setPopup(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {popup.content}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Server Actions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => performAction('custom_command')} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Terminal className="mr-2" size={20} />
            Custom Command
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Restart Server"
          description="Safely restart the BeamMP server"
          icon={<RefreshCw size={24} className="text-blue-500" />}
          onClick={() => performAction('restart')}
          color="border-blue-500"
        />
        
        <ActionCard
          title="Stop Server"
          description="Safely stop the BeamMP server"
          icon={<PowerOff size={24} className="text-red-500" />}
          onClick={() => performAction('stop')}
          color="border-red-500"
        />
        
        <ActionCard
          title="Start Server"
          description="Start the BeamMP server"
          icon={<Power size={24} className="text-green-500" />}
          onClick={() => performAction('start')}
          color="border-green-500"
        />
        
        <ActionCard
          title="Broadcast Message"
          description="Send a message to all players"
          icon={<MessageSquare size={24} className="text-purple-500" />}
          onClick={() => performAction('broadcast')}
          color="border-purple-500"
        />
        
        <ActionCard
          title="Change Map"
          description="Switch to a different map"
          icon={<Map size={24} className="text-yellow-500" />}
          onClick={() => performAction('change_map')}
          color="border-yellow-500"
        />
        
        <ActionCard
          title="Kick All Players"
          description="Remove all players from the server"
          icon={<Users size={24} className="text-orange-500" />}
          onClick={() => performAction('kick_all')}
          color="border-orange-500"
        />
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="mr-2 text-yellow-500" size={24} />
          Important Notes
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Server restarts may take up to 30 seconds to complete</li>
          <li>Players will be automatically disconnected during restart</li>
          <li>Make sure to broadcast important messages before server maintenance</li>
          <li>Map changes require all players to reconnect</li>
        </ul>
      </div>
    </div>
  );
};