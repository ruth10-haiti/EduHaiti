// src/components/UI/ChartPie.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartPieProps {
  data: any[];
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const ChartPie: React.FC<ChartPieProps> = ({ 
  data, 
  title, 
  colors = DEFAULT_COLORS 
}) => {
  // Vérifier si data est vide
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="text-center text-gray-500 py-12">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              // Vérifier que percent existe avant de l'utiliser
              if (percent === undefined) return name;
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};