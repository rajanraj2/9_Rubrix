import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';
import { hackathonAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';

type TabType = 'active' | 'completed';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [completedHackathons, setCompletedHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHackathons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch active hackathons (the API will filter based on eligibility)
      const activeResponse = await hackathonAPI.getAllHackathons();
      
      setActiveHackathons(activeResponse.data.data.filter(
        (h: Hackathon) => h.status === 'upcoming' || h.status === 'ongoing'
      ));
      
      // Fetch completed hackathons that the student participated in
      const completedResponse = await hackathonAPI.getCompletedHackathons();
      setCompletedHackathons(completedResponse.data.data);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to load hackathons. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons, joinSuccess]); // Refresh when a new hackathon is joined

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHackathons();
  };

  const handleCardClick = (hackathonId: string) => {
    const hackathon = [...activeHackathons, ...completedHackathons].find(h => h._id === hackathonId);
    if (!hackathon) return;

    if (hackathon.status === 'completed') {
      navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
    } else {
      navigate(`/dashboard/student/hackathon/${hackathonId}`);
    }
  };

  const handleJoinHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinError(null);
      setJoinSuccess(null);

      const response = await hackathonAPI.joinByCode(joinCode.trim());
      
      // Add the newly joined hackathon to the active hackathons if it's not completed
      const joinedHackathon = response.data.data;
      
      // Check if the joined hackathon is active (upcoming or ongoing)
      if (joinedHackathon.status === 'upcoming' || joinedHackathon.status === 'ongoing') {
        // Check if it's already in the list to avoid duplicates
        const exists = activeHackathons.some(h => h._id === joinedHackathon._id);
        
        if (!exists) {
          // Add the new hackathon to the active hackathons list
          setActiveHackathons(prev => [...prev, joinedHackathon]);
        }
      } else if (joinedHackathon.status === 'completed') {
        // If it's completed, add to completed hackathons if not already there
        const exists = completedHackathons.some(h => h._id === joinedHackathon._id);
        
        if (!exists) {
          setCompletedHackathons(prev => [...prev, joinedHackathon]);
        }
      }
      
      // Force a refresh to ensure data is up-to-date
      fetchHackathons();
      
      setJoinSuccess(`Successfully joined: ${response.data.data.title}`);
      setJoinCode('');
    } catch (err: unknown) {
      // Handle the case where the user is already registered for this hackathon
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string }, status?: number } };
        
        if (errorResponse.response?.status === 400 && 
            errorResponse.response?.data?.message?.includes('already registered')) {
          // Extract the hackathon name from the code
          const hackathon = [...activeHackathons, ...completedHackathons].find(
            h => h.uniqueCode === joinCode.trim().toUpperCase()
          );
          
          if (hackathon) {
            setJoinSuccess(`You are already registered for: ${hackathon.title}`);
          } else {
            setJoinSuccess(`You are already registered for this hackathon`);
          }
          setJoinCode('');
          return;
        }
      }
      
      // Handle other errors
      setJoinError(
        err instanceof Error ? err.message : 
        typeof err === 'object' && err !== null && 'response' in err 
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to join hackathon')
          : 'Failed to join hackathon'
      );
    } finally {
      setIsJoining(false);
    }
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
              ? "You don't have any active hackathons available." 
              : "You haven't participated in any completed hackathons yet."}
          </p>
          {activeTab === 'active' && (
            <p className="text-sm text-gray-500">
              Check back later for new hackathons you're eligible to participate in, or join using a code!
            </p>
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
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Explore hackathons and manage your submissions</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing || isLoading}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (refreshing || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Join by Code Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Join a Hackathon with Code</h2>
          <form onSubmit={handleJoinHackathon} className="space-y-4">
            <div>
              <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700">
                Enter Hackathon Code
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  disabled={isJoining}
                />
                <button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isJoining || !joinCode.trim() ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isJoining ? 'Joining...' : 'Join'}
                  {!isJoining && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {joinError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {joinError}
              </div>
            )}
            
            {joinSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {joinSuccess}
              </div>
            )}
          </form>
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
                My Submissions
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

export default StudentDashboard;