import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Star, ChevronRight, Filter, Users, MapPin, School, GraduationCap, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';
import { hackathonAPI, submissionAPI } from '../../lib/api';

import { set } from 'react-hook-form';


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
    schoolName?: string;
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
  totalScore: number;
  feedback?: string;
  summary_feedback?: {
    summary: string;
    feedback: string;
    performance_category: string;
  };
  submittedAt: string;
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
    schoolName?: string;
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
    submittedAt: string;
    totalScore: number;
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
      schoolName?: string;
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string >();
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'descending' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDemographicFilterOpen, setIsDemographicFilterOpen] = useState(false);
  const [filterParam, setFilterParam] = useState<string | null>(null);
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(100);

  const [evaluationParams, setEvaluationParams] = useState<string[]>([]);

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
  



  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!hackathonId) return;
      setIsLoading(true);
      try {
        const response = await hackathonAPI.getLeaderboard(hackathonId);
        if (response.data.success) {
          const fetchedSubmissions: Submission[] = response.data.data;
          const hackathon = await hackathonAPI.getHackathon(hackathonId);
          console.log("Fetched leaderboard data:", fetchedSubmissions);
          const parameters = hackathon.data.data.parameters.map((param: any) => param.name);
          setEvaluationParams(parameters);
          
          fetchedSubmissions.sort((a, b) => b.totalScore - a.totalScore);
          setSubmissions(fetchedSubmissions);
          setDisplayedSubmissions(fetchedSubmissions.slice(0, ITEMS_PER_PAGE));
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
      setIsLoading(false);
    };
    
    fetchLeaderboard();
  }, [hackathonId]);

  // const selectedSubmission = submissions.find(s => s.id === selectedSubmission);

  

  const handleSelectSubmission = (submissionId?: string) => {
    setSelectedSubmissionId(submissionId);
    setSelectedSubmission(hackathonId ?? null); // ✅ Ensure it never gets undefined
  };

  // Toggle shortlist
  const toggleShortlist = async (submissionId: string) => {
    setSubmissions(prevSubmissions =>
      prevSubmissions.map(submission =>
        submission.id === submissionId
          ? { ...submission, isShortlisted: !submission.isShortlisted }
          : submission
          
      )
    );
    
  };


  // Load more submissions when scrolling or changing page
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setDisplayedSubmissions(submissions.slice(0, endIndex));
      console.log(`Displaying submissions:`, displayedSubmissions);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);

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

          const aValue = a.parameters?.[childKey] ?? 0; // Default to 0 if undefined
          const bValue = b.parameters?.[childKey] ?? 0; // Default to 0 if undefined

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
      
      if (key === 'userId.schoolName') {
        const aValue = a.userId?.schoolName || '';
        const bValue = b.userId?.schoolName || '';
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
      if (key === 'totalScore') {
        return direction === 'ascending' 
          ? a.totalScore - b.totalScore 
          : b.totalScore - a.totalScore;
      } else if (key === 'submittedAt') {
        const aDate = new Date(a.submittedAt).getTime();
        const bDate = new Date(b.submittedAt).getTime();
        return direction === 'ascending' 
          ? aDate - bDate 
          : bDate - aDate;
      } else if (key === 'submissionText') {
        return direction === 'ascending'

          ? a.submittedAt.localeCompare(b.submittedAt)
          : b.submittedAt.localeCompare(a.submittedAt);

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


    const filtered = submissions.filter(submission => {
      if (filterParam === 'totalScore') {
        return submission.totalScore >= filterMin && submission.totalScore <= filterMax;

      }
      
      if (filterParam.includes('.')) {
        const [parent, child] = filterParam.split('.');
        if (parent === 'parameters' && child && submission.parameters?.[child] !== undefined) {
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
        s.userId?.schoolName?.toLowerCase().includes(demographicFilter.school.toLowerCase())
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

                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-10 border">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Parameter</label>
                          <select
                            value={filterParam || ''}
                            onChange={(e) => setFilterParam(e.target.value || null)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                          >
                            <option value="">Select parameter</option>
                            <option value="totalScore">Overall Score</option>
                            {evaluationParams.map((param) => (
                              <option key={param} value={`parameters.${param}`}>
                                {param.charAt(0).toUpperCase() + param.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex space-x-2">

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
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
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Parameter</label>
                            <select
                              value={filterParam || ''}
                              onChange={(e) => setFilterParam(e.target.value || null)}
                              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                            >
                              <option value="">Select parameter</option>
                              <option value="overallScore">Overall Score</option>
                              {hackathon && hackathon.parameters && hackathon.parameters.map((param: any) => (
                                <option key={param._id} value={`parameters.${param.name}`}>
                                  {param.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex space-x-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Min</label>
                              <input
                                type="number"
                                value={filterMin}
                                onChange={(e) => setFilterMin(Number(e.target.value))}
                                min="0"
                                max="100"
                                className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Max</label>
                              <input
                                type="number"
                                value={filterMax}
                                onChange={(e) => setFilterMax(Number(e.target.value))}
                                min="0"
                                max="100"
                                className="mt-1 block w-full border rounded-md px-3 py-2 text-sm"
                              />
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
                              onClick={applyFilter}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                              disabled={!filterParam}
                            >
                              Apply
                            </button>
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
                        onClick={() => handleSort('submissionText')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Submission</span>
                          {getSortIndicator('submissionText')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('submittedAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          {getSortIndicator('submittedAt')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('totalScore')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Score</span>
                          {getSortIndicator('totalScore')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">

                    {displayedSubmissions.map((submission, index) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.userId?.fullName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.submissionText}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.totalScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => submission?.id && toggleShortlist(submission.id)}

                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Star className={`w-5 h-5 ${submission.isShortlisted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                          <button
                            // onClick={() => setSelectedSubmission(submission)}
                            onClick = {() => handleSelectSubmission(submission.id)}

                            // onClick={() => setSelectedSubmission(submission?.id && selectedSubmission === submission.id ? null : submission.id )}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                        </td>
                      </tr>
                    ) : (
                      displayedSubmissions.map((submission, index) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.submissionTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.round(submission.overallScore)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleShortlist(submission.id)}
                              className={`text-yellow-500 hover:text-yellow-700 ${submission.isShortlisted ? 'fill-yellow-400' : ''}`}
                            >
                              <Star className={`w-5 h-5 ${submission.isShortlisted ? 'fill-yellow-400' : ''}`} />
                            </button>
                            <button
                              onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? null : submission.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => viewSubmissionDetails(submission.id)}
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Open full submission view"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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

            <SubmissionDetail
              submissionId={selectedSubmissionId } // Ensure correct ID is passed
              hackathonId={hackathonId} // Pass the hackathon ID for evaluation fetching
              onClose={() => setSelectedSubmission(null)}
            />

          )}

        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage; 