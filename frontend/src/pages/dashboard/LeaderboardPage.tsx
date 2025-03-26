import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Star, ChevronRight, Filter, Users, MapPin, School, GraduationCap, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';
import { hackathonAPI, submissionAPI } from '../../lib/api';

interface SubmissionParams {
  [key: string]: number;
}

interface HackathonParameter {
  _id: string;
  name: string;
  weight: number;
  description: string;
}

interface HackathonData {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  parameters: HackathonParameter[];
  [key: string]: any;
}

interface SubmissionResponse {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    state?: string;
    district?: string;
    grade?: string;
    gender?: string;
    schoolCollegeName?: string;
  };
  hackathonId: string;
  submissionText?: string;
  files?: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
  isShortlisted: boolean;
  evaluation?: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    feedback?: string;
  }>;
  overallScore: number;
  feedback?: string;
  summary_feedback?: {
    summary: string;
    feedback: string;
    performance_category: string;
  };
  submissi: string;
  evaluatedAt?: string;
}

interface Submission {
  id: string;
  _id: string;
  studentName: string;
  submissionTitle: string;
  submissionDate: string;
  overallScore: number;
  parameters: SubmissionParams;
  isShortlisted: boolean;
  userId: {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    state?: string;
    district?: string;
    grade?: string;
    gender?: string;
    schoolCollegeName?: string;
  };
  submissionText?: string;
  files?: Array<{
    filename: string;
    path: string;
    mimetype: string;
    url?: string;
  }>;
  evaluation?: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    feedback?: string;
  }>;
  feedback?: string;
  summary_feedback?: {
    summary: string;
    feedback: string;
    performance_category: string;
  };
}

interface LeaderboardItem {
  submission: {
    _id: string;
    submissionText: string;
    submissi: string;
    overallScore: number;
    isShortlisted: boolean;
    evaluation: Array<{
      parameterId: string;
      parameterName: string;
      score: number;
      feedback?: string;
    }>;
    files: Array<{
      filename: string;
      path: string;
      mimetype: string;
      url?: string;
    }>;
    feedback?: string;
    summary_feedback?: {
      summary: string;
      feedback: string;
      performance_category: string;
    };
  };
  participant: {
    userId: {
      _id: string;
      fullName: string;
      phoneNumber?: string;
      state?: string;
      district?: string;
      grade?: string;
      gender?: string;
      schoolCollegeName?: string;
    };
  };
}

const ITEMS_PER_PAGE = 10;

const LeaderboardPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  console.log(`Loading leaderboard for hackathon: ${hackathonId}`);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [originalSubmissions, setOriginalSubmissions] = useState<Submission[]>([]);
  const [displayedSubmissions, setDisplayedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState({ key: 'overallScore', direction: 'descending' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDemographicFilterOpen, setIsDemographicFilterOpen] = useState(false);
  const [filterParam, setFilterParam] = useState<string | null>(null);
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(100);
  const [hackathon, setHackathon] = useState<HackathonData | null>(null);
  const [demographicFilter, setDemographicFilter] = useState<{
    state: string;
    district: string;
    grade: string;
    gender: string;
    school: string;
  }>({
    state: '',
    district: '',
    grade: '',
    gender: '',
    school: ''
  });
  
  // Load hackathon parameters and submissions data
  useEffect(() => {
    const fetchHackathonData = async () => {
      if (!hackathonId) return;
      
      try {
        setIsLoading(true);
        console.log(`Starting to fetch data for hackathon: ${hackathonId}`);
        
        // Fetch hackathon details to get parameters
        const hackathonResponse = await hackathonAPI.getHackathon(hackathonId);
        console.log('Hackathon details response:', hackathonResponse);
        setHackathon(hackathonResponse.data.data);
        
        // Fetch leaderboard data
        const leaderboardResponse = await hackathonAPI.getLeaderboard(hackathonId);
        console.log('Leaderboard full response:', leaderboardResponse);
        
        if (leaderboardResponse.data && leaderboardResponse.data.data && Array.isArray(leaderboardResponse.data.data)) {
          console.log('Number of submissions received:', leaderboardResponse.data.data.length);
          
        // Transform the data to match our Submission interface
          const submissionsData = leaderboardResponse.data.data.map((item: SubmissionResponse) => {
            // Extract parameter scores from the submission's evaluation
            const parameters: SubmissionParams = {};
            
            if (item.evaluation && Array.isArray(item.evaluation)) {
              item.evaluation.forEach((evaluation) => {
                parameters[evaluation.parameterName] = evaluation.score;
              });
            }
            
            return {
              id: item._id,
              _id: item._id,
              studentName: item.userId?.fullName || 'Unknown Student',
              submissionTitle: item.submissionText?.substring(0, 50) || 'Untitled Submission',
              submissionDate: item.submittedAt,
              overallScore: item.totalScore || 0,
              parameters,
              isShortlisted: item.isShortlisted || false,
              userId: item.userId || {},
              submissionText: item.submissionText,
              files: item.files,
              evaluation: item.evaluation,
              feedback: item.feedback,
              summary_feedback: item.summary_feedback
            };
          });
          
          console.log('Transformed submissions data:', submissionsData);
          
          if (submissionsData.length > 0) {
            setSubmissions(submissionsData);
            setOriginalSubmissions(submissionsData);
            
            // Initial sort by overall score
            const sortedSubmissions = [...submissionsData].sort((a, b) => b.overallScore - a.overallScore);
            setSubmissions(sortedSubmissions);
          } else {
            console.warn('No submissions found after transformation');
            // Try fallback
            tryFallbackSubmissions();
          }
        } else {
          console.warn('Leaderboard data is missing or in unexpected format:', leaderboardResponse.data);
          // Try fallback
          tryFallbackSubmissions();

        }
      } catch (error) {
        console.error('Error fetching hackathon data:', error);
        // Try fallback
        tryFallbackSubmissions();
      } finally {
        setIsLoading(false);
      }
    };
    



    const tryFallbackSubmissions = async () => {
      console.log('Trying to fetch submissions directly as fallback');
      try {
        const submissionsResponse = await hackathonAPI.getSubmissions(hackathonId);
        console.log('Submissions fallback response:', submissionsResponse);
        
        if (submissionsResponse.data && 
            submissionsResponse.data.data && 
            Array.isArray(submissionsResponse.data.data) && 
            submissionsResponse.data.data.length > 0) {
          
          // Transform the data to match our Submission interface
          const fallbackSubmissions = submissionsResponse.data.data.map((item: SubmissionResponse) => {
            // Extract parameter scores from the submission's evaluation
            const parameters: SubmissionParams = {};
            
            if (item.evaluation && Array.isArray(item.evaluation)) {
              item.evaluation.forEach((evaluation) => {
                parameters[evaluation.parameterName] = evaluation.score;
              });
            }
            
            return {
              id: item._id,
              _id: item._id,
              studentName: item.userId?.fullName || 'Unknown Student',
              submissionTitle: item.submissionText?.substring(0, 50) || 'Untitled Submission',
              submissionDate: item.submittedAt,
              overallScore: item.totalScore || 0,
              parameters,
              isShortlisted: item.isShortlisted || false,
              userId: item.userId || {},
              submissionText: item.submissionText,
              files: item.files,
              evaluation: item.evaluation,
              feedback: item.feedback,
              summary_feedback: item.summary_feedback
            };
          });
          
          console.log('Fallback submissions data:', fallbackSubmissions);
          
          if (fallbackSubmissions.length > 0) {
            setSubmissions(fallbackSubmissions);
            setOriginalSubmissions(fallbackSubmissions);
            
            // Initial sort by overall score
            const sortedSubmissions = [...fallbackSubmissions].sort((a, b) => b.overallScore - a.overallScore);
            setSubmissions(sortedSubmissions);
          } else {
            console.warn('No submissions found from fallback either');
          }
        } else {
          console.warn('Submissions fallback data is missing or in unexpected format:', submissionsResponse.data);
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback submissions:', fallbackError);
      }
    };
    
    fetchHackathonData();
  }, [hackathonId]);


  // Load more submissions when scrolling or changing page
  useEffect(() => {
    setIsLoading(true);
    // Calculate displayed submissions based on current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedSubmissions(submissions.slice(0, endIndex));
    setIsLoading(false);
  }, [currentPage, submissions]);

  // Handle sort functionality
  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedSubmissions = [...submissions].sort((a, b) => {
      // Handle nested parameter keys
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        if (parentKey === 'parameters' && childKey) {
          const aValue = a.parameters[childKey] || 0;
          const bValue = b.parameters[childKey] || 0;
          return direction === 'ascending' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        }
        return 0;
      }

      // Handle demographic sorting
      if (key === 'userId.state') {
        const aValue = a.userId?.state || '';
        const bValue = b.userId?.state || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (key === 'userId.district') {
        const aValue = a.userId?.district || '';
        const bValue = b.userId?.district || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (key === 'userId.schoolCollegeName') {
        const aValue = a.userId?.schoolCollegeName || '';
        const bValue = b.userId?.schoolCollegeName || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (key === 'userId.grade') {
        const aValue = a.userId?.grade || '';
        const bValue = b.userId?.grade || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (key === 'userId.gender') {
        const aValue = a.userId?.gender || '';
        const bValue = b.userId?.gender || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle non-nested keys
      if (key === 'overallScore') {
        return direction === 'ascending' 
          ? a.overallScore - b.overallScore 
          : b.overallScore - a.overallScore;
      } else if (key === 'submissionDate') {
        const aDate = new Date(a.submissionDate).getTime();
        const bDate = new Date(b.submissionDate).getTime();
        return direction === 'ascending' 
          ? aDate - bDate 
          : bDate - aDate;
      } else if (key === 'submissionTitle') {
        return direction === 'ascending'

          ? a.submissionTitle.localeCompare(b.submissionTitle)
          : b.submissionTitle.localeCompare(a.submissionTitle);
      } else if (key === 'studentName') {
        return direction === 'ascending'
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);

      }
      
      return 0;
    });

    setSubmissions(sortedSubmissions);
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  // Filter submissions by parameter scores
  const applyFilter = () => {
    if (!filterParam) return;


    const filtered = [...originalSubmissions].filter(submission => {
      if (filterParam === 'overallScore') {
        return submission.overallScore >= filterMin && submission.overallScore <= filterMax;

      }
      
      if (filterParam.includes('.')) {
        const [parent, child] = filterParam.split('.');
        if (parent === 'parameters' && child && child in submission.parameters) {
          return submission.parameters[child] >= filterMin && submission.parameters[child] <= filterMax;
        }
      }
      
      return true;
    });

    setSubmissions(filtered);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // Apply demographic filters
  const applyDemographicFilter = () => {
    let filtered = [...originalSubmissions];
    
    // Apply state filter
    if (demographicFilter.state) {
      filtered = filtered.filter(s => 
        s.userId?.state?.toLowerCase().includes(demographicFilter.state.toLowerCase())
      );
    }
    
    // Apply district filter
    if (demographicFilter.district) {
      filtered = filtered.filter(s => 
        s.userId?.district?.toLowerCase().includes(demographicFilter.district.toLowerCase())
      );
    }
    
    // Apply grade filter
    if (demographicFilter.grade) {
      filtered = filtered.filter(s => 
        s.userId?.grade?.toLowerCase() === demographicFilter.grade.toLowerCase()
      );
    }
    
    // Apply gender filter
    if (demographicFilter.gender) {
      filtered = filtered.filter(s => 
        s.userId?.gender?.toLowerCase() === demographicFilter.gender.toLowerCase()
      );
    }
    
    // Apply school filter
    if (demographicFilter.school) {
      filtered = filtered.filter(s => 
        s.userId?.schoolCollegeName?.toLowerCase().includes(demographicFilter.school.toLowerCase())
      );
    }
    
    setSubmissions(filtered);
    setCurrentPage(1);
    setIsDemographicFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSubmissions(originalSubmissions);
    setFilterParam(null);
    setFilterMin(0);
    setFilterMax(100);
    setCurrentPage(1);
    setIsFilterOpen(false);
    setDemographicFilter({
      state: '',
      district: '',
      grade: '',
      gender: '',
      school: ''
    });
    setIsDemographicFilterOpen(false);
  };


  // Toggle shortlist
  const toggleShortlist = async (submissionId: string) => {
    try {
      await submissionAPI.toggleShortlist(submissionId);
      
      // Update local state
      const updatedSubmissions = submissions.map(submission => {
        if (submission.id === submissionId) {
          return { ...submission, isShortlisted: !submission.isShortlisted };
        }
        return submission;
      });
      
      setSubmissions(updatedSubmissions);
      setOriginalSubmissions(prev => 
        prev.map(sub => sub.id === submissionId ? { ...sub, isShortlisted: !sub.isShortlisted } : sub)
      );
    } catch (error) {
      console.error('Error toggling shortlist:', error);
    }
  };


  // Load more submissions
  const loadMore = () => {
    if (currentPage * ITEMS_PER_PAGE < submissions.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    }
    return null;
  };

  const viewSubmissionDetails = (submissionId: string) => {
    navigate(`/dashboard/teacher/submission/${submissionId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">View and manage all submissions for this hackathon</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Submissions</h2>

                <div className="flex space-x-2">

                  <div className="relative">
                    <button
                      onClick={() => setIsDemographicFilterOpen(!isDemographicFilterOpen)}
                      className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                    >
                      <Users className="w-4 h-4" />

                      <span>Demographics</span>
                    </button>
                    
                    {isDemographicFilterOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md p-4 z-10 border">

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              <input
                                type="text"
                                value={demographicFilter.state}
                                onChange={(e) => setDemographicFilter({...demographicFilter, state: e.target.value})}
                                placeholder="Filter by state..."
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">District</label>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              <input
                                type="text"
                                value={demographicFilter.district}
                                onChange={(e) => setDemographicFilter({...demographicFilter, district: e.target.value})}
                                placeholder="Filter by district..."
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">School</label>
                            <div className="flex items-center">
                              <School className="w-4 h-4 mr-2 text-gray-500" />
                              <input
                                type="text"
                                value={demographicFilter.school}
                                onChange={(e) => setDemographicFilter({...demographicFilter, school: e.target.value})}
                                placeholder="Filter by school..."
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Grade</label>
                            <div className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                              <select
                                value={demographicFilter.grade}
                                onChange={(e) => setDemographicFilter({...demographicFilter, grade: e.target.value})}
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              >
                                <option value="">All Grades</option>
                                <option value="8">Grade 8</option>
                                <option value="9">Grade 9</option>
                                <option value="10">Grade 10</option>
                                <option value="11">Grade 11</option>
                                <option value="12">Grade 12</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-gray-500" />
                              <select
                                value={demographicFilter.gender}
                                onChange={(e) => setDemographicFilter({...demographicFilter, gender: e.target.value})}
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              >
                                <option value="">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <button
                              onClick={resetFilters}
                              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                            >
                              Reset
                            </button>
                            <button
                              onClick={applyDemographicFilter}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Score Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Score Filter</span>
                    </button>
                    
                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-10 border">
                        {/* Score filter content */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Parameter</label>
                            <select
                              value={filterParam || ''}
                              onChange={(e) => setFilterParam(e.target.value || null)}
                              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                            >
                              <option value="">Select parameter</option>
                              <option value="overallscore">Overall Score</option>
                              {evaluationParams.map((param) => (
                                <option key={param} value={`parameters.${param}`}>
                                  {param.charAt(0).toUpperCase() + param.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex space-x-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                              <input
                                type="number"
                                value={filterMin}
                                onChange={(e) => setFilterMin(Number(e.target.value))}
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                              <input
                                type="number"
                                value={filterMax}
                                onChange={(e) => setFilterMax(Number(e.target.value))}
                                className="block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('studentName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Student</span>
                          {getSortIndicator('studentName')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('submissionTitle')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Submission</span>
                          {getSortIndicator('submissionTitle')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"

                        onClick={() => handleSort('submissionDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {getSortIndicator('submissionDate')}

                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('overallScore')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Score</span>
                          {getSortIndicator('overallScore')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">


                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : displayedSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          No submissions found

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {displayedSubmissions.length < submissions.length && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {selectedSubmission && (
            <div className="lg:w-1/4 bg-white rounded-lg shadow">
              <SubmissionDetail
                submission={submissions.find(s => s.id === selectedSubmission)!}
                onClose={() => setSelectedSubmission(null)}
                fullSubmission
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;