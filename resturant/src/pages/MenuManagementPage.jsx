import { useState, useEffect } from "react";
import { menuApi, unwrap } from "./api";
import { Modal, ConfirmModal, Button, Input, Select, Toggle, EmptyState, StatusBadge, formatCurrency } from "../components/UI";

function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
  return (
    <div className={`bg-white/80 rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden ${!item.is_available ? "opacity-60" : ""}`}>
      {/* Image placeholder */}
      <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative overflow-hidden">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : (
            <div className="flex flex-col items-center gap-1 text-stone-300">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          )
        }
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.is_available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}>
            {item.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-semibold bg-white/80 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-[#111111] leading-snug">{item.name}</h3>
          <span className="text-base font-bold text-[#0F766E] flex-shrink-0">{formatCurrency(item.price)}</span>
        </div>
        <p className="text-xs text-stone-500 mb-4 line-clamp-2">{item.description || "No description"}</p>
        <div className="flex items-center justify-between">
          <Toggle checked={item.is_available} onChange={() => onToggle(item.id)} />
          <div className="flex gap-1.5">
            <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-teal-50 flex items-center justify-center text-stone-500 hover:text-teal-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDelete(item)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-red-50 flex items-center justify-center text-stone-500 hover:text-red-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  image: null,
  is_available: true
};

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const itemsRes = await menuApi.items();
      const catRes = await menuApi.categories();

      setMenuItems(unwrap(itemsRes));
      setCategories(unwrap(catRes));

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterAvail, setFilterAvail] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
 
  const filtered = menuItems.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || item.category === filterCat;
    const matchAvail = filterAvail === "all" || (filterAvail === "available" ? item.is_available : !item.is_available);
    return matchSearch && matchCat && matchAvail;
  });

  async function loadData() {
  try {
    setLoading(true);

    const itemsRes = await menuApi.items();
    const categoriesRes = await menuApi.categories();

    setMenuItems(unwrap(itemsRes));
    setCategories(unwrap(categoriesRes));
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
  useEffect(() => {
  loadData();
}, []);

 
  const handleEdit = (item) => {
   setForm({
  name: item.name,
  category_id: item.category,
  description: item.description,
  price: item.price,
  image: null,
  is_available: item.is_available
});
    setEditItem(item);
    setShowForm(true);
  };
const handleSave = async () => {
  try {
    setSaving(true);

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("category", form.category_id);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("is_available", form.is_available);

    if (form.image) {
      formData.append("image", form.image);
    }

    if (editItem) {
      await menuApi.updateItem(editItem.id, formData);
    } else {
      await menuApi.createItem(formData);
    }

    await fetchData();

    setShowForm(false);
    setEditItem(null);
    setForm(emptyForm);

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSaving(false);
  }
};


const handleDelete = async () => {
  try {
    await menuApi.deleteItem(deleteItem.id);

    await loadData();

    setDeleteItem(null);
  } catch (err) {
  console.error("DELETE ERROR:", err);
  console.log("ERROR DATA:", err.data);

  alert(
    err?.data?.detail ||
    err?.data?.error ||
    JSON.stringify(err?.data) ||
    "Delete failed"
  );
}
};

const handleToggle = async (id) => {
  try {
    await menuApi.toggleAvailability(id);

    await loadData();
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-stone-500 text-sm">{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <Button variant="primary" onClick={() => { setForm(emptyForm); setEditItem(null); setShowForm(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all">
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <div className="flex rounded-xl border border-stone-300 overflow-hidden bg-white/70">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2.5 transition-colors ${viewMode === "grid" ? "bg-[#0F766E] text-white" : "text-stone-500 hover:bg-stone-100"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setViewMode("list")} className={`px-3 py-2.5 transition-colors ${viewMode === "list" ? "bg-[#0F766E] text-white" : "text-stone-500 hover:bg-stone-100"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        filtered.length === 0
          ? <EmptyState title="No items found" message="Try adjusting your search or filters" />
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(item => (
                <MenuItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={setDeleteItem} onToggle={handleToggle} />
              ))}
            </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white/80 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100">
                {["Item", "Category", "Price", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.length === 0
                ? <tr><td colSpan={5} className="py-12 text-center text-stone-400 text-sm">No items found</td></tr>
                : filtered.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-[#111111]">{item.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{item.category}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#0F766E]">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">
                      <Toggle checked={item.is_available} onChange={() => handleToggle(item.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(item)} className="px-2.5 py-1.5 text-xs font-medium bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-700 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => setDeleteItem(item)} className="px-2.5 py-1.5 text-xs font-medium bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? "Edit Menu Item" : "Add Menu Item"} size="md">
        <div className="space-y-4">
          <div className="space-y-2">
  <label className="text-sm font-medium text-stone-700">
    Item Image
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setForm((f) => ({
        ...f,
        image: e.target.files[0],
      }))
    }
    className="w-full px-3 py-2 border rounded-xl"
  />

  {form.image && (
    <img
      src={URL.createObjectURL(form.image)}
      alt="preview"
      className="w-28 h-28 object-cover rounded-lg border"
    />
  )}
</div>
          <Input label="Item Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grilled Salmon" />
          <Select label="Category *" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">Select category</option>
           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the dish…" rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
          </div>
          <Input label="Price ($) *" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-sm font-medium text-[#111111]">Available</p>
              <p className="text-xs text-stone-500">Show this item on the menu</p>
            </div>
            <Toggle checked={form.is_available} onChange={v => setForm(f => ({ ...f, is_available: v }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleSave} disabled={!form.name || !form.price}>
              {editItem ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal open={!!deleteItem} title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} danger />
    </div>
  );
}
