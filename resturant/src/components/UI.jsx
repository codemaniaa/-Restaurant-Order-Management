import {  useEffect} from "react";

// ─── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:   "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    preparing: "bg-purple-100 text-purple-800 border-purple-200",
    ready:     "bg-emerald-100 text-emerald-800 border-emerald-200",
    delivered: "bg-teal-100 text-teal-800 border-teal-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  const labels = {
    pending: "Pending", confirmed: "Confirmed", preparing: "Preparing",
    ready: "Ready", delivered: "Delivered", cancelled: "Cancelled",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "pending" ? "bg-amber-500" :
        status === "confirmed" ? "bg-blue-500" :
        status === "preparing" ? "bg-purple-500" :
        status === "ready" ? "bg-emerald-500" :
        status === "delivered" ? "bg-teal-500" :
        status === "cancelled" ? "bg-red-500" : "bg-stone-400"
      }`} />
      {labels[status] || status}
    </span>
  );
}

// ─── Payment Badge ─────────────────────────────────────────────────────────────
export function PaymentBadge({ status }) {
  const map = {
    paid:            "bg-emerald-100 text-emerald-800 border-emerald-200",
    unpaid:          "bg-rose-100 text-rose-700 border-rose-200",
    partially_paid:  "bg-orange-100 text-orange-700 border-orange-200",
  };
  const labels = { paid: "Paid", unpaid: "Unpaid", partially_paid: "Partial" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Confirmation Modal ────────────────────────────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-[#F5F0E6] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200"
        onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-100" : "bg-teal-100"}`}>
          {danger
            ? <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            : <svg className="w-6 h-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
        </div>
        <h3 className="text-xl font-bold text-[#111111] mb-2">{title}</h3>
        <p className="text-stone-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[#0F766E] hover:bg-[#0d6560]"}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Modal Wrapper ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-5xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative bg-[#F5F0E6] rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-stone-200`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#111111]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white/60 rounded-2xl p-5 border border-stone-200 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
        {icon || <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
      </div>
      <h3 className="text-lg font-semibold text-[#111111] mb-2">{title}</h3>
      <p className="text-stone-500 text-sm max-w-xs mb-4">{message}</p>
      {action}
    </div>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <input
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-[#111111] text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""} ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Select Field ──────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
      <select
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-[#111111] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Button ────────────────────────────────────────────────────────────────────
export function Button({ variant = "primary", size = "md", loading, children, className = "", ...props }) {
  const variants = {
    primary:   "bg-[#0F766E] text-white hover:bg-[#0d6560] shadow-sm",
    secondary: "bg-white text-[#111111] border border-stone-300 hover:bg-stone-50",
    danger:    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    ghost:     "text-[#0F766E] hover:bg-teal-50",
    dark:      "bg-[#111111] text-white hover:bg-stone-800 shadow-sm",
  };
  const sizes = {
    sm:  "px-3 py-1.5 text-xs rounded-lg",
    md:  "px-4 py-2.5 text-sm rounded-xl",
    lg:  "px-6 py-3 text-base rounded-xl",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? "bg-[#0F766E]" : "bg-stone-300"}`}
        style={{ height: "1.375rem" }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-[1.375rem]" : "translate-x-0"}`} />
      </div>
      {label && <span className="text-sm text-stone-700">{label}</span>}
    </label>
  );
}

// ─── Stats Card ────────────────────────────────────────────────────────────────
export function StatsCard({ icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal:   { bg: "bg-teal-50",   icon: "text-teal-700",   border: "border-teal-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-700",  border: "border-amber-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-700", border: "border-purple-100" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-700",   border: "border-blue-100" },
    red:    { bg: "bg-red-50",    icon: "text-red-700",    border: "border-red-100" },
    green:  { bg: "bg-emerald-50",icon: "text-emerald-700",border: "border-emerald-100" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white/80 rounded-2xl p-5 border ${c.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-[#111111] mb-0.5">{value}</div>
      <div className="text-sm font-medium text-stone-600">{label}</div>
      {sub && <div className="text-xs text-stone-400 mt-1">{sub}</div>}
    </div>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export function formatCurrency(amount) {
  return `${Number(amount).toFixed(2)}`;
}
