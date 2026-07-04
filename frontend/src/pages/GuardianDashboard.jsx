import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as guardianService from '../services/guardianService';
import {
  Users,
  UserPlus,
  Check,
  X,
  ShieldAlert,
  MapPin,
  Clock,
  Compass,
  Mail,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvatarSrc } from '../utils/avatar';

export const GuardianDashboard = () => {
  const [monitoredUsers, setMonitoredUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [guardiansList, setGuardiansList] = useState([]); // Wards added by current user
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', relationship: 'Friend' }
  });

  const loadData = async () => {
    try {
      // 1. Get wards monitored by this user
      const monitoredRes = await guardianService.getMonitoredUsers();
      if (monitoredRes.success) {
        setMonitoredUsers(monitoredRes.monitoredUsers);
      }

      // 2. Get requests received
      const requestsRes = await guardianService.getGuardianRequests();
      if (requestsRes.success) {
        setPendingRequests(requestsRes.requests);
      }

      // 3. Get guardians this user has added (if any, in case they also want to see their own status)
      const guardiansRes = await guardianService.getGuardians();
      if (guardiansRes.success) {
        setGuardiansList(guardiansRes.guardians);
      }
    } catch (err) {
      console.error('Failed to load guardian dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add a ward/guardian connection
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await guardianService.addGuardian({
        email: data.email,
        relationship: data.relationship
      });
      if (res.success) {
        toast.success(res.message);
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

  // Respond to request
  const handleRequestResponse = async (requestId, status) => {
    const toastId = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} request...`);
    try {
      const res = await guardianService.respondToRequest(requestId, status);
      if (res.success) {
        toast.success(`Request ${status} successfully.`, { id: toastId });
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request.', { id: toastId });
    }
  };

  // Remove connection
  const handleRemoveConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    const toastId = toast.loading('Removing connection...');
    try {
      const res = await guardianService.removeGuardian(connectionId);
      if (res.success) {
        toast.success('Connection removed.', { id: toastId });
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove connection.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Guardian Command Center
        </h1>
        <p className="text-slate-400 text-xs mt-1">Manage safety permissions and monitor ward alerts in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monitored Wards List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Wards Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Users Under Your Care</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-1.5" /> Loading monitored wards...
              </div>
            ) : monitoredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-xl">
                No users currently share their safety updates with you. Add a ward using the invite panel.
              </div>
            ) : (
              <div className="space-y-4">
                {monitoredUsers.map((ward) => {
                  const hasActiveSos = ward.latestSos && ward.latestSos.status === 'active';
                  const mapsUrl = ward.latestSos && ward.latestSos.location?.coordinates
                    ? `https://www.google.com/maps/search/?api=1&query=${ward.latestSos.location.coordinates[1]},${ward.latestSos.location.coordinates[0]}`
                    : null;

                  return (
                    <div
                      key={ward.connectionId}
                      className={`p-4 rounded-xl border transition-all ${
                        hasActiveSos
                          ? 'border-red-500 bg-red-950/10 shadow-lg shadow-red-500/5'
                          : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Profile Info */}
                        <div className="flex items-center gap-3">
                          <img
                              src={getAvatarSrc(ward.user.avatar, ward.user.name)}
                            alt={ward.user.name}
                            className={`w-12 h-12 rounded-full object-cover border-2 ${
                              hasActiveSos ? 'border-red-500 animate-pulse' : 'border-purple-500/30'
                            }`}
                            onError={(e) => {
                                e.target.src = getAvatarSrc('', ward.user.name);
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{ward.user.name}</h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold uppercase tracking-wider">
                                {ward.relationship}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{ward.user.phone || 'No phone set'}</p>
                          </div>
                        </div>

                        {/* Location / SOS Alerts */}
                        <div className="flex flex-wrap items-center gap-2">
                          {hasActiveSos ? (
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold animate-pulse">
                                <ShieldAlert className="w-4 h-4 fill-red-500/10" /> EMERGENCY ACTIVE
                              </span>
                              {mapsUrl && (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-danger text-xs py-2 px-4 flex items-center gap-1"
                                >
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>Route Maps</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 justify-end">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                No Active Alerts
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-1">
                                Last checked: {ward.latestSos ? new Date(ward.latestSos.createdAt).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleRemoveConnection(ward.connectionId)}
                            className="p-2 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors ml-2"
                            title="Remove connection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                      {/* Display battery details if active alert */}
                      {hasActiveSos && (
                        <div className="mt-3 pt-3 border-t border-red-500/20 grid grid-cols-2 gap-4 text-xs text-slate-300">
                          <div>
                            <span className="text-red-400 font-semibold">Battery:</span> {ward.latestSos.batteryLevel}%
                          </div>
                          <div className="text-right text-[10px] text-slate-400">
                            Triggered: {new Date(ward.latestSos.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Emergency History Logs for Guard Wards */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Emergency History Logs</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center text-slate-500 text-xs py-4">Loading history...</div>
              ) : monitoredUsers.every(w => !w.latestSos) ? (
                <div className="text-center text-xs text-slate-500 border border-dashed border-white/5 p-4 rounded-lg">
                  No emergency histories recorded.
                </div>
              ) : (
                monitoredUsers.filter(w => w.latestSos).map((w) => (
                  <div key={w.connectionId} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{w.user.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        SOS Resolved status
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block font-mono">Battery: {w.latestSos.batteryLevel}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(w.latestSos.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Column: Invites & Requests */}
        <div className="space-y-6">
          
          {/* Pending Invitations Received */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Pending Requests Received</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center">Checking invites...</div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-white/5 rounded-xl">
                  No pending guardian requests.
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{req.userId?.name || 'Unknown User'}</h4>
                      <span className="text-[9px] text-purple-400 font-semibold uppercase">{req.relationship}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleRequestResponse(req._id, 'approved')}
                        className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRequestResponse(req._id, 'rejected')}
                        className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                        title="Reject"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Ward Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Add a Guardian Link</h3>
              <p className="text-[10px] text-slate-400">Add safety contacts by their SafeHer account emails.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="guardian@email.com"
                    className="glass-input pl-10 text-xs py-2"
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
                  className="glass-input text-xs py-2 appearance-none bg-slate-900"
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
                className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
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

          {/* Guardians/Wards You Added (Sent Invites) */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Sent Invitations Status</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-slate-500 text-[10px] text-center">Loading list...</div>
              ) : guardiansList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-white/5 rounded-xl">
                  No sent requests.
                </p>
              ) : (
                guardiansList.map((g) => (
                  <div
                    key={g._id}
                    className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{g.guardianEmail}</h4>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{g.relationship}</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      g.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : g.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default GuardianDashboard;
