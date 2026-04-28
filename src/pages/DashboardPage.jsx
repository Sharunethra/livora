import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Activity
} from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendType }) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-indigo-400">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          trendType === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const DashboardPage = () => {
  // Placeholder stats
  const stats = {
    totalResidents: 1248,
    activeComplaints: 12,
    availableFlats: 45,
    monthlyRevenue: "$52,400",
    maintenancePending: 8,
    visitorCount: 154
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Welcome */}
      <div className="relative overflow-hidden glass-card p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Good Morning, Admin! 👋</h1>
          <p className="text-slate-300 max-w-xl">
            Here's what's happening in your society today. You have <span className="text-indigo-400 font-bold">12 open complaints</span> and <span className="text-indigo-400 font-bold">8 maintenance requests</span> to attend to.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-20 -mt-20 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Residents" value={stats.totalResidents} icon={Users} trend="+4.5%" trendType="up" />
        <StatsCard title="Open Complaints" value={stats.activeComplaints} icon={AlertCircle} trend="-2" trendType="up" />
        <StatsCard title="Available Flats" value={stats.availableFlats} icon={Home} />
        <StatsCard title="Visitor Today" value={stats.visitorCount} icon={Activity} trend="+12%" trendType="up" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Complaints</h2>
              <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">Water Leakage in Wing B-402</h4>
                    <p className="text-sm text-slate-400">Reported by Rajesh Kumar • 2 hours ago</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-full">HIGH</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Active Notices</h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Announcement</span>
                  <h4 className="text-white font-medium mt-1">Elevator Maintenance - Wing A</h4>
                  <p className="text-sm text-slate-400 mt-2">The elevators in Wing A will be under maintenance from 10 PM to 4 AM...</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 transition-all font-medium text-sm">
              Post New Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
