import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { API } from "../App";

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [report, setReport] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, user: null, type: "" });
  const [editValue, setEditValue] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchUsers();
    fetchReport();
    fetchCalendar();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { headers });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${API}/leaves/report`, { headers });
      setReport(res.data.report || []);
    } catch (err) {
      console.error("Error fetching report:", err);
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

  const handleUpdateRole = async (userId) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.put(`${API}/users/${userId}/role`, { role: editValue }, { headers });
      setSuccess("User role updated successfully!");
      setEditModal({ show: false, user: null, type: "" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async (userId, leaveType) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.put(`${API}/users/${userId}/leave-balance`,
        { leave_type: leaveType, balance: parseFloat(editValue) },
        { headers }
      );
      setSuccess("Leave balance updated successfully!");
      setEditModal({ show: false, user: null, type: "" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update balance");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Employee", "Leave Type", "Start Date", "End Date", "Days", "Status", "Applied Date", "Reviewed By", "Comments"];
    const rows = report.map(r => [
      r.employee_name,
      r.leave_type,
      r.start_date,
      r.end_date,
      r.days_count,
      r.status,
      r.applied_date.split('T')[0],
      r.reviewed_by,
      r.comments || ""
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const leaveTypes = {
    cl: { name: "Casual Leave", color: "bg-blue-100 text-blue-800" },
    el: { name: "Earned Leave", color: "bg-green-100 text-green-800" },
    sl: { name: "Sick Leave", color: "bg-purple-100 text-purple-800" },
    wfh: { name: "Work From Home", color: "bg-amber-100 text-amber-800" },
    compensatory: { name: "Compensatory", color: "bg-pink-100 text-pink-800" }
  };

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    employee: "bg-green-100 text-green-800"
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {["users", "calendar", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Leave Balances</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.username}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[u.role]}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(u.leave_balances).map(([type, balance]) => (
                            <span key={type} className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {type.toUpperCase()}: {balance}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditModal({ show: true, user: u, type: "role" });
                              setEditValue(u.role);
                            }}
                            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => {
                              setEditModal({ show: true, user: u, type: "balance" });
                            }}
                            className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
                          >
                            Edit Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Leave Calendar</h3>
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
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Leave Reports</h3>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
            {report.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No leave requests</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Employee</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Start</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">End</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Days</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Applied</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">Reviewed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-900 font-medium">{entry.employee_name}</td>
                        <td className="px-3 py-2 text-slate-700">{entry.leave_type}</td>
                        <td className="px-3 py-2 text-slate-700">{entry.start_date}</td>
                        <td className="px-3 py-2 text-slate-700">{entry.end_date}</td>
                        <td className="px-3 py-2 text-slate-700">{entry.days_count}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            entry.status === "APPROVED" ? "bg-green-100 text-green-800" :
                            entry.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{entry.applied_date.split('T')[0]}</td>
                        <td className="px-3 py-2 text-slate-700">{entry.reviewed_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editModal.type === "role" ? "Edit User Role" : "Edit Leave Balance"}
            </h3>
            <div className="mb-4 text-sm text-slate-600">
              <p><span className="font-medium">User:</span> {editModal.user?.username}</p>
            </div>

            {editModal.type === "role" ? (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
                  <select
                    onChange={(e) => {
                      const type = e.target.value;
                      setEditValue(editModal.user?.leave_balances[type]?.toString() || "0");
                      setEditModal({ ...editModal, leaveType: type });
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select leave type</option>
                    {Object.entries(leaveTypes).map(([type, info]) => (
                      <option key={type} value={type}>{info.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Balance</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter balance"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (editModal.type === "role") {
                    handleUpdateRole(editModal.user?.id);
                  } else {
                    handleUpdateBalance(editModal.user?.id, editModal.leaveType);
                  }
                }}
                disabled={loading || (editModal.type === "balance" && !editModal.leaveType)}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => setEditModal({ show: false, user: null, type: "" })}
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

export default AdminDashboard;
