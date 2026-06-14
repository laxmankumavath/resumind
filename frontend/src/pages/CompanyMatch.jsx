import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateCompanyMatch, getCompanyHistory } from '../api/companyMatch.api';
import { getResumes } from '../api/resume.api';
import useResumeStore from '../store/resumeStore';

const FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Product Companies', value: 'Product Based Companies' },
  { label: 'Service Companies', value: 'Service Based Companies' },
  { label: 'Startups', value: 'Startups' },
  { label: 'FAANG', value: 'FAANG' },
  { label: 'AI Companies', value: 'AI Startups' },
  { label: 'Remote Friendly', value: 'Remote Friendly' },
];

const CATEGORY_OPTIONS = [
  'FAANG',
  'Product Based Companies',
  'Startups',
  'Service Based Companies',
  'FinTech',
  'EdTech',
  'AI Startups',
  'Semiconductor Companies',
  'Core Engineering Companies',
];

const probabilityStyles = {
  'Very High': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  High: 'bg-green-50 text-green-700 border-green-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Low: 'bg-rose-50 text-rose-700 border-rose-100',
};

const getInitials = (name) => String(name || 'CO')
  .split(/\s+/)
  .map(part => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const getFilterValue = (filter) => {
  if (filter === 'Product Companies') return 'Product Based Companies';
  if (filter === 'Service Companies') return 'Service Based Companies';
  if (filter === 'AI Companies') return 'AI Startups';
  return filter;
};

const matchesCompanyFilter = (company, activeFilter, filterValue) => {
  if (activeFilter === 'All') return true;
  if (activeFilter === 'Remote Friendly') return company.remoteFriendly;
  if (activeFilter === 'Startups') return company.companyType.includes('Startups');
  return company.companyType === filterValue;
};

const CompanyCard = ({ company, index }) => {
  const topMissing = company.missingSkills?.slice(0, 4) || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            {getInitials(company.companyName)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">{company.companyName}</h3>
            <p className="truncate text-xs text-slate-500">{company.companyType}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-slate-900">{company.matchPercentage}%</p>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${probabilityStyles[company.hiringProbability] || probabilityStyles.Medium}`}>
            {company.hiringProbability}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Skills</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{company.skillsMatch || 0}%</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">ATS</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{company.atsCompatibility || 0}%</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Confidence</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{company.confidenceScore || 0}%</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase text-slate-400">Estimated Package</p>
        <p className="mt-1 text-sm font-medium text-slate-800">{company.averagePackage}</p>
      </div>

      {topMissing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Missing Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topMissing.map(skill => (
              <span key={skill} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase text-slate-400">Why selected</p>
        <ul className="mt-2 space-y-2">
          {(company.reasons || []).slice(0, 2).map(reason => (
            <li key={reason} className="flex gap-2 text-sm leading-5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-md bg-indigo-50 p-3">
        <p className="text-xs font-semibold uppercase text-brand-indigo">Recommended Improvements</p>
        <ul className="mt-2 space-y-1.5">
          {(company.recommendedActions || []).slice(0, 3).map(action => (
            <li key={action} className="text-xs leading-5 text-slate-700">{action}</li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
};

const SkeletonGrid = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    {[1, 2, 3, 4].map(item => (
      <div key={item} className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white p-5">
        <div className="h-10 w-1/2 rounded bg-slate-200" />
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="h-16 rounded bg-slate-100" />
          <div className="h-16 rounded bg-slate-100" />
          <div className="h-16 rounded bg-slate-100" />
        </div>
        <div className="mt-8 h-4 w-full rounded bg-slate-100" />
        <div className="mt-3 h-4 w-5/6 rounded bg-slate-100" />
      </div>
    ))}
  </div>
);

const MetricBars = ({ data, valueKey, label, tone = 'indigo' }) => {
  const toneClasses = {
    indigo: 'bg-brand-indigo',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
  };
  const maxValue = Math.max(1, ...data.map(item => Number(item[valueKey]) || 0));

  return (
    <div className="mt-4 space-y-3">
      {data.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No chart data yet.</p>
      ) : data.map(item => {
        const value = Number(item[valueKey]) || 0;
        const width = valueKey === 'gap' ? Math.max(6, (value / maxValue) * 100) : Math.max(6, value);

        return (
          <div key={`${label}-${item.name}`} className="grid grid-cols-[minmax(90px,150px)_1fr_48px] items-center gap-3">
            <span className="truncate text-xs font-medium text-slate-600" title={item.name}>{item.name}</span>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${toneClasses[tone]}`}
                style={{ width: `${Math.min(100, width)}%` }}
              />
            </div>
            <span className="text-right text-xs font-bold text-slate-700">
              {valueKey === 'gap' ? value : `${value}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ScoreComparison = ({ data }) => (
  <div className="mt-4 grid gap-3 sm:grid-cols-4">
    {data.length === 0 ? (
      <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500 sm:col-span-4">No score comparison yet.</p>
    ) : data.map(item => (
      <div key={item.subject} className="rounded-md bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase text-slate-400">{item.subject}</p>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{item.value}%</p>
        <div className="mt-3 h-2 rounded-full bg-white">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.value)}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const CompanyMatch = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const setCompanyMatchResult = useResumeStore((state) => state.setCompanyMatchResult);

  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeId || '');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [resumeResponse, historyResponse] = await Promise.all([
          getResumes(),
          getCompanyHistory(),
        ]);
        const nextResumes = resumeResponse.data || [];
        const nextHistory = historyResponse.data || [];
        setResumes(nextResumes);
        setHistory(nextHistory);

        if (resumeId || nextResumes[0]?._id) {
          setSelectedResumeId(resumeId || nextResumes[0]._id);
        }
        if (!resumeId && nextHistory[0]) {
          setResult(nextHistory[0]);
          setCompanyMatchResult(nextHistory[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load company match data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [resumeId, setCompanyMatchResult]);

  const filteredCompanies = useMemo(() => {
    const companies = result?.matchedCompanies || [];
    const filterValue = getFilterValue(activeFilter);

    return companies.filter(company => {
      const matchesSearch = !search
        || company.companyName.toLowerCase().includes(search.toLowerCase())
        || company.companyType.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = matchesCompanyFilter(company, activeFilter, filterValue);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, result, search]);

  const chartData = useMemo(() => filteredCompanies.slice(0, 10).map(company => ({
    name: company.companyName,
    match: company.matchPercentage,
    skills: company.skillsMatch,
    ats: company.atsCompatibility,
    gap: company.missingSkills?.length || 0,
  })), [filteredCompanies]);

  const radarData = useMemo(() => {
    const top = filteredCompanies[0];
    if (!top) return [];
    return [
      { subject: 'Match', value: top.matchPercentage },
      { subject: 'Skills', value: top.skillsMatch || 0 },
      { subject: 'ATS', value: top.atsCompatibility || 0 },
      { subject: 'Confidence', value: top.confidenceScore || 0 },
    ];
  }, [filteredCompanies]);

  const bestCompany = filteredCompanies[0] || result?.matchedCompanies?.[0];
  const improvedScore = bestCompany ? Math.min(100, bestCompany.matchPercentage + 10) : 0;

  const toggleCategory = (category) => {
    setSelectedCategories(current => (
      current.includes(category)
        ? current.filter(item => item !== category)
        : [...current, category]
    ));
  };

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      toast.error('Select a resume first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    try {
      const response = await generateCompanyMatch(selectedResumeId, {
        targetRole,
        jobDescription,
        companyCategories: selectedCategories,
      });
      setResult(response.data);
      setCompanyMatchResult(response.data);
      setHistory(current => [response.data, ...current.filter(item => item._id !== response.data._id)]);
      navigate(`/dashboard/company-match/${selectedResumeId}`, { replace: true });
      toast.success('Company match generated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate company match.');
      toast.error(err.response?.data?.message || 'Failed to generate company match.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-lg bg-white" />
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Company Match Predictor</h2>
          <p className="mt-1 text-slate-500">ATS-aware company recommendations and hiring probability estimates.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || resumes.length === 0}
          className="inline-flex items-center justify-center rounded-md bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate Match
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </span>
          <button onClick={handleGenerate} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-rose-700">
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Resume</span>
              <select
                value={selectedResumeId}
                onChange={(event) => setSelectedResumeId(event.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              >
                {resumes.map(resume => (
                  <option key={resume._id} value={resume._id}>
                    {resume.originalFile?.split('/').pop() || `Resume ${resume._id.slice(-5)}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Target Role</span>
              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Software Engineer"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Job Description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={4}
              placeholder="Optional"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
          </label>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Company Categories</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCategories.includes(category)
                      ? 'border-brand-indigo bg-brand-indigo text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-slate-400">History</h3>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {history.slice(0, 4).map(item => (
              <button
                key={item._id}
                onClick={() => {
                  setResult(item);
                  setCompanyMatchResult(item);
                  if (item.resumeId?._id || item.resumeId) {
                    setSelectedResumeId(item.resumeId?._id || item.resumeId);
                  }
                }}
                className="w-full rounded-md border border-slate-200 p-3 text-left hover:bg-slate-50"
              >
                <p className="truncate text-sm font-semibold text-slate-900">{item.targetRole || 'Company match'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.matchedCompanies?.[0]?.companyName || 'No companies yet'} - {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
            {history.length === 0 && (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No company matches yet.</p>
            )}
          </div>
        </div>
      </section>

      {isGenerating ? (
        <SkeletonGrid />
      ) : result ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">ATS Score</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{result.atsScore || 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Best Match</p>
              <p className="mt-2 truncate text-2xl font-extrabold text-slate-900">{bestCompany?.companyName || '--'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Candidate Level</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{result.metadata?.candidateLevel || '--'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Companies</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{result.matchedCompanies?.length || 0}</p>
            </div>
          </section>

          {bestCompany && (
            <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Target className="mt-1 h-5 w-5 shrink-0 text-brand-indigo" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      To increase your chances for {bestCompany.companyName} from {bestCompany.matchPercentage}% to {improvedScore}%, improve:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(bestCompany.missingSkills || []).slice(0, 5).map(skill => (
                        <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-indigo">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/dashboard/rewrite/${selectedResumeId}`}
                  className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-indigo shadow-sm"
                >
                  Improve Resume
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </section>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Match Percentage Graph</h3>
              <MetricBars data={chartData} valueKey="match" label="match" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Skill Gap Graph</h3>
              <MetricBars data={chartData} valueKey="gap" label="gap" tone="rose" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <h3 className="text-base font-bold text-slate-900">ATS Score Comparison</h3>
              <ScoreComparison data={radarData} />
            </div>
          </section>

          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(filter => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    activeFilter === filter.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter.value !== 'All' && <Filter className="mr-1.5 h-3.5 w-3.5" />}
                  {filter.label}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search companies"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </label>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {filteredCompanies.map((company, index) => (
              <CompanyCard key={company.companyName} company={company} index={index} />
            ))}
            {filteredCompanies.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 lg:col-span-2">
                No companies match the current filter.
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Generate your first company match</h3>
          <p className="mt-1 text-sm text-slate-500">Select a resume and target role to see company recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyMatch;
