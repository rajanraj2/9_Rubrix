import React from 'react';
import { Calendar, Users } from 'lucide-react';

interface Submission {
  id: string;
  position: number;
  score: number;
  feedback: string;
}

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  submissions: number;
  createdBy: {
    _id: string;
    fullName: string;
  };
  collaborators?: Array<{
    _id: string;
    fullName: string;
  }>;
  parameters?: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

interface HackathonCardProps {
  hackathon: Hackathon;
  onClick: () => void;
  submission?: Submission;
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onClick,
  submission,
}) => {
  const { title, description, startDate, endDate, status, participants, submissions, collaborators } = hackathon;
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer" onClick={onClick}>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </span>
        </div>

        {participants !== undefined && submissions !== undefined && (
          <div className="flex justify-between mt-3 text-sm text-gray-500">
            <div>Participants: {participants}</div>
            <div>Submissions: {submissions}</div>
          </div>
        )}

        {collaborators && collaborators.length > 0 && (
          <div className="flex items-center mt-3 text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            <span>{collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}</span>
          </div>
        )}

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
                : status === 'upcoming'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status === 'ongoing' 
              ? 'In Progress' 
              : status === 'upcoming'
              ? 'Upcoming'
              : 'Completed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard;