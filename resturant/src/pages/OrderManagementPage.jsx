import { useState, useEffect } from "react";
import { ordersApi, unwrap } from "./api";
import { StatusBadge, PaymentBadge, Button, Modal, formatDate, formatCurrency } from "../components/UI";
import { OrderDetailModal } from "../components/OrderCard";

const STATUS_TRANSITIONS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready:     ["delivered"],
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  async function loadOrders() {
  try {
    setLoading(true);

    const res = await ordersApi.all();

    setOrders(unwrap(res));
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
useEffect(() => {
  loadOrders();
}, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.customer_phone.includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchPayment = filterPayment === "all" || o.payment_status === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

 const handleStatusChange = async (id, newStatus) => {
  try {
    await ordersApi.setStatus(id, newStatus);

    await loadOrders();
  } catch (err) {
    console.error(err);
    alert("Status update failed");
  }
};


  const handlePaymentChange = async (id, newPayment) => {
  if (newPayment !== "paid") return;

  try {
    await ordersApi.verifyPayment(id);

    await loadOrders();
  } catch (err) {
    console.error(err);
    alert("Payment update failed");
  }
};

  const openDetail = (order) => { setSelectedOrder(order); setDetailOpen(true); };
if (loading) {
  return (
    <div className="p-10 text-center">
      Loading orders...
    </div>
  );
}
  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all">
          <option value="all">All Statuses</option>
          {["pending","confirmed","preparing","ready","delivered","cancelled"].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all">
          <option value="all">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partial</option>
        </select>
      </div>

      {/* Count */}
      <div className="text-sm text-stone-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</div>

      {/* Table */}
      <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100">
                {["#", "Customer", "Items", "Total", "Order Status", "Payment", "Time", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.length === 0
                ? <tr><td colSpan={8} className="py-16 text-center text-stone-400 text-sm">No orders found</td></tr>
                : filtered.map(order => {
                  const allowed = STATUS_TRANSITIONS[order.status] || [];
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors group">
                      <td className="px-4 py-3 text-sm font-bold text-stone-400">#{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-[#111111]">{order.customer_name}</div>
                        <div className="text-xs text-stone-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600 whitespace-nowrap">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#111111] whitespace-nowrap">
                        {formatCurrency(order.total_price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          {allowed.length > 0 && (
                            <select
                              value=""
                              onChange={e => e.target.value && handleStatusChange(order.id, e.target.value)}
                              className="text-xs border border-stone-200 rounded-lg px-1.5 py-1 bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 cursor-pointer"
                            >
                              <option value="">Update</option>
                              {allowed.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PaymentBadge status={order.payment_status} />
                          <select
                            value={order.payment_status}
                            onChange={e => handlePaymentChange(order.id, e.target.value)}
                            className="text-xs border border-stone-200 rounded-lg px-1.5 py-1 bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 cursor-pointer"
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Mark Paid</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(order)}
                          className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700 rounded-lg transition-colors whitespace-nowrap">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Order #${selectedOrder?.id} Details`} size="lg">
        {selectedOrder && <OrderDetailModal order={selectedOrder} />}
      </Modal>
    </div>
  );
}
