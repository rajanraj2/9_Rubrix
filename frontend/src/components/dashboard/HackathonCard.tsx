import React from 'react';
import { Calendar } from 'lucide-react';

interface Submission {
  id: string;
  position: number;
  score: number;
  feedback: string;
}

interface HackathonCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'completed';
  submission?: Submission;
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  title,
  description,
  startDate,
  endDate,
  status,
  submission,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </span>
        </div>

        {status === 'completed' && submission && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Position</span>
              <span className="font-medium text-gray-900">#{submission.position}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-500">Score</span>
              <span className="font-medium text-gray-900">{submission.score}/100</span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'ongoing'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status === 'ongoing' ? 'In Progress' : 'Completed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard;