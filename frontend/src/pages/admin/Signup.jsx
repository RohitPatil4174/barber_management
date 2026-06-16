import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useStore from '../../store/useStore';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <GlassCard className="w-full max-w-md p-8 z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg">
            <UserPlus className="text-secondary" size={28} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Create Admin Account</h2>
        <p className="text-center text-muted mb-8">Set up your shop management</p>

        {error && <div className="mb-4 text-danger text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
            <Input 
              type="email" 
              placeholder="admin@trimflow.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Confirm Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-4" variant="secondary">
            {loading ? 'Creating...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/admin/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Signup;
