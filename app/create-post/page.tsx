// File: /app/create-post/page.tsx (With PDF Support)

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Image as ImageIcon, Video, X } from 'lucide-react'; // Optional: for icons

export default function CreatePostPage() {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      
      // Validate file types and combinations
      const hasPDF = selectedFiles.some(f => f.type === 'application/pdf');
      const hasVideo = selectedFiles.some(f => f.type.startsWith('video/'));
      const hasImage = selectedFiles.some(f => f.type.startsWith('image/'));

      // LinkedIn API rules:
      // - PDF: only 1 file, cannot mix with images/videos
      // - Video: only 1 file, cannot mix with images
      // - Images: up to 9 files
      
      if (hasPDF && selectedFiles.length > 1) {
        setError('You can only upload 1 PDF file at a time (no mixing with images/videos).');
        return;
      }
      
      if (hasPDF && (hasVideo || hasImage)) {
        setError('Cannot mix PDF with images or videos. Please upload only PDF or only media files.');
        return;
      }

      if (hasVideo && selectedFiles.length > 1) {
        setError('You can only upload 1 video at a time (no mixing with images).');
        return;
      }

      if (hasVideo && hasImage) {
        setError('Cannot mix video with images. Please upload only video or only images.');
        return;
      }

      // For images, allow up to 9
      if (hasImage && !hasVideo && !hasPDF) {
        const imageFiles = selectedFiles.filter(f => f.type.startsWith('image/')).slice(0, 9);
        setFiles(imageFiles);
        setError(null);
        return;
      }

      // For PDF or Video, take only the first file
      setFiles([selectedFiles[0]]);
      setError(null);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() && files.length === 0) {
      setError('Post must contain a message or a file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('message', message);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post.');
      }

      setSuccess(`Successfully created post! Post ID: ${result.postId}`);
      setMessage('');
      setFiles([]);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return <FileText className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl p-8 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-white mb-2">Create a LinkedIn Post</h1>
        <p className="text-gray-300 mb-6">
          Write your message and optionally upload images, a video, or a PDF document.
        </p>

        <form onSubmit={handleSubmit}>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-40 p-4 border rounded-lg focus:ring-2 transition-shadow duration-200 resize-none text-white "
            disabled={isLoading}
          />
          
          {/* File Input */}
          <div className="mt-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-white mb-2">
              Add files
            </label>
            <p className="text-xs text-gray-400 mb-2">
              📸 Images: up to 9 files | 🎥 Video: 1 file only | 📄 PDF: 1 file only
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/mp4,video/quicktime,application/pdf" // Accept images, videos, and PDFs
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              disabled={isLoading}
            />
          </div>
          
          {/* File Previews */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image preview */}
                    {file.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}

                    {/* Video preview */}
                    {file.type.startsWith('video/') && (
                      <div className="w-full h-24 flex flex-col items-center justify-center bg-gray-700 rounded-lg text-white p-2">
                        <Video className="w-8 h-8 mb-1" />
                        <p className="text-xs truncate w-full text-center">{file.name}</p>
                      </div>
                    )}

                    {/* PDF preview */}
                    {file.type === 'application/pdf' && (
                      <div className="w-full h-24 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 p-2">
                        <FileText className="w-8 h-8 mb-1" />
                        <p className="text-xs truncate w-full text-center">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {isLoading ? 'Posting...' : 'Create Post'}
            </Button>
          </div>
        </form>

        {/* Feedback Area */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">📌 LinkedIn Upload Rules:</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• <strong>Images:</strong> Upload up to 9 images in one post</li>
            <li>• <strong>Video:</strong> Only 1 video per post (cannot mix with images)</li>
            <li>• <strong>PDF:</strong> Only 1 PDF per post (cannot mix with media)</li>
            <li>• <strong>PDF Size:</strong> Max 100MB, up to 300 pages</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
