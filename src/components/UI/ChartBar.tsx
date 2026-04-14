// src/components/UI/ChartBar.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartBarProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

export const ChartBar: React.FC<ChartBarProps> = ({ 
  data, 
  xKey, 
  yKey, 
  title, 
  color = '#10B981' 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};