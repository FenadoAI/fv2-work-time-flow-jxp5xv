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
  Shield,
  Briefcase,
  Megaphone,
  CheckCircle,
  ArrowRight,
  TrendingUp
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
      description: 'Comprehensive leave tracking with CL, EL, SL, WFH, and compensatory leaves',
      color: 'hsl(200, 84%, 42%)'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time check-in/out system with automatic work hours calculation',
      color: 'hsl(180, 84%, 45%)'
    },
    {
      icon: Users,
      title: 'Employee Profiles',
      description: 'Complete profile management with skills, documents, and contact information',
      color: 'hsl(160, 84%, 42%)'
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: 'Priority-based company-wide communication system',
      color: 'hsl(45, 84%, 42%)'
    },
    {
      icon: FileText,
      title: 'Reports & Analytics',
      description: 'Comprehensive reporting for leave and attendance data',
      color: 'hsl(280, 84%, 42%)'
    },
    {
      icon: Shield,
      title: 'Secure Access Control',
      description: 'Role-based permissions for employees, managers, and administrators',
      color: 'hsl(320, 84%, 42%)'
    }
  ];

  const stats = [
    { label: 'Leave Types', value: '5', icon: Calendar },
    { label: 'User Roles', value: '3', icon: Users },
    { label: 'Core Features', value: '15+', icon: TrendingUp },
    { label: 'Security', value: '100%', icon: Shield }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 98%)' }}>
      {/* Hero Section - 3xl spacing (64px) */}
      <div className="relative overflow-hidden" style={{ backgroundColor: 'hsl(200, 84%, 42%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            {/* Icon with 2xl spacing (48px) below */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-12 rounded-2xl" style={{ backgroundColor: 'hsla(0, 0%, 100%, 0.2)' }}>
              <Briefcase className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            
            {/* Heading 1: 2.5rem (40px) / Bold / -0.02em */}
            <h1 
              className="font-bold mb-6"
              style={{ 
                fontSize: '2.5rem', 
                lineHeight: '1.25', 
                letterSpacing: '-0.02em',
                color: 'hsl(0, 0%, 100%)'
              }}
            >
              Modern HRIS Solution
            </h1>
            
            {/* Body Large: 1.125rem (18px) / Regular / 0 */}
            <p 
              className="mb-12 max-w-3xl mx-auto"
              style={{ 
                fontSize: '1.125rem', 
                lineHeight: '1.75',
                color: 'hsla(0, 0%, 100%, 0.9)'
              }}
            >
              Streamline your HR operations with our comprehensive platform for leave management,
              attendance tracking, and employee engagement. Built for modern workplaces.
            </p>
            
            {/* CTA Buttons with lg spacing (24px) gap */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="px-8 py-6 font-semibold transition-all duration-150"
                style={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  color: 'hsl(200, 84%, 42%)',
                  fontSize: '1.125rem'
                }}
                size="lg"
              >
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="px-8 py-6 font-semibold border-2 transition-all duration-150"
                style={{ 
                  borderColor: 'hsl(0, 0%, 100%)',
                  color: 'hsl(0, 0%, 100%)',
                  backgroundColor: 'transparent',
                  fontSize: '1.125rem'
                }}
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Negative margin for overlap effect */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={idx} 
                className="border transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  borderColor: 'hsl(0, 0%, 88%)'
                }}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl"
                    style={{ backgroundColor: 'hsl(200, 84%, 42%)' }}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  {/* Heading 2: 2rem (32px) / SemiBold */}
                  <div 
                    className="font-semibold mb-1"
                    style={{ 
                      fontSize: '2rem', 
                      lineHeight: '1.25',
                      color: 'hsl(0, 0%, 12%)'
                    }}
                  >
                    {stat.value}
                  </div>
                  {/* Body Small: 0.875rem (14px) */}
                  <div 
                    className="font-medium"
                    style={{ 
                      fontSize: '0.875rem',
                      color: 'hsl(0, 0%, 45%)'
                    }}
                  >
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section - 2xl spacing (48px) top and bottom */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Section Header with xl spacing (32px) below */}
        <div className="text-center mb-16">
          {/* Heading 2: 2rem (32px) / SemiBold / -0.01em */}
          <h2 
            className="font-semibold mb-4"
            style={{ 
              fontSize: '2rem', 
              lineHeight: '1.25',
              letterSpacing: '-0.01em',
              color: 'hsl(0, 0%, 12%)'
            }}
          >
            Everything You Need
          </h2>
          {/* Body Large */}
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '1.125rem',
              lineHeight: '1.5',
              color: 'hsl(0, 0%, 45%)'
            }}
          >
            A complete HRIS platform designed for modern workplaces
          </p>
        </div>

        {/* Feature Grid with lg spacing (24px) gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={idx} 
                className="border transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  borderColor: 'hsl(0, 0%, 88%)'
                }}
              >
                <CardHeader className="p-6">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  {/* Heading 3: 1.5rem (24px) / SemiBold */}
                  <CardTitle 
                    className="font-semibold mb-2"
                    style={{ 
                      fontSize: '1.5rem',
                      lineHeight: '1.25',
                      color: 'hsl(0, 0%, 12%)'
                    }}
                  >
                    {feature.title}
                  </CardTitle>
                  {/* Body: 1rem (16px) / Regular */}
                  <CardDescription 
                    style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.5',
                      color: 'hsl(0, 0%, 45%)'
                    }}
                  >
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits Section with Primary Background */}
      <div 
        className="py-24"
        style={{ backgroundColor: 'hsl(200, 84%, 42%)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="font-semibold mb-4"
              style={{ 
                fontSize: '2rem', 
                lineHeight: '1.25',
                letterSpacing: '-0.01em',
                color: 'hsl(0, 0%, 100%)'
              }}
            >
              Why Choose Our HRIS?
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{ 
                fontSize: '1.125rem',
                lineHeight: '1.5',
                color: 'hsla(0, 0%, 100%, 0.9)'
              }}
            >
              Built with modern technology and best practices
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div 
                key={idx} 
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150"
                style={{ backgroundColor: 'hsla(0, 0%, 100%, 0.1)' }}
              >
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6" style={{ color: 'hsl(160, 84%, 42%)' }} strokeWidth={2} />
                </div>
                <div 
                  className="font-medium"
                  style={{ 
                    fontSize: '1rem',
                    color: 'hsl(0, 0%, 100%)'
                  }}
                >
                  {benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Card 
          className="border overflow-hidden"
          style={{ 
            backgroundColor: 'hsl(0, 0%, 100%)',
            borderColor: 'hsl(0, 0%, 88%)'
          }}
        >
          <div 
            className="p-12 text-center"
            style={{ backgroundColor: 'hsl(200, 84%, 42%)' }}
          >
            <h2 
              className="font-semibold mb-4"
              style={{ 
                fontSize: '2rem', 
                lineHeight: '1.25',
                letterSpacing: '-0.01em',
                color: 'hsl(0, 0%, 100%)'
              }}
            >
              Ready to Get Started?
            </h2>
            <p 
              className="mb-8"
              style={{ 
                fontSize: '1.125rem',
                lineHeight: '1.5',
                color: 'hsla(0, 0%, 100%, 0.9)'
              }}
            >
              Join thousands of organizations using our HRIS platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                className="px-8 py-6 font-semibold transition-all duration-150"
                style={{ 
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  color: 'hsl(200, 84%, 42%)',
                  fontSize: '1.125rem'
                }}
                size="lg"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="px-8 py-6 font-semibold border-2 transition-all duration-150"
                style={{ 
                  borderColor: 'hsl(0, 0%, 100%)',
                  color: 'hsl(0, 0%, 100%)',
                  backgroundColor: 'transparent',
                  fontSize: '1.125rem'
                }}
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer 
        className="py-12"
        style={{ 
          backgroundColor: 'hsl(0, 0%, 12%)',
          color: 'hsl(0, 0%, 65%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="w-6 h-6" style={{ color: 'hsl(200, 84%, 42%)' }} strokeWidth={2} />
            <span 
              className="font-bold"
              style={{ 
                fontSize: '1.25rem',
                color: 'hsl(0, 0%, 100%)'
              }}
            >
              HRIS Platform
            </span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>
            © 2025 HRIS Platform. All rights reserved.
          </p>
          <p 
            className="mt-2"
            style={{ fontSize: '0.75rem', color: 'hsl(0, 0%, 45%)' }}
          >
            Built with React, FastAPI, and MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
