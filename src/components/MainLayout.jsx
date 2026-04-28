import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ShieldAlert, 
  Wrench, 
  MessageSquare, 
  Bell, 
  CreditCard,
  LogOut
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'group-hover:text-white'} />
    <span className="font-medium">{label}</span>
  </Link>
);

const MainLayout = () => {
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/societies', icon: Building2, label: 'Societies' },
    { to: '/residents', icon: Users, label: 'Residents' },
    { to: '/complaints', icon: ShieldAlert, label: 'Complaints' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 mr-0 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            LIVORA
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 px-4 py-2 glass-card rounded-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {menuItems.find(i => i.to === location.pathname)?.label || 'Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="px-4 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
