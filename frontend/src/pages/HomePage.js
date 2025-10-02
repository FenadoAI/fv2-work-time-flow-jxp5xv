import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Briefcase,
  Heart,
  Megaphone,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to their dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Manage CL, EL, SL, WFH, and compensatory leaves with ease',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Check-in/out system with automatic work hours calculation',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Employee Profiles',
      description: 'Comprehensive profile management with skills and documents',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: 'Company-wide communication with priority-based notifications',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FileText,
      title: 'Reports & Analytics',
      description: 'Exportable reports for leave and attendance tracking',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control for employees, managers, and admins',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { label: 'Leave Types', value: '5+', icon: Calendar },
    { label: 'User Roles', value: '3', icon: Users },
    { label: 'Features', value: '15+', icon: TrendingUp },
    { label: 'Secure', value: '100%', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
              <Briefcase className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Modern HRIS Solution
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Streamline your HR operations with our comprehensive platform for leave management,
              attendance tracking, and employee engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                size="lg"
              >
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 hover:shadow-3xl transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete HRIS platform designed for modern workplaces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="shadow-xl border-0 backdrop-blur-sm bg-white/90 hover:shadow-2xl transition-all transform hover:scale-105">
                <CardHeader>
                  <div className={`inline-block p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-4 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our HRIS?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built with modern technology and best practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Multi-role access control (Employee, Manager, Admin)',
              'Automated leave balance tracking',
              'Real-time attendance monitoring',
              'Priority-based announcements',
              'Comprehensive reporting',
              'Mobile-responsive design',
              'Secure authentication',
              'Easy-to-use interface'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                </div>
                <div className="text-white font-medium">{benefit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of organizations using our HRIS platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                size="lg"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">HRIS Platform</span>
          </div>
          <p className="text-sm">
            © 2025 HRIS Platform. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Built with React, FastAPI, and MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
