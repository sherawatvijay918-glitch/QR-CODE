"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import VegDot from "@/components/VegDot";
import { categories as initialCategories, menuItems as initialMenuItems } from "@/lib/dummy-data";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { MenuItem } from "@/lib/types";

// Emoji presets for vegetarian foods
const EMOJI_PRESETS = ["🥙", "🥗", "🍛", "🍲", "🫓", "☕", "🥤", "🍮", "🍰", "🍚", "🥪"];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(initialCategories[0]?.id || "");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState(EMOJI_PRESETS[0]);
  const [formAvailable, setFormAvailable] = useState(true);

  // Filter items
  const filtered = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter((m) => m.categoryId === activeCategory);

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory(categories[0]?.id || "");
    setFormPrice("");
    setFormDescription("");
    setFormImage(EMOJI_PRESETS[0]);
    setFormAvailable(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.categoryId);
    setFormPrice(String(item.price));
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormAvailable(item.available);
    setIsModalOpen(true);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Save form (Add or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) {
      alert("Please enter a valid price.");
      return;
    }

    if (editingItem) {
      // Edit mode
      setMenuItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: formName,
            categoryId: formCategory,
            price: priceNum,
            description: formDescription,
            image: formImage,
            available: formAvailable,
            veg: true, // Always veg
          };
        }
        return item;
      }));
    } else {
      // Add mode
      const newItem: MenuItem = {
        id: `m${Date.now()}`,
        name: formName,
        categoryId: formCategory,
        price: priceNum,
        description: formDescription,
        image: formImage,
        available: formAvailable,
        veg: true, // Always veg
      };
      setMenuItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const handleAddCategory = () => {
    const name = prompt("Enter new category name:");
    if (name && name.trim()) {
      const newCat = {
        id: `c_${Date.now()}`,
        name: name.trim(),
        itemCount: 0
      };
      setCategories(prev => [...prev, newCat]);
      setActiveCategory(newCat.id);
    }
  };

  return (
    <>
      <Topbar title="Menu" />
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-hidden max-w-7xl mx-auto w-full">

        {/* Menu Grid and Add Item button */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 max-h-[calc(100vh-140px)] scrollbar-thin">
          <div className="flex items-center justify-between gap-4 border-b pb-4 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Dish Collections</h2>
              <p className="text-xs text-slate-400 mt-1">Configure dish rates, stock presence, and visual emojis in the system.</p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm shrink-0"
            >
              Add Item
            </button>
          </div>

          {/* Dynamic Menu Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border p-5 bg-surface hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                style={{
                  borderColor: "var(--border)",
                  opacity: item.available ? 1 : 0.65,
                }}
              >
                <div className="space-y-4">
                  {/* Image / Title area */}
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2.5xl shadow-inner border select-none overflow-hidden"
                      style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}
                    >
                      {item.image && item.image.startsWith("http") ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        item.image
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <VegDot veg={true} />
                        <p className="truncate font-bold text-foreground text-sm">{item.name}</p>
                      </div>
                      
                      <p className="line-clamp-2 text-xs leading-normal text-muted">
                        {item.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Options / Availability Indicators and CRUD Buttons */}
                <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Price Option</p>
                    <span className="text-base font-extrabold text-foreground mt-0.5 block">
                      ₹{item.price}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                        item.available
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-muted border border-border/50"
                      }`}
                    >
                      {item.available ? "Available" : "Sold out"}
                    </span>
                    
                    <div className="flex gap-1 pl-2 border-l border-border" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface-inset transition-colors cursor-pointer"
                        aria-label="Edit"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-2 text-muted hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        aria-label="Delete"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Slide-over / Modal Add & Edit Menu Item Form Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl border border-border/40 space-y-5">
            
            {/* Modal Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-surface-inset text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <FiX size={15} />
            </button>

            {/* Modal Title */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brass bg-brass/10 px-3 py-1 rounded-full">
                {editingItem ? "Update Option" : "New Option"}
              </span>
              <h3 className="text-lg font-bold text-foreground mt-2.5">
                {editingItem ? "Edit Vegetarian Dish" : "Add Vegetarian Dish"}
              </h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Item Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all focus:ring-1 focus:ring-brass focus:border-brass bg-surface border-border"
                />
              </div>

              {/* Price Option */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Price Option (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-all focus:ring-1 focus:ring-brass focus:border-brass bg-surface border-border font-mono"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of ingredients or size option"
                  rows={2}
                  className="w-full rounded-xl border px-3.5 py-2 text-xs outline-none transition-all focus:ring-1 focus:ring-brass focus:border-brass bg-surface border-border"
                />
              </div>

              {/* Veg status info badge (locked, pure veg) */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-700 font-semibold select-none">
                <span className="flex items-center gap-1.5">
                  <VegDot veg={true} /> 100% Vegetarian Choice
                </span>
                <span className="text-[9px] uppercase tracking-wider text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded font-mono">
                  Enforced
                </span>
              </div>

              {/* Select Emoji representation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Select Visual Icon</label>
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                  {EMOJI_PRESETS.map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      onClick={() => setFormImage(emoji)}
                      className={`h-9 w-9 text-lg rounded-lg flex items-center justify-center border shrink-0 transition-all cursor-pointer ${
                        formImage === emoji
                          ? "border-brass bg-brass/10 scale-105"
                          : "border-border/60 hover:bg-surface-inset"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability checkbox */}
              <div className="flex items-center gap-2 pt-2 select-none">
                <input
                  type="checkbox"
                  id="avail"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-border/80 border text-brass focus:ring-brass/30 accent-brass cursor-pointer"
                />
                <label htmlFor="avail" className="text-xs font-semibold text-foreground cursor-pointer">
                  Available in stocks for ordering
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                >
                  {editingItem ? "Update Item" : "Create Item"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border py-3 text-xs font-bold text-muted hover:text-foreground hover:bg-surface-inset rounded-xl transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
