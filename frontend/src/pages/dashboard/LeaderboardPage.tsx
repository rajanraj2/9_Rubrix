import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Star, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import SubmissionDetail from '../../components/dashboard/SubmissionDetail';

interface SubmissionParams {
  innovation: number;
  technical: number;
  design: number;
  presentation: number;
  [key: string]: number;
}

interface Submission {
  id: string;
  studentName: string;
  submissionTitle: string;
  submissionDate: string;
  overallScore: number;
  parameters: SubmissionParams;
  isShortlisted: boolean;
}

// Sample data for demonstration purposes
const SAMPLE_SUBMISSIONS: Submission[] = Array.from({ length: 100 }, (_, i) => ({
  id: `submission-${i + 1}`,
  studentName: `Student ${i + 1}`,
  submissionTitle: `Project ${i + 1}`,
  submissionDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
  overallScore: Math.floor(Math.random() * 100),
  parameters: {
    innovation: Math.floor(Math.random() * 100),
    technical: Math.floor(Math.random() * 100),
    design: Math.floor(Math.random() * 100),
    presentation: Math.floor(Math.random() * 100),
  },
  isShortlisted: Math.random() > 0.8, // 20% are shortlisted randomly
}));

// Sort submissions by overall score descending
SAMPLE_SUBMISSIONS.sort((a, b) => b.overallScore - a.overallScore);

const ITEMS_PER_PAGE = 10;

const LeaderboardPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  console.log(`Loading leaderboard for hackathon: ${hackathonId}`);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissions, setSubmissions] = useState(SAMPLE_SUBMISSIONS);
  const [displayedSubmissions, setDisplayedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState({ key: 'overallScore', direction: 'descending' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterParam, setFilterParam] = useState<string | null>(null);
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(100);

  // Load more submissions when scrolling or changing page
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setDisplayedSubmissions(submissions.slice(0, endIndex));
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
          const aValue = a.parameters[childKey];
          const bValue = b.parameters[childKey];
          return direction === 'ascending' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        }
        return 0;
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
      }
      
      return 0;
    });

    setSubmissions(sortedSubmissions);
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  // Filter submissions
  const applyFilter = () => {
    if (!filterParam) return;

    const filtered = SAMPLE_SUBMISSIONS.filter(submission => {
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

  // Reset filters
  const resetFilters = () => {
    setSubmissions(SAMPLE_SUBMISSIONS);
    setFilterParam(null);
    setFilterMin(0);
    setFilterMax(100);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // Toggle shortlist
  const toggleShortlist = (submissionId: string) => {
    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === submissionId) {
        return { ...submission, isShortlisted: !submission.isShortlisted };
      }
      return submission;
    });
    setSubmissions(updatedSubmissions);
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
                            <option value="overallScore">Overall Score</option>
                            <option value="parameters.innovation">Innovation</option>
                            <option value="parameters.technical">Technical</option>
                            <option value="parameters.design">Design</option>
                            <option value="parameters.presentation">Presentation</option>
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
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
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
                    {displayedSubmissions.map((submission, index) => (
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
                          {submission.overallScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => toggleShortlist(submission.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Star className={`w-5 h-5 ${submission.isShortlisted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => setSelectedSubmission(selectedSubmission === submission.id ? null : submission.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
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
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage; 