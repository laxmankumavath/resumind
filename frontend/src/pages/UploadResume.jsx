import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadResume } from '../api/resume.api';

const UploadResume = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size exceeds 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const onUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadResume(file);
      toast.success('Resume uploaded successfully!');
      // Navigate to Analysis view with the new resume ID
      navigate(`/dashboard/analysis/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Upload Your Resume</h2>
        <p className="mt-2 text-slate-600">Upload your PDF or DOCX file to get an AI-powered ATS analysis.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-brand-indigo bg-brand-indigo/5' : 'border-slate-300 hover:bg-slate-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Drag and drop your resume</h3>
            <p className="text-sm text-slate-500 mb-4">PDF or DOCX (max. 5MB)</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleChange}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-brand-indigo/10 rounded-lg">
                  <File className="h-8 w-8 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                disabled={isUploading}
                className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onUpload}
                disabled={isUploading}
                className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-indigo hover:bg-brand-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Uploading & Parsing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResume;
