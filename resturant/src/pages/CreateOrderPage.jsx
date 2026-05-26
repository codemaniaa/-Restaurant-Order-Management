import { useState, useEffect } from "react";

import { menuApi, ordersApi, unwrap } from "./api";
import { Button, Input, formatCurrency } from "../components/UI";

function CartItem({ item, quantity, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111111] truncate">{item.name}</p>
        <p className="text-xs text-stone-500">{formatCurrency(item.price)} each</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onDecrease} className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold transition-colors text-sm">−</button>
        <span className="w-7 text-center text-sm font-bold text-[#111111]">{quantity}</span>
        <button onClick={onIncrease} className="w-6 h-6 rounded-lg bg-[#0F766E] hover:bg-[#0d6560] flex items-center justify-center text-white font-bold transition-colors text-sm">+</button>
      </div>
      <div className="w-14 text-right">
        <span className="text-sm font-bold text-[#111111]">{formatCurrency(item.price * quantity)}</span>
      </div>
      <button onClick={onRemove} className="text-stone-300 hover:text-red-500 transition-colors ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

export default function CreateOrderPage({ onNavigate }) {
  const [selectedCat, setSelectedCat] = useState("all");
  
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  fetchData();
}, []);

    async function fetchData() {
    try {
      setLoading(true);

      // menu items lao
      const itemsRes = await menuApi.items({
        available: true,
      });

      // categories lao
      const catRes = await menuApi.categories();

      // unwrap data
      const items = unwrap(itemsRes) || [];
      const cats = unwrap(catRes) || [];

      console.log("MENU ITEMS:", items);

      // category state set
      setCategories(cats);

      // category name attach
      const mappedItems = items.map((item) => {
        const cat = cats.find(
          (c) => c.id === item.category
        );

        return {
          ...item,
          price: Number(item.price),
          category_name: cat
            ? cat.name
            : "Unknown",
        };
      });

      // menu state update
      setMenuItems(mappedItems);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }


  const [form, setForm] = useState({ customer_name: "", customer_phone: "", notes: "", payment_status: "unpaid" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableItems = menuItems;

  const filtered = availableItems.filter(
    (item) => {
      const matchCat =
        selectedCat === "all" ||
        item.category_name === selectedCat;

      const matchSearch =
        !search ||
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return matchCat && matchSearch;
    }
  );

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    item: availableItems.find(i => i.id === Number(id)),
    quantity: qty,
  })).filter(c => c.item);

  const total = cartItems.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0);

  const addToCart = (item) => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  const increase  = (id) => setCart(prev => ({ ...prev, [id]: prev[id] + 1 }));
  const decrease  = (id) => setCart(prev => {
    if (prev[id] <= 1) { const n = { ...prev }; delete n[id]; return n; }
    return { ...prev, [id]: prev[id] - 1 };
  });
  const remove    = (id) => setCart(prev => { const n = { ...prev }; delete n[id]; return n; });

  const handleSubmit = async () => {
  if (!form.customer_name || !form.customer_phone || cartItems.length === 0) return;
  try {
    setSubmitting(true);
    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      notes: form.notes,
      payment_status: form.payment_status,

      items: cartItems.map(c => ({
        menu_item: c.item.id,
        quantity: c.quantity,
      })),
    };
    await ordersApi.create(payload);
    setSuccess(true);
    setCart({});
    setForm({
      customer_name: "",
      customer_phone: "",
      notes: "",
      payment_status: "unpaid",
    });
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSubmitting(false);
  }
  };
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading menu...
    </div>
  );
}
  return (
    <div className="flex gap-5 h-[calc(100vh-8rem)]">
      {/* Left — Menu browser */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        {/* Search + filter */}
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 flex-shrink-0">
          {[{ id: "all", name: "All" }, ...categories].map(c => (
            <button key={c.id} onClick={() => setSelectedCat(c.name || "all")}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCat === (c.name || "all")
                  ? "bg-[#0F766E] text-white shadow-sm"
                  : "bg-white/80 text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}>
              {c.name}
            </button>
          ))}
        </div>


        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
            {filtered.map(item => {
              const inCart = cart[item.id] || 0;
              return (
                <button key={item.id} onClick={() => addToCart(item)}
                  className={`text-left bg-white/80 rounded-xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-3.5 relative overflow-hidden group ${inCart > 0 ? "border-teal-300 bg-teal-50/30" : "border-stone-200"}`}>
                  {inCart > 0 && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0F766E] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {inCart}
                    </div>
                  )}
                  <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mb-2.5 text-stone-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-[#111111] mb-0.5 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-stone-500 mb-2 line-clamp-1">
                                {item.category_name}
                    </p>
                  <p className="text-sm font-bold text-[#0F766E]">{formatCurrency(item.price)}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right — Cart & checkout */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Cart header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#0F766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-sm font-bold text-[#111111]">Current Order</span>
          </div>
          {totalItems > 0 && (
            <span className="text-xs font-bold bg-[#0F766E] text-white px-2 py-0.5 rounded-full">{totalItems}</span>
          )}
        </div>

        {/* Customer info */}
        <div className="px-4 py-3 border-b border-stone-100 space-y-2.5 flex-shrink-0">
          <Input placeholder="Customer name *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
          <Input placeholder="Phone number *" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Special notes…" rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder-stone-400" />
          <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all">
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
          </select>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cartItems.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <p className="text-sm text-stone-400">Tap items to add them</p>
              </div>
            )
            : cartItems.map(({ item, quantity }) => (
              <CartItem key={item.id} item={item} quantity={quantity}
                onIncrease={() => increase(item.id)}
                onDecrease={() => decrease(item.id)}
                onRemove={() => remove(item.id)}
              />
            ))
          }
        </div>

        {/* Footer total + submit */}
        <div className="px-4 py-4 border-t border-stone-100 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Subtotal</span>
            <span className="text-xl font-bold text-[#111111]">{formatCurrency(total)}</span>
          </div>

          {success && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-xs text-emerald-700 font-medium">Order created successfully!</span>
            </div>
          )}

          <Button variant="primary" className="w-full" size="lg" loading={submitting}
            onClick={handleSubmit}
            disabled={!form.customer_name || !form.customer_phone || cartItems.length === 0}>
            Place Order
          </Button>
          {cartItems.length > 0 && (
            <button onClick={() => setCart({})} className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors">
              Clear cart
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
