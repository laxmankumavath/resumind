import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCcw, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerFullRewrite } from '../api/rewrite.api';
import { exportDocx, exportPdf } from '../api/resume.api';
import { useJobPolling } from '../hooks/useJobPolling';
import useResumeStore from '../store/resumeStore';

const Rewrite = () => {
  const { resumeId } = useParams();
  
  const [rewriteId, setRewriteId] = useState(null);
  const [rewriteStarted, setRewriteStarted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom hook for polling the active rewrite job
  const { status, data, error, startPolling, stopPolling } = useJobPolling(
    rewriteId ? `/rewrite/${rewriteId}` : null,
    3000
  );

  const setRewriteResult = useResumeStore((state) => state.setRewriteResult);

  useEffect(() => {
    if (!data) return;

    if (data.status === 'completed') {
      setRewriteResult(data);
      stopPolling();
    } else if (data.status === 'failed') {
      toast.error(`Rewrite failed: ${data.error}`);
      stopPolling();
    }
  }, [data, setRewriteResult, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const onStartRewrite = async () => {
    try {
      const res = await triggerFullRewrite(resumeId, "Target Role"); // Ideally we should get the role from context or input
      setRewriteId(res.data.rewriteId);
      setRewriteStarted(true);
      startPolling(`/rewrite/${res.data.rewriteId}`);
      toast.success('AI Rewrite started! This can take up to 30 seconds.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start rewrite.');
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
    setIsExporting(true);
    try {
      const blob = await exportPdf(resumeId);
      downloadBlob(blob, 'resume_rewritten.pdf');
      toast.success('PDF exported successfully!');
    } catch {
      toast.error('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDocx(resumeId);
      downloadBlob(blob, 'resume_rewritten.docx');
      toast.success('DOCX exported successfully!');
    } catch {
      toast.error('Failed to export DOCX.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!rewriteStarted) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Fix Your Resume with AI</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Our Gemini-powered AI will rewrite your experience and summary sections to use stronger action verbs, better quantify your achievements, and match ATS expectations.
        </p>
        <button
          onClick={onStartRewrite}
          className="inline-flex items-center px-8 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-brand-indigo hover:bg-brand-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo"
        >
          Rewrite Full Resume
        </button>
      </div>
    );
  }

  const currentRewriteJob = data?._id === rewriteId ? data : null;
  const isJobCompleted = currentRewriteJob && currentRewriteJob.status === 'completed';
  const isJobFailed = status === 'failed' || (currentRewriteJob && currentRewriteJob.status === 'failed');
  const isJobRunning = !isJobCompleted && !isJobFailed;

  if (isJobRunning) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <RefreshCcw className="animate-spin h-16 w-16 text-brand-indigo mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900">AI is Rewriting Your Resume</h2>
        <p className="text-slate-500 mt-2">Upgrading action verbs and grammar. This can take up to 30 seconds...</p>
        
        <div className="mt-12 space-y-6 max-w-2xl mx-auto text-left opacity-30">
          <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isJobFailed) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900">Rewrite Failed</h2>
        <p className="text-red-600 mt-2">{error || currentRewriteJob?.error}</p>
        <button
          onClick={() => setRewriteStarted(false)}
          className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-indigo bg-brand-indigo/10 hover:bg-brand-indigo/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isJobCompleted) {
    const rewrittenSections = currentRewriteJob.rewrittenSections || {};
    const fullResumeText = rewrittenSections.rewrittenResume;
    const improvements = currentRewriteJob.comparison?.improvementsMade
      || currentRewriteJob.metadata?.atsImprovementsApplied
      || rewrittenSections.atsImprovementsApplied
      || [];
    const keywordsAdded = currentRewriteJob.comparison?.keywordsAdded
      || currentRewriteJob.metadata?.keywordsAdded
      || rewrittenSections.keywordsAdded
      || [];
    const estimatedScoreIncrease = currentRewriteJob.comparison?.estimatedScoreIncrease
      || currentRewriteJob.metadata?.estimatedScoreIncrease;
    const estimatedNewATSScore = currentRewriteJob.metadata?.estimatedNewATSScore
      || rewrittenSections.estimatedNewATSScore;

    return (
      <div className="max-w-5xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center">
              <CheckCircle className="text-green-500 mr-3 h-8 w-8" />
              Rewrite Complete!
            </h2>
            <p className="mt-1 text-slate-500">Your resume has been upgraded. You can now download the optimized version.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isExporting ? <RefreshCcw className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              Export PDF
            </button>
            <button
              onClick={handleExportDOCX}
              disabled={isExporting}
              className="inline-flex items-center px-5 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              {isExporting ? <RefreshCcw className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              Export DOCX
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">ATS-Optimized Resume</h3>
              {(estimatedNewATSScore || estimatedScoreIncrease) && (
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {estimatedNewATSScore && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                      New ATS: {estimatedNewATSScore}
                    </span>
                  )}
                  {estimatedScoreIncrease && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-brand-indigo">
                      Increase: {estimatedScoreIncrease}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            {fullResumeText ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">{fullResumeText}</pre>
              </div>
            ) : (
              <>
                {rewrittenSections.summary && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Summary</h4>
                    <p className="text-sm leading-6 text-slate-700">{rewrittenSections.summary}</p>
                  </section>
                )}
                {rewrittenSections.skills?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {rewrittenSections.skills.map((skill, i) => (
                        <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {rewrittenSections.experience?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Experience</h4>
                    <ul className="space-y-2">
                      {rewrittenSections.experience.map((exp, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-700">- {exp}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {rewrittenSections.projects?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Projects</h4>
                    <ul className="space-y-3">
                      {rewrittenSections.projects.map((project, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-700">- {project}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {rewrittenSections.education?.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Education</h4>
                    <ul className="space-y-2">
                      {rewrittenSections.education.map((education, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-700">- {education}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            {improvements.length > 0 && (
              <section className="border-t border-slate-200 pt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Improvements Applied</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {improvements.map((item, i) => (
                    <li key={i} className="rounded-md bg-green-50 px-3 py-2 text-xs leading-5 text-green-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {keywordsAdded.length > 0 && (
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Keywords Added</h4>
                <div className="flex flex-wrap gap-2">
                  {keywordsAdded.map((keyword, i) => (
                    <span key={i} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-brand-indigo">
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {!currentRewriteJob.rewrittenSections && (
              <p className="text-slate-500 italic text-sm">Preview not available. Please export to PDF to view changes.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Rewrite;
