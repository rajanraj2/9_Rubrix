import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Video, Image, Mic, File, Check } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import { hackathonAPI, submissionAPI } from '../../lib/api';
import { Hackathon } from '../../components/dashboard/HackathonCard';

interface FileUpload {
  file: File;
  type: 'text' | 'video' | 'audio' | 'image' | 'document';
  preview?: string;
}

interface Submission {
  _id: string;
  submissionText: string;
  hackathonId: {
    _id: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: 'upcoming' | 'ongoing' | 'completed';
  };
  files: Array<{
    filename: string;
    path: string;
    mimetype: string;
    url?: string;
  }>;
  submittedAt: string;
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
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileLoading, setIsFileLoading] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!hackathonId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch hackathon details
        const hackathonResponse = await hackathonAPI.getHackathon(hackathonId);
        setHackathon(hackathonResponse.data.data);
        
        // Fetch user's submissions to check if they've already submitted
        const submissionsResponse = await submissionAPI.getUserSubmissions();
        const userSubmissions = submissionsResponse.data.data;
        
        // Find if there's a submission for this hackathon
        const foundSubmission = userSubmissions.find(
          (sub: Submission) => sub.hackathonId._id === hackathonId
        );
        
        if (foundSubmission) {
          setExistingSubmission(foundSubmission);
          setSubmissionText(foundSubmission.submissionText);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load hackathon details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    
    // Check if submissionText is empty and no files are uploaded
    if (!submissionText.trim() && uploadedFiles.length === 0) {
        alert('Please either provide text or upload at least one file');
        return;
    }

    // Check if submissionText is empty when files are uploaded
    if (uploadedFiles.length > 0 && !submissionText.trim()) {
        alert('Please provide a description for your submission along with the files.');
        return;
    }
    
    try {
        setIsSubmitting(true);
        
        // Create FormData object for file uploads
        const formData = new FormData();
        formData.append('hackathonId', hackathonId!);
        formData.append('submissionText', submissionText);
        
        // Add each file to the FormData if any
        uploadedFiles.forEach(fileUpload => {
            formData.append('files', fileUpload.file);
        });
        
        // Use direct fetch API to handle multipart form data with extended timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for large uploads
        
        try {
            const response = await fetch('http://localhost:5001/api/submissions', {
                method: 'POST',
                body: formData,
                credentials: 'include', // Include cookies for auth
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit');
            }
            
            // Redirect to the student dashboard
            alert('Submission successful!');
            navigate('/dashboard/student');
        } catch (fetchError) {
            if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
                throw new Error('Upload timed out. Your files may be too large or your connection is slow.');
            }
            throw fetchError;
        }
    } catch (error: unknown) {
        console.error('Submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit your entry. Please try again.';
        alert(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
};

  const handleFileClick = async (fileIndex: number) => {
    try {
      if (!existingSubmission) return;
      
      // Set loading state for this file
      setIsFileLoading(prev => ({ ...prev, [fileIndex]: true }));
      
      const fileToOpen = existingSubmission.files[fileIndex];
      console.log('Opening file:', fileToOpen);
      
      // Get presigned URL
      const response = await submissionAPI.getFilePresignedUrl(existingSubmission._id, fileIndex);
      const { presignedUrl, mimetype } = response.data.data;
      
      console.log('Received presigned URL and mimetype:', { presignedUrl, mimetype });
      
      // For DOCX, PDF, and other document types, handle them differently based on type
      if (mimetype.includes('wordprocessingml.document') || 
          mimetype.includes('msword') || 
          mimetype.includes('spreadsheet') || 
          mimetype.includes('presentation') ||
          mimetype.includes('audio') ||
          mimetype.includes('video')) {
        // For Office and media files, force download using an anchor tag
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.download = fileToOpen.filename; // Set the filename
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(presignedUrl);
        }, 100);
      } else if (mimetype.includes('pdf') || mimetype.includes('image')) {
        // PDFs and images can be opened in a new tab
        window.open(presignedUrl, '_blank');
      } else {
        // For any other file type, force download
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.download = fileToOpen.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: unknown) {
      console.error('Error opening file:', err);
      alert('Failed to open file. Please try again.');
    } finally {
      // Clear loading state
      setIsFileLoading(prev => ({ ...prev, [fileIndex]: false }));
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

  // If user has already submitted, show the submission instead of the form
  if (existingSubmission) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="student" />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <button 
              onClick={() => navigate('/dashboard/student')}
              className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Your Submission</h1>
            <p className="text-gray-600 mt-1">{hackathon.title}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center text-green-600 mb-4">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-medium">Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString()} at {new Date(existingSubmission.submittedAt).toLocaleTimeString()}</span>
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-2">Your Submission Text</h2>
            <div className="bg-gray-50 p-4 rounded-md mb-6 whitespace-pre-wrap">
              {existingSubmission.submissionText || "No text submission provided."}
            </div>
            
            {existingSubmission.files && existingSubmission.files.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Uploaded Files</h2>
                <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                  {existingSubmission.files.map((file, index) => (
                    <li key={index} className="p-3 flex items-center">
                      <File className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">{file.filename}</span>
                      <button 
                        onClick={() => handleFileClick(index)}
                        className="ml-auto inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isFileLoading[index]}
                      >
                        {isFileLoading[index] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-700 mr-2"></div>
                            Loading...
                          </>
                        ) : 'Open File'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          <button 
            onClick={() => navigate('/dashboard/student')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
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
                  <label htmlFor="submissionText" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details
                  </label>
                  <textarea
                    id="submissionText"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={6}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe your project or solution here..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You can either provide a text description or upload files, or both.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            multiple
                            accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, PPTX, TXT, JPG, PNG, MP4, MP3 up to {MAX_FILE_SIZE_MB}MB
                      </p>
                    </div>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Files to Upload</h3>
                    <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                      {uploadedFiles.map((fileUpload, index) => (
                        <li key={index} className="p-3 flex items-center">
                          {getFileTypeIcon(fileUpload.type)}
                          <span className="ml-3 text-gray-700">{fileUpload.file.name}</span>
                          <span className="ml-2 text-gray-500 text-sm">
                            ({(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-auto text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/student')}
                    className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!submissionText.trim() && uploadedFiles.length === 0)}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSubmitting || (!submissionText.trim() && uploadedFiles.length === 0)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Submission Tips</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ensure your submission addresses the hackathon's objectives</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Include all necessary files to demonstrate your solution</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Describe your approach clearly in the text submission</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>You can submit only once, so make it count!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HackathonSubmission; 