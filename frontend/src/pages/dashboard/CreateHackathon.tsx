import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Users, Filter } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import { hackathonAPI } from '../../lib/api';

interface Parameter {
  id: string;
  name: string;
  weight: number;
  description: string;
}

interface EligibilityCriteria {
  id: string;
  criteriaType: 'grade' | 'school' | 'state' | 'phoneNumbers';
  values: string[];
  phoneNumbers: string[];
}

const CreateHackathon: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collaborators, setCollaborators] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parameters state
  const [parameters, setParameters] = useState<Parameter[]>([
    { id: '1', name: 'Impact on society', weight: 100, description: 'How impactful is this project for society?' },
  ]);
  
  // Eligibility criteria state
  const [criteria, setCriteria] = useState<EligibilityCriteria[]>([]);
  
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

  // Eligibility criteria functions
  const addCriteria = () => {
    const newId = (criteria.length + 1).toString();
    setCriteria([
      ...criteria,
      {
        id: newId,
        criteriaType: 'grade',
        values: [],
        phoneNumbers: [],
      },
    ]);
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(crit => crit.id !== id));
  };

  const updateCriteria = (id: string, field: keyof EligibilityCriteria, value: string | string[]) => {
    setCriteria(criteria.map(crit => {
      if (crit.id === id) {
        return { ...crit, [field]: value };
      }
      return crit;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (parameters.some(param => !param.name || !param.description)) {
      setError('Please fill in all parameter details');
      return;
    }

    const totalWeight = parameters.reduce((sum, param) => sum + param.weight, 0);
    if (totalWeight !== 100) {
      setError('Parameter weights must sum to 100');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Format parameters for API
      const formattedParameters = parameters.map(({ name, weight, description }) => ({
        name,
        weight,
        description,
      }));
      
      // Format eligibility criteria for API
      const formattedCriteria = criteria.map(({ criteriaType, values, phoneNumbers }) => ({
        criteriaType,
        values: criteriaType !== 'phoneNumbers' ? values : [],
        phoneNumbers: criteriaType === 'phoneNumbers' ? phoneNumbers : [],
      }));
      
      // Create hackathon
      const response = await hackathonAPI.createHackathon({
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        parameters: formattedParameters,
        eligibilityCriteria: formattedCriteria,
      });
      
      // If collaborators were added, add them to the hackathon
      if (collaborators.trim()) {
        const collaboratorPhoneNumbers = collaborators
          .split(',')
          .map(num => num.trim())
          .filter(num => num.length === 10);
        
        if (collaboratorPhoneNumbers.length > 0) {
          await hackathonAPI.addCollaborators(
            response.data.data._id,
            collaboratorPhoneNumbers
          );
        }
      }
      
      // Navigate back to teacher dashboard
      navigate('/dashboard/teacher');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'object' && err !== null && 'response' in err 
        ? (err.response as any)?.data?.message 
        : 'Failed to create hackathon. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render input fields for criteria values
  const renderCriteriaInputs = (crit: EligibilityCriteria) => {
    switch (crit.criteriaType) {
      case 'grade':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Grades (comma separated)</label>
            <input
              type="text"
              value={crit.values.join(', ')}
              onChange={(e) => updateCriteria(crit.id, 'values', e.target.value.split(',').map(v => v.trim()))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. 9, 10, 11, 12"
            />
          </div>
        );
      case 'school':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Schools (comma separated)</label>
            <input
              type="text"
              value={crit.values.join(', ')}
              onChange={(e) => updateCriteria(crit.id, 'values', e.target.value.split(',').map(v => v.trim()))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. School A, School B"
            />
          </div>
        );
      case 'state':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible States (comma separated)</label>
            <input
              type="text"
              value={crit.values.join(', ')}
              onChange={(e) => updateCriteria(crit.id, 'values', e.target.value.split(',').map(v => v.trim()))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. CA, NY, TX"
            />
          </div>
        );
      case 'phoneNumbers':
        return (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Specific Student Phone Numbers (comma separated)</label>
            <input
              type="text"
              value={crit.phoneNumbers.join(', ')}
              onChange={(e) => updateCriteria(crit.id, 'phoneNumbers', e.target.value.split(',').map(v => v.trim()))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. 1234567890, 9876543210"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Hackathon</h1>
          <p className="text-gray-600 mt-1">Set up a new hackathon for your students</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
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

          {/* Collaborators */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Collaborators (Optional)</h2>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <label htmlFor="collaborators" className="block text-sm font-medium text-gray-700">
                Teacher Phone Numbers (comma separated)
              </label>
              <input
                type="text"
                id="collaborators"
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. 1234567890, 9876543210"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add other teachers as collaborators by entering their phone numbers
              </p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Eligibility Criteria (Optional)</h2>
              <button
                type="button"
                onClick={addCriteria}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Filter className="w-4 h-4 mr-1" />
                Add Criteria
              </button>
            </div>
            
            {criteria.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No criteria added. By default, all students can participate.</p>
            ) : (
              <div className="space-y-4">
                {criteria.map((crit) => (
                  <div key={crit.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <select
                          value={crit.criteriaType}
                          onChange={(e) => updateCriteria(crit.id, 'criteriaType', e.target.value as 'grade' | 'school' | 'state' | 'phoneNumbers')}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="grade">Filter by Grade</option>
                          <option value="school">Filter by School</option>
                          <option value="state">Filter by State</option>
                          <option value="phoneNumbers">Specific Phone Numbers</option>
                        </select>
                        
                        {renderCriteriaInputs(crit)}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeCriteria(crit.id)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evaluation Parameters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
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

            <div className="space-y-4">
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
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/teacher')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Hackathon'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateHackathon; 