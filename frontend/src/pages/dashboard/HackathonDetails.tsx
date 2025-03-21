import React, { useState } from 'react';
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
} from 'recharts';
import { Plus } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const SAMPLE_DATA = {
  participantStats: [
    { name: 'Registered', value: 150 },
    { name: 'Submitted', value: 120 },
    { name: 'Completed', value: 100 },
    { name: 'Shortlisted', value: 30 },
  ],
  scoreDistribution: [
    { range: '0-20', count: 10 },
    { range: '21-40', count: 25 },
    { range: '41-60', count: 45 },
    { range: '61-80', count: 30 },
    { range: '81-100', count: 10 },
  ],
  parameters: [
    { name: 'Innovation', average: 75 },
    { name: 'Technical', average: 68 },
    { name: 'Design', average: 82 },
    { name: 'Presentation', average: 71 },
  ],
};

const HackathonDetails = () => {
  const [selectedView, setSelectedView] = useState('overall');
  const [parameters, setParameters] = useState(SAMPLE_DATA.parameters);
  const [newParameter, setNewParameter] = useState('');

  const handleAddParameter = () => {
    if (newParameter.trim()) {
      setParameters([...parameters, { name: newParameter, average: 0 }]);
      setNewParameter('');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Hackathon Insights</h1>
          <div className="mt-4 flex space-x-4">
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
          </div>
        </div>

        {selectedView === 'overall' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participation Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SAMPLE_DATA.participantStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {SAMPLE_DATA.participantStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_DATA.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
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
                  <BarChart data={parameters}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#4F46E5" />
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