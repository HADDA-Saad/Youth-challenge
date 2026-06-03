import PageWrapper from '../components/layout/PageWrapper';

export default function Feed() {
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Activity Feed</h1>
          <p className="text-dark-400">See what your friends are up to.</p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-dark-600 rounded-2xl bg-dark-800/40 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-dark-700/60 flex items-center justify-center">
            <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-200 mb-1">Coming in Week 6</h2>
            <p className="text-sm text-dark-500 max-w-xs">
              The social feed will show goal completions, badge unlocks, and challenge wins from your friends in real time.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
            In development
          </span>
        </div>
      </div>
    </PageWrapper>
  );
}
