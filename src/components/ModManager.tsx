import React, { useEffect, useState } from 'react';
import { Box, Trash2, Upload } from 'lucide-react';
import { getModsList, uploadMod, toggleMod, deleteMod } from '../services/api';

interface Mod {
  name: string;
  size: string;
  status: 'Enabled' | 'Disabled';
}

export const ModManager: React.FC = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fetchMods = async () => {
    try {
      const modsList = await getModsList();
      setMods(modsList);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch mods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      await uploadMod(file);
      setUploadStatus('Upload successful!');
      fetchMods(); // Refresh the mods list
    } catch (error) {
      setUploadStatus('Upload failed');
      setError(error instanceof Error ? error.message : 'Failed to upload mod');
    }
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleToggleMod = async (filename: string) => {
    try {
      await toggleMod(filename);
      fetchMods(); // Refresh the list to show updated status
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle mod');
    }
  };

  const handleDeleteMod = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await deleteMod(filename);
      fetchMods(); // Refresh the list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete mod');
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
      <h2 className="text-3xl font-bold mb-6">Mod Manager</h2>
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="mod-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Mod
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="mod-upload"
              className="hidden"
              accept=".zip,.rar,.7zip"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="mod-upload"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <Upload className="mr-2" size={20} />
              <span>Choose file</span>
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {uploadStatus || 'No file chosen'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mod Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mods.map((mod) => (
                <tr key={mod.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Box className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{mod.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(parseInt(mod.size) / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mod.status === 'Enabled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleMod(mod.name)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {mod.status === 'Enabled' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteMod(mod.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};