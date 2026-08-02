import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import useStore from '../../store/useStore';

const Analytics = () => {
  const [data, setData] = useState({ revenueByDay: [], servicePopularity: [] });
  const { user, shopSettings } = useStore();

  useEffect(() => {
    fetch('https://barber-management-backend.onrender.com/api/transactions/analytics', {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, [user]);

  const COLORS = ['#D4AF37', '#CD7F32', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h2>
        <p className="text-muted">Business performance insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Last 7 Days</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#A0A0A0" tick={{fill: '#A0A0A0'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#A0A0A0" tick={{fill: '#A0A0A0'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${shopSettings?.currency || '$'}${value}`} />
                <Tooltip 
                  cursor={{fill: '#222'}} 
                  contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Service Popularity</h3>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.servicePopularity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.servicePopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {data.servicePopularity.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-muted">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
