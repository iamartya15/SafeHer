import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as guardianService from '../services/guardianService';
import {
  Users,
  UserPlus,
  Check,
  X,
  ShieldAlert,
  
  Clock,
  Compass,
  Mail,
  Loader2,
  Trash2,
  HeartHandshake,
  
  
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';
import { useAuth } from '../hooks/useAuth';
import { formatShortDateTime } from '../utils/dateFormatter';
import { useNotifications } from '../context/NotificationContext';

export const GuardianDashboard = () => {
  const { user, refreshSession } = useAuth();
  const { fetchNotifications } = useNotifications();
  const [monitoredUsers, setMonitoredUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [guardiansList, setGuardiansList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Use ref to keep track of loading state to avoid duplicate triggers
  const isLoadingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', relationship: 'Friend' }
  });

  const loadData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      // 1. Get wards monitored by this user
      const monitoredRes = await guardianService.getMonitoredUsers();
      if (monitoredRes.success) {
        setMonitoredUsers(monitoredRes.data || []);
      }

      // 2. Get requests received
      const requestsRes = await guardianService.getGuardianRequests();
      if (requestsRes.success) {
        setPendingRequests(requestsRes.data || []);
      }

      // 3. Get guardians this user has added
      const guardiansRes = await guardianService.getGuardians();
      if (guardiansRes.success) {
        setGuardiansList(guardiansRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load guardian dashboard data:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Visibility-aware lightweight polling implementation
  useEffect(() => {
    loadData();

    let intervalId = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadData();
        }
      }, 5000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
        startPolling();
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  // Add a ward/guardian connection
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await guardianService.addGuardian({
        email: data.email,
        relationship: data.relationship
      });
      if (res.success) {
        toast.success(res.message || 'Invitation sent successfully.');
        reset();
        loadData();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to send invite.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Respond to request (Approve/Reject)
  const handleRequestResponse = async (requestId, status) => {
    const toastId = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} request...`);
    try {
      const res = await guardianService.respondToRequest(requestId, status);
      if (res.success) {
        toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`, { id: toastId });
        if (status === 'approved' && refreshSession) {
          await refreshSession();
        }
        loadData();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request.', { id: toastId });
    }
  };

  // Remove connection / Cancel invite / Clean up history
  const handleRemoveConnection = async (connectionId, currentStatus) => {
    let confirmMsg = 'Are you sure you want to remove this guardian connection?';
    if (currentStatus === 'pending') confirmMsg = 'Are you sure you want to cancel this invitation?';
    if (['rejected', 'cancelled', 'removed'].includes(currentStatus)) confirmMsg = 'Are you sure you want to delete this log entry?';

    if (!window.confirm(confirmMsg)) return;

    const toastId = toast.loading('Processing request...');
    try {
      const res = await guardianService.removeGuardian(connectionId);
      if (res.success) {
        toast.success(res.message || 'Action completed successfully.', { id: toastId });
        loadData();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to process action.', { id: toastId });
    }
  };

  // Derived states
  const activeAlerts = monitoredUsers.filter(w => w.latestSos && w.latestSos.status === 'active');
  const connectedGuardians = guardiansList.filter(g => g.status === 'approved');
  const sentInvitations = guardiansList.filter(g => g.status !== 'approved');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>🛡️ Guardian Command Center</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Manage safety permissions, send invites, and monitor live emergency feeds.</p>
      </div>

      {/* 1. Emergency Alerts Header (Visible only when alerts are active) */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          {activeAlerts.map((ward) => {
            const mapsUrl = ward.latestSos.location?.coordinates
              ? `https://www.google.com/maps/search/?api=1&query=${ward.latestSos.location.coordinates[1]},${ward.latestSos.location.coordinates[0]}`
              : null;

            return (
              <div
                key={ward.connectionId}
                className="p-5 rounded-2xl border border-red-500 bg-red-950/20 shadow-2xl shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse duration-1000"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={getAvatarSrc(ward.user.avatar, ward.user.name)}
                      alt={ward.user.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
                      onError={(e) => {
                        e.target.src = getAvatarSrc('', ward.user.name);
                      }}
                    />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      {ward.user.name} <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">{ward.relationship}</span>
                    </h3>
                    <p className="text-xs text-red-300 font-semibold mt-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 fill-red-500/10" /> EMERGENCY ACTIVE (Battery: {ward.latestSos.batteryLevel}%)
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Triggered: {formatShortDateTime(ward.latestSos.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/30"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Route Maps</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (People you protect & connected guardians) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. People You Protect Section */}
          {true && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">People You Protect</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                {monitoredUsers.length} Wards
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-400" /> Loading monitored list...
              </div>
            ) : monitoredUsers.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl space-y-1 bg-slate-900/10">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="font-semibold text-slate-400">No wards linked under your care.</p>
                <p className="text-[10px] text-slate-600">Once a user invites you and you accept, their real-time safety status will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monitoredUsers.map((ward) => {
                  const isEmergency = ward.latestSos && ward.latestSos.status === 'active';
                  return (
                    <div
                      key={ward.connectionId}
                      className={`p-4 rounded-xl border transition-all ${
                        isEmergency
                          ? 'border-red-500/30 bg-red-950/5 shadow-md shadow-red-500/5'
                          : 'border-white/5 bg-slate-900/30 hover:bg-slate-900/50'
                      } flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarSrc(ward.user.avatar, ward.user.name)}
                          alt={ward.user.name}
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            isEmergency ? 'border-red-500 animate-pulse' : 'border-purple-500/20'
                          }`}
                          onError={(e) => {
                            e.target.src = getAvatarSrc('', ward.user.name);
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white max-w-[100px] truncate">{ward.user.name}</h4>
                            <span className="text-[8px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-400 font-bold uppercase">
                              {ward.relationship}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{ward.user.phone || 'No phone set'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEmergency ? (
                          <span className="text-[9px] font-extrabold text-red-400 animate-pulse uppercase bg-red-500/10 px-1.5 py-0.5 rounded">
                            ACTIVE SOS
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SAFE
                          </span>
                        )}

                        <button
                          onClick={() => handleRemoveConnection(ward.connectionId, 'approved')}
                          className="p-1.5 bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors border border-white/5"
                          title="Disconnect connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* B. Connected Guardians Section */}
          {(user?.role === 'user' || user?.role === 'admin') && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Your Connected Guardians</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                {connectedGuardians.length} Active
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-400" /> Loading guardians...
              </div>
            ) : connectedGuardians.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl space-y-1 bg-slate-900/10">
                <HeartHandshake className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="font-semibold text-slate-400">No active guardians added.</p>
                <p className="text-[10px] text-slate-600">Send an invitation to add a safety guardian who can track you in emergencies.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {connectedGuardians.map((guard) => (
                  <div
                    key={guard._id}
                    className="p-4 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarSrc(guard.guardianId?.avatar, guard.guardianEmail)}
                        alt={guard.guardianId?.name || guard.guardianEmail}
                        className="w-10 h-10 rounded-full object-cover border border-purple-500/20"
                        onError={(e) => {
                          e.target.src = getAvatarSrc('', guard.guardianEmail);
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white max-w-[100px] truncate">{guard.guardianId?.name || guard.guardianEmail}</h4>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-400 font-bold uppercase">
                            {guard.relationship}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{guard.guardianId?.phone || 'No phone set'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveConnection(guard._id, 'approved')}
                      className="p-1.5 bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors border border-white/5"
                      title="Remove guardian connection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* C. History Logs */}
          {true && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Emergency History Logs</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center text-slate-500 text-xs py-4">Loading logs...</div>
              ) : monitoredUsers.every(w => !w.latestSos) ? (
                <div className="text-center text-xs text-slate-500 border border-dashed border-white/5 p-6 rounded-xl">
                  No emergency alerts recorded.
                </div>
              ) : (
                monitoredUsers.filter(w => w.latestSos).map((w) => (
                  <div key={w.connectionId} className="p-3 bg-slate-950/20 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{w.user.name}</span>
                      <span className={`text-[9px] font-bold block mt-0.5 ${w.latestSos.status === 'active' ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                        SOS Status: {w.latestSos.status === 'active' ? 'Active Emergency' : 'Resolved'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block font-mono text-[10px]">Battery: {w.latestSos.batteryLevel}%</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{formatShortDateTime(w.latestSos.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

        </div>

        {/* Right Sidebar Columns (Requests, Invites, Sent requests) */}
        <div className="space-y-6">
          
          {/* A. Pending Requests Received */}
          {true && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold">
                  {pendingRequests.length} New
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center">Checking requests...</div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-white/5 rounded-xl">
                  No pending requests received.
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 bg-slate-900/20 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{req.userId?.name || 'Unknown User'}</h4>
                      <span className="text-[8px] text-purple-400 font-bold uppercase">{req.relationship}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleRequestResponse(req._id, 'approved')}
                        className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
                        title="Accept Invitation"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRequestResponse(req._id, 'rejected')}
                        className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                        title="Decline Request"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* B. Add Guardian Form */}
          {(user?.role === 'user' || user?.role === 'admin') && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Add safety guardian</h3>
              <p className="text-[10px] text-slate-400">Invite a guardian by their registered SafeHer account email.</p>
            </div>

            <form onSubmit={(e) => handleSubmit(onSubmit)(e)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="guardian@email.com"
                    className="glass-input pl-10 text-xs py-2 w-full"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && (
                  <span className="text-[9px] text-red-400 block">{errors.email.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relationship</label>
                <select
                  className="glass-input text-xs py-2 appearance-none bg-slate-950 w-full"
                  {...register('relationship', { required: true })}
                >
                  <option value="Friend">Friend</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Invite...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Send Guardian Invite</span>
                  </>
                )}
              </button>
            </form>
          </div>
          )}

          {/* C. Sent Invitations Status */}
          {(user?.role === 'user' || user?.role === 'admin') && (
            <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Sent Invitations Status</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-slate-500 text-[10px] text-center">Loading list...</div>
              ) : sentInvitations.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-white/5 rounded-xl">
                  No invitations sent yet.
                </p>
              ) : (
                sentInvitations.map((g) => (
                  <div
                    key={g._id}
                    className="p-3 bg-slate-900/20 border border-white/5 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate" title={g.guardianEmail}>
                        {g.guardianEmail}
                      </h4>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">{g.relationship}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                        g.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : g.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : g.status === 'cancelled'
                          ? 'bg-slate-500/10 text-slate-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {g.status}
                      </span>
                      
                      <button
                        onClick={() => handleRemoveConnection(g._id, g.status)}
                        className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title={g.status === 'pending' ? 'Cancel Invite' : 'Delete log'}
                      >
                        {g.status === 'pending' ? <X className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default GuardianDashboard;
