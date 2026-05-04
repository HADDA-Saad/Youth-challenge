import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-6 z-20">
      {/* Left side — empty or breadcrumb area */}
      <div />

      {/* Right side — user info + logout */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium text-dark-200">{user?.username || 'User'}</span>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-danger-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-danger-500/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
