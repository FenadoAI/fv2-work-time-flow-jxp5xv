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
import { ArrowLeft, Plus, Trash2, Megaphone, AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';

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

  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: { 
        color: 'bg-gradient-to-r from-red-500 to-rose-500', 
        border: 'border-red-300',
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        icon: AlertTriangle,
        badge: 'bg-red-100 text-red-800 border-red-200'
      },
      high: { 
        color: 'bg-gradient-to-r from-orange-500 to-amber-500', 
        border: 'border-orange-300',
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        icon: AlertCircle,
        badge: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      normal: { 
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500', 
        border: 'border-blue-300',
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        icon: Info,
        badge: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      low: { 
        color: 'bg-gradient-to-r from-gray-500 to-slate-500', 
        border: 'border-gray-300',
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
        icon: Bell,
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };
    return configs[priority] || configs.normal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <div className="text-xl text-blue-600 font-medium">Loading announcements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 border-blue-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90 mb-8">
          <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <CardHeader className="relative">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-4xl text-white flex items-center gap-3 mb-2">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Megaphone className="h-10 w-10" />
                    </div>
                    Announcements
                  </CardTitle>
                  <CardDescription className="text-purple-100 text-lg">
                    Stay informed with company-wide updates
                  </CardDescription>
                </div>
                {userRole === 'admin' && !showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New Announcement
                  </Button>
                )}
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6">
            {/* Create Form */}
            {showForm && userRole === 'admin' && (
              <form onSubmit={handleSubmit} className="mb-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <Plus className="h-6 w-6 text-purple-600" />
                  Create New Announcement
                </h3>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter announcement title"
                      className="mt-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      placeholder="Enter announcement content"
                      rows={4}
                      className="mt-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="mt-2 border-purple-300 focus:border-purple-500">
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
                      <Label className="text-sm font-semibold text-gray-700">Target Audience</Label>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 p-2 rounded hover:bg-purple-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.target_all}
                            onChange={(e) => setFormData({ ...formData, target_all: e.target.checked, target_roles: [] })}
                            className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span>All Employees</span>
                        </label>

                        {!formData.target_all && (
                          <div className="ml-6 space-y-2">
                            {['employee', 'manager', 'admin'].map(role => (
                              <label key={role} className="flex items-center gap-2 p-2 rounded hover:bg-purple-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.target_roles.includes(role)}
                                  onChange={() => toggleRole(role)}
                                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="capitalize">{role}s</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Announcement
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="border-purple-300 hover:bg-purple-50"
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
                <div className="text-center py-16">
                  <div className="inline-block p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <Megaphone className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="text-xl text-gray-500 font-medium">No announcements available</div>
                  <div className="text-sm text-gray-400 mt-2">Check back later for updates</div>
                </div>
              ) : (
                announcements.map((announcement) => {
                  const priorityConfig = getPriorityConfig(announcement.priority);
                  const PriorityIcon = priorityConfig.icon;
                  
                  return (
                    <div
                      key={announcement.id}
                      className={`p-6 rounded-2xl border-l-8 ${priorityConfig.border} ${priorityConfig.bg} shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 ${priorityConfig.color} rounded-lg shadow-md`}>
                              <PriorityIcon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                            <Badge className={`${priorityConfig.badge} border px-3 py-1`}>
                              {announcement.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold">By:</span> {announcement.created_by_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-semibold">Date:</span> {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                            {announcement.target_roles && (
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">For:</span> {announcement.target_roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                              </span>
                            )}
                            {!announcement.target_roles && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 border">All Employees</Badge>
                            )}
                          </div>
                        </div>
                        {userRole === 'admin' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md hover:shadow-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
