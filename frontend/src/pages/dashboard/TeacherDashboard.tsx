import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';

const SAMPLE_HACKATHONS = [
  {
    id: '1',
    title: 'AI Innovation Challenge',
    description: 'Create innovative solutions using artificial intelligence and machine learning to solve real-world problems.',
    startDate: '2024-03-15',
    participants: 45,
    submissions: 32,
  },
  {
    id: '2',
    title: 'Web3 Development Hackathon',
    description: 'Build decentralized applications using blockchain technology and smart contracts.',
    startDate: '2024-03-20',
    participants: 38,
    submissions: 25,
  },
  {
    id: '3',
    title: 'Mobile App Challenge',
    description: 'Design and develop mobile applications that address community needs and enhance user experience.',
    startDate: '2024-03-25',
    participants: 52,
    submissions: 41,
  },
];

const TeacherDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Current Hackathons</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your ongoing hackathons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_HACKATHONS.map((hackathon) => (
            <HackathonCard key={hackathon.id} {...hackathon} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;