import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { API } from "../App";

const ManagerDashboard = () => {
  const { user, logout, token } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState({ show: false, leave: null, action: "" });
  const [comments, setComments] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPendingLeaves();
    fetchCalendar();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get(`${API}/leaves/pending`, { headers });
      setPendingLeaves(res.data);
    } catch (err) {
      console.error("Error fetching pending leaves:", err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.get(`${API}/leaves/calendar`, { headers });
      setCalendar(res.data.calendar || []);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  const handleAction = async (leaveId, action) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = action === "approve" ? "approve" : "reject";
      await axios.put(`${API}/leaves/${leaveId}/${endpoint}`, { comments }, { headers });
      setSuccess(`Leave ${action}d successfully!`);
      setActionModal({ show: false, leave: null, action: "" });
      setComments("");
      fetchPendingLeaves();
      fetchCalendar();
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} leave`);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = {
    cl: { name: "Casual Leave", color: "bg-blue-100 text-blue-800" },
    el: { name: "Earned Leave", color: "bg-green-100 text-green-800" },
    sl: { name: "Sick Leave", color: "bg-purple-100 text-purple-800" },
    wfh: { name: "Work From Home", color: "bg-amber-100 text-amber-800" },
    compensatory: { name: "Compensatory", color: "bg-pink-100 text-pink-800" }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome, {user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Approvals ({pendingLeaves.length})</h3>
          {pendingLeaves.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No pending leave requests</p>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-slate-900">{leave.employee_name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypes[leave.leave_type].color}`}>
                          {leave.leave_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p><span className="font-medium">Duration:</span> {leave.start_date} to {leave.end_date} ({leave.days_count} days)</p>
                        <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                        <p><span className="font-medium">Applied:</span> {new Date(leave.applied_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActionModal({ show: true, leave, action: "approve" })}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setActionModal({ show: true, leave, action: "reject" })}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Leave Calendar */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Team Leave Calendar</h3>
          {calendar.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No approved leaves</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calendar.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{entry.employee_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypes[entry.leave_type].color}`}>
                          {entry.leave_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.start_date}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.end_date}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.days_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {actionModal.action === "approve" ? "Approve" : "Reject"} Leave Request
            </h3>
            <div className="mb-4 text-sm text-slate-600">
              <p className="mb-2"><span className="font-medium">Employee:</span> {actionModal.leave?.employee_name}</p>
              <p className="mb-2"><span className="font-medium">Type:</span> {actionModal.leave?.leave_type.toUpperCase()}</p>
              <p className="mb-2"><span className="font-medium">Duration:</span> {actionModal.leave?.start_date} to {actionModal.leave?.end_date}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Comments (Optional)</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your comments..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction(actionModal.leave?.id, actionModal.action)}
                disabled={loading}
                className={`flex-1 px-4 py-3 ${actionModal.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} disabled:opacity-50 text-white font-semibold rounded-lg transition-colors`}
              >
                {loading ? "Processing..." : `Confirm ${actionModal.action === "approve" ? "Approval" : "Rejection"}`}
              </button>
              <button
                onClick={() => {
                  setActionModal({ show: false, leave: null, action: "" });
                  setComments("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
