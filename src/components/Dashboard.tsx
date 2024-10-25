import React, { useEffect, useState } from 'react';
import { Server, Activity, PersonStandingIcon, CpuIcon, MemoryStickIcon, UserIcon } from 'lucide-react';
import { getServerStatus, getServerUtilization } from '../services/api';

interface ServerStatusData {
  sname: string;
  players: string;
  maxplayers: string;
  map: string;
  version: string;
  modstotal: string;
}

interface ServerUtilization {
  utilization: {
    current_state: string;
    resources: {
      cpu_absolute: number;
      memory_bytes: number;
      disk_bytes: number;
      uptime: number;
    };
  };
  limits: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-blue-100 mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  </div>
);

const formatBytes = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatUptime = (miliseconds: number): string => {
  const seconds = Math.floor(miliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
};

export const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [utilization, setUtilization] = useState<ServerUtilization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statusData, utilizationData] = await Promise.all([
          getServerStatus(),
          getServerUtilization()
        ]);
        setStatus(statusData);
        setUtilization(utilizationData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch server data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Server Status"
          value={utilization?.utilization.current_state || 'Unknown'}
          icon={<Server className={utilization?.utilization.current_state === 'running' ? 'text-green-500' : 'text-red-500'} size={24} />}
        />
        <DashboardCard
          title="Players"
          value={status ? `${status.players}/${status.maxplayers}` : 'Unknown'}
          icon={<UserIcon className="text-blue-500" size={24} />}
        />
        <DashboardCard
          title="CPU Usage"
          value={utilization ? `${utilization.utilization.resources.cpu_absolute.toFixed(1)}%` : 'Unknown'}
          icon={<CpuIcon className="text-purple-500" size={24} />}
        />
        <DashboardCard
          title="Memory Usage"
          value={utilization ? formatBytes(utilization.utilization.resources.memory_bytes) : 'Unknown'}
          icon={<MemoryStickIcon className="text-yellow-500" size={24} />}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Server Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{status?.sname || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Map:</span>
              <span className="font-medium">{status?.map.split('/')[2] || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">{status?.version || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mods:</span>
              <span className="font-medium">{status?.modstotal || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">
                {utilization ? formatUptime(utilization.utilization.resources.uptime) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Limits</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">CPU Limit:</span>
              <span className="font-medium">{utilization?.limits.cpu || 'Unknown'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Memory Limit:</span>
              <span className="font-medium">
                {utilization ? formatBytes(utilization.limits.memory * 1024 * 1024) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disk Limit:</span>
              <span className="font-medium">
                {utilization ? formatBytes(utilization.limits.disk * 1024 * 1024) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};