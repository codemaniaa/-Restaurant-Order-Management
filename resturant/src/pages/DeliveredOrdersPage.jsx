import { useState, useEffect } from "react";
import { ordersApi, unwrap } from "./api";
import { PaymentBadge, Modal, formatDate, formatCurrency } from "../components/UI";
import { OrderDetailModal } from "../components/OrderCard";

export default function DeliveredOrdersPage() { 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await ordersApi.delivered();

      setOrders(unwrap(res) || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load delivered orders");
    } finally {
      setLoading(false);
    }
  };

  // VERY IMPORTANT
  useEffect(() => {
    loadOrders();
  }, []);

  const handleVerifyPayment = async (id) => {
    try {
      await ordersApi.verifyPayment(id);

      // reload orders after verify
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Payment verify failed");
    }
  };

  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_price), 0);

  const unpaidCount = orders.filter(
    (o) => o.payment_status !== "paid"
  ).length;

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading delivered orders...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white/80 rounded-2xl border border-stone-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-[#111111]">{orders.length}</div>
          <div className="text-sm text-stone-500 mt-0.5">Total Delivered</div>
        </div>
        <div className="bg-white/80 rounded-2xl border border-emerald-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-stone-500 mt-0.5">Revenue Collected</div>
        </div>
        <div className="bg-white/80 rounded-2xl border border-amber-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-amber-700">{unpaidCount}</div>
          <div className="text-sm text-stone-500 mt-0.5">Pending Payment</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
          <h3 className="text-sm font-bold text-[#111111]">Delivered Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {["#", "Customer", "Items", "Total", "Payment", "Chef", "Delivered At", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.length === 0
                ? <tr><td colSpan={8} className="py-16 text-center text-stone-400 text-sm">No delivered orders yet</td></tr>
                : orders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-stone-400">#{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-[#111111]">{order.customer_name}</div>
                      <div className="text-xs text-stone-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111111]">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentBadge status={order.payment_status} />
                        {order.payment_status !== "paid" && (
                          <button onClick={() => handleVerifyPayment(order.id)}
                            className="text-xs text-teal-700 font-semibold hover:underline whitespace-nowrap">
                            Verify →
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{order.delivered_by_name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{formatDate(order.completed_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelected(order); setDetailOpen(true); }}
                        className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700 rounded-lg transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Order #${selected?.id} Details`} size="lg">
        {selected && <OrderDetailModal order={selected} />}
      </Modal>
    </div>
  );
}
