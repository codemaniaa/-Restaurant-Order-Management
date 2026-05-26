import { useState, useRef, useEffect } from "react";

export default function Navbar({ user, onLogout, onMobileMenuOpen, pageTitle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const notifications = [
    { id: 1, text: "Order #5 is ready for delivery", time: "2m ago", unread: true },
    { id: 2, text: "New order from Sarah Chen", time: "8m ago", unread: true },
    { id: 3, text: "Payment verified for Order #1", time: "15m ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-14 bg-[#F5F0E6]/90 backdrop-blur-sm border-b border-stone-200 flex items-center px-4 gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-200 transition-colors text-stone-600"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-[#111111] truncate">{pageTitle}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-200 transition-colors text-stone-600 hover:text-[#111111]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-[#F5F0E6] border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                <span className="text-sm font-bold text-[#111111]">Notifications</span>
                <span className="text-xs text-teal-700 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-stone-100">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-stone-100/60 transition-colors ${n.unread ? "bg-teal-50/40" : ""}`}>
                    <p className="text-sm text-stone-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-stone-200 transition-colors"
          >
            <div className="w-7 h-7 bg-[#0F766E] rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#111111] leading-tight">{user?.full_name || user?.username}</div>
              <div className="text-[10px] text-stone-500 capitalize">{user?.role}</div>
            </div>
            <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-52 bg-[#F5F0E6] border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-stone-100">
                <div className="text-sm font-semibold text-[#111111]">{user?.full_name || user?.username}</div>
                <div className="text-xs text-stone-500 capitalize">{user?.role} Account</div>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors">
                  <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
