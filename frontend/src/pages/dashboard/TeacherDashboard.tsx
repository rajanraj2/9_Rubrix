import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, CheckCircle } from 'lucide-react';
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
  uniqueCode: string;
  createdBy: {
    _id: string;
    fullName: string;
  };
  collaborators?: Array<{
    _id: string;
    fullName: string;
  }>;
}

type TabType = 'active' | 'completed';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [completedHackathons, setCompletedHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch active hackathons
        const activeResponse = await hackathonAPI.getAllHackathons();
        setActiveHackathons(activeResponse.data.data.filter(
          (h: Hackathon) => h.status === 'upcoming' || h.status === 'ongoing'
        ));
        
        // Fetch completed hackathons
        const completedResponse = await hackathonAPI.getCompletedHackathons();
        setCompletedHackathons(completedResponse.data.data);
      } catch (err) {
        console.error('Error fetching hackathons:', err);
        setError('Failed to load hackathons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const handleCardClick = (hackathonId: string) => {
    navigate(`/dashboard/teacher/hackathon/${hackathonId}`);
  };

  const renderHackathons = () => {
    const hackathons = activeTab === 'active' ? activeHackathons : completedHackathons;
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      );
    }

    if (hackathons.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {activeTab === 'active' 
              ? "You don't have any active hackathons yet." 
              : "You don't have any completed hackathons yet."}
          </p>
          {activeTab === 'active' && (
            <button
              onClick={() => navigate('/dashboard/teacher/create-hackathon')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Hackathon
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <HackathonCard
            key={hackathon._id}
            hackathon={hackathon}
            onClick={() => handleCardClick(hackathon._id)}
            showJoinCode={true}
          />
        ))}
        
        {activeTab === 'active' && (
          <div 
            onClick={() => navigate('/dashboard/teacher/create-hackathon')}
            className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 h-full cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <PlusCircle className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Create New Hackathon</h3>
            <p className="text-gray-500 text-center mt-2">Design and launch a new hackathon for your students</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your hackathons and view student submissions</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('active')}
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Active Hackathons
              </div>
            </button>
            <button
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Completed Hackathons
              </div>
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {renderHackathons()}
      </main>
    </div>
  );
};

export default TeacherDashboard;