import { useState, useEffect } from "react";
import { ordersApi, unwrap } from "./api";
import { StatsCard, formatCurrency, formatDate, StatusBadge, PaymentBadge } from "../components/UI";


function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative group">
            <div
              className="w-full bg-[#0F766E]/20 rounded-sm hover:bg-[#0F766E]/40 transition-colors cursor-pointer"
              style={{ height: `${(d.revenue / max) * 64}px` }}
            >
              <div
                className="absolute bottom-0 w-full bg-[#0F766E] rounded-sm transition-all"
                style={{ height: `${(d.revenue / max) * 64}px` }}
              />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#111111] text-white text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              ${d.revenue}
            </div>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick, color = "teal" }) {
  const colors = {
    teal:   "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",
    amber:  "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
    purple: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] ${colors[color]}`}>
      <div className="text-lg">{icon}</div>
      <div className="text-left">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs opacity-70">{desc}</div>
      </div>
    </button>
  );
}

export default function DashboardPage({ onNavigate }) {
 
  const [orders, setOrders] = useState([]);
   const recentOrders = orders.slice(0, 5);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
  total_orders: 0,
  pending_orders: 0,
  preparing_orders: 0,
  delivered_orders: 0,
  total_revenue: 0,
  payment_pending: 0,
});
const [revenueData, setRevenueData] = useState([]);

useEffect(() => {
  async function fetchDashboard() {
    try {
      setLoading(true);

      const res = await ordersApi.all();
      const allOrders = unwrap(res);

      setOrders(allOrders);

      // Stats calculate
      const totalOrders = allOrders.length;

      const pendingOrders = allOrders.filter(
        o => o.status === "pending"
      ).length;

      const preparingOrders = allOrders.filter(
        o => o.status === "preparing"
      ).length;

      const deliveredOrders = allOrders.filter(
        o => o.status === "delivered"
      ).length;

      const totalRevenue = allOrders
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total_price), 0);

      const paymentPending = allOrders
        .filter(o => o.payment_status !== "paid")
        .reduce((sum, o) => sum + Number(o.total_price), 0);

      setStats({
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        preparing_orders: preparingOrders,
        delivered_orders: deliveredOrders,
        total_revenue: totalRevenue,
        payment_pending: paymentPending,
      });

      // Recent 7 days revenue
      buildRevenueChart(allOrders);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  fetchDashboard();   
}, []);                


function buildRevenueChart(allOrders) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const revenueMap = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };

  allOrders.forEach(order => {
    if (order.payment_status === "paid") {
      const day = days[new Date(order.created_at).getDay()];
      revenueMap[day] += Number(order.total_price);
    }
  });

  const chart = days.map(day => ({
    day,
    revenue: revenueMap[day],
  }));

  setRevenueData(chart);
}

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading dashboard...
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 bg-white/70 border border-stone-200 px-3 py-1.5 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Total Orders" value={stats.total_orders} color="teal" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Pending" value={stats.pending_orders} color="amber" sub="Awaiting confirmation" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>} label="Preparing" value={stats.preparing_orders} color="purple" sub="In kitchen now" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Delivered" value={stats.delivered_orders} color="green" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Revenue" value={formatCurrency(stats.total_revenue)} color="teal" sub="Today" />
        <StatsCard icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} label="Pay Pending" value={formatCurrency(stats.payment_pending)} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white/80 rounded-2xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Weekly Revenue</h3>
              <p className="text-xs text-stone-500 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="text-xl font-bold text-[#0F766E]">{formatCurrency(stats.total_revenue)}</div>
          </div>
          <MiniBarChart data={revenueData} />
        </div>

        {/* Quick actions */}
        <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#111111] mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <QuickAction icon="🧾" label="New Order" desc="Create POS order" onClick={() => onNavigate?.("create-order")} color="teal" />
            <QuickAction icon="🍳" label="Kitchen Queue" desc="View active orders" onClick={() => onNavigate?.("kitchen")} color="purple" />
            <QuickAction icon="📋" label="All Orders" desc="Manage orders" onClick={() => onNavigate?.("orders")} color="amber" />
          </div>
        </div>
      </div>
 
      {/* Recent orders */}
      <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111111]">Recent Orders</h3>
          <button onClick={() => onNavigate?.("orders")} className="text-sm text-teal-700 font-medium hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                {["Order", "Customer", "Items", "Total", "Status", "Payment", "Time"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-[#111111]">#{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[#111111]">{order.customer_name}</div>
                    <div className="text-xs text-stone-500">{order.customer_phone}</div>
                  </td>
                 <td className="px-4 py-3 text-sm text-stone-600">
  {order.items?.length || 0} item
  {(order.items?.length || 0) !== 1 ? "s" : ""}
</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#111111]">{formatCurrency(order.total_price)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentBadge status={order.payment_status} /></td>
                  <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
