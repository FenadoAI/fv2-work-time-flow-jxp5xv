import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { API } from "../App";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "cl",
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const res = await axios.get(`${API}/leaves/balance`, { headers });
      setLeaveBalance(res.data);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get(`${API}/leaves/my-requests`, { headers });
      setLeaveRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(`${API}/leaves/apply`, formData, { headers });
      setSuccess("Leave request submitted successfully!");
      setFormData({ leave_type: "cl", start_date: "", end_date: "", reason: "" });
      setShowForm(false);
      fetchLeaveBalance();
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit leave request");
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

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Employee Dashboard</h1>
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

        {/* Leave Balance Cards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Leave Balance</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              {showForm ? "Cancel" : "+ Apply for Leave"}
            </button>
          </div>

          {leaveBalance && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(leaveBalance).map(([type, balance]) => (
                <div key={type} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${leaveTypes[type].color}`}>
                    {type.toUpperCase()}
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{balance}</div>
                  <div className="text-sm text-slate-600 mt-1">{leaveTypes[type].name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Application Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
                  <select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {Object.entries(leaveTypes).map(([type, info]) => (
                      <option key={type} value={type}>{info.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                  <input
                    type="text"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for leave"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* Leave Request History */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Leave Request History</h3>
          {leaveRequests.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No leave requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypes[request.leave_type].color}`}>
                          {request.leave_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{request.start_date}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{request.end_date}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{request.days_count}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{request.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[request.status]}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{request.comments || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
