// src/components/UI/StatCard.tsx
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend} vs mois dernier
            </p>
          )}
        </div>
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};