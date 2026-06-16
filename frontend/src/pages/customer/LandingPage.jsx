import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useStore from '../../store/useStore';
import { Scissors } from 'lucide-react';

const LandingPage = () => {
  const [name, setName] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { shopSettings } = useStore();

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    if (!name || !selectedService) {
      setError('Please enter your name and select a service.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, serviceId: selectedService }),
      });

      if (response.ok) {
        // Assume user's identity is tied to this local storage for demo purposes
        // In real app, we might use a session or local storage ID to track their specific entry
        localStorage.setItem('customerName', name);
        navigate('/queue');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to join queue.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elegant decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="mb-10 text-center z-10"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-surface rounded-full shadow-[0_0_30px_rgba(212,175,55,0.15)] border border-primary/20">
             <Scissors size={40} className="text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          {shopSettings?.shopName || 'TrimFlow'}
        </h1>
        <p className="text-muted text-lg tracking-wide">Premium Barbershop Experience</p>
      </motion.div>

      <GlassCard className="w-full max-w-md p-8 z-10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Join the Queue</h2>
        
        {error && <div className="mb-4 text-danger text-sm text-center">{error}</div>}

        <form onSubmit={handleJoinQueue} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Your Name</label>
            <Input 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Select Service</label>
            <div className="relative">
              <select 
                className="input-field appearance-none"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
              >
                <option value="" disabled>Choose a service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id} className="bg-surface">
                    {service.name} - {shopSettings?.currency || '$'}{service.price}
                  </option>
                ))}
              </select>
              {/* Custom arrow for select */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                ▼
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-4">
            {loading ? 'Joining...' : 'Join Queue Instantly'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default LandingPage;
