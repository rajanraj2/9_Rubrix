import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Star,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'teacher';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const { hackathonId } = useParams();
  const [isHackathonOpen, setIsHackathonOpen] = useState(true);

  const studentLinks = [
    { icon: LayoutDashboard, label: 'Ongoing Hackathons', href: '/dashboard/student/ongoing' },
    { icon: Trophy, label: 'Completed Hackathons', href: '/dashboard/student/completed' },
  ];

  const teacherLinks = [
    { icon: LayoutDashboard, label: 'Current Hackathons', href: '/dashboard/teacher' },
    { icon: Plus, label: 'Create Hackathon', href: '/dashboard/teacher/create-hackathon' },
  ];

  const hackathonLinks = hackathonId ? [
    { icon: Trophy, label: 'Insights', href: `/dashboard/teacher/hackathon/${hackathonId}` },
    { icon: Trophy, label: 'Leaderboard', href: `/dashboard/teacher/hackathon/${hackathonId}/leaderboard` },
    { icon: Star, label: 'Shortlisted', href: `/dashboard/teacher/hackathon/${hackathonId}/shortlisted` },
  ] : [];

  const links = role === 'student' ? studentLinks : teacherLinks;

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 p-4 flex flex-col">
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              location.pathname === link.href
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {hackathonId && role === 'teacher' && (
        <div className="mt-8">
          <button
            onClick={() => setIsHackathonOpen(!isHackathonOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900"
          >
            <span>Hackathon Navigation</span>
            {isHackathonOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {isHackathonOpen && (
            <div className="mt-2 space-y-1">
              {hackathonLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                    location.pathname === link.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;