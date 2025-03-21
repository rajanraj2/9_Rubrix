import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';

interface Parameter {
  id: string;
  name: string;
  weight: number;
  description: string;
}

const CreateHackathon: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([
    { id: '1', name: 'Innovation', weight: 25, description: 'Evaluate the uniqueness and creativity of the solution' },
    { id: '2', name: 'Technical', weight: 25, description: 'Assess the technical implementation and code quality' },
    { id: '3', name: 'Design', weight: 25, description: 'Judge the user interface and experience design' },
    { id: '4', name: 'Presentation', weight: 25, description: 'Rate the project documentation and presentation' },
  ]);
  
  const addParameter = () => {
    const newId = (parameters.length + 1).toString();
    setParameters([
      ...parameters,
      {
        id: newId,
        name: '',
        weight: 0,
        description: '',
      },
    ]);
  };

  const removeParameter = (id: string) => {
    setParameters(parameters.filter(param => param.id !== id));
    rebalanceWeights(parameters.filter(param => param.id !== id));
  };

  const updateParameter = (id: string, field: keyof Parameter, value: string | number) => {
    setParameters(parameters.map(param => {
      if (param.id === id) {
        return { ...param, [field]: value };
      }
      return param;
    }));
  };

  const rebalanceWeights = (params: Parameter[]) => {
    const totalWeight = params.reduce((sum, param) => sum + param.weight, 0);
    if (totalWeight === 100) return;

    const remainingWeight = 100 - totalWeight;
    const paramsToAdjust = params.filter(param => param.weight > 0);
    
    if (paramsToAdjust.length === 0) return;

    const weightPerParam = Math.floor(remainingWeight / paramsToAdjust.length);
    const extraWeight = remainingWeight % paramsToAdjust.length;

    setParameters(params.map((param, index) => ({
      ...param,
      weight: param.weight > 0 
        ? param.weight + weightPerParam + (index < extraWeight ? 1 : 0)
        : param.weight
    })));
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    const updatedParameters = parameters.map(param => {
      if (param.id === id) {
        return { ...param, weight: newWeight };
      }
      return param;
    });

    setParameters(updatedParameters);
    rebalanceWeights(updatedParameters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (parameters.some(param => !param.name || !param.description)) {
      alert('Please fill in all parameter details');
      return;
    }

    const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0);
    if (totalWeight !== 100) {
      alert('Parameter weights must sum to 100');
      return;
    }

    // Here you would typically make an API call to create the hackathon
    console.log({
      title,
      description,
      startDate,
      endDate,
      parameters,
    });

    // Navigate back to teacher dashboard
    navigate('/dashboard/teacher');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Hackathon</h1>
          <p className="text-gray-600 mt-1">Set up a new hackathon for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter hackathon title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe the hackathon objectives and requirements"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Evaluation Parameters</h2>
              <button
                type="button"
                onClick={addParameter}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Parameter
              </button>
            </div>

            <div className="space-y-6">
              {parameters.map((param) => (
                <div key={param.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Parameter name"
                        required
                      />
                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) => updateParameter(param.id, 'description', e.target.value)}
                        className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Parameter description"
                        required
                      />
                    </div>
                    {parameters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParameter(param.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      value={param.weight}
                      onChange={(e) => handleWeightChange(param.id, parseInt(e.target.value))}
                      className="flex-1"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-16">
                      Weight: {param.weight}%
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center py-3 px-4 bg-gray-100 rounded-md">
                <span className="font-medium text-gray-700">Total Weight:</span>
                <span className={`font-medium ${parameters.reduce((sum, param) => sum + param.weight, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {parameters.reduce((sum, param) => sum + param.weight, 0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/teacher')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Hackathon
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateHackathon; 