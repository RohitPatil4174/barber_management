import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import useStore from '../../store/useStore';
import { Trash2, Edit } from 'lucide-react';

const Settings = () => {
  const { user, shopSettings, setShopSettings } = useStore();
  const [services, setServices] = useState([]);
  
  // Settings Form State
  const [shopName, setShopName] = useState('');
  const [currency, setCurrency] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    if (shopSettings) {
      setShopName(shopSettings.shopName);
      setCurrency(shopSettings.currency);
    }
    fetchServices();
  }, [shopSettings]);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      const data = await res.json();
      setServices(data);
    } catch (err) { console.error(err); }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ shopName, currency })
      });
      const data = await res.json();
      setShopSettings(data);
    } catch (err) { console.error(err); }
    setSavingSettings(false);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setAddingService(true);
    try {
      await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: newServiceName, price: newServicePrice, duration: newServiceDuration })
      });
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDuration('');
      fetchServices();
    } catch (err) { console.error(err); }
    setAddingService(false);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetch(`http://localhost:5000/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchServices();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">Settings</h2>
        <p className="text-muted">Manage your shop preferences and services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* General Settings */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Shop Name</label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Currency Symbol</label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} required />
              </div>
              <Button type="submit" disabled={savingSettings}>
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="p-6 border border-danger/30">
            <h3 className="text-xl font-bold text-danger mb-2">Danger Zone</h3>
            <p className="text-muted text-sm mb-4">Actions here are irreversible.</p>
            <Button variant="secondary" className="w-full text-danger border-danger/30 hover:bg-danger/10">
              Clear All Transactions
            </Button>
          </GlassCard>
        </div>

        {/* Services Management */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Add New Service</h3>
            <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Service Name</label>
                <Input placeholder="E.g. Fade Cut" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Price</label>
                <Input type="number" placeholder="25" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Duration (mins)</label>
                <Input type="number" placeholder="30" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} required />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={addingService}>
                  {addingService ? 'Adding...' : 'Add Service'}
                </Button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Manage Services</h3>
            </div>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Price</Th>
                  <Th>Duration</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {services.map(service => (
                  <Tr key={service._id}>
                    <Td className="font-medium text-white">{service.name}</Td>
                    <Td className="text-muted">{currency}{service.price}</Td>
                    <Td className="text-muted">{service.duration} mins</Td>
                    <Td>
                      <button onClick={() => handleDeleteService(service._id)} className="text-danger hover:text-danger/80 transition-colors p-2">
                        <Trash2 size={18} />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Settings;
