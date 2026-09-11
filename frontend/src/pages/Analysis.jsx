import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCcw,
  FileText,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerAnalysis } from '../api/analysis.api';
import { getResumes } from '../api/resume.api';
import { useJobPolling } from '../hooks/useJobPolling';
import useResumeStore from '../store/resumeStore';

const Analysis = () => {
  const { resumeId: routeResumeId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(routeResumeId || '');
  const [analysisId, setAnalysisId] = useState(null);
  const [jobDescriptionSubmitted, setJobDescriptionSubmitted] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  // Custom hook for polling
  const { status, data, error, startPolling, stopPolling } = useJobPolling(
    analysisId ? `/analysis/${analysisId}` : null,
    2500
  );

  const setAnalysisResult = useResumeStore((state) => state.setAnalysisResult);

  // Load user's resumes
  useEffect(() => {
    const fetchUserResumes = async () => {
      setIsLoadingResumes(true);
      try {
        const res = await getResumes();
        const list = res.data || [];
        setResumes(list);

        if (!routeResumeId && list.length > 0) {
          setSelectedResumeId(list[0]._id);
        } else if (routeResumeId) {
          setSelectedResumeId(routeResumeId);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load resumes list');
      } finally {
        setIsLoadingResumes(false);
      }
    };
    fetchUserResumes();
  }, [routeResumeId]);

  useEffect(() => {
    if (status === 'completed' && data) {
      setAnalysisResult(data);
    }
  }, [status, data, setAnalysisResult]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const onSubmitJobDescription = async (formData) => {
    const activeResumeId = selectedResumeId || routeResumeId;
    if (!activeResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    try {
      const res = await triggerAnalysis(activeResumeId, formData.jobTitle, formData.jobDescriptionText);
      const newAnalysisId = res.data?.analysisId || res.data?._id;
      setAnalysisId(newAnalysisId);
      setJobDescriptionSubmitted(true);
      startPolling(`/analysis/${newAnalysisId}`);
      toast.success('Analysis started! This may take a few moments.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start analysis.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 bg-green-50';
    if (score >= 60) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  if (!isLoadingResumes && resumes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
        <FileText className="mx-auto h-16 w-16 text-brand-indigo/40 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">No Resumes Found</h2>
        <p className="mt-2 text-slate-600">
          Upload your resume first to analyze it against any job description.
        </p>
        <Link
          to="/dashboard/upload"
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-indigo hover:bg-brand-purple"
        >
          Upload Resume
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!jobDescriptionSubmitted) {
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Target Role & Analysis</h2>
            <p className="mt-2 text-slate-600">Provide the job description you want to tailor your resume for.</p>
          </div>

          {/* Resume Selector */}
          {resumes.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Resume:</label>
              <div className="relative">
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    navigate(`/dashboard/analysis/${e.target.value}`, { replace: true });
                  }}
                  className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.originalFile?.split('/').pop() || `Resume ${r._id.slice(-4)}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit(onSubmitJobDescription)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Job Title</label>
              <div className="mt-1">
                <input
                  {...register('jobTitle', { required: 'Job title is required' })}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-indigo focus:border-brand-indigo"
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Job Description</label>
              <div className="mt-1">
                <textarea
                  {...register('jobDescriptionText', { required: 'Job description is required' })}
                  rows={8}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-indigo focus:border-brand-indigo"
                  placeholder="Paste the full job description here..."
                />
                {errors.jobDescriptionText && <p className="mt-1 text-sm text-red-600">{errors.jobDescriptionText.message}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-indigo hover:bg-brand-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                ) : null}
                Start ATS Analysis
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (status === 'polling') {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <RefreshCcw className="animate-spin h-16 w-16 text-brand-indigo mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900">Analyzing Your Resume</h2>
        <p className="text-slate-500 mt-2">Our AI is extracting keywords and scoring your resume against the job description...</p>
        
        <div className="mt-12 space-y-4 max-w-lg mx-auto">
          <div className="h-4 bg-slate-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-full w-full mx-auto animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded-full w-5/6 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900">Analysis Failed</h2>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => setJobDescriptionSubmitted(false)}
          className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-indigo bg-brand-indigo/10 hover:bg-brand-indigo/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'completed' && data) {
    const currentActiveResumeId = selectedResumeId || routeResumeId;

    return (
      <div className="max-w-5xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">ATS Analysis Results</h2>
            <p className="mt-1 text-slate-500">Here's how your resume stacks up against the job description.</p>
          </div>
          <button
            onClick={() => navigate(`/dashboard/rewrite/${currentActiveResumeId}`)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-indigo hover:bg-brand-purple"
          >
            Fix with AI Rewrite
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Overall ATS Score</p>
            <div className="mt-4 flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreColor(data.atsScore)}`}>
                {data.atsScore}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Target score is 80+</p>
          </div>

          {/* Keyword Match */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Keyword Match</p>
            <div className="mt-4 flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreColor(data.keywordScore)}`}>
                {data.keywordScore}%
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Job description keywords</p>
          </div>

          {/* Grammar & Style */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Grammar & Formatting</p>
            <div className="mt-4 flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreColor(data.grammarScore)}`}>
                {data.grammarScore}%
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Readability and tone</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              What you did well
            </h3>
            <ul className="space-y-3">
              {data.strengths?.map((str, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">-</span>
                  <span className="text-slate-700 text-sm">{str}</span>
                </li>
              ))}
              {(!data.strengths || data.strengths.length === 0) && (
                <p className="text-sm text-slate-500">No major strengths identified.</p>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Areas for improvement
            </h3>
            <ul className="space-y-3">
              {data.weaknesses?.map((wk, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-red-500 mr-2">-</span>
                  <span className="text-slate-700 text-sm">{wk}</span>
                </li>
              ))}
              {(!data.weaknesses || data.weaknesses.length === 0) && (
                <p className="text-sm text-slate-500">Looking good! No major weaknesses.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Keywords Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Matched Keywords */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Matched Keywords ({data.matchedKeywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.matchedKeywords?.map((kw, i) => (
                <span key={i} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
                  {kw}
                </span>
              ))}
              {(!data.matchedKeywords || data.matchedKeywords.length === 0) && (
                <p className="text-sm text-slate-500">No matched keywords found.</p>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Missing Keywords ({data.missingKeywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.missingKeywords?.map((kw, i) => (
                <span key={i} className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                  + {kw}
                </span>
              ))}
              {(!data.missingKeywords || data.missingKeywords.length === 0) && (
                <p className="text-sm text-slate-500">Great job! No critical keywords missing.</p>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions & Areas of Improvement */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-20">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Actionable Suggestions & Improvements</h3>
          <ul className="space-y-4">
            {(data.areasOfImprovement || data.suggestions)?.map((sug, i) => (
              <li key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start">
                <span className="text-brand-indigo font-bold mr-3">•</span>
                <span className="text-slate-800 text-sm">{sug}</span>
              </li>
            ))}
            {(!data.suggestions || data.suggestions.length === 0) && (!data.areasOfImprovement || data.areasOfImprovement.length === 0) && (
              <p className="text-sm text-slate-500">No additional suggestions.</p>
            )}
          </ul>
        </div>
      </div>
    );
  }

  return null;
};

export default Analysis;
