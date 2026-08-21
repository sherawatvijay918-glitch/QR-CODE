"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { menuItems, categories } from "@/lib/dummy-data";
import {
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  User,
  Phone,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Calendar,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  UserPlus,
  Minus,
  Plus,
  CreditCard,
  FileText
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}

interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

interface Transaction {
  id: number;
  customerId: number;
  type: "bill" | "payment";
  amount: number;
  items: TransactionItem[] | null;
  notes: string | null; // serves as extra notes/details
  createdAt: string;
}

export default function RoughLedgerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");

  // Statement Passbook Modal
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Form: Create Customer Profile
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Form: Inline transaction entry inside Passbook
  const [txType, setTxType] = useState<"bill" | "payment">("bill");
  const [txDate, setTxDate] = useState(""); // custom date-time
  const [txDescription, setTxDescription] = useState(""); // Extra notes/details

  // New States: Menu order builder inside diary entry
  const [txBillItems, setTxBillItems] = useState<TransactionItem[]>([]);
  const [txCatalogSearch, setTxCatalogSearch] = useState("");
  const [txCustomName, setTxCustomName] = useState("");
  const [txCustomPrice, setTxCustomPrice] = useState("");

  // Simple Payment State
  const [txPaymentAmount, setTxPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"UPI" | "Cash">("UPI");

  // Quick Settle Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleCust, setSettleCust] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settlePaymentMode, setSettlePaymentMode] = useState<"UPI" | "Cash">("UPI");
  const [settleNotes, setSettleNotes] = useState("");
  const [activeSettleDropdown, setActiveSettleDropdown] = useState<number | null>(null);

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<"all" | "pending" | "excess" | "settled">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<"UPI" | "Cash">("UPI");
  const [payNotes, setPayNotes] = useState("");
  const [payDate, setPayDate] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/rough-customers?status=all");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      triggerToast("Failed to fetch customer list");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (custId: number) => {
    setIsTxLoading(true);
    try {
      const res = await fetch(`/api/rough-transactions?customerId=${custId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch statements:", err);
      triggerToast("Failed to load passbook entries");
    } finally {
      setIsTxLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleOpenRoughPos = () => {
      setTxBillItems([]);
      setTxDescription("");
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setTxDate(now.toISOString().substring(0, 16));
      setIsMenuModalOpen(true);
    };
    window.addEventListener("open-rough-pos-modal", handleOpenRoughPos);
    return () => {
      window.removeEventListener("open-rough-pos-modal", handleOpenRoughPos);
    };
  }, []);

  useEffect(() => {
    if (isPassbookOpen && selectedCust) {
      fetchTransactions(selectedCust.id);

      // Reset inline form values
      setTxPaymentAmount("");
      setPaymentMode("UPI");
      setTxDescription("");
      setTxBillItems([]);
      setTxCatalogSearch("");
      setTxCustomName("");
      setTxCustomPrice("");
      setTxType("bill");

      // Set default transaction date-time to current local time (formatted for datetime-local input)
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setTxDate(now.toISOString().slice(0, 16));
    }
  }, [isPassbookOpen, selectedCust]);

  // Compute metrics totals
  const totalDueReceivables = customers.reduce((sum, c) => c.totalDue > 0 ? sum + Number(c.totalDue) : sum, 0);
  const totalAdvancesPayables = customers.reduce((sum, c) => c.totalDue < 0 ? sum + Math.abs(Number(c.totalDue)) : sum, 0);
  const activeCustomersCount = customers.length;

  // Auto-calculated bill amount
  const calculatedBillTotal = txBillItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const totalBills = transactions.filter(t => t.type === "bill").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPayments = transactions.filter(t => t.type === "payment").reduce((sum, t) => sum + Number(t.amount), 0);

  // Filter catalogue items for autocomplete search
  const filteredCatalogItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(txCatalogSearch.toLowerCase())
  ).slice(0, 5);

  // Add Item helpers for diary logger
  const addCatalogItem = (item: typeof menuItems[0]) => {
    setTxBillItems(prev => {
      const exists = prev.find(i => i.name === item.name);
      if (exists) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prev, { name: item.name, price: item.price, qty: 1 }];
      }
    });
    setTxCatalogSearch("");
  };

  const addCustomItem = () => {
    if (!txCustomName.trim() || !txCustomPrice) return;
    const priceNum = parseFloat(txCustomPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price");
      return;
    }
    setTxBillItems(prev => {
      const exists = prev.find(i => i.name === txCustomName.trim());
      if (exists) {
        return prev.map(i => i.name === txCustomName.trim() ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prev, { name: txCustomName.trim(), price: priceNum, qty: 1 }];
      }
    });
    setTxCustomName("");
    setTxCustomPrice("");
  };

  const adjustBillItemQty = (name: string, delta: number) => {
    setTxBillItems(prev => prev.map(i => {
      if (i.name === name) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean) as TransactionItem[]);
  };

  const removeBillItem = (name: string) => {
    setTxBillItems(prev => prev.filter(i => i.name !== name));
  };

  // Create new customer profile
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    try {
      const res = await fetch("/api/rough-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone || null })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Account created for ${newCustName}`);
        setIsCustomerModalOpen(false);
        setNewCustName("");
        setNewCustPhone("");
        fetchCustomers();
      } else {
        triggerToast(data.error || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error creating customer profile");
    }
  };

  // Add a transaction record (Bill / Payment) directly from the customer statement modal
  const handleAddTransactionEntry = async (e?: React.FormEvent, customBody?: any) => {
    if (e) e.preventDefault();
    if (!selectedCust) return;

    let finalAmount = 0;
    let finalItems: any = null;
    let body: any = customBody || null;

    if (!body) {

      if (txType === "bill") {
        // Debit / Goods Taken
        if (txBillItems.length === 0) {
          alert("Please add at least one food item or click '+ Add Custom Item' to input pricing");
          return;
        }
        finalAmount = calculatedBillTotal;
        finalItems = txBillItems;
      } else {
        // Credit / Money Paid
        const amountNum = parseFloat(txPaymentAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
          alert("Please enter a valid payment amount");
          return;
        }
        finalAmount = amountNum;
        finalItems = null;

        const currentDue = Number(selectedCust.totalDue);
        let calculationNote = "";
        if (currentDue > 0) {
          if (amountNum > currentDue) {
            calculationNote = `(₹${(amountNum - currentDue).toFixed(2)} extra/advance)`;
          } else if (amountNum < currentDue) {
            calculationNote = `(₹${(currentDue - amountNum).toFixed(2)} remaining due)`;
          } else {
            calculationNote = `(Fully settled)`;
          }
        } else {
          calculationNote = `(Added to advance)`;
        }

        finalItems = null;
        // Combine type, paymentMode, user notes, and automated difference details
        body = {
          customerId: selectedCust.id,
          type: txType,
          amount: finalAmount,
          items: finalItems,
          notes: `Paid via ${paymentMode}${txDescription.trim() ? `. Note: ${txDescription.trim()}` : ""} ${calculationNote}`,
          createdAt: txDate ? new Date(txDate).toISOString() : new Date().toISOString()
        };
      }
    }

    try {
      const res = await fetch("/api/rough-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {
          customerId: selectedCust.id,
          type: txType,
          amount: finalAmount,
          items: finalItems,
          notes: txDescription.trim() || null,
          createdAt: txDate ? new Date(txDate).toISOString() : new Date().toISOString()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Entry logged successfully!");

        // Reset inputs
        setTxPaymentAmount("");
        setTxDescription("");
        setTxBillItems([]);
        setTxCatalogSearch("");
        setTxCustomName("");
        setTxCustomPrice("");

        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setTxDate(now.toISOString().slice(0, 16));

        // Refresh customer list to update balances
        await fetchCustomers();

        // Fetch updated transaction statement
        await fetchTransactions(selectedCust.id);

        // Re-evaluate selected customer details to update modal title balance
        const updatedCustRes = await fetch("/api/rough-customers");
        const updatedCustData = await updatedCustRes.json();
        if (Array.isArray(updatedCustData)) {
          const matched = updatedCustData.find((c: any) => c.id === selectedCust.id);
          if (matched) setSelectedCust(matched);
        }
      } else {
        triggerToast(data.error || "Failed to log entry");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error logging entry");
    }
  };

  const openSettleModal = (cust: Customer, mode: "UPI" | "Cash" = "UPI") => {
    setSettleCust(cust);
    setSettleAmount(Math.abs(Number(cust.totalDue)).toString());
    setSettlePaymentMode(mode);
    setSettleNotes("");
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCust) return;

    const amountNum = parseFloat(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const balance = Number(settleCust.totalDue);
    const type = balance > 0 ? "payment" : "bill";
    const settleAmt = amountNum;

    let calculationNote = "";
    if (balance > 0) {
      if (amountNum > balance) {
        calculationNote = `(₹${(amountNum - balance).toFixed(2)} extra/advance)`;
      } else if (amountNum < balance) {
        calculationNote = `(₹${(balance - amountNum).toFixed(2)} remaining due)`;
      } else {
        calculationNote = `(Fully settled)`;
      }
    } else {
      const adv = Math.abs(balance);
      if (amountNum > adv) {
        calculationNote = `(₹${(amountNum - adv).toFixed(2)} extra due)`;
      } else if (amountNum < adv) {
        calculationNote = `(₹${(adv - amountNum).toFixed(2)} remaining advance)`;
      } else {
        calculationNote = `(Fully settled)`;
      }
    }

    const finalNotes = `Settle via ${settlePaymentMode}${settleNotes.trim() ? `. Note: ${settleNotes.trim()}` : ""} ${calculationNote}`;

    try {
      const res = await fetch("/api/rough-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: settleCust.id,
          type: type,
          amount: settleAmt,
          notes: finalNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Account updated for ${settleCust.name}`);
        setIsSettleModalOpen(false);
        setSettleCust(null);

        // Refresh customer list
        await fetchCustomers();

        // Refresh transactions table if passbook is open for this customer
        if (selectedCust && selectedCust.id === settleCust.id) {
          await fetchTransactions(selectedCust.id);
          const updatedCustRes = await fetch("/api/rough-customers");
          const updatedCustData = await updatedCustRes.json();
          if (Array.isArray(updatedCustData)) {
            const matched = updatedCustData.find((c: any) => c.id === selectedCust.id);
            if (matched) setSelectedCust(matched);
          }
        }
      } else {
        triggerToast(data.error || "Failed to settle account");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error settling account");
    }
  };

  const handleConfirmAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const currentDue = Number(selectedCust.totalDue);
    let calculationNote = "";
    if (currentDue > 0) {
      if (amountNum > currentDue) {
        calculationNote = `(₹${(amountNum - currentDue).toFixed(2)} extra/advance)`;
      } else if (amountNum < currentDue) {
        calculationNote = `(₹${(currentDue - amountNum).toFixed(2)} remaining due)`;
      } else {
        calculationNote = `(Fully settled)`;
      }
    } else {
      calculationNote = `(Added to advance)`;
    }

    const finalNotes = `Paid via ${payMode}${payNotes.trim() ? `. Note: ${payNotes.trim()}` : ""} ${calculationNote}`;

    const body = {
      customerId: selectedCust.id,
      type: "payment",
      amount: amountNum,
      notes: finalNotes,
      createdAt: payDate ? new Date(payDate).toISOString() : new Date().toISOString()
    };

    await handleAddTransactionEntry(undefined, body);
    setIsAddPaymentModalOpen(false);
  };

  const handlePOSOrderSubmit = async () => {
    if (!selectedCust) return;
    if (txBillItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    const body = {
      customerId: selectedCust.id,
      type: "bill",
      amount: calculatedBillTotal,
      items: txBillItems,
      notes: txDescription.trim() || `Dinner bill`,
      createdAt: txDate ? new Date(txDate).toISOString() : new Date().toISOString()
    };

    await handleAddTransactionEntry(undefined, body);
    setIsMenuModalOpen(false);
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (!confirm("Are you sure you want to delete this log entry? This will reverse the account calculations.")) return;

    try {
      const res = await fetch(`/api/rough-transactions?id=${txId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Entry deleted successfully");
        if (selectedCust) {
          await fetchTransactions(selectedCust.id);
          const custRes = await fetch("/api/rough-customers");
          const custData = await custRes.json();
          if (Array.isArray(custData)) {
            setCustomers(custData);
            const matched = custData.find((c: any) => c.id === selectedCust.id);
            if (matched) setSelectedCust(matched);
          }
        }
      } else {
        triggerToast(data.error || "Failed to delete entry");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error deleting entry");
    }
  };

  const handleQuickAddItem = async (cust: Customer, itemName: string, price: number) => {
    const now = new Date();
    // Adjust to local timezone ISO string format
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const createdAtStr = now.toISOString();

    const finalAmount = price;
    const finalItems = [{ name: itemName, price: price, qty: 1 }];
    const finalNotes = `Quick Add: ${itemName} (x1)`;

    try {
      const res = await fetch("/api/rough-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: cust.id,
          type: "bill",
          amount: finalAmount,
          items: finalItems,
          notes: finalNotes,
          createdAt: createdAtStr
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Added 1 ${itemName} to ${cust.name}'s account`);

        // Refresh customer list
        await fetchCustomers();

        // Refresh transactions table
        await fetchTransactions(cust.id);

        // Re-evaluate selected customer details
        const updatedCustRes = await fetch("/api/rough-customers");
        const updatedCustData = await updatedCustRes.json();
        if (Array.isArray(updatedCustData)) {
          const matched = updatedCustData.find((c: any) => c.id === cust.id);
          if (matched) setSelectedCust(matched);
        }
      } else {
        triggerToast(data.error || "Failed to add entry");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error adding entry");
    }
  };

  const openPassbook = (cust: Customer) => {
    setSelectedCust(cust);
    setStartDate("");
    setEndDate("");
    setIsPassbookOpen(true);
  };

  // Filter list by search query and status filter
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    const balance = Number(c.totalDue);
    if (customerStatusFilter === "pending") return balance > 0;
    if (customerStatusFilter === "excess") return balance < 0;
    if (customerStatusFilter === "settled") return balance === 0;
    return true;
  });

  return (
    <>
      {selectedCust ? (
        <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          <Topbar title="Notebook Ledger" />

          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden min-h-0 w-full max-w-7xl mx-auto">
            <div className="flex-1 flex flex-col overflow-hidden space-y-5 animate-float h-full min-h-0">

              {/* Header / Profile & Command Actions Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center font-extrabold text-sm shrink-0">
                    {selectedCust.name ? selectedCust.name[0].toUpperCase() : "C"}
                  </div>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => { setSelectedCust(null); }}
                      className="group flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                    >
                      <span className="group-hover:-translate-x-0.5 transition-transform duration-200">&larr;</span> Back to ledger accounts
                    </button>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Ledger Passbook: <span className="font-bold text-slate-650 dark:text-slate-350">{selectedCust.name}</span>
                    </h2>
                    {selectedCust.phone && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-all">
                        Linked Mobile: {selectedCust.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions command bar */}
                <div className="flex flex-wrap items-center gap-2 select-none z-20">
                  {/* Add Order Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTxBillItems([]);
                      setTxDescription("");
                      const now = new Date();
                      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                      setTxDate(now.toISOString().substring(0, 16));
                      setIsMenuModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Add Order Bill</span>
                  </button>

                  {/* Add Payment Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPayAmount("");
                      setPayNotes("");
                      const now = new Date();
                      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                      setPayDate(now.toISOString().substring(0, 16));
                      setIsAddPaymentModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98] flex items-center gap-1.5 border border-transparent dark:border-slate-200"
                  >
                    <CreditCard size={13} />
                    <span>Log Payment</span>
                  </button>

                  {/* Settle Balance Dropdown */}
                  {Number(selectedCust.totalDue) !== 0 && (
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setActiveSettleDropdown(activeSettleDropdown === -selectedCust.id ? null : -selectedCust.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-805 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] shadow-sm border border-slate-200 dark:border-slate-800"
                      >
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span>Settle Account ▾</span>
                      </button>

                      {activeSettleDropdown === -selectedCust.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-float text-left">
                          <button
                            type="button"
                            onClick={() => {
                              openSettleModal(selectedCust, "UPI");
                              setActiveSettleDropdown(null);
                            }}
                            className="w-full text-left text-[11px] font-bold px-4 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Pay via UPI
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              openSettleModal(selectedCust, "Cash");
                              setActiveSettleDropdown(null);
                            }}
                            className="w-full text-left text-[11px] font-bold px-4 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Pay via Cash
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Full-width Layout: Quick Add, Filter & Statement Table */}
              <div className="flex-1 flex flex-col overflow-hidden h-full min-h-0 pb-4 space-y-4">

                {/* 3-Card Metrics Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 select-none">
                  {/* Total Dues Created (Debit) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Purchases</span>
                    <span className="text-xl font-black font-mono block text-slate-850 dark:text-white mt-1">₹{totalBills.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">Value of billed food items</span>
                  </div>

                  {/* Total Payments Logged (Credit) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Payments</span>
                    <span className="text-xl font-black font-mono block text-slate-850 dark:text-white mt-1">₹{totalPayments.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">Payments cleared by user</span>
                  </div>

                  {/* Net Ledger Balance Outstanding */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Net Ledger Balance</span>
                    <span className="text-xl font-black font-mono block mt-1">
                      {Number(selectedCust.totalDue) > 0 ? (
                        <span className="text-rose-500">₹{Number(selectedCust.totalDue).toFixed(2)} Due</span>
                      ) : Number(selectedCust.totalDue) < 0 ? (
                        <span className="text-sky-500">₹{Math.abs(Number(selectedCust.totalDue)).toFixed(2)} Advance</span>
                      ) : (
                        <span className="text-emerald-500">₹0.00 Settled</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">Remaining outstanding balance</span>
                  </div>
                </div>

                {/* Quick Add Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm shrink-0 select-none">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block shrink-0 select-none">Items Quick Log</span>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {[
                      { name: "Aloo Paratha with Curd", label: "Aloo Paratha", price: 120 },
                      { name: "Chole Bhature", label: "Chole Bhature", price: 100 },
                      { name: "Paneer Paratha with Curd", label: "Paneer Paratha", price: 80 },
                      { name: "Poha", label: "Poha", price: 80 },
                      { name: "Cold Coffee", label: "Cold Coffee", price: 160 },
                      { name: "Gulab Jamun", label: "Gulab Jamun", price: 180 }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAddItem(selectedCust, item.name, item.price)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        {item.label} &bull; ₹{item.price}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date filter bar - compact premium card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0 select-none">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block sm:w-20 select-none">Date Range</span>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar size={12} />
                        </div>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 pl-8.5 pr-3 py-2 text-xs outline-none text-slate-850 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar size={12} />
                        </div>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 pl-8.5 pr-3 py-2 text-xs outline-none text-slate-850 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => { setStartDate(""); setEndDate(""); }}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl transition-all cursor-pointer select-none whitespace-nowrap text-slate-500 hover:text-slate-750 dark:hover:text-white"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Table statement logs - premium layout */}
                <div className="flex-1 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/90 overflow-y-auto shadow-sm min-h-0">
                  {isTxLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3 select-none">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-550 border-t-transparent dark:border-white dark:border-t-transparent" />
                      <p className="text-xs text-slate-400 font-bold">Loading statements ledger...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center select-none text-slate-400">
                      <Info size={24} className="mb-2 text-slate-200 dark:text-slate-800" />
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No logs found in ledger diary</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Generate order or log a payment to see transaction entries here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/20 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Details & Description</th>
                            <th className="px-6 py-4 text-right">Debit (Goods)</th>
                            <th className="px-6 py-4 text-right">Credit (Paid)</th>
                            <th className="px-6 py-4 text-right">Running Balance</th>
                            <th className="px-6 py-4 text-center">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          {(() => {
                            let runningBal = 0;
                            return transactions.map((tx) => {
                              const isBill = tx.type === "bill";
                              const amt = Number(tx.amount);
                              if (isBill) {
                                runningBal += amt;
                              } else {
                                runningBal -= amt;
                              }

                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                                  <td className="px-6 py-4 text-slate-400 dark:text-slate-500 leading-relaxed min-w-28 font-normal text-[10.5px]">
                                    {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    })}
                                    <span className="block text-[9.5px] text-slate-400 mt-0.5 font-mono">
                                      {new Date(tx.createdAt).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                      }).toLowerCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-205 leading-normal max-w-xs select-text">
                                    <div className="flex items-center gap-1.5 text-slate-850 dark:text-slate-200">
                                      {isBill ? (
                                        <FileText size={12} className="text-slate-400 shrink-0" />
                                      ) : (
                                        <CreditCard size={12} className="text-emerald-500 shrink-0" />
                                      )}
                                      <p className="font-extrabold">{tx.notes}</p>
                                    </div>
                                    {tx.items && Array.isArray(tx.items) && tx.items.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5 font-mono text-[9px] select-none">
                                        {tx.items.map((it: any, index: number) => {
                                          // check if veg/non-veg dot
                                          const itemMatch = menuItems.find(mi => mi.name.toLowerCase() === it.name.toLowerCase());
                                          const isVeg = itemMatch ? itemMatch.veg : true;
                                          return (
                                            <span
                                              key={index}
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border bg-white dark:bg-slate-900 ${isVeg
                                                  ? "border-emerald-500/10 text-emerald-650"
                                                  : "border-rose-500/10 text-rose-650"
                                                }`}
                                            >
                                              <span className={`h-1 w-1 rounded-full shrink-0 ${isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                                              <span>{it.name} &bull; x{it.qty}</span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold select-none text-[12px]">
                                    {isBill ? `₹${amt.toFixed(2)}` : "—"}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold select-none text-[12px]">
                                    {!isBill ? `₹${amt.toFixed(2)}` : "—"}
                                  </td>
                                  <td className={`px-6 py-4 text-right font-mono font-bold select-none text-[12px] ${runningBal > 0 ? "text-slate-850 dark:text-white" : runningBal < 0 ? "text-blue-500" : "text-slate-400"}`}>
                                    ₹{Math.abs(runningBal).toFixed(2)}
                                    <span className="text-[9px] font-black uppercase tracking-wider ml-1 text-slate-400">
                                      {runningBal > 0 ? "due" : runningBal < 0 ? "adv" : "settled"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center select-none">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTransaction(tx.id)}
                                      className="h-7 w-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-550 flex items-center justify-center cursor-pointer transition-all active:scale-90 mx-auto"
                                      title="Reverse Entry"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Topbar title="Notebook Ledger" />
          <main className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto w-full pb-24">
            <div className="space-y-6 select-none animate-fade-in">
              {/* Page Title Panel */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="text-indigo-500" size={18} />
                    Rough Book Ledger
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Maintain customer accounts, log order transactions, and manage active ledger balances.
                  </p>
                </div>

                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white transition-all px-4.5 py-2.5 text-xs font-bold cursor-pointer active:scale-95 shadow-sm shrink-0"
                >
                  <UserPlus size={13} />
                  <span>Create Client Ledger</span>
                </button>
              </div>

              {/* Toast Alerts */}
              {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#0B0F19] text-white border border-indigo-500/20 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-float max-w-sm">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white shrink-0">
                    <Info className="animate-pulse" size={13} />
                  </div>
                  <div className="text-xs font-bold pr-2 leading-normal">
                    {toast}
                  </div>
                </div>
              )}

              {/* Premium Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Receivables */}
                <div className="relative overflow-hidden rounded-2xl border p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 shadow-sm flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Receivables</p>
                    <p className="font-mono text-2xl font-black text-rose-500">₹{totalDueReceivables.toFixed(2)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100/50 dark:border-rose-900/20 shrink-0">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Total Advances */}
                <div className="relative overflow-hidden rounded-2xl border p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 shadow-sm flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Advances</p>
                    <p className="font-mono text-2xl font-black text-sky-500">₹{totalAdvancesPayables.toFixed(2)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-500 flex items-center justify-center border border-sky-100/50 dark:border-sky-900/20 shrink-0">
                    <ArrowDownLeft size={16} />
                  </div>
                </div>

                {/* Active Accounts */}
                <div className="relative overflow-hidden rounded-2xl border p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 shadow-sm flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Accounts</p>
                    <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">{activeCustomersCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-450 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 shrink-0">
                    <User size={16} />
                  </div>
                </div>
              </div>

              {/* Filter / Search Bar with capsule segmented control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="relative w-full sm:w-80 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={13} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search client name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/20 pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-550 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-bold placeholder-slate-400"
                  />
                </div>

                {/* Status Selectors - Premium iOS Style Segment */}
                <div className="bg-slate-50 dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800 overflow-x-auto select-none">
                  {[
                    { id: "all", label: "All Accounts" },
                    { id: "pending", label: "Pending Dues" },
                    { id: "excess", label: "Advances" },
                    { id: "settled", label: "Settled" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCustomerStatusFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${customerStatusFilter === item.id
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Premium Customer Grid Layout */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 select-none">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent dark:border-white dark:border-t-transparent" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 rounded-3xl text-slate-400 select-none">
                  <User size={28} className="mb-2 text-slate-200 dark:text-slate-800" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-400">No client records match the criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomers.map(cust => {
                    const bal = Number(cust.totalDue);
                    const initials = cust.name ? cust.name[0].toUpperCase() : "C";
                    return (
                      <div
                        key={cust.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Card Header: Avatar & Status */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-[12.5px] font-extrabold text-slate-800 dark:text-white leading-snug">{cust.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold select-all">{cust.phone || "No phone linked"}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">RC-{cust.id}</span>
                        </div>

                        {/* Balance display */}
                        <div className="my-5 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-baseline">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ledger Balance</span>
                          <span className="text-right">
                            {bal > 0 ? (
                              <span className="text-[13px] font-mono font-black text-rose-500">₹{bal.toFixed(2)} Due</span>
                            ) : bal < 0 ? (
                              <span className="text-[13px] font-mono font-black text-emerald-600 dark:text-emerald-450">₹{Math.abs(bal).toFixed(2)} Adv</span>
                            ) : (
                              <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500">Settled</span>
                            )}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-1.5 mt-auto select-none pt-1">
                          {/* Settle Dropdown Trigger */}
                          {bal !== 0 ? (
                            <div className="relative">
                              <button
                                onClick={() => setActiveSettleDropdown(activeSettleDropdown === cust.id ? null : cust.id)}
                                className="w-full text-center py-2 px-1.5 text-[11px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 dark:border-emerald-400/10 rounded-xl cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-0.5"
                              >
                                <span>Settle</span>
                                <span>▾</span>
                              </button>

                              {activeSettleDropdown === cust.id && (
                                <div className="absolute left-0 bottom-full mb-1.5 w-full bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-float text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openSettleModal(cust, "UPI");
                                      setActiveSettleDropdown(null);
                                    }}
                                    className="w-full text-left text-[11px] font-bold px-4 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    Pay via UPI
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openSettleModal(cust, "Cash");
                                      setActiveSettleDropdown(null);
                                    }}
                                    className="w-full text-left text-[11px] font-bold px-4 py-2.5 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    Pay via Cash
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              disabled
                              className="w-full text-center py-2 px-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-655 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl cursor-not-allowed"
                            >
                              Settle
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCust(cust);
                              setTxBillItems([]);
                              setTxDescription("");
                              const now = new Date();
                              now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                              setTxDate(now.toISOString().substring(0, 16));
                              setIsMenuModalOpen(true);
                            }}
                            className="w-full text-center py-2 px-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                          >
                            + Order
                          </button>

                          <button
                            type="button"
                            onClick={() => openPassbook(cust)}
                            className="w-full text-center py-2 px-1 bg-slate-900 hover:bg-slate-855 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50 text-white rounded-xl text-[11px] font-bold active:scale-[0.98] transition-all cursor-pointer border border-transparent dark:border-slate-200"
                          >
                            Passbook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* MODAL 1: CREATE CUSTOMER PROFILE */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="fixed inset-0" onClick={() => setIsCustomerModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-50 animate-float flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="text-indigo-500" size={18} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Create Customer Ledger Profile</h3>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer} className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Bhai"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 98765xxxxx"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer text-center"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98] transition-all rounded-xl cursor-pointer text-center shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK SETTLE BALANCE */}
      {isSettleModalOpen && settleCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="fixed inset-0" onClick={() => { setIsSettleModalOpen(false); setSettleCust(null); }} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-50 animate-float flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-555" size={18} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quick Settle: {settleCust.name}</h3>
              </div>
              <button
                onClick={() => { setIsSettleModalOpen(false); setSettleCust(null); }}
                className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmSettle} className="pt-5 space-y-4">

              {/* Display Current Balance */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</span>
                <span className={`text-xs font-black ${Number(settleCust.totalDue) > 0 ? "text-rose-505" : "text-blue-505"}`}>
                  {Number(settleCust.totalDue) > 0
                    ? `Owes ₹${Number(settleCust.totalDue).toFixed(2)}`
                    : `₹${Math.abs(Number(settleCust.totalDue)).toFixed(2)} In Advance`}
                </span>
              </div>

              {/* Payment Mode Selector (UPI / Cash) */}
              <div className="space-y-1.5 select-none">
                <label className="text-[10px] font-bold text-slate-505 dark:text-slate-400 block uppercase tracking-wider">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlePaymentMode("UPI")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${settlePaymentMode === "UPI"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                  >
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlePaymentMode("Cash")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${settlePaymentMode === "Cash"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                  >
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Amount to Settle (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs">₹</div>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-8.5 pr-4 py-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              {(() => {
                const balance = Number(settleCust.totalDue);
                const amountPaid = parseFloat(settleAmount) || 0;
                if (amountPaid <= 0) return null;

                if (balance > 0) {
                  if (amountPaid > balance) {
                    return (
                      <div className="text-[10.5px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl leading-normal">
                        <span>₹{(amountPaid - balance).toFixed(2)} Extra/Advance &bull; New Balance: ₹{(amountPaid - balance).toFixed(2)} adv</span>
                      </div>
                    );
                  } else if (amountPaid < balance) {
                    return (
                      <div className="text-[10.5px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl leading-normal">
                        <span>₹{(balance - amountPaid).toFixed(2)} Remaining Due &bull; New Balance: ₹{(balance - amountPaid).toFixed(2)} due</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-[10.5px] font-bold text-emerald-505 bg-emerald-505/10 border border-emerald-500/20 p-2.5 rounded-xl leading-normal">
                        <span>Fully Settled &bull; New Balance: ₹0.00</span>
                      </div>
                    );
                  }
                } else {
                  const adv = Math.abs(balance);
                  return (
                    <div className="text-[10.5px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl leading-normal">
                      <span>Adding to Advance &bull; New Balance: ₹{(adv + amountPaid).toFixed(2)} adv</span>
                    </div>
                  );
                }
              })()}

              {/* Payment Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Payment Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Settle balance via GPAY"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => { setIsSettleModalOpen(false); setSettleCust(null); }}
                  className="flex-1 py-3 text-xs font-bold text-slate-505 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer text-center"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all rounded-xl cursor-pointer text-center shadow-md"
                >
                  Confirm Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SAME-TO-SAME POS TERMINAL OVERLAY */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-6 select-none">
          <div className="fixed inset-0" onClick={() => setIsMenuModalOpen(false)} />

          <div className="relative w-full max-w-7xl h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B0F19] shadow-2xl z-50 flex flex-col overflow-hidden animate-float">

            {/* Topbar of POS */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>{selectedCust ? `${selectedCust.name} POS Terminal` : "Select Customer POS Terminal"}</span>
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500">
                  {txDate ? new Date(txDate).toLocaleString() : new Date().toLocaleString()}
                </span>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Split layout: Categories (Left), Grid (Center), Cart (Right) */}
            <div className="flex-1 flex overflow-hidden min-h-0">

              {/* 1. Left Sidebar: Categories list */}
              <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 flex flex-col gap-1 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedCategory === null
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                    }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedCategory === cat.id
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* 2. Middle Panel: Item Grid list */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F1F5F9] dark:bg-[#070A13]">
                {/* Search / filter row */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center shrink-0">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search food item by name..."
                      value={txCatalogSearch}
                      onChange={(e) => setTxCatalogSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-8 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 font-bold"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 align-content-start">
                  {menuItems
                    .filter((item) => {
                      if (selectedCategory === null) return true;
                      return item.categoryId === selectedCategory;
                    })
                    .filter((item) => {
                      return item.name.toLowerCase().includes(txCatalogSearch.toLowerCase());
                    })
                    .map((item) => {
                      const cartItem = txBillItems.find((it) => it.name === item.name);
                      const qty = cartItem ? cartItem.qty : 0;
                      const isSelected = qty > 0;

                      // Qty modifiers
                      const handleAddOne = (e: any) => {
                        e.stopPropagation();
                        setTxBillItems((prev) => {
                          const exists = prev.find((it) => it.name === item.name);
                          if (exists) {
                            return prev.map((it) => it.name === item.name ? { ...it, qty: it.qty + 1 } : it);
                          }
                          return [...prev, { name: item.name, price: item.price, qty: 1 }];
                        });
                      };

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => handleAddOne(e)}
                          className={`relative flex gap-3 p-3 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98] select-none ${isSelected ? "border-red-500 ring-1 ring-red-500/30" : "border-slate-200 dark:border-slate-800"
                            }`}
                        >
                          {/* Dish Image */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-center font-bold text-slate-400">
                            {item.image && item.image.startsWith("http") ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{item.name.charAt(0)}</span>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="pr-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.veg ? "bg-emerald-500" : "bg-red-500"}`} />
                                <h4 className="text-[11px] font-black text-slate-805 dark:text-slate-200 truncate leading-normal">{item.name}</h4>
                              </div>
                              <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 mt-1 block">₹{item.price}</span>
                            </div>
                          </div>

                          {/* Selected marker counter badge overlay */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white font-mono text-[10px] font-extrabold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shadow-sm">
                              {qty}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 3. Right Sidebar: Cart Details */}
              <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden min-h-0 select-none">
                {/* Visual tabs like the screenshot */}
                <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-805 text-[10px] font-extrabold select-none">
                  <div className="py-3 text-center border-b-2 border-red-500 bg-slate-50/50 dark:bg-slate-950/20 text-red-500">Dine In</div>
                  <div className="py-3 text-center text-slate-400 hover:text-slate-600 cursor-pointer">Room Service</div>
                  <div className="py-3 text-center text-slate-400 hover:text-slate-600 cursor-pointer">Pick Up</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {/* Customer display */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450">Customer Account</label>
                    {selectedCust ? (
                      <input
                        type="text"
                        disabled
                        value={selectedCust.name}
                        className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-black border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400"
                      />
                    ) : (
                      <select
                        onChange={(e) => {
                          const matched = customers.find(c => c.id === Number(e.target.value));
                          if (matched) {
                            setSelectedCust(matched);
                          }
                        }}
                        className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-black border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400"
                        defaultValue=""
                      >
                        <option value="" disabled>Select Customer</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Selected Cart list */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450">Selected Items</label>
                    {txBillItems.length === 0 ? (
                      <div className="text-[10px] text-slate-450 italic py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/10 leading-normal">
                        No items added yet.<br />Click items from Menu on the left.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                        {txBillItems.map((item, idx) => {
                          const handleSubOne = () => {
                            setTxBillItems((prev) => {
                              const exists = prev.find((it) => it.name === item.name);
                              if (!exists) return prev;
                              if (exists.qty <= 1) {
                                return prev.filter((it) => it.name !== item.name);
                              }
                              return prev.map((it) => it.name === item.name ? { ...it, qty: it.qty - 1 } : it);
                            });
                          };
                          const handleAddOne = () => {
                            setTxBillItems((prev) => {
                              return prev.map((it) => it.name === item.name ? { ...it, qty: it.qty + 1 } : it);
                            });
                          };

                          return (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-bold gap-2">
                              <div className="flex-1 min-w-0 pr-1">
                                <p className="text-slate-800 dark:text-slate-250 truncate">{item.name}</p>
                                <span className="font-mono text-[10px] text-slate-400">₹{item.price}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={handleSubOne}
                                  className="h-4.5 w-4.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-[10px] active:scale-90 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-mono text-xs w-3 text-center">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={handleAddOne}
                                  className="h-4.5 w-4.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-[10px] active:scale-90 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* KOT Instructions notes */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450">KOT Notes / Instructions</label>
                    <textarea
                      placeholder="e.g. Non-spicy, Extra butter"
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-slate-805 dark:text-slate-200 min-h-16 resize-none"
                    />
                  </div>

                  {/* Date selection inside checkout */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450">Order Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-slate-805 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Checkout Summary Footer */}
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shrink-0 select-none">
                  <div className="flex items-center justify-between font-black text-sm">
                    <span className="text-slate-505 uppercase tracking-widest text-[10px]">Total Amount</span>
                    <span className="font-mono text-base text-slate-905 dark:text-white">₹{calculatedBillTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 select-none shrink-0">
                    <button
                      type="button"
                      onClick={() => { setTxBillItems([]); setIsMenuModalOpen(false); }}
                      className="flex-1 py-3 text-xs font-black text-slate-505 hover:text-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePOSOrderSubmit}
                      disabled={txBillItems.length === 0}
                      className="flex-2 py-3 text-xs font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer text-center shadow-md active:scale-98 select-none"
                    >
                      Generate POS
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: ADD PAYMENT RECEIPT MODAL */}
      {isAddPaymentModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="fixed inset-0" onClick={() => setIsAddPaymentModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-50 animate-float flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">💵</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Add Payment: {selectedCust.name}</h3>
              </div>
              <button
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAddPayment} className="pt-5 space-y-4">

              {/* Payment Mode Selector */}
              <div className="space-y-1.5 select-none">
                <label className="text-[10px] font-bold text-slate-505 dark:text-slate-400 block uppercase tracking-wider">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMode("UPI")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${payMode === "UPI"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                  >
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode("Cash")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${payMode === "Cash"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-500"
                      }`}
                  >
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Amount Paid (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-405 font-bold text-xs">₹</div>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-8.5 pr-4 py-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Payment Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-205 font-mono"
                />
              </div>

              {/* Payment Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block uppercase tracking-wider">Payment Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid cash directly"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer text-center"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all rounded-xl cursor-pointer text-center shadow-md"
                >
                  Confirm Payment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
