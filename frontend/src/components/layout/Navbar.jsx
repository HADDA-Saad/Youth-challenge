import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelative } from '../../utils/formatDate';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowPanel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = () => {
    setShowPanel((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-dark-900/60 backdrop-blur-md border-b border-dark-800/80 flex items-center justify-between px-6 z-20">
      {/* Left side — empty or breadcrumb area */}
      <div />

      {/* Right side — user info + notifications + logout */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-sm font-display font-bold shadow-neon-primary">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium text-dark-200">{user?.username || 'User'}</span>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={togglePanel}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-800/60 border border-transparent hover:border-dark-800/50 transition-all duration-300"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold text-white bg-danger-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown panel */}
          {showPanel && (
            <div
              ref={panelRef}
              className="absolute right-0 top-full mt-2.5 w-80 bg-dark-900/90 backdrop-blur-xl border border-dark-800/80 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800/80">
                <span className="text-sm font-semibold text-dark-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <svg className="w-8 h-8 text-dark-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <p className="text-sm text-dark-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 border-b border-dark-800/50 hover:bg-dark-800/40 transition-colors last:border-b-0"
                    >
                      <p className="text-sm text-dark-200 leading-snug">{notif.message}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        {formatRelative(notif.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-danger-400 transition-all duration-300 px-3 py-1.5 rounded-xl hover:bg-danger-500/10 border border-transparent hover:border-danger-500/20"
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
