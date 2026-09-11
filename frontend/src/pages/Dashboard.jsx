import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Building2, FileText, Plus, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getResumes } from '../api/resume.api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await getResumes();
        setResumes(response.data);
      } catch {
        toast.error('Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="mt-1 text-slate-500">Manage your resumes and view analysis results.</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-indigo hover:bg-brand-purple"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Resume
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Resumes</p>
            <p className="text-2xl font-bold text-slate-900">{resumes.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <BarChart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg ATS Score</p>
            <p className="text-2xl font-bold text-slate-900">--</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Resumes</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-20 rounded-xl shadow-sm border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No resumes found</h3>
          <p className="text-slate-500 mt-1 mb-4">Upload your first resume to get started</p>
          <Link
            to="/dashboard/upload"
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {resumes.map((resume) => (
              <li key={resume._id}>
                <div className="block hover:bg-slate-50 transition-colors">
                  <div className="px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center min-w-0 gap-4">
                      <div className="p-2 bg-brand-indigo/10 rounded-lg">
                        <FileText className="h-6 w-6 text-brand-indigo" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-indigo truncate">
                          {resume.originalFile?.split('/').pop() || 'resume.pdf'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/dashboard/analysis/${resume._id}`}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <BarChart className="mr-1.5 h-3.5 w-3.5" />
                        ATS Analysis
                      </Link>
                      <Link
                        to={`/dashboard/rewrite/${resume._id}`}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                        Resume Rewrite
                      </Link>
                      <Link
                        to={`/dashboard/company-match/${resume._id}`}
                        className="inline-flex items-center rounded-md bg-brand-indigo px-3 py-2 text-xs font-semibold text-white hover:bg-brand-purple"
                      >
                        <Building2 className="mr-1.5 h-3.5 w-3.5" />
                        Company Match
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
