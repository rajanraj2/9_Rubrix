import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, X, FileText, Video, Image, Mic, File, Check } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';

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

const HackathonSubmission: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample hackathon data - in a real app, you would fetch this based on hackathonId
  const hackathon = {
    id: hackathonId,
    title: 'AI Innovation Challenge',
    description: 'Create innovative solutions using artificial intelligence and machine learning to solve real-world problems. Your submission should include a working prototype, documentation, and a presentation explaining your approach.',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    status: 'ongoing' as const,
  };

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
    setIsSubmitting(true);

    try {
      // Here you would typically upload files and create the submission
      console.log('Submitting:', {
        hackathonId,
        text: submissionText,
        files: uploadedFiles.map(f => ({
          name: f.file.name,
          type: f.type,
          size: f.file.size,
        })),
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Submission successful!');
      setSubmissionText('');
      setUploadedFiles([]);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{hackathon.title}</h1>
          <p className="text-gray-600 mt-1">Submit your solution for this hackathon</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Submission</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={6}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Describe your solution..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments
                    </label>
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          multiple
                          accept={Object.values(ALLOWED_FILE_TYPES).flat().join(',')}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Files
                        </button>
                        <p className="mt-2 text-xs text-gray-500">
                          Supported formats: PDF, DOCX, PPTX, TXT, JPG, PNG, MP4, MP3 (max 2MB)
                        </p>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                          {uploadedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between py-3 px-4">
                              <div className="flex items-center">
                                {getFileTypeIcon(file.type)}
                                <span className="ml-2 text-sm text-gray-700">{file.file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Submit Solution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
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