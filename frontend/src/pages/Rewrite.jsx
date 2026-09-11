import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Wand2,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCcw,
  Copy,
  Check,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerFullRewrite, triggerSectionRewrite, getRewriteHistory } from '../api/rewrite.api';
import { getResumes, exportDocx, exportPdf } from '../api/resume.api';
import { useJobPolling } from '../hooks/useJobPolling';
import useResumeStore from '../store/resumeStore';

const Rewrite = () => {
  const { resumeId: routeResumeId } = useParams();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(routeResumeId || '');
  const [targetRole, setTargetRole] = useState('');
  const [rewriteId, setRewriteId] = useState(null);
  const [rewriteStarted, setRewriteStarted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  // Section rewrite states
  const [sectionLoading, setSectionLoading] = useState(null);
  const [customSectionText, setCustomSectionText] = useState({});

  const setRewriteResult = useResumeStore((state) => state.setRewriteResult);

  // Polling hook
  const { status, data, error, startPolling, stopPolling } = useJobPolling(
    rewriteId ? `/rewrite/${rewriteId}` : null,
    2500
  );

  // Load user's resumes
  useEffect(() => {
    let isMounted = true;
    const fetchUserResumes = async () => {
      setIsLoadingResumes(true);
      try {
        const res = await getResumes();
        const list = res.data || [];
        if (!isMounted) return;
        setResumes(list);

        if (!routeResumeId && list.length > 0) {
          setSelectedResumeId(list[0]._id);
        } else if (routeResumeId) {
          setSelectedResumeId(routeResumeId);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          toast.error('Failed to load resumes list');
        }
      } finally {
        if (isMounted) {
          setIsLoadingResumes(false);
        }
      }
    };
    fetchUserResumes();
    return () => {
      isMounted = false;
    };
  }, [routeResumeId]);

  // Load latest rewrite history for selected resume
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!selectedResumeId) return;
      try {
        const historyRes = await getRewriteHistory(selectedResumeId);
        const items = historyRes.data || [];
        if (!isMounted) return;
        setHistory(items);

        // If we have a completed rewrite, display it immediately
        const latestCompleted = items.find((item) => item.status === 'completed');
        if (latestCompleted && !rewriteStarted) {
          setRewriteId(latestCompleted._id);
          setRewriteStarted(true);
          startPolling(`/rewrite/${latestCompleted._id}`);
        }
      } catch {
        // history fetch error (e.g. none exists yet)
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedResumeId, rewriteStarted, startPolling]);

  // Watch polling data updates
  useEffect(() => {
    if (!data) return;

    if (data.status === 'completed') {
      setRewriteResult(data);
      stopPolling();
    } else if (data.status === 'failed') {
      toast.error(`Rewrite failed: ${data.error || 'Unknown error'}`);
      stopPolling();
    }
  }, [data, setRewriteResult, stopPolling]);

  const handleResumeSelect = (newId) => {
    setSelectedResumeId(newId);
    setRewriteId(null);
    setRewriteStarted(false);
    navigate(`/dashboard/rewrite/${newId}`, { replace: true });
  };

  const onStartRewrite = async () => {
    const activeResumeId = selectedResumeId || routeResumeId;
    if (!activeResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    try {
      setRewriteStarted(true);
      const res = await triggerFullRewrite(activeResumeId, targetRole || 'Target Role');
      const newRewriteId = res.data?.rewriteId || res.data?._id;

      if (newRewriteId) {
        setRewriteId(newRewriteId);
        startPolling(`/rewrite/${newRewriteId}`);
        toast.success('AI Rewrite started! Upgrading resume content...');
      } else if (res.data?.status === 'completed') {
        // Returned completed immediately inline
        setRewriteId(res.data._id);
        setRewriteResult(res.data);
        toast.success('Resume rewritten successfully!');
      }
    } catch (err) {
      setRewriteStarted(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to start resume rewrite.');
    }
  };

  const handleSectionRewrite = async (sectionName, text) => {
    const activeResumeId = selectedResumeId || routeResumeId;
    if (!activeResumeId) return;

    setSectionLoading(sectionName);
    try {
      const res = await triggerSectionRewrite(activeResumeId, sectionName, text, targetRole || 'Target Role');
      const rewritten = res.data?.rewrittenText;
      if (rewritten) {
        setCustomSectionText((prev) => ({
          ...prev,
          [sectionName]: rewritten,
        }));
        toast.success(`${sectionName} section upgraded!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to rewrite ${sectionName}`);
    } finally {
      setSectionLoading(null);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportPDF = async () => {
    const activeResumeId = selectedResumeId || routeResumeId;
    if (!activeResumeId) return;

    setIsExporting(true);
    try {
      const blob = await exportPdf(activeResumeId);
      downloadBlob(blob, 'resume_rewritten.pdf');
      toast.success('PDF exported successfully!');
    } catch {
      toast.error('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    const activeResumeId = selectedResumeId || routeResumeId;
    if (!activeResumeId) return;

    setIsExporting(true);
    try {
      const blob = await exportDocx(activeResumeId);
      downloadBlob(blob, 'resume_rewritten.docx');
      toast.success('DOCX exported successfully!');
    } catch {
      toast.error('Failed to export DOCX.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // If user has zero resumes uploaded
  if (!isLoadingResumes && resumes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
        <FileText className="mx-auto h-16 w-16 text-brand-indigo/40 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">No Resumes Found</h2>
        <p className="mt-2 text-slate-600">
          Upload a resume first to generate an ATS-optimized, AI-crafted resume.
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

  const currentRewriteJob = data?._id === rewriteId ? data : (history.find(h => h._id === rewriteId) || data);
  const isJobCompleted = currentRewriteJob?.status === 'completed';
  const isJobFailed = status === 'failed' || (currentRewriteJob && currentRewriteJob.status === 'failed');
  const isJobRunning = rewriteStarted && !isJobCompleted && !isJobFailed;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header & Resume Selector Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-indigo" />
            AI Resume Rewriter
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Truthfully tailor and optimize your resume for applicant tracking systems.
          </p>
        </div>

        {/* Resume Selector */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Resume:</label>
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => handleResumeSelect(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.originalFile?.split('/').pop() || `Resume ${r._id.slice(-4)}`} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Main Rewrite View */}
      {!rewriteStarted && !isJobCompleted && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center max-w-3xl mx-auto">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo mb-6">
            <Wand2 className="h-8 w-8" />
          </div>
          
          <h3 className="text-3xl font-extrabold text-slate-900 mb-3">
            Transform Your Resume with Gemini AI
          </h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Our AI analyzes your experience, upgrades weak action verbs, integrates crucial keywords truthfully, and formats every section to maximize ATS passing rates.
          </p>

          <div className="max-w-md mx-auto mb-8 text-left space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Role (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Product Manager"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                />
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartRewrite}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent shadow-sm text-base font-semibold rounded-xl text-white bg-brand-indigo hover:bg-brand-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo transition-all transform active:scale-95"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Rewrite Full Resume
            </button>
            <Link
              to={`/dashboard/analysis/${selectedResumeId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50"
            >
              View ATS Score First
            </Link>
          </div>
        </div>
      )}

      {/* Progress / Loading State */}
      {isJobRunning && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center max-w-3xl mx-auto my-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <RefreshCcw className="animate-spin h-20 w-20 text-brand-indigo" />
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-brand-purple animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">AI is Rewriting Your Resume</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
            Enhancing bullet points with impactful action verbs and aligning keywords. This typically takes 10 to 25 seconds...
          </p>
          
          <div className="mt-8 space-y-4 max-w-xl mx-auto opacity-40">
            <div className="h-4 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-5/6 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Failed State */}
      {isJobFailed && (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-rose-200 text-center max-w-2xl mx-auto my-8">
          <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Rewrite Could Not Complete</h3>
          <p className="text-rose-600 mt-2 text-sm">{error || currentRewriteJob?.error || 'An unexpected error occurred during rewriting.'}</p>
          <button
            onClick={() => setRewriteStarted(false)}
            className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-indigo hover:bg-brand-purple"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Completed Results View */}
      {isJobCompleted && (
        <div className="space-y-8">
          {/* Top Score Banner & Action Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 h-8 w-8" />
                <h3 className="text-2xl font-extrabold text-slate-900">Rewrite Complete!</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Your resume has been upgraded with ATS-aligned wording and impact-focused achievements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isExporting ? <RefreshCcw className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                Export PDF
              </button>

              <button
                onClick={handleExportDOCX}
                disabled={isExporting}
                className="inline-flex items-center px-5 py-2.5 border border-slate-300 shadow-sm text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {isExporting ? <RefreshCcw className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                Export DOCX
              </button>

              <button
                onClick={() => setRewriteStarted(false)}
                className="inline-flex items-center px-4 py-2.5 border border-slate-200 text-xs font-semibold rounded-xl text-brand-indigo bg-brand-indigo/10 hover:bg-brand-indigo/20 transition-colors"
              >
                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                Rewrite Again
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          {(() => {
            const rewrittenSections = currentRewriteJob.rewrittenSections || {};
            const estimatedNewATSScore = currentRewriteJob.metadata?.estimatedNewATSScore || rewrittenSections.estimatedNewATSScore || 85;
            const estimatedScoreIncrease = currentRewriteJob.comparison?.estimatedScoreIncrease || currentRewriteJob.metadata?.estimatedScoreIncrease || '+18 pts';
            const improvements = currentRewriteJob.comparison?.improvementsMade
              || currentRewriteJob.metadata?.atsImprovementsApplied
              || rewrittenSections.atsImprovementsApplied
              || [];
            const keywordsAdded = currentRewriteJob.comparison?.keywordsAdded
              || currentRewriteJob.metadata?.keywordsAdded
              || rewrittenSections.keywordsAdded
              || [];

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New ATS Score</p>
                      <p className="text-2xl font-extrabold text-slate-900">{estimatedNewATSScore} <span className="text-xs font-medium text-slate-400">/ 100</span></p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-brand-indigo rounded-xl">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Boost</p>
                      <p className="text-2xl font-extrabold text-brand-indigo">{estimatedScoreIncrease}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Keywords Integrated</p>
                      <p className="text-2xl font-extrabold text-slate-900">{keywordsAdded.length}</p>
                    </div>
                  </div>
                </div>

                {/* Improvements & Keywords Badges */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Improvements */}
                  {improvements.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Key Improvements Applied
                      </h4>
                      <ul className="space-y-2.5">
                        {improvements.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Keywords Added */}
                  {keywordsAdded.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-indigo" />
                        Truthful Keywords Added
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {keywordsAdded.map((kw, i) => (
                          <span key={i} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-brand-indigo">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Formatted Rewritten Resume Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-indigo" />
                      <h4 className="text-lg font-bold text-slate-900">Optimized Resume Preview</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(rewrittenSections.rewrittenResume || JSON.stringify(rewrittenSections, null, 2))}
                        className="inline-flex items-center px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                        {copied ? 'Copied' : 'Copy All Text'}
                      </button>
                    </div>
                  </div>

                  {/* Formatted Resume Body */}
                  {rewrittenSections.rewrittenResume ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-x-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
                        {rewrittenSections.rewrittenResume}
                      </pre>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary Section */}
                      {rewrittenSections.professionalSummary && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Summary</h5>
                            <button
                              onClick={() => handleSectionRewrite('Professional Summary', customSectionText['Professional Summary'] || rewrittenSections.professionalSummary)}
                              disabled={sectionLoading === 'Professional Summary'}
                              className="text-xs text-brand-indigo hover:underline flex items-center gap-1"
                            >
                              {sectionLoading === 'Professional Summary' ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                              Re-polish
                            </button>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-800">
                            {customSectionText['Professional Summary'] || rewrittenSections.professionalSummary}
                          </p>
                        </div>
                      )}

                      {/* Skills Section */}
                      {rewrittenSections.skills?.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {rewrittenSections.skills.map((skill, i) => (
                              <span key={i} className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-800 shadow-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience Section */}
                      {rewrittenSections.experience?.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</h5>
                            <button
                              onClick={() => handleSectionRewrite('Experience', rewrittenSections.experience.join('\n'))}
                              disabled={sectionLoading === 'Experience'}
                              className="text-xs text-brand-indigo hover:underline flex items-center gap-1"
                            >
                              {sectionLoading === 'Experience' ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                              Re-polish
                            </button>
                          </div>
                          <ul className="space-y-2.5">
                            {(customSectionText['Experience'] ? customSectionText['Experience'].split('\n') : rewrittenSections.experience).map((exp, i) => (
                              <li key={i} className="text-sm leading-relaxed text-slate-800 flex items-start gap-2">
                                <span className="text-brand-indigo font-bold">•</span>
                                <span>{exp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Projects Section */}
                      {rewrittenSections.projects?.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Projects</h5>
                          <ul className="space-y-2.5">
                            {rewrittenSections.projects.map((proj, i) => (
                              <li key={i} className="text-sm leading-relaxed text-slate-800 flex items-start gap-2">
                                <span className="text-brand-indigo font-bold">•</span>
                                <span>{proj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Education Section */}
                      {rewrittenSections.education?.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Education</h5>
                          <ul className="space-y-1.5">
                            {rewrittenSections.education.map((edu, i) => (
                              <li key={i} className="text-sm text-slate-800">{edu}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Rewrite;
