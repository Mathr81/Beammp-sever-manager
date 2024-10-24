import React, { useEffect, useState } from 'react';
import { User, X } from 'lucide-react';
import { getServerStatus, sendCommand } from '../services/api';

interface ServerStatus {
  players: string;
  playerslist: string;
}

export const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      const status: ServerStatus = await getServerStatus();
      // Split the players list and remove empty entries
      const playerList = status.playerslist.split(';').filter(player => player.length > 0);
      setPlayers(playerList);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch players');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const kickPlayer = async (playerName: string) => {
    if (!window.confirm(`Are you sure you want to kick ${playerName}?`)) return;

    try {
      await sendCommand(`kick ${playerName}`);
      fetchPlayers(); // Refresh the list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to kick player');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Player List</h2>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {players.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No players currently online
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{player}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => kickPlayer(player)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <X className="h-5 w-5" />
                      <span className="ml-1">Kick</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};