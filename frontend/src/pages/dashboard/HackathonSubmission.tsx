import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Video, Image, Mic, File, Check } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import { hackathonAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';

interface FileUpload {
  file: File;
  type: 'text' | 'video' | 'audio' | 'image' | 'document';
  preview?: string;
}

const ALLOWED_FILE_TYPES = {
  text: ['.txt'],
  document: ['.pdf', '.docx', '.pptx'],
  image: ['.jpg', '.jpeg', '.png', '.gif'],
  video: ['.mp4', '.webm'],
  audio: ['.mp3', '.wav'],
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024); // 2MB in MB

const HackathonSubmission: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!hackathonId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await hackathonAPI.getHackathon(hackathonId);
        setHackathon(response.data.data);
      } catch (err) {
        console.error('Error fetching hackathon:', err);
        setError('Failed to load hackathon details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathon();
  }, [hackathonId]);

  const getFileTypeIcon = (type: FileUpload['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Mic className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'document':
        return <File className="w-5 h-5" />;
    }
  };

  const getFileType = (file: File): FileUpload['type'] | null => {
    if (ALLOWED_FILE_TYPES.text.some(ext => file.name.toLowerCase().endsWith(ext))) return 'text';
    if (ALLOWED_FILE_TYPES.document.some(ext => file.name.toLowerCase().endsWith(ext))) return 'document';
    if (ALLOWED_FILE_TYPES.image.some(ext => file.name.toLowerCase().endsWith(ext))) return 'image';
    if (ALLOWED_FILE_TYPES.video.some(ext => file.name.toLowerCase().endsWith(ext))) return 'video';
    if (ALLOWED_FILE_TYPES.audio.some(ext => file.name.toLowerCase().endsWith(ext))) return 'audio';
    
    return null;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileUpload[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 2MB.`);
        continue;
      }

      const fileType = getFileType(file);
      if (!fileType) {
        alert(`File type not supported for ${file.name}`);
        continue;
      }

      let preview: string | undefined;
      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({ file, type: fileType, preview });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      alert('Please provide a description of your submission');
      return;
    }
    
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file for your submission');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create FormData object for file uploads
      const formData = new FormData();
      formData.append('hackathonId', hackathonId!);
      formData.append('submissionText', submissionText);
      
      // Add each file to the FormData
      uploadedFiles.forEach(fileUpload => {
        formData.append('files', fileUpload.file);
      });
      
      // Use direct fetch API to handle multipart form data
      const response = await fetch('http://localhost:5001/api/submissions', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for auth
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit');
      }
      
      // Redirect to the student dashboard
      alert('Submission successful!');
      navigate('/dashboard/student');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </main>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error || 'Hackathon not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Submit Your Project</h1>
          <p className="text-gray-600 mt-1">{hackathon.title}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hackathon Details</h2>
          <p className="text-gray-600 mb-4">{hackathon.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Start Date</h3>
              <p className="text-gray-600">{new Date(hackathon.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">End Date</h3>
              <p className="text-gray-600">{new Date(hackathon.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Evaluation Parameters</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              {hackathon.parameters?.map((param, index) => (
                <li key={index}>
                  {param.name} ({param.weight}%) - {param.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your project and how it addresses the hackathon challenge..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Files
                    </label>
                    <span className="text-xs text-gray-500">
                      Max file size: {MAX_FILE_SIZE_MB}MB
                    </span>
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag files here</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOC/DOCX, PPT/PPTX, Images, Videos, Audio
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.mov,.mp3,.wav"
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                      {uploadedFiles.map((fileUpload, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            {getFileTypeIcon(fileUpload.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fileUpload.file.name}</p>
                              <p className="text-xs text-gray-500">{(fileUpload.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Hackathon Details</h2>
            <div className="prose prose-sm">
              <p>{hackathon.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium">{new Date(hackathon.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium">{new Date(hackathon.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HackathonSubmission; 