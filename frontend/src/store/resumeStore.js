import { create } from 'zustand';

const useResumeStore = create((set) => ({
  currentResume: null, // The currently active resume object
  analysisResult: null, // Result from ATS scoring
  rewriteResult: null, // Result from AI rewrite
  companyMatchResult: null, // Result from Company Match Predictor
  
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setRewriteResult: (result) => set({ rewriteResult: result }),
  setCompanyMatchResult: (result) => set({ companyMatchResult: result }),
  
  clearResumeState: () => set({
    currentResume: null,
    analysisResult: null,
    rewriteResult: null,
    companyMatchResult: null,
  }),
}));

export default useResumeStore;
