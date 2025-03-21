import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';

// Sample data - in a real app, you would fetch this from your API
const SAMPLE_ONGOING_HACKATHONS = [
  {
    id: '1',
    title: 'AI Innovation Challenge',
    description: 'Create innovative solutions using artificial intelligence and machine learning to solve real-world problems.',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    status: 'ongoing' as const,
  },
  {
    id: '2',
    title: 'Web3 Development Hackathon',
    description: 'Build decentralized applications using blockchain technology and smart contracts.',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    status: 'ongoing' as const,
  },
];

const SAMPLE_COMPLETED_HACKATHONS = [
  {
    id: '3',
    title: 'Mobile App Challenge',
    description: 'Design and develop mobile applications that address community needs.',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'completed' as const,
    submission: {
      id: 'sub-1',
      position: 5,
      score: 85,
      feedback: 'Excellent work on the UI/UX. The implementation is solid and well-documented.',
    },
  },
  {
    id: '4',
    title: 'Data Science Competition',
    description: 'Analyze large datasets to derive meaningful insights and predictions.',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed' as const,
    submission: {
      id: 'sub-2',
      position: 12,
      score: 78,
      feedback: 'Good analysis but could improve on visualization aspects.',
    },
  },
];

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const navigate = useNavigate();

  const handleCardClick = (hackathonId: string, status: 'ongoing' | 'completed') => {
    if (status === 'ongoing') {
      navigate(`/dashboard/student/hackathon/${hackathonId}`);
    } else {
      navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Hackathons</h1>
          <p className="text-gray-600 mt-1">View and manage your hackathon participations</p>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'ongoing'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Ongoing Hackathons</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'completed'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Completed Hackathons</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'ongoing' ? (
            SAMPLE_ONGOING_HACKATHONS.map((hackathon) => (
              <div
                key={hackathon.id}
                onClick={() => handleCardClick(hackathon.id, 'ongoing')}
                className="cursor-pointer"
              >
                <HackathonCard {...hackathon} />
              </div>
            ))
          ) : (
            SAMPLE_COMPLETED_HACKATHONS.map((hackathon) => (
              <div
                key={hackathon.id}
                onClick={() => handleCardClick(hackathon.id, 'completed')}
                className="cursor-pointer"
              >
                <HackathonCard {...hackathon} />
              </div>
            ))
          )}
        </div>

        {((activeTab === 'ongoing' && SAMPLE_ONGOING_HACKATHONS.length === 0) ||
          (activeTab === 'completed' && SAMPLE_COMPLETED_HACKATHONS.length === 0)) && (
          <div className="text-center py-12">
            <div className="rounded-full bg-gray-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              {activeTab === 'ongoing' ? (
                <Clock className="w-6 h-6 text-gray-600" />
              ) : (
                <Trophy className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900">No {activeTab} hackathons</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'ongoing'
                ? "You're not participating in any hackathons currently"
                : "You haven't completed any hackathons yet"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;