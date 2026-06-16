import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import LiveClock from '../../components/ui/LiveClock';
import useStore from '../../store/useStore';
import { socket } from '../../App';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <GlassCard className="p-6 flex items-center gap-4 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${colorClass} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-surface border border-white/5 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-muted text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
    </GlassCard>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaysRevenue: 0, totalCustomersToday: 0, completedServices: 0, pendingCustomers: 0
  });
  const [queue, setQueue] = useState([]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer Left');
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  
  const { user, shopSettings } = useStore();
  const token = user?.token;

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await fetch('http://localhost:5000/api/transactions/stats', { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      const queueRes = await fetch('http://localhost:5000/api/queue');
      const queueData = await queueRes.json();
      setQueue(queueData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('queue_updated', fetchData);
    socket.on('dashboard_updated', fetchData);
    
    return () => {
      socket.off('queue_updated', fetchData);
      socket.off('dashboard_updated', fetchData);
    };
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/queue/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
    } catch (err) { console.error(err); }
  };

  const handleCompleteService = async (id, amountCharged) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/complete/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amountCharged })
      });
    } catch (err) { console.error(err); }
  };

  const handleCancelService = async () => {
    if (!selectedQueueId) return;
    try {
      await fetch(`http://localhost:5000/api/transactions/cancel/${selectedQueueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cancelReason })
      });
      setIsCancelModalOpen(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Overview</h2>
          <p className="text-muted">Welcome back, here's what's happening today.</p>
        </div>
        <LiveClock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={`${shopSettings?.currency || '$'}${stats.todaysRevenue}`} icon={DollarSign} colorClass="text-primary" delay={0.1} />
        <StatCard title="Total Customers" value={stats.totalCustomersToday} icon={Users} colorClass="text-secondary" delay={0.2} />
        <StatCard title="Completed" value={stats.completedServices} icon={CheckCircle} colorClass="text-success" delay={0.3} />
        <StatCard title="In Queue" value={stats.pendingCustomers} icon={Clock} colorClass="text-[#3498db]" delay={0.4} />
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Live Queue</h3>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
            {queue.length} Waiting
          </span>
        </div>
        
        <Table>
          <Thead>
            <Tr>
              <Th>No.</Th>
              <Th>Customer</Th>
              <Th>Service</Th>
              <Th>Wait Time</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {queue.map((entry, index) => (
              <Tr key={entry._id}>
                <Td className="font-medium text-muted">#{index + 1}</Td>
                <Td className="font-bold text-white">{entry.customerName}</Td>
                <Td>
                  <div>
                    <p className="text-white">{entry.service?.name}</p>
                    <p className="text-xs text-muted">{shopSettings?.currency || '$'}{entry.service?.price}</p>
                  </div>
                </Td>
                <Td className="text-muted text-sm">
                  {formatDistanceToNow(new Date(entry.joinTime))}
                </Td>
                <Td>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    entry.status === 'serving' ? 'bg-success/20 text-success border border-success/20' : 'bg-surface border border-white/10 text-muted'
                  }`}>
                    {entry.status.toUpperCase()}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {entry.status === 'waiting' && (
                      <Button variant="primary" className="py-2 px-4 text-xs w-auto" onClick={() => handleUpdateStatus(entry._id, 'serving')}>
                        Start
                      </Button>
                    )}
                    {entry.status === 'serving' && (
                      <Button variant="primary" className="py-2 px-4 text-xs w-auto bg-success hover:bg-success/90 border-none" onClick={() => handleCompleteService(entry._id, entry.service.price)}>
                        Complete
                      </Button>
                    )}
                    <Button variant="secondary" className="py-2 px-4 text-xs w-auto hover:bg-danger/20 hover:text-danger hover:border-danger/30" onClick={() => {
                      setSelectedQueueId(entry._id);
                      setIsCancelModalOpen(true);
                    }}>
                      Remove
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
            {queue.length === 0 && (
              <Tr>
                <Td colSpan="6" className="text-center py-8 text-muted">No customers in queue.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </GlassCard>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Remove Customer">
        <div className="space-y-4">
          <p className="text-muted text-sm">Select a reason for removing this customer from the queue.</p>
          <select 
            className="input-field appearance-none bg-surface"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            <option>Customer Left</option>
            <option>Cancelled</option>
            <option>Duplicate Entry</option>
            <option>Other</option>
          </select>
          <Button onClick={handleCancelService} className="mt-4 bg-danger hover:bg-danger/90">
            Confirm Removal
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
