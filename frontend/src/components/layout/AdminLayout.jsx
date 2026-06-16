import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, Settings as SettingsIcon, LogOut } from 'lucide-react';
import useStore from '../../store/useStore';

const AdminLayout = () => {
  const { logout, shopSettings } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/admin/transactions', icon: History },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold text-primary">{shopSettings?.shopName || 'TrimFlow'}</h1>
          <p className="text-xs text-muted uppercase tracking-wider mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'text-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-danger hover:bg-danger/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface border-b border-white/5 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">{shopSettings?.shopName}</h1>
          <button onClick={handleLogout} className="text-danger">
            <LogOut size={24} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
