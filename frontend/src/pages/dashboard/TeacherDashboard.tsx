import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';
import { hackathonAPI } from '../../lib/api';

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  submissions: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setIsLoading(true);
        const response = await hackathonAPI.getAllHackathons();
        setHackathons(response.data.data);
      } catch (err) {
        console.error('Error fetching hackathons:', err);
        setError('Failed to load hackathons. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const handleCardClick = (hackathonId: string) => {
    navigate(`/dashboard/teacher/hackathon/${hackathonId}`);
  };

  const ongoingHackathons = hackathons.filter(h => h.status === 'ongoing');
  const completedHackathons = hackathons.filter(h => h.status === 'completed');

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="teacher" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-600">Loading hackathons...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="teacher" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Current Hackathons</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your hackathons</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/teacher/create-hackathon')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Hackathon
          </button>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ongoing Hackathons</h2>
          {ongoingHackathons.length === 0 ? (
            <p className="text-gray-500">No ongoing hackathons.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingHackathons.map((hackathon) => (
                <div
                  key={hackathon._id}
                  onClick={() => handleCardClick(hackathon._id)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                >
                  <HackathonCard
                    id={hackathon._id}
                    title={hackathon.title}
                    description={hackathon.description}
                    startDate={hackathon.startDate}
                    endDate={hackathon.endDate}
                    status={hackathon.status}
                    participants={hackathon.participants}
                    submissions={hackathon.submissions}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Hackathons</h2>
          {completedHackathons.length === 0 ? (
            <p className="text-gray-500">No completed hackathons.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedHackathons.map((hackathon) => (
                <div
                  key={hackathon._id}
                  onClick={() => handleCardClick(hackathon._id)}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                >
                  <HackathonCard
                    id={hackathon._id}
                    title={hackathon.title}
                    description={hackathon.description}
                    startDate={hackathon.startDate}
                    endDate={hackathon.endDate}
                    status={hackathon.status}
                    participants={hackathon.participants}
                    submissions={hackathon.submissions}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;