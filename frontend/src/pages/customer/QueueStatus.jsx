import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ArrowLeft } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import useStore from '../../store/useStore';
import { socket } from '../../App';

const QueueStatus = () => {
  const [queue, setQueue] = useState([]);
  const navigate = useNavigate();
  const customerName = localStorage.getItem('customerName');
  const { shopSettings } = useStore();

  const fetchQueue = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/queue');
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!customerName) {
      navigate('/');
      return;
    }

    fetchQueue();

    socket.on('queue_updated', fetchQueue);
    return () => {
      socket.off('queue_updated', fetchQueue);
    };
  }, [customerName, navigate]);

  // Calculate position and wait time
  const myIndex = queue.findIndex(q => q.customerName === customerName);
  const myEntry = myIndex !== -1 ? queue[myIndex] : null;
  const customersAhead = myIndex !== -1 ? myIndex : 0;
  
  // Sum of durations of people ahead
  const estimatedWait = queue.slice(0, myIndex).reduce((acc, curr) => acc + (curr.service?.duration || 0), 0);

  // If customer is no longer in queue (completed or cancelled)
  if (queue.length > 0 && !myEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-primary mb-4">Service Completed!</h2>
          <p className="text-muted mb-6">Your session has been marked as finished or removed.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('customerName');
              navigate('/');
            }}
            className="btn-primary"
          >
            Go to Home
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
        <button onClick={() => navigate('/')} className="text-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">{shopSettings?.shopName}</h1>
        <div className="w-6" /> {/* spacer */}
      </div>

      <GlassCard className="w-full max-w-md p-8 z-10 text-center relative overflow-hidden">
        {/* Glow effect inside card */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
        
        <h2 className="text-lg text-muted mb-2">Hello, <span className="text-white font-semibold">{customerName}</span></h2>
        
        {myEntry?.status === 'serving' ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-10"
          >
            <h1 className="text-5xl font-bold text-primary mb-4">It's Your Turn!</h1>
            <p className="text-xl text-white">Please head to the barber chair.</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted mb-8">Your current status in the queue</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-background/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
                <Users className="text-secondary mb-2" size={28} />
                <span className="text-4xl font-bold text-white mb-1">{customersAhead}</span>
                <span className="text-xs text-muted uppercase tracking-wider">Ahead of You</span>
              </div>
              
              <div className="bg-background/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
                <Clock className="text-primary mb-2" size={28} />
                <span className="text-4xl font-bold text-white mb-1">{estimatedWait}</span>
                <span className="text-xs text-muted uppercase tracking-wider">Mins Wait</span>
              </div>
            </div>

            <div className="text-sm text-muted">
              Service: <span className="text-white font-medium">{myEntry?.service?.name}</span>
            </div>
          </>
        )}
      </GlassCard>

      {/* Live Queue list for transparency */}
      <div className="w-full max-w-md mt-10 z-10">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4 px-2">Live Queue</h3>
        <div className="space-y-3">
          {queue.map((entry, index) => (
            <motion.div 
              key={entry._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border flex items-center justify-between ${entry.customerName === customerName ? 'bg-primary/10 border-primary/30' : 'bg-surface/50 border-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.status === 'serving' ? 'bg-success text-white' : 'bg-surface border border-white/10 text-muted'}`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{entry.customerName === customerName ? 'You' : entry.customerName}</p>
                  <p className="text-xs text-muted">{entry.service?.name}</p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-background/80 text-muted border border-white/5">
                {entry.status === 'serving' ? <span className="text-success">Serving</span> : 'Waiting'}
              </div>
            </motion.div>
          ))}
          {queue.length === 0 && <p className="text-center text-muted text-sm py-4">Queue is empty</p>}
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
