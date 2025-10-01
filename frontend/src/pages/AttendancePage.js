import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

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

      // Fetch today's attendance
      const todayResponse = await axios.get(`${API_BASE}/api/attendance/today`, { headers });
      setTodayAttendance(todayResponse.data);

      // Fetch attendance records
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
    const statusColors = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status?.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-xl text-blue-600">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 bg-white hover:bg-blue-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Today's Attendance Card */}
        <Card className="mb-6 shadow-xl border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Today's Attendance - {formatDate(todayAttendance?.date || new Date())}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Check-In</div>
                <div className="text-2xl font-bold text-blue-700">
                  {todayAttendance?.checked_in ? formatTime(todayAttendance.check_in) : 'Not checked in'}
                </div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Check-Out</div>
                <div className="text-2xl font-bold text-cyan-700">
                  {todayAttendance?.checked_out ? formatTime(todayAttendance.check_out) : 'Not checked out'}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Work Hours</div>
                <div className="text-2xl font-bold text-green-700">
                  {todayAttendance?.work_hours ? `${todayAttendance.work_hours}h` : '-'}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!todayAttendance?.checked_in && (
                <Button
                  onClick={handleCheckIn}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              )}
              {todayAttendance?.checked_in && !todayAttendance?.checked_out && (
                <Button
                  onClick={handleCheckOut}
                  className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Check Out
                </Button>
              )}
              {todayAttendance?.checked_out && (
                <div className="text-center">
                  <CheckCircle className="inline-block h-8 w-8 text-green-600 mb-2" />
                  <div className="text-lg font-semibold text-gray-700">
                    You've completed your day!
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Attendance History
            </CardTitle>
            <CardDescription className="text-blue-100">
              Last 30 days of attendance records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendance records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Work Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell>{formatTime(record.check_in)}</TableCell>
                        <TableCell>{formatTime(record.check_out)}</TableCell>
                        <TableCell>
                          {record.work_hours ? `${record.work_hours}h` : '-'}
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
