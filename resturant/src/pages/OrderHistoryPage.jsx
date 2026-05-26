import { useState } from "react";
import { mockOrders } from "../data/mockData";
import { StatusBadge, PaymentBadge, Modal, formatDate, formatCurrency } from "../components/UI";
import { OrderDetailModal } from "../components/OrderCard";

const PAGE_SIZE = 5;

export default function OrderHistoryPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = mockOrders.filter(o => {
    const matchSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchFrom = !dateFrom || new Date(o.created_at) >= new Date(dateFrom);
    const matchTo   = !dateTo   || new Date(o.created_at) <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = () => setPage(1);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); handleFilter(); }}
              placeholder="Search customer…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); handleFilter(); }}
            className="px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all">
            <option value="all">All Statuses</option>
            {["pending","confirmed","preparing","ready","delivered","cancelled"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <div className="space-y-1">
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); handleFilter(); }}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all" />
          </div>
          <div className="space-y-1">
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); handleFilter(); }}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all" />
          </div>
        </div>
        {(search || filterStatus !== "all" || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setFilterStatus("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
            className="mt-3 text-xs text-teal-700 font-medium hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="text-sm text-stone-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""} found</div>

      {/* Table */}
      <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100">
                {["#", "Customer", "Items", "Total", "Status", "Payment", "Created", "Completed", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {paginated.length === 0
                ? <tr><td colSpan={9} className="py-16 text-center text-stone-400 text-sm">No orders match your filters</td></tr>
                : paginated.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-stone-400">#{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-[#111111]">{order.customer_name}</div>
                      <div className="text-xs text-stone-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111111]">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3"><PaymentBadge status={order.payment_status} /></td>
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{formatDate(order.completed_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(order); setDetailOpen(true); }}
                        className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700 rounded-lg transition-colors whitespace-nowrap">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/40">
            <span className="text-xs text-stone-500">
              Page {page} of {totalPages} — {filtered.length} results
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${p === page ? "bg-[#0F766E] text-white border-[#0F766E]" : "border-stone-200 bg-white text-stone-600 hover:bg-teal-50 hover:text-teal-700"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Order #${selected?.id} Details`} size="lg">
        {selected && <OrderDetailModal order={selected} />}
      </Modal>
    </div>
  );
}
