import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { getSettings, updateSetting } from '../services/api';

interface Setting {
  attributes: {
    name: string;
    env_variable: string;
    description: string;
    server_value: string;
    default_value: string;
    rules: string;
  };
}

interface SettingsResponse {
  data: Setting[];
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response: SettingsResponse = await getSettings();
        setSettings(response.data);
        const initialValues: Record<string, string> = {};
        response.data.forEach(setting => {
          initialValues[setting.attributes.env_variable] = setting.attributes.server_value;
        });
        setFormValues(initialValues);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (envVariable: string, value: string) => {
    setFormValues(prev => ({ ...prev, [envVariable]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, envVariable: string) => {
    e.preventDefault();
    try {
      await updateSetting(envVariable, formValues[envVariable]);
      setNotification({ message: 'Setting updated successfully', type: 'success' });
    } catch (error) {
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to update setting', 
        type: 'error' 
      });
    }
    setTimeout(() => setNotification(null), 3000);
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
      <h2 className="text-3xl font-bold mb-6">Server Settings</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {notification && (
        <div className={`mb-4 ${
          notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        } px-4 py-3 rounded relative border`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {settings.map((setting) => (
          <div key={setting.attributes.env_variable} className="border-b pb-6 last:border-b-0">
            <form onSubmit={(e) => handleSubmit(e, setting.attributes.env_variable)}>
              <div className="mb-4">
                <label htmlFor={setting.attributes.env_variable} className="block text-sm font-medium text-gray-700">
                  {setting.attributes.name}
                </label>
                <p className="mt-1 text-sm text-gray-500">{setting.attributes.description}</p>
              </div>
              
              <div className="flex gap-4">
                {setting.attributes.rules.includes('in:true,false') ? (
                  <select
                    id={setting.attributes.env_variable}
                    value={formValues[setting.attributes.env_variable]}
                    onChange={(e) => handleChange(setting.attributes.env_variable, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type={setting.attributes.rules.includes('integer') ? 'number' : 'text'}
                    id={setting.attributes.env_variable}
                    value={formValues[setting.attributes.env_variable]}
                    onChange={(e) => handleChange(setting.attributes.env_variable, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="mr-2 -ml-1 h-5 w-5" />
                  Save
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
};