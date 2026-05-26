import { useState, useEffect } from "react";
import { StatusBadge, PaymentBadge, formatDate, formatCurrency, Button } from "./UI";

function useElapsedTime(createdAt) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
      if (diff < 60) setElapsed(`${diff}s`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m ${diff % 60}s`);
      else setElapsed(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

export function OrderCard({ order, onStatusUpdate, showActions = true }) {
  const elapsed = useElapsedTime(order.created_at);
  const urgentMinutes = Math.floor((Date.now() - new Date(order.created_at)) / 60000);
  const isUrgent = urgentMinutes > 20;

  const nextStatusMap = {
    confirmed: { label: "Start Preparing", next: "preparing", color: "primary" },
    preparing:  { label: "Mark Ready", next: "ready", color: "dark" },
    ready:      { label: "Mark Delivered", next: "delivered", color: "primary" },
  };
  const nextAction = nextStatusMap[order.status];

  return (
    <div className={`bg-white/80 rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden
      ${isUrgent ? "border-amber-300 shadow-amber-100" : "border-stone-200"}`}>
      {/* Header */}
      <div className={`px-5 py-3.5 flex items-start justify-between border-b ${isUrgent ? "bg-amber-50 border-amber-200" : "bg-stone-50/60 border-stone-100"}`}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-bold text-[#111111]">Order #{order.id}</span>
            {isUrgent && (
              <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                URGENT
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-stone-700">{order.customer_name}</p>
          <p className="text-xs text-stone-500">{order.customer_phone}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} />
          <div className={`mt-1.5 text-sm font-bold tabular-nums ${isUrgent ? "text-amber-700" : "text-stone-500"}`}>
            ⏱ {elapsed}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#0F766E]/10 text-[#0F766E] rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                {item.quantity}
              </span>
              <span className="text-stone-800 font-medium">{item.menu_item?.name || item.menu_item}</span>
            </div>
            <span className="text-stone-500 font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mx-5 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note: </span>{order.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-[#111111]">{formatCurrency(order.total_price)}</div>
          <div className="text-xs text-stone-400">{formatDate(order.created_at)}</div>
        </div>
        {showActions && nextAction && (
          <Button variant={nextAction.color} size="sm" onClick={() => onStatusUpdate?.(order.id, nextAction.next)}>
            {nextAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">Customer</p>
            <p className="text-sm font-semibold text-[#111111]">{order.customer_name}</p>
            <p className="text-sm text-stone-600">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">Ordered At</p>
            <p className="text-sm text-stone-700">{formatDate(order.created_at)}</p>
          </div>
          {order.completed_at && (
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">Completed At</p>
              <p className="text-sm text-stone-700">{formatDate(order.completed_at)}</p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-1">Order Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-1">Payment</p>
            <PaymentBadge status={order.payment_status} />
          </div>
          {order.delivered_by_name && (
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-0.5">Delivered By</p>
              <p className="text-sm text-stone-700">{order.delivered_by_name}</p>
            </div>
          )}
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Order Notes</p>
          <p className="text-sm text-amber-900">{order.notes}</p>
        </div>
      )}

     {/* Items */}
      <div>
        <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-3">
          Items
        </p>

        <div className="space-y-2">
          {(order.items || []).map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#0F766E]/10 text-[#0F766E] rounded-lg flex items-center justify-center text-xs font-bold">
                  {item.quantity}×
                </span>

                <div>
                  <p className="text-sm font-medium text-[#111111]">
                    {item.menu_item?.name || item.menu_item}
                  </p>

                  <p className="text-xs text-stone-500">
                    {formatCurrency(item.unit_price)} each
                  </p>
                </div>
              </div>

              <span className="text-sm font-semibold text-[#111111]">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-200">
          <span className="text-sm font-bold text-stone-600">Total</span>
          <span className="text-xl font-bold text-[#111111]">
            {formatCurrency(order.total_price)}
          </span>
        </div>
      </div>

      {/* Status History */}
      {order.status_history?.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-3">Status History</p>
          <div className="space-y-2">
            {order.status_history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-stone-600">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                <span className="font-medium">{h.new_status}</span>
                <span className="text-stone-400">by {h.changed_by_name}</span>
                <span className="text-stone-400 ml-auto">{formatDate(h.changed_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
