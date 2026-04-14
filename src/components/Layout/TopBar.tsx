// src/components/Layout/TopBar.tsx
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
};