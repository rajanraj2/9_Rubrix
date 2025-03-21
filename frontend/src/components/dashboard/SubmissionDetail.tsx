import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';

interface SubmissionDetailProps {
  submission: {
    id: string;
    studentName: string;
    submissionTitle: string;
    submissionDate: string;
    overallScore: number;
    parameters: {
      innovation: number;
      technical: number;
      design: number;
      presentation: number;
      [key: string]: number;
    };
    isShortlisted: boolean;
  };
  onClose: () => void;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ submission, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'feedback'>('preview');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(
    "This project shows great potential. The technical implementation is solid, but there's room for improvement in the UI/UX design. Consider adding more user-friendly features and improving the documentation. Overall, a commendable effort!"
  );

  // Sample project preview content
  const previewContent = {
    title: submission.submissionTitle,
    description: "This project aims to solve problems in the healthcare sector by implementing AI-driven solutions for early disease detection. The application uses machine learning algorithms to analyze patient data and provide preliminary diagnoses.",
    technologies: ["React", "Node.js", "TensorFlow", "MongoDB"],
    screenshot: "https://placehold.co/600x400",
    repositoryUrl: "https://github.com/student/project",
  };

  // Sample summary content
  const summaryContent = {
    approach: "The project uses a combination of supervised and unsupervised learning algorithms to analyze patient data. The frontend is built with React for a responsive and accessible interface.",
    challenges: "Major challenges included data preprocessing, model training optimization, and ensuring HIPAA compliance for data privacy.",
    learnings: "The team learned valuable lessons about healthcare data management, machine learning model deployment, and creating user-friendly interfaces for medical professionals.",
  };

  const handleSaveFeedback = () => {
    setIsEditingFeedback(false);
    // Here you would typically save the feedback to your backend
  };

  // Function to render score bars with colored backgrounds based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'preview'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'summary'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 text-center ${
            activeTab === 'feedback'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Feedback
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Project Title</h4>
              <p className="text-base font-medium">{previewContent.title}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-sm">{previewContent.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Technologies Used</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {previewContent.technologies.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Project Screenshot</h4>
              <img 
                src={previewContent.screenshot} 
                alt="Project Screenshot" 
                className="mt-1 rounded-md w-full object-cover h-48"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Repository</h4>
              <a 
                href={previewContent.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline"
              >
                {previewContent.repositoryUrl}
              </a>
            </div>
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Approach</h4>
              <p className="text-sm">{summaryContent.approach}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Challenges Faced</h4>
              <p className="text-sm">{summaryContent.challenges}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Learnings</h4>
              <p className="text-sm">{summaryContent.learnings}</p>
            </div>
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-500">Teacher's Feedback</h4>
              {!isEditingFeedback ? (
                <button
                  onClick={() => setIsEditingFeedback(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveFeedback}
                  className="text-green-600 hover:text-green-800"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {!isEditingFeedback ? (
              <p className="text-sm">{feedback}</p>
            ) : (
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 p-2 border rounded-md text-sm"
                placeholder="Provide feedback..."
              />
            )}
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Scoring Parameters</h4>
        <div className="space-y-3">
          {Object.entries(submission.parameters).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 capitalize">{key}</span>
                <span className="text-xs font-medium text-gray-700">{value}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${getScoreColor(value)} h-2 rounded-full`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Overall</span>
              <span className="text-xs font-medium text-gray-700">{submission.overallScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getScoreColor(submission.overallScore)} h-2 rounded-full`}
                style={{ width: `${submission.overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail; 