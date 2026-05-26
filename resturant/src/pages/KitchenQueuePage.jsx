import { useState, useEffect } from "react";
import { ordersApi, unwrap } from "./api";
import { EmptyState } from "../components/UI";
import { OrderCard } from "../components/OrderCard";

export default function KitchenQueuePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load kitchen queue from API
  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await ordersApi.kitchenQueue();

      const data = unwrap(res);

      // oldest first
      const sorted = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setOrders(sorted);
    } catch (err) {
      console.error(err);
      alert("Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  // page load pe fetch
  useEffect(() => {
    loadOrders();
  }, []);

  // update order status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await ordersApi.setStatus(id, newStatus);

      // reload fresh data
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  const confirmed = orders.filter(
    (o) => o.status === "confirmed"
  );

  const preparing = orders.filter(
    (o) => o.status === "preparing"
  );

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading kitchen queue...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-blue-800">
            {confirmed.length} Confirmed
          </span>
          <span className="text-xs text-blue-600">
            — awaiting prep
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-purple-800">
            {preparing.length} Preparing
          </span>
          <span className="text-xs text-purple-600">
            — in kitchen now
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-stone-400 bg-white/70 border border-stone-200 rounded-xl px-3 py-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Sorted oldest first
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <EmptyState
          title="Kitchen is clear!"
          message="No confirmed or preparing orders right now. New orders will appear here."
          icon={
            <svg
              className="w-8 h-8 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Confirmed — Ready to Start
            </h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {confirmed.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preparing */}
      {preparing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Preparing — In Progress
            </h2>
            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {preparing.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preparing.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}