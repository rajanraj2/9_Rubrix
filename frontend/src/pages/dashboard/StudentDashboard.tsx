import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, Eye } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import HackathonCard from '../../components/dashboard/HackathonCard';
import { hackathonAPI, submissionAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';
import { useAuth } from '../../lib/authContext';

type TabType = 'active' | 'completed';

interface Submission {
  _id: string;
  hackathonId: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'ongoing' | 'completed';
  };
  submissionText: string;
  files: Array<{
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  submittedAt: string;
  totalScore: number;
  feedback?: string;
}

interface Participant {
  userId: {
    id: string;
    fullName: string;
  }
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [completedHackathons, setCompletedHackathons] = useState<Hackathon[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [submittedHackathonIds, setSubmittedHackathonIds] = useState<string[]>([]);
  const [registeredHackathonIds, setRegisteredHackathonIds] = useState<string[]>([]);

  const fetchHackathons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch active hackathons (the API will filter based on eligibility)
      const activeResponse = await hackathonAPI.getAllHackathons();
      const activeHackathonsData = activeResponse.data.data.filter(
        (h: Hackathon) => h.status === 'upcoming' || h.status === 'ongoing'
      );
      setActiveHackathons(activeHackathonsData);
      
      // Fetch completed hackathons that the student participated in
      const completedResponse = await hackathonAPI.getCompletedHackathons();
      const completedHackathonsData = completedResponse.data.data;
      setCompletedHackathons(completedHackathonsData);

      // Fetch user's submissions
      const submissionsResponse = await submissionAPI.getUserSubmissions();
      const submissions = submissionsResponse.data.data;
      setUserSubmissions(submissions);
      
      // Extract the hackathon IDs for which the user has submitted
      const hackathonIds = submissions.map((submission: Submission) => 
        submission.hackathonId._id
      );
      setSubmittedHackathonIds(hackathonIds);

      // Fetch all participants for active and completed hackathons at once
      const registeredIds: string[] = [];
      
      // Use a more efficient approach - batch similar requests
      if (user && user.id) {
        // Get all hackathon IDs
        const allHackathonIds = [...activeHackathonsData, ...completedHackathonsData]
          .filter(h => !hackathonIds.includes(h._id)) // Filter out already submitted
          .map(h => h._id);
        
        console.log(`Checking registration status for ${allHackathonIds.length} hackathons`);
        
        // Process in smaller batches to not overwhelm the server
        const batchSize = 5;
        for (let i = 0; i < allHackathonIds.length; i += batchSize) {
          const batch = allHackathonIds.slice(i, i + batchSize);
          await Promise.all(batch.map(async (hackathonId) => {
            try {
              const participantsResponse = await hackathonAPI.getParticipants(hackathonId);
              const participants = participantsResponse.data.data;
              
              if (participants.some(
                (participant: Participant) => participant.userId.id === user.id
              )) {
                registeredIds.push(hackathonId);
              }
            } catch (err) {
              console.error(`Error checking registration status for hackathon ${hackathonId}:`, err);
            }
          }));
        }
      }
      
      console.log('Registered hackathon IDs:', registeredIds);
      setRegisteredHackathonIds(registeredIds);
      
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to load hackathons. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('StudentDashboard mounted or hackathon joined, refreshing data...');
    fetchHackathons();
  }, [fetchHackathons, joinSuccess]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHackathons();
  };

  const handleCardClick = (hackathonId: string) => {
    const hackathon = [...activeHackathons, ...completedHackathons].find(h => h._id === hackathonId);
    if (!hackathon) return;

    // If the student has already submitted for this hackathon, go directly to the submission page
    if (submittedHackathonIds.includes(hackathonId)) {
      console.log('User has submitted for this hackathon, redirecting to submission page');
      navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
    } else {
      // Otherwise, go to the hackathon details page, regardless of registration status
      console.log('User has not submitted for this hackathon, showing details page');
      navigate(`/dashboard/student/hackathon/${hackathonId}`);
    }
  };

  const handleSubmissionClick = (submissionId: string, hackathonId: string) => {
    navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
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
        
        // Add to registered hackathons if not already submitted
        if (!submittedHackathonIds.includes(joinedHackathon._id)) {
          setRegisteredHackathonIds(prev => {
            if (!prev.includes(joinedHackathon._id)) {
              return [...prev, joinedHackathon._id];
            }
            return prev;
          });
        }
      } else if (joinedHackathon.status === 'completed') {
        // If it's completed, add to completed hackathons if not already there
        const exists = completedHackathons.some(h => h._id === joinedHackathon._id);
        
        if (!exists) {
          setCompletedHackathons(prev => [...prev, joinedHackathon]);
        }
      }
      
      // Force a refresh to ensure data is up-to-date
      await fetchHackathons();
      
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

    if (activeTab === 'active') {
      if (activeHackathons.length === 0) {
        return (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              You don't have any active hackathons available.
            </p>
            <p className="text-sm text-gray-500">
              Check back later for new hackathons you're eligible to participate in, or join using a code!
            </p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeHackathons.map((hackathon) => (
            <div key={hackathon._id} className="relative">
              <HackathonCard
                hackathon={hackathon}
                onClick={() => handleCardClick(hackathon._id)}
              />
              {submittedHackathonIds.includes(hackathon._id) && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg">
                  Submitted
                </div>
              )}
              {!submittedHackathonIds.includes(hackathon._id) && registeredHackathonIds.includes(hackathon._id) && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg">
                  Registered
                </div>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      // Completed tab - show submissions
      if (userSubmissions.length === 0) {
        return (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              You haven't submitted any projects yet.
            </p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSubmissions.map((submission) => (
            <div 
              key={submission._id}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleSubmissionClick(submission._id, submission.hackathonId._id)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {submission.hackathonId.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{submission.submissionText}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  {submission.totalScore > 0 && (
                    <span className="font-medium text-green-600">Score: {submission.totalScore.toFixed(1)}/10</span>
                  )}
                </div>
                
                {submission.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Files:</p>
                    <ul className="mt-2 space-y-1">
                      {submission.files.slice(0, 3).map((file, index) => (
                        <li key={index} className="text-sm text-indigo-600 truncate">
                          {file.filename}
                        </li>
                      ))}
                      {submission.files.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{submission.files.length - 3} more files
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmissionClick(submission._id, submission.hackathonId._id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Join Hackathon</h2>
          <form onSubmit={handleJoinHackathon} className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Hackathon Code
              </label>
              <input
                type="text"
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. ABC123"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isJoining || !joinCode.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isJoining || !joinCode.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Join Hackathon
                </>
              )}
            </button>
          </form>
          
          {joinSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              {joinSuccess}
            </div>
          )}
          
          {joinError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {joinError}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm mr-8 ${
                  activeTab === 'active'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Hackathons
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Submissions
              </button>
            </nav>
          </div>
        </div>

        {renderHackathons()}
      </main>
    </div>
  );
};

export default StudentDashboard;