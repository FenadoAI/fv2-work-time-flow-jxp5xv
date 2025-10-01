import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Megaphone } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_all: true,
    target_roles: []
  });
  const navigate = useNavigate();
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const announcementData = {
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      target_roles: formData.target_all ? null : formData.target_roles
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/announcements`, announcementData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Announcement created successfully!');
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        target_all: true,
        target_roles: []
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[priority] || colors.normal}>{priority.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-xl text-blue-600">Loading announcements...</div>
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="shadow-xl border-t-4 border-t-blue-500 mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Megaphone className="h-8 w-8" />
                  Announcements
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Manage company-wide announcements
                </CardDescription>
              </div>
              {userRole === 'admin' && !showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Create Form */}
            {showForm && userRole === 'admin' && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-4">Create New Announcement</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      placeholder="Enter announcement content"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.target_all}
                          onChange={(e) => setFormData({ ...formData, target_all: e.target.checked, target_roles: [] })}
                        />
                        <span>All Employees</span>
                      </label>

                      {!formData.target_all && (
                        <div className="ml-6 space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.target_roles.includes('employee')}
                              onChange={() => toggleRole('employee')}
                            />
                            <span>Employees</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.target_roles.includes('manager')}
                              onChange={() => toggleRole('manager')}
                            />
                            <span>Managers</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.target_roles.includes('admin')}
                              onChange={() => toggleRole('admin')}
                            />
                            <span>Admins</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Create Announcement
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No announcements available
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-5 rounded-lg border-l-4 shadow-sm ${
                      announcement.priority === 'urgent' ? 'bg-red-50 border-red-500' :
                      announcement.priority === 'high' ? 'bg-orange-50 border-orange-500' :
                      announcement.priority === 'normal' ? 'bg-blue-50 border-blue-500' :
                      'bg-gray-50 border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <p className="text-slate-700 mb-3">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>👤 {announcement.created_by_name}</span>
                          <span>📅 {new Date(announcement.created_at).toLocaleDateString()}</span>
                          {announcement.target_roles && (
                            <span>
                              🎯 {announcement.target_roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                            </span>
                          )}
                          {!announcement.target_roles && <span>🌐 All Employees</span>}
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
