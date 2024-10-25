import axios from 'axios';

const API_URL = 'http://89.213.140.45:10100';
const API_KEY = '7b2bd1e4-2d1e-4c96-8d5e-6627af535571';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Status endpoint
export const checkApiStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

// Power actions
export const performPowerAction = async (
  action: 'start' | 'stop' | 'restart'
) => {
  const response = await api.post(`/power/${action}`);
  return response.data;
};

// Server status and control
export const getServerStatus = async () => {
  const response = await api.get('/server/status');
  return response.data;
};

export const getServerUtilization = async () => {
  const response = await api.get('/server/utilization');
  return response.data;
};

export const sendCommand = async (command: string) => {
  const response = await api.post('/server/command', { command });
  return response.data;
};

// Map management
export const changeMap = async (mapPath: string) => {
  const response = await api.post('/settings/set', { setting: "MAP", value: mapPath });
  return response.data;
};

// Mods management
export const uploadMod = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/mods/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const toggleMod = async (filename: string) => {
  const response = await api.post('/mods/toggle', { filename });
  return response.data;
};

export const deleteMod = async (filename: string) => {
  const response = await api.post('/mods/delete', { filename });
  return response.data;
};

export const getModsList = async () => {
  const response = await api.get('/mods/list');
  return response.data;
};

// Settings management
export const getSettings = async () => {
  const response = await api.get('/settings/get');
  return response.data;
};

export const updateSetting = async (setting: string, value: string) => {
  const response = await api.post('/settings/set', { setting, value });
  return response.data;
};

// Error handling helper
export const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return new Error(
        `Server error: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      return new Error('No response received from server');
    } else {
      return new Error(`Request error: ${error.message}`);
    }
  }
  return new Error('An unexpected error occurred');
};
