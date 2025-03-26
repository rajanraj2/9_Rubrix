import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'teacher';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const { hackathonId } = useParams();
  const [isHackathonOpen, setIsHackathonOpen] = useState(true);

  const studentLinks = [
    { icon: LayoutDashboard, label: 'Ongoing Challenges', href: '/dashboard/student/ongoing-hackathons' },
    { icon: Trophy, label: 'Completed Challenges', href: '/dashboard/student/completed-hackathons' },
  ];

  const teacherLinks = [
    { icon: LayoutDashboard, label: 'Current Challenges', href: '/dashboard/teacher' },
    { icon: Plus, label: 'Create New Challenge', href: '/dashboard/teacher/create-hackathon' },
  ];

  const hackathonLinks = hackathonId ? [
    { icon: Trophy, label: 'Insights', href: `/dashboard/teacher/hackathon/${hackathonId}` },
    { icon: Trophy, label: 'Leaderboard', href: `/dashboard/teacher/hackathon/${hackathonId}/leaderboard` },
    { icon: Star, label: 'Shortlisted', href: `/dashboard/teacher/hackathon/${hackathonId}/shortlisted` },
  ] : [];

  const links = role === 'student' ? studentLinks : teacherLinks;

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md h-screen border-r border-gray-200 p-5 flex flex-col shadow-md">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Code2 className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-lg font-semibold text-gray-900">PiJam</span>
        </Link>
      </div>
      
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all transform hover:-translate-y-0.5 ${
              location.pathname === link.href
                ? 'bg-purple-50 text-purple-600 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      {hackathonId && role === 'teacher' && (
        <div className="mt-8">
          <button
            onClick={() => setIsHackathonOpen(!isHackathonOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 rounded-lg bg-gray-50 shadow-sm"
          >
            <span>Challenge Navigation</span>
            {isHackathonOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {isHackathonOpen && (
            <div className="mt-3 space-y-1 pl-2">
              {hackathonLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all transform hover:-translate-y-0.5 ${
                    location.pathname === link.href
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-auto p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg shadow-inner">
        <p className="text-sm text-gray-600">
          {role === 'student' 
            ? "Keep learning and creating!" 
            : "Inspire your students with new challenges!"}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;