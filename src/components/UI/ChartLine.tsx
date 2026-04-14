// src/components/UI/ChartLine.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartLineProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

export const ChartLine: React.FC<ChartLineProps> = ({ 
  data, 
  xKey, 
  yKey, 
  title, 
  color = '#3B82F6' 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};