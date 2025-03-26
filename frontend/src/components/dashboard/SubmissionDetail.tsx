import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { submissionAPI } from '../../lib/api';

interface SubmissionDetailProps {
  submissionId: string | undefined;
  hackathonId: string | undefined;
  onClose: () => void;
}

// Submission Interface (From Node.js Backend)
interface Submission {
  id?: string;
  studentName: string;
  submissionTitle: string;
  submissionDate: string;
  overallScore: number;
  isShortlisted: boolean;
  files?: Array<{
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  description?: string;
  technologies?: string[];
  screenshot?: string;
  repositoryUrl?: string;
  approach?: string;
  challenges?: string;
  learnings?: string;
}

// Evaluation Interface (From FastAPI Backend)
interface Evaluation {
  submission_id: string;
  parameter_scores: Record<string, { id: string; score: number; description: string }>;
  overall_score: number;
  summary_feedback: { summary: string; feedback: string; performance_category: string };
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ submissionId, hackathonId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'feedback'>('preview');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!submissionId) return;

      try {
        const response = await submissionAPI.getSubmission(submissionId);
        if (response.data.success) {
          setSubmission(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    };

    const fetchEvaluationDetails = async () => {
      if (!hackathonId || !submissionId) return;

      try {
        const response = await axios.get(`http://localhost:8000/hackathon/${hackathonId}/evaluations`);
        const evaluations = response.data.submissions;

        // Find the evaluation result for the selected submission
        const submissionEvaluation = evaluations.find((evalResult: Evaluation) => evalResult.submission_id === submissionId);
        setEvaluation(submissionEvaluation || null);
      } catch (error) {
        console.error("Error fetching evaluation results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionDetails();
    fetchEvaluationDetails();
  }, [submissionId, hackathonId]);

  if (isLoading) return <div className="p-6 text-gray-600">Loading submission details...</div>;
  if (!submission) return <div className="p-6 text-gray-600">No submission found.</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {['preview', 'summary', 'feedback'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'preview' | 'summary' | 'feedback')}
            className={`flex-1 py-2 text-center ${
              activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Project Title</h4>
            <p className="text-base font-medium">{submission.submissionTitle}</p>

            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="text-sm">{submission.description || 'No description available.'}</p>

            <h4 className="text-sm font-medium text-gray-500">Technologies Used</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {submission.technologies?.map((tech, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">{tech}</span>
              ))}
            </div>

            <h4 className="text-sm font-medium text-gray-500">Repository</h4>
            <a href={submission.repositoryUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
              {submission.repositoryUrl || 'No repository link provided'}
            </a>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Approach</h4>
            <p className="text-sm">{submission.approach || 'Approach details not available.'}</p>

            <h4 className="text-sm font-medium text-gray-500">Challenges Faced</h4>
            <p className="text-sm">{submission.challenges || 'Challenges not provided.'}</p>

            <h4 className="text-sm font-medium text-gray-500">Learnings</h4>
            <p className="text-sm">{submission.learnings || 'No learnings shared.'}</p>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && evaluation && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Teacher's Feedback</h4>
            <p className="text-sm">{evaluation.summary_feedback.feedback || "No feedback available."}</p>
          </div>
        )}
      </div>

      {/* Scoring Parameters */}
      {evaluation && (
        <div className="border-t p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Scoring Parameters</h4>
          <div className="space-y-3">
            {Object.entries(evaluation.parameter_scores).map(([key, value]) => (
              <div key={value.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 capitalize">{key}</span>
                  <span className="text-xs font-medium text-gray-700">{value.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${getScoreColor(value.score)} h-2 rounded-full`} style={{ width: `${value.score}%` }}></div>
                </div>
              </div>
            ))}
            {/* Overall Score */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Overall</span>
                <span className="text-xs font-medium text-gray-700">{evaluation.overall_score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${getScoreColor(evaluation.overall_score)} h-2 rounded-full`} style={{ width: `${evaluation.overall_score}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetail;
