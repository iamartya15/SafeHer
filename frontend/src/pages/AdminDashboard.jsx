import { useState, useEffect } from 'react';
import * as adminService from '../services/adminService';
import * as incidentService from '../services/incidentService';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  Activity,
  Trash2,
  Edit2,
  CheckCircle,
  Loader2,
  PieChart,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, reports, sos

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Stats
      const statsRes = await adminService.getAdminStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // Load Users
      const usersRes = await adminService.getAdminUsers();
      if (usersRes.success) {
        setUsers(usersRes.users);
      }

      // Load Reports
      const reportsRes = await incidentService.getIncidents();
      if (reportsRes.success) {
        setIncidents(reportsRes.reports);
      }

      // Load SOS Logs
      const sosRes = await adminService.getSOSLogs();
      if (sosRes.success) {
        setSosLogs(sosRes.logs);
      }
    } catch (err) {
      console.error('Failed to load admin logs:', err);
      toast.error('Failed to load admin controls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId, currentRole, newRole) => {
    if (currentRole === newRole) return;
    const toastId = toast.loading('Updating user role...');
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(res.message, { id: toastId });
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update role.', { id: toastId });
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this incident report? This action is permanent.')) return;
    const toastId = toast.loading('Deleting incident report...');
    try {
      const res = await adminService.deleteFakeReport(reportId);
      if (res.success) {
        toast.success('Report deleted successfully.', { id: toastId });
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Admin Moderation Command</span>
          <span className="text-xs px-2 py-0.5 rounded bg-fuchsia-600/30 border border-fuchsia-500/30 text-fuchsia-300 font-bold uppercase tracking-wider">
            Superuser
          </span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Audit active alarms, moderate community updates, and change permissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
        {[
          { id: 'stats', label: 'Dashboard Statistics', icon: PieChart },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'reports', label: 'Incident Moderator', icon: AlertTriangle },
          { id: 'sos', label: 'Emergency SOS Logs', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                activeTab === tab.id
                  ? 'border-purple-500 bg-purple-500/5 text-purple-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading admin control variables...
        </div>
      ) : (
        <div className="fade-in">
          
          {/* STATS TAB */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { value: stats.totalUsers, label: 'Registered Accounts', desc: 'Total accounts registered', icon: Users, color: 'text-purple-400' },
                  { value: stats.totalReports, label: 'Incident Reports', desc: 'Community reported incidents', icon: AlertTriangle, color: 'text-orange-400' },
                  { value: stats.totalSos, label: 'Emergency Alerts', desc: 'Total SOS signals generated', icon: ShieldAlert, color: 'text-rose-400' },
                  { value: stats.activeSos, label: 'Active Alarms', desc: 'Awaiting resolution state', icon: Activity, color: 'text-red-400 animate-pulse' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="glass-card rounded-2xl p-6 border border-white/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                          <span className="text-3xl font-extrabold text-white mt-1 block">{stat.value}</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4">{stat.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Incidents by Category */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h3 className="text-base font-bold text-white">Incidents Category Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  {Object.entries(stats.categories).map(([category, val]) => (
                    <div key={category} className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 font-medium block truncate">{category}</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-slate-900/60">
                <h3 className="text-sm font-bold text-white">Registered Users List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-3">Profile</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Verified</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={getAvatarSrc(u.avatar, u.name)}
                            className="w-8 h-8 rounded-full object-cover border border-purple-500/20"
                            onError={(e) => { e.target.src = getAvatarSrc('', u.name); }}
                          />
                          <span className="font-bold text-white">{u.name}</span>
                        </td>
                        <td className="px-6 py-4 font-mono">{u.email}</td>
                        <td className="px-6 py-4 font-mono">{u.phone || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {u.isVerified ? 'YES' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-fuchsia-500/10 text-fuchsia-400' : u.role === 'guardian' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700/30 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, u.role, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500 text-[11px]"
                          >
                            <option value="user">User</option>
                            <option value="guardian">Guardian</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-slate-900/60">
                <h3 className="text-sm font-bold text-white">Report Moderation Dashboard</h3>
              </div>
              
              {incidents.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No incident reports available to moderate.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3">Incident ID</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Location Address</th>
                        <th className="px-6 py-3">Media</th>
                        <th className="px-6 py-3 text-right">Moderator Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {incidents.map((rep) => (
                        <tr key={rep._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{rep._id}</td>
                          <td className="px-6 py-4 font-bold text-red-400">{rep.category}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{rep.description}</td>
                          <td className="px-6 py-4 font-mono">{rep.address}</td>
                          <td className="px-6 py-4">
                            {rep.image ? (
                              <a href={rep.image} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                                View Image
                              </a>
                            ) : (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteReport(rep._id)}
                              className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                              title="Delete Fake Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SOS TAB */}
          {activeTab === 'sos' && (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-slate-900/60">
                <h3 className="text-sm font-bold text-white">System Emergency SOS History</h3>
              </div>
              
              {sosLogs.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No emergency alarms logged in the system.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3">Ward Name</th>
                        <th className="px-6 py-3">Coordinates</th>
                        <th className="px-6 py-3">Battery Status</th>
                        <th className="px-6 py-3">Device OS / Platform</th>
                        <th className="px-6 py-3">Alert Status</th>
                        <th className="px-6 py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {sosLogs.map((log) => {
                        const mapsUrl = log.location?.coordinates
                          ? `https://www.google.com/maps/search/?api=1&query=${log.location.coordinates[1]},${log.location.coordinates[0]}`
                          : null;

                        return (
                          <tr key={log._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold text-white">{log.userId?.name || 'Deleted Account'}</td>
                            <td className="px-6 py-4">
                              {mapsUrl ? (
                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline font-mono">
                                  {log.location.coordinates[1].toFixed(5)}, {log.location.coordinates[0].toFixed(5)}
                                </a>
                              ) : (
                                <span className="text-slate-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono">{log.batteryLevel}%</td>
                            <td className="px-6 py-4 font-mono text-[11px] truncate max-w-xs">
                              {log.browserInfo?.platform || 'Unknown'} - {log.browserInfo?.userAgent || 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'active' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700/30 text-slate-400'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
