import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Home, 
  AlertCircle, 
  TrendingUp,
  Activity,
  CreditCard,
  Wrench,
  Calendar,
  Bell
} from 'lucide-react';
import api from '../services/api';

const StatsCard = ({ title, value, icon: Icon, trend, trendType, isLoading }) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-indigo-400">
        <Icon size={24} />
      </div>
      {trend && !isLoading && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          trendType === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    {isLoading ? (
      <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
    ) : (
      <p className="text-2xl font-bold text-white">{value}</p>
    )}
  </div>
);

const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
    refetchInterval: 30000 // refresh every 30s
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Welcome */}
      <div className="relative overflow-hidden glass-card p-8 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Good Morning, {user.name || 'Admin'}! 👋</h1>
          <p className="text-slate-300 max-w-xl">
            {isLoading ? 'Fetching latest society metrics...' : (
              <>
                There are <span className="text-indigo-400 font-bold">{stats?.openComplaints} open complaints</span> and <span className="text-indigo-400 font-bold">{stats?.pendingMaintenance} maintenance requests</span> to attend to.
              </>
            )}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-20 -mt-20 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Residents" 
          value={stats?.totalResidents} 
          icon={Users} 
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Monthly Revenue" 
          value={`₹${Number(stats?.monthlyRevenue).toLocaleString()}`} 
          icon={CreditCard} 
          trendType="up"
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Open Complaints" 
          value={stats?.openComplaints} 
          icon={AlertCircle} 
          isLoading={isLoading} 
        />
        <StatsCard 
          title="Pending Maintenance" 
          value={stats?.pendingMaintenance} 
          icon={Wrench} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Secondary Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           <StatsCard 
            title="Available Flats" 
            value={stats?.availableFlats} 
            icon={Home} 
            isLoading={isLoading} 
          />
           <StatsCard 
            title="Active Bookings" 
            value={stats?.activeBookings} 
            icon={Calendar} 
            isLoading={isLoading} 
          />
          
          <div className="md:col-span-2 glass-card p-6">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <Activity className="text-slate-500" size={20} />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />)
              ) : stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'COMPLAINT' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      <Activity size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">New {activity.type} from {activity.resident_name}</h4>
                      <p className="text-[10px] text-slate-500">{new Date(activity.date).toLocaleDateString()} • ID: {activity.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activity.status === 'OPEN' || activity.status === 'PENDING' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 italic">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notices */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Latest Notices</h2>
              <Bell className="text-indigo-400" size={20} />
            </div>
            <div className="space-y-4">
              {isLoading ? (
                [1,2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />)
              ) : stats?.recentNotices?.length > 0 ? (
                stats.recentNotices.map((notice) => (
                  <div key={notice.notice_id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors group">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {new Date(notice.notice_date).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-slate-300 mt-2 line-clamp-3 group-hover:text-white transition-colors">
                      {notice.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">No active notices</div>
              )}
            </div>
            <button className="w-full mt-6 py-2 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 hover:text-indigo-400 hover:border-indigo-500/30 transition-all font-medium text-sm">
              View All Notices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
