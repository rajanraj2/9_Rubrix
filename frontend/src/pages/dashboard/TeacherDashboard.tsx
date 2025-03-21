import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';

const SAMPLE_HACKATHONS = [
  {
    id: '1',
    title: 'AI Innovation Challenge',
    description: 'Create innovative solutions using artificial intelligence and machine learning to solve real-world problems.',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    status: 'ongoing' as const,
    participants: 45,
    submissions: 32,
  },
  {
    id: '2',
    title: 'Web3 Development Hackathon',
    description: 'Build decentralized applications using blockchain technology and smart contracts.',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    status: 'ongoing' as const,
    participants: 38,
    submissions: 25,
  },
  {
    id: '3',
    title: 'Mobile App Challenge',
    description: 'Design and develop mobile applications that address community needs and enhance user experience.',
    startDate: '2024-03-25',
    endDate: '2024-04-25',
    status: 'ongoing' as const,
    participants: 52,
    submissions: 41,
  },
  {
    id: '4',
    title: 'Python Programming Contest',
    description: 'A completed hackathon focused on building efficient Python applications.',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed' as const,
    participants: 60,
    submissions: 48,
  },
  {
    id: '5',
    title: 'IoT Innovation Challenge',
    description: 'Completed challenge for creating innovative IoT solutions.',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'completed' as const,
    participants: 35,
    submissions: 28,
  }
];

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (hackathonId: string) => {
    navigate(`/dashboard/teacher/hackathon/${hackathonId}`);
  };

  const ongoingHackathons = SAMPLE_HACKATHONS.filter(h => h.status === 'ongoing');
  const completedHackathons = SAMPLE_HACKATHONS.filter(h => h.status === 'completed');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Current Hackathons</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your hackathons</p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ongoing Hackathons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                onClick={() => handleCardClick(hackathon.id)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              >
                <HackathonCard {...hackathon} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Hackathons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                onClick={() => handleCardClick(hackathon.id)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              >
                <HackathonCard {...hackathon} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;