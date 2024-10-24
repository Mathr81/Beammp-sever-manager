import axios from 'axios';

const API_URL = import.meta.env.VITE_PTERODACTYL_URL;
const SERVER_ID = import.meta.env.VITE_BEAMMP_SERVER_ID;
const API_KEY = import.meta.env.VITE_PTERODACTYL_API_KEY;

const api = axios.create({
  baseURL: `${API_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'Application/vnd.pterodactyl.v1+json',
  },
});

export const checkApiConfiguration = () => {
  return !!(API_URL && SERVER_ID && API_KEY);
};

export const checkApiConnection = async () => {
  try {
    await api.get('/');
    return true;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new Error(
        'Connection to the server timed out. Please check your network connection and try again.'
      );
    } else if (error.response) {
      return new Error(
        `Server responded with an error: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      return new Error(
        'No response received from the server. Please check your network connection and try again.'
      );
    } else {
      return new Error(`Error setting up the request: ${error.message}`);
    }
  } else if (error instanceof Error) {
    return new Error(`An unexpected error occurred: ${error.message}`);
  } else {
    return new Error('An unknown error occurred');
  }
};

export const getServerStatus = async () => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    const response = await api.get(`/servers/${SERVER_ID}/resources`);
    return response.data.attributes;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const sendCommand = async (command: string) => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    await api.post(`/servers/${SERVER_ID}/command`, { command });
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const restartServer = async () => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    await api.post(`/servers/${SERVER_ID}/power`, { signal: 'restart' });
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const stopServer = async () => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    await api.post(`/servers/${SERVER_ID}/power`, { signal: 'stop' });
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const startServer = async () => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    await api.post(`/servers/${SERVER_ID}/power`, { signal: 'start' });
    return true;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getServerDetails = async () => {
  try {
    if (!checkApiConfiguration()) {
      throw new Error(
        'Missing required environment variables for Pterodactyl API'
      );
    }
    const response = await api.get(`/servers/${SERVER_ID}`);
    return response.data.attributes;
  } catch (error) {
    throw handleApiError(error);
  }
};
