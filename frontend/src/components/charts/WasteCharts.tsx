import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ForecastPoint } from '../../types';

const COLORS = ['#059669', '#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface CategoryDonutProps {
  data: Array<{ category: string; weight_kg: number; pct: number }>;
}

export const CategoryDonutChart: React.FC<CategoryDonutProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="weight_kg"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value} kg`, 'Weight']}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.5rem' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ForecastChartProps {
  data: ForecastPoint[];
}

export const ForecastingChart: React.FC<ForecastChartProps> = ({ data }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} unit=" kg" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.5rem' }} />
          <Legend />
          <Area type="monotone" dataKey="upper_bound_kg" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBound)" name="Upper Confidence Bound" />
          <Area type="monotone" dataKey="predicted_weight_kg" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorPred)" name="ML Forecast (kg)" />
          <Area type="monotone" dataKey="lower_bound_kg" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBound)" name="Lower Bound" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
