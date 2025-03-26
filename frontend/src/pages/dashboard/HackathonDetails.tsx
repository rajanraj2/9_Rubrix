import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { Plus, Filter, Search, X } from 'lucide-react';

import Sidebar from '../../components/dashboard/Sidebar';
import { hackathonAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

// Define color scheme for scores
const getScoreColor = (score: number): string => {
  if (score > 70) return '#10B981'; // green
  if (score >= 40) return '#F59E0B'; // yellow
  return '#EF4444'; // red
};

// Interfaces for our data structures
interface UserData {
  _id: string;
  fullName: string;
  phoneNumber: string;
  state?: string;
  district?: string;
  grade?: string;
  gender?: string;
  
  schoolCollegeName?: string;
  schoolName?: string;
}

interface Participant {
  _id: string;
  userId: UserData;
  hackathonId: string;
}

interface Evaluation {
  parameterId: string;
  parameterName: string;
  score: number;
  feedback?: string;
}

interface Submission {
  _id: string;
  userId: UserData;
  hackathonId: string;
  submissionText: string;
  evaluation: Evaluation[];
  totalScore: number;
  isShortlisted: boolean;
  submittedAt: string;
}

interface ChartData {
  name: string;
  value: number;
}

interface ScoreDistributionData {
  range: string;
  count: number;
}

interface ParameterScoreData {
  name: string;
  average: number;
}

interface FilteredData {
  participant: Participant;
  submissions: Submission[];
}

interface HackathonParameter {
  name: string;
  weight: number;
  description?: string;
}

const HackathonDetails = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [selectedView, setSelectedView] = useState('overall');
  const [parameters, setParameters] = useState<ParameterScoreData[]>([]);
  const [newParameter, setNewParameter] = useState('');
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);

  // Demographic data states
  const [stateData, setStateData] = useState<ChartData[]>([]);
  const [genderData, setGenderData] = useState<ChartData[]>([]);
  const [districtData, setDistrictData] = useState<ChartData[]>([]);
  const [schoolData, setSchoolData] = useState<ChartData[]>([]);
  const [gradeData, setGradeData] = useState<ChartData[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistributionData[]>([]);
  const [parameterScores, setParameterScores] = useState<ParameterScoreData[]>([]);


  useEffect(() => {
    const fetchHackathonDetails = async () => {
      if (!hackathonId) return;
      
      try {
        setIsLoading(true);
        setError(null);

        
        // Fetch hackathon details
        const response = await hackathonAPI.getHackathon(hackathonId);
        setHackathon(response.data.data);
        
        // Fetch participants data
        const participantsResponse = await hackathonAPI.getParticipants(hackathonId);
        setParticipants(participantsResponse.data.data);
        
        // Fetch submissions and leaderboard data
        const submissionsResponse = await hackathonAPI.getSubmissions(hackathonId);
        setSubmissions(submissionsResponse.data.data);
        
        // Process demographic data
        processParticipantData(participantsResponse.data.data);
        processSubmissionData(submissionsResponse.data.data);
        
        // If there are parameters defined, use them
        if (response.data.data.parameters && response.data.data.parameters.length > 0) {
          setParameters(response.data.data.parameters.map((param: HackathonParameter) => ({

            name: param.name,
            average: param.weight,
          })));
        }
      } catch (error) {

        setError('Failed to load hackathon details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathonDetails();
  }, [hackathonId]);


  const processParticipantData = (participants: Participant[]) => {
    // Process state data
    const stateCount: Record<string, number> = {};
    const genderCount: Record<string, number> = {};
    const districtCount: Record<string, number> = {};
    const schoolCount: Record<string, number> = {};
    const gradeCount: Record<string, number> = {};

    participants.forEach(participant => {
      const user = participant.userId;
      if (!user) return;

      // Count by state
      const state = user.state;
      if (state) {
        stateCount[state] = (stateCount[state] || 0) + 1;
      }

      // Count by gender
      const gender = user.gender;
      if (gender) {
        genderCount[gender] = (genderCount[gender] || 0) + 1;
      }

      // Count by district
      const district = user.district;
      if (district) {
        districtCount[district] = (districtCount[district] || 0) + 1;
      }

      // Count by school

      const school = user.schoolCollegeName || user.schoolCollegeName;

      if (school) {
        schoolCount[school] = (schoolCount[school] || 0) + 1;
      }

      // Count by grade
      const grade = user.grade;
      if (grade) {
        gradeCount[grade] = (gradeCount[grade] || 0) + 1;
      }
    });

    // Convert counts to chart data format
    setStateData(Object.keys(stateCount).map(state => ({ name: state, value: stateCount[state] })));
    setGenderData(Object.keys(genderCount).map(gender => ({ name: gender, value: genderCount[gender] })));
    setDistrictData(Object.keys(districtCount).map(district => ({ name: district, value: districtCount[district] })));
    setSchoolData(Object.keys(schoolCount).map(school => ({ name: school, value: schoolCount[school] })));
    setGradeData(Object.keys(gradeCount).map(grade => ({ name: grade, value: gradeCount[grade] })));
  };

  const processSubmissionData = (submissions: Submission[]) => {
    // Process score distribution
    const scoreBuckets: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    // Parameter scores accumulation
    const paramScores: Record<string, { name: string; totalScore: number; count: number }> = {};

    submissions.forEach(submission => {
      // Score distribution
      const score = submission.totalScore || 0;
      if (score <= 20) scoreBuckets['0-20']++;
      else if (score <= 40) scoreBuckets['21-40']++;
      else if (score <= 60) scoreBuckets['41-60']++;
      else if (score <= 80) scoreBuckets['61-80']++;
      else scoreBuckets['81-100']++;

      // Parameter scores
      if (submission.evaluation && submission.evaluation.length) {
        submission.evaluation.forEach(evalItem => {
          if (!paramScores[evalItem.parameterName]) {
            paramScores[evalItem.parameterName] = {
              name: evalItem.parameterName,
              totalScore: 0,
              count: 0
            };
          }
          // Ensure score is properly normalized
          paramScores[evalItem.parameterName].totalScore += evalItem.score;
          paramScores[evalItem.parameterName].count++;
        });
      }
    });

    // Convert score distribution to chart data
    setScoreDistribution(Object.keys(scoreBuckets).map(range => ({
      range,
      count: scoreBuckets[range]
    })));

    // Calculate average for each parameter
    const parameterData = Object.values(paramScores).map(param => ({
      name: param.name,
      average: param.count ? Math.round((param.totalScore / param.count)) : 0
    }));

    setParameterScores(parameterData);
  };


  const handleAddParameter = () => {
    if (newParameter.trim()) {
      setParameters([...parameters, { name: newParameter, average: 0 }]);
      setNewParameter('');
    }
  };


  const handleFilterByPhone = () => {
    if (!phoneFilter.trim()) {
      setFilteredData(null);
      return;
    }

    // Find participant by phone number
    const participant = participants.find(p => 
      p.userId && p.userId.phoneNumber === phoneFilter.trim()
    );

    if (!participant) {
      alert("No participant found with this phone number");
      return;
    }

    // Find submissions for this participant
    const userSubmissions = submissions.filter(s => 
      s.userId && s.userId._id === participant.userId._id
    );

    setFilteredData({
      participant: participant,
      submissions: userSubmissions
    });
  };

  const clearFilter = () => {
    setPhoneFilter('');
    setFilteredData(null);

  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="teacher" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="teacher" />
        <main className="flex-1 p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error || "Hackathon not found"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{hackathon.title}</h1>
          <p className="text-gray-600 mt-1">{hackathon.description}</p>
          

          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedView('overall')}
                className={`px-4 py-2 rounded-md ${
                  selectedView === 'overall'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Overall
              </button>
              <button
                onClick={() => setSelectedView('parameters')}
                className={`px-4 py-2 rounded-md ${
                  selectedView === 'parameters'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Parameters
              </button>
              <button
                onClick={() => setSelectedView('demographics')}
                className={`px-4 py-2 rounded-md ${
                  selectedView === 'demographics'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Demographics
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-10 border">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Filter by</h3>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={phoneFilter}
                      onChange={(e) => setPhoneFilter(e.target.value)}
                      placeholder="Student Phone Number"
                      className="flex-1 border rounded-l-md px-3 py-2 text-sm"
                    />
                    <button 
                      onClick={handleFilterByPhone}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-r-md"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  {filteredData && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Filtered by:</span>
                        <button onClick={clearFilter} className="text-xs text-red-500">
                          Clear <X className="inline w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{filteredData.participant.userId.fullName}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {filteredData ? (
          // Single student insights view
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{filteredData.participant.userId.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">School/College</p>
                    <p className="font-medium">{filteredData.participant.userId.schoolCollegeName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-medium">{filteredData.participant.userId.grade || 'N/A'}</p>
                  </div>
                </div>
                
                {filteredData.submissions.length > 0 ? (
                  <>
                    <h4 className="text-md font-medium text-gray-900 mt-6 mb-2">Submission Scores</h4>
                    {filteredData.submissions.map((submission, idx) => (
                      <div key={idx} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          <span 
                            className="text-lg font-bold" 
                            style={{ color: getScoreColor(submission.totalScore) }}
                          >
                            {submission.totalScore || 0}/100
                          </span>
                        </div>
                        
                        {submission.evaluation && submission.evaluation.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Parameter Scores:</h5>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={submission.evaluation.map(e => ({
                                  parameter: e.parameterName,
                                  score: e.score,
                                  color: getScoreColor(e.score * 10) // Assuming score is out of 10
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="parameter" />
                                  <YAxis domain={[0, 10]} />
                                  <Tooltip />
                                  <Bar 
                                    dataKey="score" 
                                    fill="#8884d8" 
                                    name="Score" 
                                    label={{ position: 'top' }}
                                    isAnimationActive={false}
                                  >
                                    {submission.evaluation.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score * 10)} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No submissions found for this student.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : selectedView === 'overall' ? (
          // Overall insights view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participation Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Registered', value: participants.length },
                        { name: 'Submitted', value: submissions.length },
                        { name: 'Shortlisted', value: submissions.filter(s => s.isShortlisted).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      name="Submissions" 
                      isAnimationActive={false}
                    >
                      {scoreDistribution.map((entry, index) => {
                        const range = entry.range.split('-');
                        const avgScore = (parseInt(range[0]) + parseInt(range[1])) / 2;
                        return <Cell key={`cell-${index}`} fill={getScoreColor(avgScore)} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : selectedView === 'parameters' ? (
          // Parameters view
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Parameter Analysis</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newParameter}
                    onChange={(e) => setNewParameter(e.target.value)}
                    placeholder="New parameter name"
                    className="px-3 py-1 border rounded-md"
                  />
                  <button
                    onClick={handleAddParameter}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={parameterScores.length > 0 ? parameterScores : parameters}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar 
                      dataKey="average" 
                      name="Average Score" 
                      isAnimationActive={false}
                    >
                      {(parameterScores.length > 0 ? parameterScores : parameters).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.average)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          // Demographics view (bento grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants by State</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stateData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants by Gender</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants by Grade</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4F46E5" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HackathonDetails;