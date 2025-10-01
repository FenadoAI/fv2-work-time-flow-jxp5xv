import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, TrendingUp, Coffee, Zap } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function AttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const todayResponse = await axios.get(`${API_BASE}/api/attendance/today`, { headers });
      setTodayAttendance(todayResponse.data);

      const recordsResponse = await axios.get(`${API_BASE}/api/attendance/my-records?limit=30`, { headers });
      setAttendanceRecords(recordsResponse.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/attendance/check-in`,
        { notes: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Checked in successfully!');
      fetchAttendanceData();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Check-in failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/attendance/check-out`,
        { notes: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Checked out successfully!');
      fetchAttendanceData();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Check-out failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
      late: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
      absent: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      half_day: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Coffee }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border px-3 py-1 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status?.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-xl text-blue-600 font-medium">Loading attendance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 border-blue-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Today's Attendance Card */}
        <Card className="mb-8 shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90 transform transition-all duration-300 hover:shadow-3xl">
          <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-3xl text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="h-8 w-8" />
                </div>
                Today's Attendance
              </CardTitle>
              <CardDescription className="text-blue-100">
                {formatDate(todayAttendance?.date || new Date())}
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-block p-3 bg-blue-600 rounded-xl mb-3">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1 font-medium">Check-In</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {todayAttendance?.checked_in ? formatTime(todayAttendance.check_in) : '--:--'}
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-block p-3 bg-purple-600 rounded-xl mb-3">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1 font-medium">Check-Out</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {todayAttendance?.checked_out ? formatTime(todayAttendance.check_out) : '--:--'}
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-block p-3 bg-green-600 rounded-xl mb-3">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1 font-medium">Work Hours</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {todayAttendance?.work_hours ? `${todayAttendance.work_hours}h` : '--'}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!todayAttendance?.checked_in && (
                <Button
                  onClick={handleCheckIn}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-6 w-6" />
                  Check In
                </Button>
              )}
              {todayAttendance?.checked_in && !todayAttendance?.checked_out && (
                <Button
                  onClick={handleCheckOut}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  size="lg"
                >
                  <XCircle className="mr-2 h-6 w-6" />
                  Check Out
                </Button>
              )}
              {todayAttendance?.checked_out && (
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <CheckCircle className="inline-block h-12 w-12 text-green-600 mb-2" />
                  <div className="text-xl font-bold text-gray-800">
                    You've completed your day!
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Great work! See you tomorrow.</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-100">
            <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              Attendance History
            </CardTitle>
            <CardDescription className="text-gray-600">
              Last 30 days of attendance records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <div className="text-lg text-gray-500">No attendance records found</div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                      <TableHead className="font-bold text-gray-700">Date</TableHead>
                      <TableHead className="font-bold text-gray-700">Check-In</TableHead>
                      <TableHead className="font-bold text-gray-700">Check-Out</TableHead>
                      <TableHead className="font-bold text-gray-700">Work Hours</TableHead>
                      <TableHead className="font-bold text-gray-700">Status</TableHead>
                      <TableHead className="font-bold text-gray-700">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell className="text-blue-600 font-semibold">{formatTime(record.check_in)}</TableCell>
                        <TableCell className="text-purple-600 font-semibold">{formatTime(record.check_out)}</TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">
                            {record.work_hours ? `${record.work_hours}h` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {record.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AttendancePage;
