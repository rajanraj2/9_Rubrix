import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Check, Clock, Eye } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import { hackathonAPI, submissionAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';
import { useAuth } from '../../lib/authContext';

interface Participant {
  userId: {
    id: string;
    fullName: string;
  }
}

interface Submission {
  _id: string;
  hackathonId: {
    _id: string;
  };
  submittedAt: string;
}

const HackathonDetail: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const fetchHackathonDetails = useCallback(async () => {
    if (!hackathonId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching hackathon details for ID:', hackathonId);
      
      // Fetch the hackathon details first
      const response = await hackathonAPI.getHackathon(hackathonId);
      setHackathon(response.data.data);
      console.log('Hackathon details received:', response.data.data.title);
      
      // Check if user is already registered (only if user is logged in)
      if (user && user.id) {
        try {
          console.log('Checking registration status for user ID:', user.id);
          const participantsResponse = await hackathonAPI.getParticipants(hackathonId);
          const participants = participantsResponse.data.data;
          console.log('Participants:', participants);
          
          const isUserRegistered = participants.some(
            (participant: Participant) => participant.userId.id === user.id
          );
          console.log('Is user registered:', isUserRegistered, 'User ID:', user.id);
          
          // Update registration state immediately
          setIsRegistered(isUserRegistered);
          
          // If registered, check if they've already submitted
          if (isUserRegistered) {
            const submissionsResponse = await submissionAPI.getUserSubmissions();
            const userSubmissions = submissionsResponse.data.data;
            console.log('User submissions:', userSubmissions);
            
            const userSubmission = userSubmissions.find(
              (sub: Submission) => sub.hackathonId._id === hackathonId
            );
            
            if (userSubmission) {
              console.log('Found user submission:', userSubmission);
              setHasSubmitted(true);
              setSubmission(userSubmission);
            } else {
              console.log('No submission found for this hackathon');
              setHasSubmitted(false);
              setSubmission(null);
            }
          } else {
            // User is not registered, ensure these flags are reset
            console.log('User is not registered, resetting submission state');
            setHasSubmitted(false);
            setSubmission(null);
          }
        } catch (err) {
          // Error checking registration status is not critical, so just log it
          console.error('Error checking registration status:', err);
          
          // Ensure we still update the UI appropriately even if checking status fails
          setIsRegistered(false);
          setHasSubmitted(false);
          setSubmission(null);
        }
      } else {
        console.log('No user ID available, cannot check registration status');
        setIsRegistered(false);
        setHasSubmitted(false);
        setSubmission(null);
      }
    } catch (err) {
      console.error('Error fetching hackathon:', err);
      setError('Failed to load hackathon details. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Finished loading hackathon. Registration state:', { isRegistered, hasSubmitted });
    }
  }, [hackathonId, user?.id]);

  useEffect(() => {
    // This will run once when the component mounts and ensure the hackathon details are loaded
    if (hackathonId) {
      console.log('HackathonDetail mounted, fetching details for hackathon:', hackathonId);
      fetchHackathonDetails();
    }
  }, [fetchHackathonDetails, hackathonId]);

  // Additional useEffect to ensure proper UI state as soon as registration completes
  useEffect(() => {
    if (isRegistered && !hasSubmitted && !isLoading && hackathon) {
      console.log('User is registered and UI should show Submit button for hackathon:', hackathon.title);
    } else if (!isRegistered && !isLoading && hackathon) {
      console.log('User is NOT registered and UI should show Register button for hackathon:', hackathon.title);
    }
  }, [isRegistered, hasSubmitted, isLoading, hackathon]);

  // Redirect to submission page ONLY if user has already submitted
  useEffect(() => {
    if (hasSubmitted && !isLoading && hackathonId) {
      console.log('User has submitted, redirecting to submission page');
      navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
    } else {
      console.log('Current state:', { 
        isRegistered, 
        hasSubmitted, 
        isLoading, 
        hackathonId: !!hackathonId 
      });
      
      // Do not add redirects here for Registration state
      // We'll let the UI update naturally to show the submit button
    }
  }, [hasSubmitted, isLoading, hackathonId, navigate, isRegistered]);

  const handleRegister = async () => {
    if (!hackathonId || !user?.id) return;
    
    try {
      setIsRegistering(true);
      console.log('Starting registration process for hackathon:', hackathonId);
      
      // Call the API to register the user
      const response = await hackathonAPI.registerParticipant(hackathonId, user.id);
      console.log('Registration response received:', response.data);
      
      // Immediately update the UI state to show the Submit button
      console.log('Setting isRegistered to true to update UI');
      setIsRegistered(true);
      
      // Make sure submission state is reset
      setHasSubmitted(false);
      
      // Show success message
      alert('Successfully registered for the hackathon! You can now submit your project.');
      console.log('Registration complete, submit button should now be visible');
      
      // Navigate to the same page to force a complete refresh of the component state
      // This ensures all state variables are properly reset and the UI updates correctly
      navigate(`/dashboard/student/hackathon/${hackathonId}`, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to register for the hackathon. Please try again.');
      
      // Reset state on error
      setIsRegistered(false);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmit = () => {
    if (!hackathonId) return;
    navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
  };

  const viewSubmission = () => {
    if (!hackathonId) return;
    navigate(`/dashboard/student/hackathon/${hackathonId}/submission`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error || 'Hackathon not found'}
          </div>
        </main>
      </div>
    );
  }

  const isHackathonActive = hackathon.status === 'ongoing';
  const isHackathonUpcoming = hackathon.status === 'upcoming';
  const isHackathonCompleted = hackathon.status === 'completed';
  const isHackathonAvailable = isHackathonActive || isHackathonUpcoming; // Can submit if upcoming or ongoing
  
  // Format dates
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  const formattedStartDate = startDate.toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const formattedEndDate = endDate.toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  // Format submission date if available
  const submissionDate = submission ? new Date(submission.submittedAt).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }) : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard/student')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
          <div className="flex items-center mt-2 mb-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                isHackathonActive
                  ? 'bg-green-100 text-green-800'
                  : isHackathonUpcoming
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isHackathonActive 
                ? 'In Progress' 
                : isHackathonUpcoming
                ? 'Upcoming'
                : 'Completed'}
            </span>
            <span className="text-sm text-gray-500">
              Created by {hackathon.createdBy.fullName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this Hackathon</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">{hackathon.description}</p>
              
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <span>
                  {formattedStartDate} - {formattedEndDate}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <span>
                  {hackathon.participants || 0} Participants | {hackathon.submissions || 0} Submissions
                </span>
              </div>
            </div>

            {hackathon.parameters && hackathon.parameters.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Parameters</h2>
                <div className="space-y-4">
                  {hackathon.parameters.map((param, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-md font-medium text-gray-900">{param.name}</h3>
                        <span className="text-sm text-indigo-600 font-medium">{param.weight}%</span>
                      </div>
                      <p className="text-gray-600 text-sm">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              
              {isHackathonUpcoming && (
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    <Clock className="w-5 h-5 inline mr-2 text-blue-500" />
                    This hackathon will start on {formattedStartDate}.
                  </p>
                </div>
              )}
              
              {isHackathonActive && (
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    <Clock className="w-5 h-5 inline mr-2 text-green-500" />
                    This hackathon is active! Ends on {formattedEndDate}.
                  </p>
                </div>
              )}
              
              {isHackathonCompleted && (
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    <Clock className="w-5 h-5 inline mr-2 text-gray-500" />
                    This hackathon ended on {formattedEndDate}.
                  </p>
                </div>
              )}
              
              {!isHackathonCompleted && (
                <div className="mb-6">
                  {isRegistered ? (
                    <div className="flex items-center text-green-600 mb-4">
                      <Check className="w-5 h-5 mr-2" />
                      <span>You are registered for this hackathon</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isRegistering ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isRegistering ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Registering...
                        </span>
                      ) : (
                        'Register for Hackathon'
                      )}
                    </button>
                  )}
                </div>
              )}
              
              {isRegistered && !hasSubmitted && isHackathonAvailable && (
                <button
                  onClick={handleSubmit}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Your Project
                </button>
              )}
              
              {isRegistered && hasSubmitted && (
                <div>
                  <div className="flex items-center text-green-600 mb-4">
                    <Check className="w-5 h-5 mr-2" />
                    <span>You have already submitted your project{submissionDate ? ` on ${submissionDate}` : ''}</span>
                  </div>
                  <button
                    onClick={viewSubmission}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Your Submission
                  </button>
                </div>
              )}
              
              {isRegistered && !hasSubmitted && isHackathonCompleted && (
                <div className="text-amber-600 p-3 bg-amber-50 rounded-md">
                  You were registered but did not submit a project before the deadline.
                </div>
              )}
            </div>
            
            {hackathon.collaborators && hackathon.collaborators.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h2>
                <ul className="space-y-3">
                  {hackathon.collaborators.map((collaborator) => (
                    <li key={collaborator._id} className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 mr-3">
                        {collaborator.fullName.charAt(0)}
                      </div>
                      <span className="text-gray-700">{collaborator.fullName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HackathonDetail; 