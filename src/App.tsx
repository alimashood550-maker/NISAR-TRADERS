import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LayoutDashboard,
  PackageSearch,
  Users,
  FileBarChart,
  Settings,
  Bell,
  Search,
  ShoppingCart,
  Wallet,
  TrendingUp,
  CreditCard,
  Printer,
  Download,
  Share2,
  Barcode as BarcodeIcon,
  Plus,
  Landmark,
  CheckCircle2,
  X,
  Trash2,
  History,
  Filter,
  CalendarDays,
  BadgeIndianRupee,
  Hammer,
  RotateCcw
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Barcode from 'react-barcode';

// TYPES
type TabType = 'dashboard' | 'inventory' | 'parties' | 'banks' | 'reports' | 'settings' | 'history' | 'returns';
type HistoryEntry = { id: number; type: 'Sale' | 'Purchase' | 'Expense' | 'Return'; date: string; customer: string; items: string; qty: number; amount: number; mode: string };
type ScrapItem = { id: number; name: string; qty: number; price: number; date: string };
type ReturnItem = { id: number; name: string; qty: number; type: 'Faulty' | 'Warranty'; date: string; customer: string; note: string };

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReturnEntryModal, setShowReturnEntryModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Transaction History
  const [globalHistory, setGlobalHistory] = useState<HistoryEntry[]>([]);
  const logTransaction = async (entry: Omit<HistoryEntry, 'id'>) => {
    const { data, error } = await supabase.from('global_history').insert([entry]).select().single();
    if (error) console.error("Error logging transaction:", error);
    if (data) setGlobalHistory(prev => [data, ...prev]);
  };

  // Global Mock State (Now from Supabase)
  const [banks, setBanks] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [scrapInventory, setScrapInventory] = useState<ScrapItem[]>([]);
  const [returnsInventory, setReturnsInventory] = useState<ReturnItem[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchData = async () => {
    const [
      { data: history },
      { data: bankData },
      { data: partyData },
      { data: invData },
      { data: scrapData },
      { data: returnsData },
      { data: expData }
    ] = await Promise.all([
      supabase.from('global_history').select('*').order('created_at', { ascending: false }),
      supabase.from('banks').select('*'),
      supabase.from('parties').select('*'),
      supabase.from('inventory').select('*'),
      supabase.from('scrap_inventory').select('*').order('date', { ascending: false }),
      supabase.from('returns_inventory').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false })
    ]);

    if (history) setGlobalHistory(history);
    if (bankData) setBanks(bankData);
    if (partyData) setParties(partyData);
    if (invData) setInventoryItems(invData);
    if (scrapData) setScrapInventory(scrapData);
    if (returnsData) setReturnsInventory(returnsData);
    if (expData) setExpenses(expData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-zinc-900 text-zinc-300 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg">NT</span>
            </div>
            <span>Nisar Traders | <span className="text-zinc-400 font-medium text-sm">Admin Panel</span></span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Command Center" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<PackageSearch size={20} />} label="Inventory & Barcodes" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Users size={20} />} label="Parties & Ledger" active={activeTab === 'parties'} onClick={() => { setActiveTab('parties'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Landmark size={20} />} label="Banks & Finance" active={activeTab === 'banks'} onClick={() => { setActiveTab('banks'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<History size={20} />} label="Sale & Purchase History" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<RotateCcw size={20} />} label="Returns & Warranty" active={activeTab === 'returns'} onClick={() => { setActiveTab('returns'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<FileBarChart size={20} />} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-600"></div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-zinc-500">Super Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shrink-0">
          <div className="flex items-center gap-4 flex-1 lg:max-w-96">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <SidebarItem icon={<LayoutDashboard size={24} />} label="" active={false} onClick={() => {}} /> {/* Using dummy sidebar item for icon style */}
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Search invoices, items, or parties..." 
                className="w-full bg-zinc-100 border-transparent rounded-xl py-2.5 pl-10 pr-4 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors tooltip-trigger"
              title="Notifications"
            >
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                  <h4 className="font-bold text-zinc-900">Notifications</h4>
                  <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">2 New</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer">
                    <p className="text-sm text-zinc-900 font-semibold mb-1">Low Stock Alert</p>
                    <p className="text-xs text-zinc-500">Steel Pipe 2inch is currently running low (12 remaining).</p>
                  </div>
                  <div className="p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer">
                    <p className="text-sm text-zinc-900 font-semibold mb-1">Payment Received</p>
                    <p className="text-xs text-zinc-500">Rs. 15,000 received in Meezan Bank.</p>
                  </div>
                  <div className="p-4 text-center">
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-800" onClick={() => setShowNotifications(false)}>Mark all as read</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* DYNAMIC VIEW */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {activeTab === 'dashboard' && (
            <CommandCenter 
              banks={banks} 
              inventoryItems={inventoryItems} 
              setActiveTab={setActiveTab} 
              onPurchaseClick={() => setShowPurchaseModal(true)} 
              onExpenseClick={() => setShowExpenseModal(true)}
              onReturnClick={() => setShowReturnEntryModal(true)}
              logTransaction={logTransaction} 
              setScrapInventory={setScrapInventory}
              fetchData={fetchData}
              globalHistory={globalHistory}
            />
          )}
          {activeTab === 'inventory' && <InventoryModule inventoryItems={inventoryItems} fetchData={fetchData} scrapInventory={scrapInventory} />}
          {activeTab === 'parties' && <PartyLedgerModule parties={parties} fetchData={fetchData} />}
          {activeTab === 'banks' && <BanksModule banks={banks} fetchData={fetchData} />}
          {activeTab === 'history' && <HistoryModule history={globalHistory} />}
          {activeTab === 'returns' && <ReturnsModule returnsInventory={returnsInventory} returnsHistory={globalHistory.filter(h => h.type === 'Return')} scrapInventory={scrapInventory} />}
          {activeTab === 'reports' && <ReportsModule parties={parties} banks={banks} inventoryItems={inventoryItems} expenses={expenses} globalHistory={globalHistory} />}
          {activeTab === 'settings' && <SettingsModule />}
        </div>
      </main>

      {/* PURCHASE MODAL (GLOBAL) */}
      {showPurchaseModal && (
        <PurchaseModal 
          onClose={() => setShowPurchaseModal(false)} 
          inventoryItems={inventoryItems}
          setInventoryItems={setInventoryItems}
          banks={banks}
          parties={parties}
          logTransaction={logTransaction}
        />
      )}
      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <ExpenseModal 
          onClose={() => setShowExpenseModal(false)} 
          banks={banks}
          setBanks={setBanks}
          expenses={expenses}
          setExpenses={setExpenses}
          logTransaction={logTransaction}
        />
      )}

      {/* RETURNS ENTRY MODAL */}
      {showReturnEntryModal && (
        <ReturnsEntryModal 
          onClose={() => setShowReturnEntryModal(false)} 
          inventoryItems={inventoryItems}
          returnsInventory={returnsInventory}
          setReturnsInventory={setReturnsInventory}
          logTransaction={logTransaction}
        />
      )}
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// ------------------------------------------
// PURCHASE MODAL
// ------------------------------------------
function PurchaseModal({ onClose, inventoryItems, setInventoryItems, banks, parties, logTransaction }: any) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash'|'bank'>('cash');
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  const handleConfirmPurchase = async () => {
    if (!selectedProductId) return alert("Select a product to restock");
    if (qty <= 0 || rate <= 0) return alert("Enter valid quantity and rate");
    
    const product = inventoryItems.find((item: any) => item.id.toString() === selectedProductId.toString());
    const party = parties.find((p: any) => p.id.toString() === selectedPartyId.toString());

    // Update Inventory
    const newStock = product.stock + qty;
    const { error: invError } = await supabase
      .from('inventory')
      .update({ stock: newStock, status: newStock > 20 ? 'optimal' : 'low' })
      .eq('id', selectedProductId);

    if (invError) return alert("Error updating inventory: " + invError.message);

    // Update Bank Balance if mode is Bank
    if (paymentMode === 'bank' && selectedBankId) {
      const bank = banks.find((b: any) => b.id.toString() === selectedBankId.toString());
      if (bank) {
        const { error: bankError } = await supabase
          .from('banks')
          .update({ balance: bank.balance - (qty * rate) })
          .eq('id', selectedBankId);
        
        if (bankError) console.error("Error updating bank:", bankError);

        await supabase.from('bank_transactions').insert([{
          bank_id: selectedBankId,
          type: 'Purchase',
          description: `Purchase: ${product?.name} x${qty}`,
          amount: -(qty * rate),
          date: new Date().toISOString()
        }]);
      }
    }

    // Log to global history
    await logTransaction({
      type: 'Purchase' as const,
      date: new Date().toISOString().split('T')[0],
      customer: party?.name || 'Direct Purchase',
      items: `${product?.name || 'Unknown'} x${qty}`,
      qty,
      amount: qty * rate,
      mode: paymentMode === 'bank' ? 'Bank' : 'Cash',
    });

    fetchData(); // Refresh UI
    alert(`Successfully purchased and restocked ${qty} units!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="text-rose-500" /> Record New Purchase
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Select Product (Restock)</label>
              <select className="input-field" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                <option value="">-- Choose Product from Inventory --</option>
                {inventoryItems.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.name} (Current Stock: {item.stock})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Quantity</label>
                <input type="number" className="input-field" value={qty} onChange={e => setQty(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Purchase Rate</label>
                <input type="number" className="input-field" value={rate} onChange={e => setRate(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Select Supplier/Party</label>
              <select className="input-field" value={selectedPartyId} onChange={e => setSelectedPartyId(e.target.value)}>
                <option value="">-- Cash Purchase / Select Party --</option>
                {parties.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <label className="block text-xs font-semibold text-zinc-500 mb-3 uppercase">Payment Method</label>
              <div className="flex gap-2 mb-4">
                <button 
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${paymentMode === 'cash' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                  onClick={() => setPaymentMode('cash')}
                >Cash</button>
                <button 
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${paymentMode === 'bank' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                  onClick={() => setPaymentMode('bank')}
                >Bank Transfer</button>
              </div>

              {paymentMode === 'bank' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Select Bank</label>
                  <select className="input-field bg-white" value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)}>
                    <option value="">-- Select Bank Account --</option>
                    {banks.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-zinc-100 pt-6">
            <div className="text-zinc-500 text-sm">
              Total Amount: <span className="text-2xl font-black text-rose-600 tracking-tight ml-2">Rs. {(qty * rate).toLocaleString()}</span>
            </div>
            <button onClick={handleConfirmPurchase} className="btn-primary bg-zinc-900 hover:bg-zinc-800 px-8 shadow-lg shadow-zinc-900/20">
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// EXPENSE MODAL
// ------------------------------------------
function ExpenseModal({ onClose, banks, setBanks, expenses, setExpenses, logTransaction }: any) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Utility');
  const [paymentMode, setPaymentMode] = useState<'cash'|'bank'>('cash');
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  const handleConfirmExpense = async () => {
    if (!desc || amount <= 0) return alert("Enter description and valid amount");
    if (paymentMode === 'bank' && !selectedBankId) return alert("Select a bank account");

    const newExpense = {
      desc,
      amount,
      date: new Date().toISOString().split('T')[0],
      category,
      mode: paymentMode === 'bank' ? 'Bank' : 'Cash'
    };

    const { error: expError } = await supabase.from('expenses').insert([newExpense]);
    if (expError) return alert("Error saving expense: " + expError.message);

    // Update Bank Balance if mode is Bank
    if (paymentMode === 'bank' && selectedBankId) {
      const bank = banks.find((b: any) => b.id.toString() === selectedBankId.toString());
      if (bank) {
        const { error: bankError } = await supabase
          .from('banks')
          .update({ balance: bank.balance - amount })
          .eq('id', selectedBankId);
        
        if (bankError) console.error("Error updating bank:", bankError);

        await supabase.from('bank_transactions').insert([{
          bank_id: selectedBankId,
          type: 'Expense',
          description: desc,
          amount: -amount,
          date: new Date().toISOString()
        }]);
      }
    }

    // Log to global history
    await logTransaction({
      type: 'Expense' as const,
      date: new Date().toISOString().split('T')[0],
      customer: 'Business Expense',
      items: `${category}: ${desc}`,
      qty: 1,
      amount,
      mode: paymentMode === 'bank' ? 'Bank' : 'Cash',
    });

    fetchData(); // Refresh UI
    alert("Expense recorded successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <BadgeIndianRupee className="text-amber-500" /> Record Business Expense
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Description</label>
            <input type="text" className="input-field" placeholder="e.g. Shop Rent, Electricity Bill" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Amount (Rs.)</label>
              <input type="number" className="input-field font-bold" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Utility">Utility</option>
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="block text-xs font-semibold text-zinc-500 mb-3 uppercase">Paid From</label>
            <div className="flex gap-2 mb-4">
              <button 
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${paymentMode === 'cash' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                onClick={() => setPaymentMode('cash')}
              >Cash</button>
              <button 
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${paymentMode === 'bank' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                onClick={() => setPaymentMode('bank')}
              >Bank Account</button>
            </div>
            {paymentMode === 'bank' && (
              <select className="input-field bg-white" value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)}>
                <option value="">-- Select Bank --</option>
                {banks.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>

          <button onClick={handleConfirmExpense} className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-colors">
            Post Expense
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// RETURNS ENTRY MODAL
// ------------------------------------------
function ReturnsEntryModal({ onClose, inventoryItems, returnsInventory, setReturnsInventory, logTransaction }: any) {
  const [productName, setProductName] = useState('');
  const [qty, setQty] = useState(1);
  const [type, setType] = useState<'Faulty'|'Warranty'>('Faulty');
  const [customer, setCustomer] = useState('');
  const [note, setNote] = useState('');

  const handleConfirmReturn = async () => {
    if (!productName || !customer) return alert("Fill mandatory fields");

    const newReturn = {
      name: productName,
      qty,
      type,
      date: new Date().toISOString().split('T')[0],
      customer,
      note
    };

    const { error: retError } = await supabase.from('returns_inventory').insert([newReturn]);
    if (retError) return alert("Error saving return: " + retError.message);

    // Log to global history
    await logTransaction({
      type: 'Return' as const,
      date: new Date().toISOString().split('T')[0],
      customer: customer,
      items: `RETURN: ${productName} (${type})`,
      qty,
      amount: 0,
      mode: 'N/A'
    });

    fetchData(); // Refresh UI
    alert("Return recorded in warranty/faulty inventory");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <RotateCcw className="text-zinc-600" /> Product Return Entry
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Product Name</label>
            <input type="text" className="input-field" list="return-items-list" value={productName} onChange={e => setProductName(e.target.value)} />
            <datalist id="return-items-list">
              {inventoryItems.map((inv: any) => <option key={inv.id} value={inv.name} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Quantity</label>
              <input type="number" className="input-field" value={qty} onChange={e => setQty(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Return Type</label>
              <select className="input-field" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="Faulty">Faulty Item</option>
                <option value="Warranty">Warranty Claim</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Customer Name</label>
            <input type="text" className="input-field" value={customer} onChange={e => setCustomer(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Reason / Note</label>
            <textarea className="input-field min-h-[80px]" value={note} onChange={e => setNote(e.target.value)} placeholder="Why is the product being returned?"></textarea>
          </div>

          <button onClick={handleConfirmReturn} className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-colors">
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 1. COMMAND CENTER
// ------------------------------------------
function CommandCenter({ banks, inventoryItems, setActiveTab, onPurchaseClick, onExpenseClick, onReturnClick, logTransaction, setScrapInventory, fetchData, globalHistory }: { banks: any[], inventoryItems: any[], setActiveTab: (tab: TabType) => void, onPurchaseClick: () => void, onExpenseClick: () => void, onReturnClick: () => void, logTransaction: any, setScrapInventory: any, fetchData: any, globalHistory: HistoryEntry[] }) {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = globalHistory
    .filter(h => h.type === 'Sale' && h.date === today)
    .reduce((sum, h) => sum + h.amount, 0);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Command Center</h2>
            <p className="text-zinc-500 mt-1 text-sm md:text-base">Overview of today's business activity.</p>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Refresh Data"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap justify-start md:justify-end w-full md:w-auto">
          <button className="btn-primary" onClick={() => document.getElementById('sales-engine')?.scrollIntoView({ behavior: 'smooth' })}>
            <Plus size={18}/> Add Sale
          </button>
          <button className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600 shadow-lg shadow-rose-500/20" onClick={onPurchaseClick}>
            <ShoppingCart size={18}/> Add Purchase
          </button>
          <button className="btn-primary bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-lg shadow-amber-500/20" onClick={onExpenseClick}>
            <BadgeIndianRupee size={18}/> Add Expense
          </button>
          <button className="btn-primary bg-zinc-600 hover:bg-zinc-700 border-zinc-600 shadow-lg shadow-zinc-500/20" onClick={onReturnClick}>
            <RotateCcw size={18}/> Returns Entry
          </button>
        </div>
      </div>

      {/* QUICK ACCESS BUTTONS TO ALL MODULES WITH SOBER COLORS */}
      <div className="card p-5 border-zinc-200 bg-white">
        <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 px-2 tracking-wider">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <QuickNavBtn icon={<PackageSearch size={20} />} label="Inventory" onClick={() => setActiveTab('inventory')} colorClass="bg-[#f1f5f9] text-[#475569] border-[#e2e8f0] hover:bg-[#e2e8f0]" />
          <QuickNavBtn icon={<Users size={20} />} label="Parties" onClick={() => setActiveTab('parties')} colorClass="bg-[#eef2ff] text-[#4f46e5] border-[#e0e7ff] hover:bg-[#e0e7ff]" />
          <QuickNavBtn icon={<Landmark size={20} />} label="Banks" onClick={() => setActiveTab('banks')} colorClass="bg-[#ecfdf5] text-[#059669] border-[#d1fae5] hover:bg-[#d1fae5]" />
          <QuickNavBtn icon={<History size={20} />} label="History" onClick={() => setActiveTab('history')} colorClass="bg-[#fef2f2] text-[#dc2626] border-[#fecaca] hover:bg-[#fecaca]" />
          <QuickNavBtn icon={<RotateCcw size={20} />} label="Returns" onClick={() => setActiveTab('returns')} colorClass="bg-[#f5f5f4] text-[#57534e] border-[#e7e5e4] hover:bg-[#e7e5e4]" />
          <QuickNavBtn icon={<FileBarChart size={20} />} label="Reports" onClick={() => setActiveTab('reports')} colorClass="bg-[#fffbeb] text-[#d97706] border-[#fef3c7] hover:bg-[#fef3c7]" />
          <QuickNavBtn icon={<Settings size={20} />} label="Settings" onClick={() => setActiveTab('settings')} colorClass="bg-[#fafafa] text-[#52525b] border-[#f4f4f5] hover:bg-[#f4f4f5]" />
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Today's Sales" amount={`Rs. ${todaySales.toLocaleString()}`} icon={<TrendingUp size={24} className="text-emerald-500" />} trend="+12.5%" />
        <StatCard title="Cash/Bank Balance" amount={`Rs. ${banks.reduce((a, b) => a + b.balance, 0).toLocaleString()}`} icon={<Wallet size={24} className="text-blue-500" />} />
        <StatCard title="Active Parties" amount={parties.length.toString()} icon={<Users size={24} className="text-indigo-500" />} />
        <StatCard title="Total Inventory" amount={inventoryItems.reduce((a, i) => a + i.stock, 0).toLocaleString()} icon={<PackageSearch size={24} className="text-blue-500" />} />
      </div>

      {/* SALES ENGINE - FULL WIDTH */}
      <div id="sales-engine">
        <SalesInvoiceEngine banks={banks} inventoryItems={inventoryItems} logTransaction={logTransaction} setScrapInventory={setScrapInventory} fetchData={fetchData} />
      </div>

      {/* RECENT TRANSACTIONS - BELOW */}
      <div className="card">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          Recent Party Transactions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer border border-zinc-100">
              <div>
                <p className="font-semibold text-zinc-900">Ali Traders</p>
                <p className="text-xs text-zinc-500">2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">+Rs. 15,000</p>
                <p className="text-xs text-zinc-500">Bank Transfer</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-sm font-medium text-blue-600 hover:text-blue-800" onClick={() => setActiveTab('parties')}>View All Ledger History</button>
      </div>
    </div>
  );
}

function QuickNavBtn({ icon, label, onClick, colorClass }: { icon: React.ReactNode, label: string, onClick: () => void, colorClass: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border transition-all gap-1.5 md:gap-2 ${colorClass}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      <span className="text-[11px] md:text-sm font-bold">{label}</span>
    </button>
  );
}

function StatCard({ title, amount, icon, trend }: { title: string, amount: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 md:p-3 rounded-xl bg-zinc-50 border border-zinc-100">{icon}</div>
        {trend && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-zinc-500 text-xs md:text-sm font-medium mb-1">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-zinc-900">{amount}</h3>
      </div>
    </div>
  );
}

function SalesInvoiceEngine({ banks, inventoryItems, logTransaction, setScrapInventory, fetchData }: { banks: any[], inventoryItems: any[], logTransaction: any, setScrapInventory: any, fetchData: any }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([{ name: '', qty: 1, rate: 0 }]);
  const [paymentMode, setPaymentMode] = useState<'cash'|'bank'>('cash');
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [exchangeItemName, setExchangeItemName] = useState('');
  const [exchangeValue, setExchangeValue] = useState<number>(0);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const calculateTotal = () => {
    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    return Math.max(0, subtotal - exchangeValue);
  };

  const addItem = () => setItems([...items, { name: '', qty: 1, rate: 0 }]);
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const handleConfirmSale = async () => {
    if (!customerName) return alert("Please enter Customer Name");
    if (items.some(i => !i.name || i.rate <= 0)) return alert("Please fill all item details properly.");
    setIsConfirmed(true);

    // Log to global history
    const totalQty = items.reduce((a, i) => a + i.qty, 0);
    const itemsDesc = items.map(i => `${i.name} x${i.qty}`).join(', ');
    const totalAmount = calculateTotal();

    await logTransaction({
      type: 'Sale' as const,
      date: new Date().toISOString().split('T')[0],
      customer: customerName,
      items: itemsDesc + (exchangeItemName ? ` [Exch: ${exchangeItemName}]` : ''),
      qty: totalQty,
      amount: totalAmount,
      mode: paymentMode === 'bank' ? 'Bank' : 'Cash',
    });

    // Add to Scrap Inventory if applicable
    if (exchangeItemName && exchangeValue > 0) {
      await supabase.from('scrap_inventory').insert([{
        name: exchangeItemName,
        qty: 1,
        price: exchangeValue,
        date: new Date().toISOString().split('T')[0]
      }]);
    }

    // Update Bank Balance if mode is Bank
    if (paymentMode === 'bank' && selectedBankId) {
      const bank = banks.find((b: any) => b.id.toString() === selectedBankId.toString());
      if (bank) {
        await supabase
          .from('banks')
          .update({ balance: bank.balance + totalAmount })
          .eq('id', selectedBankId);

        await supabase.from('bank_transactions').insert([{
          bank_id: selectedBankId,
          type: 'Sale',
          description: `Sale to ${customerName}`,
          amount: totalAmount,
          date: new Date().toISOString()
        }]);
      }
    }

    fetchData(); // Refresh all data from Supabase
  };

  const handleResetSale = () => {
    setIsConfirmed(false);
    setCustomerName('');
    setPhone('');
    setItems([{ name: '', qty: 1, rate: 0 }]);
    setPaymentMode('cash');
    setExchangeItemName('');
    setExchangeValue(0);
  }

  const handlePrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    if (!phone) return alert("Please enter a phone number first.");
    let text = `*Nisar Traders* - Invoice Details\n\n`;
    text += `Customer: ${customerName}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    text += `*Items purchased:*\n`;
    items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} - ${item.qty} x Rs.${item.rate} = Rs.${item.qty * item.rate}\n`;
    });
    text += `\n*Grand Total:* Rs.${calculateTotal()}\n`;
    text += `Payment Mode: ${paymentMode === 'bank' ? 'Bank Transfer' : 'Cash'}\n\n`;
    text += `Thank you for your business!`;

    const encodedText = encodeURIComponent(text);
    const sanitizedPhone = phone.replace(/\D/g, ''); 
    
    // WhatsApp API doesn't support sending files via URL directly
    alert("WhatsApp message prepared! Please remember to attach the downloaded PDF receipt manually in WhatsApp after the chat opens.");
    
    window.open(`https://wa.me/${sanitizedPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="card transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-zinc-900">Sales & Invoice Engine</h3>
        
        {!isConfirmed && (
          <div className="flex bg-zinc-100 p-1 rounded-lg w-full md:w-auto">
            <button 
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${paymentMode === 'cash' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setPaymentMode('cash')}
            >
              Cash
            </button>
            <button 
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${paymentMode === 'bank' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setPaymentMode('bank')}
            >
              Bank
            </button>
          </div>
        )}
        
        {isConfirmed && (
          <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> Sale Confirmed
          </span>
        )}
      </div>

      <div className={`transition-opacity duration-300 ${isConfirmed ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Customer Name</label>
            <input type="text" className="input-field" placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={isConfirmed} />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Phone Number</label>
            <input type="text" className="input-field" placeholder="03001234567" value={phone} onChange={e => setPhone(e.target.value)} disabled={isConfirmed} />
          </div>
        </div>

        {paymentMode === 'bank' && !isConfirmed && (
          <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-semibold text-blue-700 mb-1.5 uppercase">Select Receiving Bank</label>
            <select 
              className="input-field bg-white border-blue-200"
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(Number(e.target.value))}
            >
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-6 bg-zinc-50 rounded-xl border border-zinc-200 p-3 md:p-4">
          <div className="hidden md:grid grid-cols-12 gap-3 mb-2 text-xs font-semibold text-zinc-500 uppercase px-2">
            <div className="col-span-4">Item Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Rate (Rs.)</div>
            <div className="col-span-3 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>
          
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-3 mb-4 md:mb-3 items-stretch md:items-center bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-0 border-zinc-200 relative">
              <div className="md:col-span-4">
                <label className="block md:hidden text-[10px] font-bold text-zinc-400 uppercase mb-1">Item Name</label>
                <input 
                  type="text" className="input-field py-2" placeholder="Item Name or select..." 
                  list="inventory-list"
                  value={item.name} 
                  onChange={(e) => { 
                    const newItems = [...items]; 
                    newItems[idx].name = e.target.value;
                    const matched = inventoryItems.find(inv => inv.name === e.target.value);
                    if (matched) newItems[idx].rate = matched.price;
                    setItems(newItems); 
                  }} 
                />
                <datalist id="inventory-list">
                  {inventoryItems.map(inv => <option key={inv.id} value={inv.name} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3 md:contents">
                <div className="md:col-span-2">
                  <label className="block md:hidden text-[10px] font-bold text-zinc-400 uppercase mb-1">Quantity</label>
                  <input 
                    type="number" className="input-field py-2 text-center" 
                    value={item.qty} min={1}
                    onChange={(e) => { const newItems = [...items]; newItems[idx].qty = Number(e.target.value); setItems(newItems); }} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block md:hidden text-[10px] font-bold text-zinc-400 uppercase mb-1">Rate (Rs.)</label>
                  <input 
                    type="number" className="input-field py-2 text-center" 
                    value={item.rate || ''} placeholder="0"
                    onChange={(e) => { const newItems = [...items]; newItems[idx].rate = Number(e.target.value); setItems(newItems); }} 
                  />
                </div>
              </div>
              <div className="md:col-span-3 text-left md:text-right font-bold text-zinc-900 md:pr-2 text-base md:text-lg border-t md:border-t-0 border-zinc-100 pt-2 md:pt-0 mt-2 md:mt-0 flex justify-between items-center">
                <span className="md:hidden text-[10px] text-zinc-400 uppercase">Item Total</span>
                <span>Rs. {(item.qty * item.rate).toLocaleString()}</span>
              </div>
              <div className="md:col-span-1 absolute top-2 right-2 md:static text-center">
                <button onClick={() => removeItem(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={addItem} className="text-sm text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 mt-2 px-2">
            <Plus size={16} /> Add another item
          </button>
        </div>

        {/* EXCHANGE SECTION */}
        {!isConfirmed && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
            <h4 className="text-[10px] md:text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-1"><Hammer size={14} /> Exchange / Old Product Discount (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase">Old Product Name</label>
                <input type="text" className="input-field bg-white border-amber-200" placeholder="e.g. Scrap Battery 12V" value={exchangeItemName} onChange={e => setExchangeItemName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase">Exchange Value (Rs.)</label>
                <input type="number" className="input-field bg-white border-amber-200 font-bold" value={exchangeValue || ''} onChange={e => setExchangeValue(Number(e.target.value))} placeholder="0" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-end border-t border-zinc-100 pt-6 gap-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {!isConfirmed ? (
            <button onClick={handleConfirmSale} className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 px-6 py-3 w-full sm:w-auto">
              <CheckCircle2 size={18} /> Confirm Sale
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:flex gap-2 w-full">
              <button onClick={handleResetSale} className="btn-primary bg-zinc-200 text-zinc-700 hover:bg-zinc-300 w-full sm:w-auto">
                New Sale
              </button>
              <button onClick={handlePrint} className="btn-primary bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 w-full sm:w-auto">
                <Printer size={18} /> Generate Receipt
              </button>
              <button onClick={shareWhatsApp} className="btn-success w-full sm:w-auto">
                <Share2 size={18} /> Send WhatsApp
              </button>
            </div>
          )}
        </div>
        <div className="text-left md:text-right bg-zinc-900 md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none text-white md:text-zinc-900">
          {exchangeValue > 0 && (
            <p className="text-zinc-400 md:text-zinc-500 text-[10px] md:text-xs font-bold uppercase mb-1">
              Subtotal: Rs. {items.reduce((acc, item) => acc + (item.qty * item.rate), 0).toLocaleString()} 
              <span className="text-rose-400 md:text-rose-500 ml-2">(- Rs. {exchangeValue.toLocaleString()})</span>
            </p>
          )}
          <p className="text-zinc-400 md:text-zinc-500 text-xs md:text-sm font-medium mb-1 uppercase tracking-wider">Grand Total</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Rs. {calculateTotal().toLocaleString()}</h2>
        </div>
      </div>

      {/* HIDDEN RECEIPT - Optimized for Thermal Printers */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; display: block !important; }
        }
      `}</style>
      <div className="print-only" style={{ display: 'none' }}>
        <div ref={receiptRef} id="thermal-receipt" className="p-4" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
            <h2 style={{ fontSize: '18px', margin: '0', fontWeight: 'bold' }}>NISAR TRADERS</h2>
            <p style={{ margin: '2px 0' }}>Main Market, Lahore</p>
            <p style={{ margin: '2px 0' }}>Ph: 0300-1234567</p>
          </div>

          <div style={{ marginBottom: '10px', fontSize: '11px' }}>
            <p style={{ margin: '2px 0' }}>Date: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '2px 0' }}>Inv: #{Date.now().toString().slice(-6)}</p>
            <p style={{ margin: '2px 0' }}>Customer: {customerName || 'Walk-in'}</p>
            <p style={{ margin: '2px 0' }}>Payment: {paymentMode.toUpperCase()}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>{(item.qty * item.rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {exchangeValue > 0 && (
            <div style={{ textAlign: 'right', fontSize: '11px', marginBottom: '5px' }}>
              <p style={{ margin: '2px 0' }}>Subtotal: {items.reduce((acc, i) => acc + (i.qty * i.rate), 0).toLocaleString()}</p>
              <p style={{ margin: '2px 0' }}>Exchange: -{exchangeValue.toLocaleString()}</p>
            </div>
          )}

          <div style={{ borderTop: '1px dashed #000', paddingTop: '5px', textAlign: 'right', marginBottom: '15px' }}>
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>TOTAL: Rs. {calculateTotal().toLocaleString()}</h3>
          </div>

          <div style={{ textAlign: 'center', fontSize: '10px' }}>
            <p style={{ margin: '5px 0' }}>*** Thank You ***</p>
            <p style={{ margin: '2px 0' }}>Computer Generated Receipt</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 2. INVENTORY & BARCODE MODULE
// ------------------------------------------
function InventoryModule({ inventoryItems, fetchData, scrapInventory }: { inventoryItems: any[], fetchData: any, scrapInventory: ScrapItem[] }) {
  const [itemName, setItemName] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  
  const printRef = useRef<HTMLDivElement>(null);

  const generateBarcode = () => {
    const uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
    setBarcodeValue(uniqueId);
  };

  const handleAddItem = async () => {
    if (!itemName) return alert('Enter item name');
    const { error } = await supabase.from('inventory').insert([{
      name: itemName,
      stock: 0,
      sku: barcodeValue || 'N/A',
      price: 0,
      status: 'out'
    }]);
    if (error) return alert("Error adding item: " + error.message);
    fetchData();
    setItemName('');
    setBarcodeValue('');
    alert('Item added to master inventory list');
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) return alert("Error deleting item: " + error.message);
      fetchData();
    }
  };

  const printLabel = () => {
    if (!barcodeValue) return alert("Generate a barcode first!");
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { 
              margin: 0; padding: 0; width: 50mm; height: 30mm; 
              display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif;
            }
            .item-name {
              font-size: 10px; font-weight: bold; margin-bottom: 2px; text-align: center;
              width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            svg { max-width: 45mm; max-height: 20mm; }
          </style>
        </head>
        <body>
          <div class="item-name">${itemName || 'Nisar Traders Item'}</div>
          <div id="barcode-container"></div>
          <script>
            document.getElementById('barcode-container').innerHTML = \`${printRef.current?.innerHTML || ''}\`;
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-6">Inventory & Barcodes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card h-fit sticky top-8">
          <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <PackageSearch className="text-blue-500" />
            Register New Item Code
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Product Name</label>
              <input type="text" className="input-field" placeholder="E.g. Iron Rod 12mm" value={itemName} onChange={e => setItemName(e.target.value)} />
            </div>
            <div className="p-6 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center min-h-[200px]">
              {barcodeValue ? (
                <div className="text-center w-full animate-in zoom-in-95 duration-300">
                  <div ref={printRef} className="bg-white p-4 rounded-xl shadow-sm inline-block mb-4">
                    <Barcode value={barcodeValue} width={2} height={50} fontSize={14} background="#ffffff" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button onClick={generateBarcode} className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg font-medium hover:bg-zinc-300 transition-colors text-sm">Regenerate</button>
                    <button onClick={printLabel} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30">
                      <Printer size={16} /> Print Label
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <BarcodeIcon size={48} className="text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 mb-4 text-sm">No barcode generated for this item yet.</p>
                  <button onClick={generateBarcode} className="btn-primary w-auto mx-auto text-sm py-2">Generate Unique Barcode</button>
                </div>
              )}
            </div>
            <button className="btn-primary w-full bg-zinc-900 hover:bg-zinc-800" onClick={handleAddItem}>Save Item to Master List</button>
          </div>
        </div>

        <div className="card border-blue-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-zinc-900">All Products ({inventoryItems.length})</h3>
          </div>
          <div className="space-y-3">
            {inventoryItems.length === 0 ? (
              <p className="text-zinc-500 text-center py-10">No products in inventory.</p>
            ) : (
              inventoryItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-4 border border-zinc-100 rounded-xl bg-white hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 rounded-lg"><BarcodeIcon size={20} className="text-zinc-600" /></div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{item.name}</h4>
                      <p className="text-xs font-mono text-zinc-500">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 font-semibold uppercase">Stock</p>
                      <p className={`font-black text-lg ${item.stock < 20 ? 'text-rose-500' : 'text-emerald-600'}`}>{item.stock}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors tooltip-trigger" title="Delete Product" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SCRAP INVENTORY SECTION */}
      <div className="card border-amber-200 bg-amber-50/20">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Hammer className="text-amber-600" />
          Scrap Inventory (Exchanged Items)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scrapInventory.length === 0 ? (
            <p className="text-zinc-500 col-span-3 text-center py-6">No scrap items recorded yet.</p>
          ) : (
            scrapInventory.map(item => (
              <div key={item.id} className="p-4 bg-white border border-amber-100 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">{item.date}</p>
                <h4 className="font-bold text-zinc-900 mb-1">{item.name}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Value Deducted</p>
                    <p className="font-black text-zinc-900">Rs. {item.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Qty: {item.qty}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 3. PARTY LEDGER
// ------------------------------------------
type ActionType = 'Purchase'|'Sale'|'Clear Payment'|'Clear Receivable';
function PartyLedgerModule({ parties, setParties }: { parties: any[], setParties: any }) {
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState({ name: '', phone: '', type: 'Client' });
  const [expandedPartyId, setExpandedPartyId] = useState<number|null>(null);
  const [actionModal, setActionModal] = useState<{partyId:number, type:ActionType}|null>(null);
  const [actionAmount, setActionAmount] = useState(0);
  const [actionNote, setActionNote] = useState('');
  const [actionMode, setActionMode] = useState<'cash'|'bank'|'credit'>('cash');

  const handleAddParty = async () => {
    if (!newParty.name || !newParty.phone) return alert("Fill all details");
    const { error } = await supabase.from('parties').insert([{
      name: newParty.name,
      type: newParty.type,
      phone: newParty.phone,
      paid: 0,
      unpaid: 0,
      receivable: 0
    }]);
    if (error) return alert("Error adding party: " + error.message);
    fetchData();
    setShowAddParty(false); 
    setNewParty({ name: '', phone: '', type: 'Client' });
  };

  const [partyTransactions, setPartyTransactions] = useState<any[]>([]);
  useEffect(() => {
    if (expandedPartyId) {
      supabase.from('party_transactions')
        .select('*')
        .eq('party_id', expandedPartyId)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) setPartyTransactions(data);
        });
    }
  }, [expandedPartyId]);

  const handleAction = async () => {
    if (!actionModal || actionAmount <= 0) return alert("Enter a valid amount");
    const party = parties.find((p: any) => p.id === actionModal.partyId);
    if (!party) return;

    let updateData: any = {};
    const txnData = {
      party_id: party.id,
      type: actionModal.type,
      mode: actionMode,
      amount: actionAmount,
      date: new Date().toISOString(),
      note: actionNote || actionModal.type
    };

    switch (actionModal.type) {
      case 'Purchase':
        if (actionMode === 'credit') updateData = { unpaid: (party.unpaid || 0) + actionAmount };
        else updateData = { paid: (party.paid || 0) + actionAmount };
        break;
      case 'Sale':
        if (actionMode === 'credit') updateData = { receivable: (party.receivable || 0) + actionAmount };
        else updateData = { paid: (party.paid || 0) + actionAmount };
        break;
      case 'Clear Payment': {
        const pay = Math.min(actionAmount, party.unpaid);
        updateData = { paid: (party.paid || 0) + pay, unpaid: party.unpaid - pay };
        break;
      }
      case 'Clear Receivable': {
        const col = Math.min(actionAmount, party.receivable);
        updateData = { paid: (party.paid || 0) + col, receivable: party.receivable - col };
        break;
      }
    }

    const { error: pError } = await supabase.from('parties').update(updateData).eq('id', party.id);
    if (pError) return alert("Error updating party: " + pError.message);

    await supabase.from('party_transactions').insert([txnData]);

    fetchData();
    setActionModal(null); 
    setActionAmount(0); 
    setActionNote(''); 
    setActionMode('cash');
    if (expandedPartyId === party.id) {
       // Refresh local transactions
       const { data } = await supabase.from('party_transactions').select('*').eq('party_id', party.id).order('date', { ascending: false });
       if (data) setPartyTransactions(data);
    }
  };

  const openAction = (partyId: number, type: ActionType) => {
    setActionModal({ partyId, type });
    setActionMode(type === 'Clear Payment' || type === 'Clear Receivable' ? 'cash' : 'cash');
  };

  const colorMap: Record<string,{bg:string,border:string,btn:string,btnHover:string,badge:string,badgeText:string,text:string}> = {
    'Purchase':         {bg:'bg-rose-50',border:'border-rose-100',btn:'bg-rose-600',btnHover:'hover:bg-rose-700',badge:'bg-rose-100',badgeText:'text-rose-700',text:'text-rose-600'},
    'Sale':             {bg:'bg-blue-50',border:'border-blue-100',btn:'bg-blue-600',btnHover:'hover:bg-blue-700',badge:'bg-blue-100',badgeText:'text-blue-700',text:'text-blue-600'},
    'Clear Payment':    {bg:'bg-emerald-50',border:'border-emerald-100',btn:'bg-emerald-600',btnHover:'hover:bg-emerald-700',badge:'bg-emerald-100',badgeText:'text-emerald-700',text:'text-emerald-600'},
    'Clear Receivable': {bg:'bg-amber-50',border:'border-amber-100',btn:'bg-amber-600',btnHover:'hover:bg-amber-700',badge:'bg-amber-100',badgeText:'text-amber-700',text:'text-amber-600'},
  };
  const showModeSelector = actionModal && (actionModal.type === 'Purchase' || actionModal.type === 'Sale');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Party Ledger</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage purchases, sales, credit, and payment clearing.</p>
        </div>
        <button className="btn-primary w-full md:w-auto" onClick={() => setShowAddParty(!showAddParty)}><Plus size={18}/> Add Party</button>
      </div>



      {showAddParty && (
        <div className="card border-blue-200 shadow-lg shadow-blue-500/10 animate-in fade-in zoom-in-95">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Register New Party</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Party Name</label><input type="text" className="input-field" value={newParty.name} onChange={e => setNewParty({...newParty, name: e.target.value})} placeholder="Business Name" /></div>
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Phone</label><input type="text" className="input-field" value={newParty.phone} onChange={e => setNewParty({...newParty, phone: e.target.value})} placeholder="0300 1234567" /></div>
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Type</label><select className="input-field" value={newParty.type} onChange={e => setNewParty({...newParty, type: e.target.value})}><option value="Client">Client</option><option value="Dealer">Dealer</option><option value="Distributor">Distributor</option></select></div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg" onClick={() => setShowAddParty(false)}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleAddParty}>Save Party</button>
          </div>
        </div>
      )}

      {actionModal && (() => {
        const cm = colorMap[actionModal.type];
        const party = parties.find((p:any) => p.id === actionModal.partyId);
        return (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 overflow-hidden">
              <div className={`p-5 flex justify-between items-center ${cm.bg} border-b ${cm.border}`}>
                <h3 className="font-bold text-zinc-900">{actionModal.type} — {party?.name}</h3>
                <button onClick={() => { setActionModal(null); setActionMode('cash'); }} className="p-1 hover:bg-zinc-200 rounded-full"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {showModeSelector && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase">Payment Mode</label>
                    <div className="flex gap-2">
                      {(['cash','bank','credit'] as const).map(m => (
                        <button key={m} onClick={() => setActionMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${actionMode === m ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{m}</button>
                      ))}
                    </div>
                    {actionMode === 'credit' && (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                        {actionModal.type === 'Purchase' ? '⚠ This will be added to Unpaid. Clear it later.' : '⚠ This will be added to Receivable. Collect it later.'}
                      </p>
                    )}
                  </div>
                )}
                {(actionModal.type === 'Clear Payment') && party?.unpaid > 0 && (
                  <p className="text-xs bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-200">Outstanding: Rs. {party.unpaid.toLocaleString()}</p>
                )}
                {(actionModal.type === 'Clear Receivable') && party?.receivable > 0 && (
                  <p className="text-xs bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-200">Receivable: Rs. {party.receivable.toLocaleString()}</p>
                )}
                <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Amount (Rs.)</label><input type="number" className="input-field text-lg font-bold" value={actionAmount || ''} onChange={e => setActionAmount(Number(e.target.value))} placeholder="0" /></div>
                <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Note</label><input type="text" className="input-field" value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder="Optional description" /></div>
                <button onClick={handleAction} className={`w-full py-3 rounded-xl text-white font-bold ${cm.btn} ${cm.btnHover}`}>
                  Confirm {actionModal.type}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-4">
        {parties.map((party: any) => (
          <div key={party.id} className="card p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-500 shrink-0">{party.name.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-zinc-900 leading-tight">{party.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${party.type === 'Client' ? 'bg-blue-100 text-blue-700' : party.type === 'Dealer' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{party.type}</span>
                    <span className="text-xs text-zinc-400">{party.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                <div className="grid grid-cols-3 md:flex md:items-center gap-4 md:gap-6">
                  <div className="text-left md:text-right"><p className="text-[10px] font-bold text-zinc-400 uppercase">Paid</p><p className="font-bold text-emerald-600 text-xs md:text-sm">Rs. {party.paid.toLocaleString()}</p></div>
                  <div className="text-left md:text-right"><p className="text-[10px] font-bold text-zinc-400 uppercase">You Owe</p><p className="font-bold text-rose-500 text-xs md:text-sm">{party.unpaid > 0 ? `Rs. ${party.unpaid.toLocaleString()}` : '—'}</p></div>
                  <div className="text-left md:text-right"><p className="text-[10px] font-bold text-zinc-400 uppercase">They Owe</p><p className="font-bold text-amber-600 text-xs md:text-sm">{party.receivable > 0 ? `Rs. ${party.receivable.toLocaleString()}` : '—'}</p></div>
                </div>
                
                <div className="flex gap-2 flex-wrap justify-start md:justify-end">
                  <button onClick={() => openAction(party.id, 'Purchase')} className="flex-1 md:flex-none px-2 md:px-3 py-1.5 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 border border-rose-200">Purchase</button>
                  <button onClick={() => openAction(party.id, 'Sale')} className="flex-1 md:flex-none px-2 md:px-3 py-1.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200">Sell Out</button>
                  {party.unpaid > 0 && <button onClick={() => openAction(party.id, 'Clear Payment')} className="flex-1 md:flex-none px-2 md:px-3 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200">Clear Owed</button>}
                  {party.receivable > 0 && <button onClick={() => openAction(party.id, 'Clear Receivable')} className="flex-1 md:flex-none px-2 md:px-3 py-1.5 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-200">Collect Due</button>}
                  <button onClick={() => setExpandedPartyId(expandedPartyId === party.id ? null : party.id)} className="flex-1 md:flex-none px-2 md:px-3 py-1.5 text-[11px] font-semibold bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200">{expandedPartyId === party.id ? 'Hide' : 'Ledger'}</button>
                </div>
              </div>
            </div>
            {expandedPartyId === party.id && (
              <div className="border-t border-zinc-100 bg-zinc-50 p-5">
                <h5 className="text-xs font-bold text-zinc-500 uppercase mb-3">Transaction History</h5>
                {partyTransactions.length === 0 ? <p className="text-sm text-zinc-400">No transactions yet.</p> : (
                  <div className="space-y-2">
                    {partyTransactions.map((txn: any) => {
                      const tc = colorMap[txn.type] || colorMap['Purchase'];
                      return (
                        <div key={txn.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-zinc-100">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.badge} ${tc.badgeText}`}>{txn.type}</span>
                            {txn.mode && <span className="text-[10px] font-medium text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">{txn.mode}</span>}
                            <span className="text-sm text-zinc-700">{txn.note}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-400">{new Date(txn.date).toLocaleDateString()}</span>
                            <span className={`font-bold text-sm ${tc.text}`}>Rs. {txn.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------
// 4. BANKS & FINANCE MODULE
// ------------------------------------------
function BanksModule({ banks, fetchData }: { banks: any[], fetchData: any }) {
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [expandedBankId, setExpandedBankId] = useState<number|null>(null);

  const handleAddBank = async () => {
    if (!newBankName) return alert("Enter bank name");
    const { error } = await supabase.from('banks').insert([{ name: newBankName, balance: 0 }]);
    if (error) return alert("Error adding bank: " + error.message);
    fetchData();
    setShowAddBank(false);
    setNewBankName('');
  };

  const [bankTransactions, setBankTransactions] = useState<any[]>([]);
  useEffect(() => {
    if (expandedBankId) {
      supabase.from('bank_transactions')
        .select('*')
        .eq('bank_id', expandedBankId)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) setBankTransactions(data);
        });
    }
  }, [expandedBankId]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Banks & Finance</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage bank accounts, view history, and balances.</p>
        </div>
        <button className="btn-primary w-full md:w-auto" onClick={() => setShowAddBank(!showAddBank)}><Plus size={18}/> Add Bank</button>
      </div>

      {showAddBank && (
        <div className="card border-emerald-200 shadow-lg shadow-emerald-500/10 animate-in fade-in zoom-in-95 bg-emerald-50/30">
          <h3 className="text-lg font-bold text-emerald-900 mb-4">Register New Bank</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-emerald-700 mb-1.5 uppercase">Bank Name</label>
              <input type="text" className="input-field border-emerald-200" value={newBankName} onChange={e => setNewBankName(e.target.value)} placeholder="E.g. Allied Bank" />
            </div>
            <div className="flex items-end">
              <button className="btn-success" onClick={handleAddBank}>Save Bank</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banks.map((bank: any) => (
          <div key={bank.id} className="card relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Landmark size={100} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-zinc-900 mb-2 relative z-10">{bank.name}</h3>
            <p className="text-[10px] md:text-sm text-zinc-500 font-semibold uppercase mb-1 relative z-10">Current Balance</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600 mb-4 relative z-10">Rs. {bank.balance.toLocaleString()}</p>
            
            <button 
              onClick={() => setExpandedBankId(expandedBankId === bank.id ? null : bank.id)}
              className="w-full py-2 bg-zinc-50 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold transition-colors relative z-10 border border-zinc-100"
            >
              {expandedBankId === bank.id ? 'Hide History' : 'View Full History'}
            </button>

            {expandedBankId === bank.id && (
              <div className="mt-4 border-t border-zinc-100 pt-4 relative z-10 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">All Transactions</h4>
                {bankTransactions.length === 0 ? (
                  <p className="text-sm text-zinc-400">No transactions recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bankTransactions.map((txn: any) => (
                      <div key={txn.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-zinc-100">
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{txn.description}</p>
                          <p className="text-[10px] text-zinc-400">{new Date(txn.date).toLocaleDateString()} · {txn.type}</p>
                        </div>
                        <span className={`font-bold text-sm ${txn.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {txn.amount >= 0 ? '+' : ''}Rs. {Math.abs(txn.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------
// 5. REPORTS MODULE
// ------------------------------------------
function ReportsModule({ parties, banks, inventoryItems, expenses, globalHistory }: any) {
  const totalInventoryValue = inventoryItems.reduce((acc: number, item: any) => acc + (item.stock * item.price), 0);
  const totalUnpaidPartyBalances = parties.reduce((acc: number, p: any) => acc + p.unpaid, 0);
  const totalBankBalances = banks.reduce((acc: number, b: any) => acc + b.balance, 0);
  const totalExpenses = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);

  return <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Business Reports</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">High-level financial summaries and inventory valuations.</p>
        </div>
        <button className="btn-primary w-full md:w-auto bg-zinc-900 hover:bg-zinc-800"><Download size={18}/> Export PDF</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-blue-900/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 opacity-80">
            <PackageSearch size={18} className="md:w-6 md:h-6" />
            <span className="font-semibold uppercase tracking-wider text-[10px] md:text-sm">Inventory Value</span>
          </div>
          <h3 className="text-lg md:text-3xl font-black">Rs. {totalInventoryValue.toLocaleString()}</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-emerald-900/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 opacity-80">
            <Landmark size={18} className="md:w-6 md:h-6" />
            <span className="font-semibold uppercase tracking-wider text-[10px] md:text-sm">Bank Liquidity</span>
          </div>
          <h3 className="text-lg md:text-3xl font-black">Rs. {totalBankBalances.toLocaleString()}</h3>
        </div>
        <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-rose-900/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 opacity-80">
            <CreditCard size={18} className="md:w-6 md:h-6" />
            <span className="font-semibold uppercase tracking-wider text-[10px] md:text-sm">Party Liabilities</span>
          </div>
          <h3 className="text-lg md:text-3xl font-black">Rs. {totalUnpaidPartyBalances.toLocaleString()}</h3>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-amber-900/20">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 opacity-80">
            <BadgeIndianRupee size={18} className="md:w-6 md:h-6" />
            <span className="font-semibold uppercase tracking-wider text-[10px] md:text-sm">Total Expenses</span>
          </div>
          <h3 className="text-lg md:text-3xl font-black">Rs. {totalExpenses.toLocaleString()}</h3>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <h3 className="text-lg md:text-xl font-bold text-zinc-900 p-6 pb-0">Recent Logged Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 text-xs font-semibold uppercase">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Activity Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {globalHistory.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      entry.type === 'Sale' ? 'bg-emerald-100 text-emerald-700' :
                      entry.type === 'Purchase' ? 'bg-rose-100 text-rose-700' :
                      entry.type === 'Expense' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">{entry.customer} - {entry.items}</td>
                  <td className={`px-6 py-4 text-right font-bold ${entry.type === 'Sale' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {entry.type === 'Sale' ? '+' : '-'}Rs. {entry.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// ------------------------------------------
// 6. SETTINGS MODULE
// ------------------------------------------
function SettingsModule() {
  const [businessName, setBusinessName] = useState('Nisar Traders');
  const [address, setAddress] = useState('Main Market, Lahore');
  const [phone, setPhone] = useState('0300-1234567');
  const [receiptFooter, setReceiptFooter] = useState('Goods once sold cannot be returned without original receipt.');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Settings</h2>
        <p className="text-zinc-500 mt-1">Configure your business profile, receipt templates, and preferences.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 font-semibold text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18}/> Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2"><Settings size={20} className="text-blue-500" /> Business Profile</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Business Name</label><input type="text" className="input-field" value={businessName} onChange={e => setBusinessName(e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Address</label><input type="text" className="input-field" value={address} onChange={e => setAddress(e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Phone</label><input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <button onClick={handleSave} className="btn-primary w-full bg-zinc-900 hover:bg-zinc-800">Save Business Profile</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2"><FileBarChart size={20} className="text-blue-500" /> Receipt & Printing</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase">Receipt Footer Text</label><textarea className="input-field min-h-[100px] resize-none" value={receiptFooter} onChange={e => setReceiptFooter(e.target.value)} /></div>
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Barcode Label Size</h4>
              <p className="text-sm text-zinc-700 font-medium">Currently set to: <span className="font-black text-zinc-900">50mm × 30mm</span> (thermal label sticker)</p>
            </div>
            <button onClick={handleSave} className="btn-primary w-full bg-zinc-900 hover:bg-zinc-800">Save Receipt Settings</button>
          </div>
        </div>
      </div>

      <div className="card border-rose-200">
        <h3 className="text-lg font-bold text-rose-700 mb-4">Danger Zone</h3>
        <p className="text-sm text-zinc-500 mb-4">These actions are destructive and cannot be undone.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={async () => { 
            if(confirm('Clear all sales data? This will empty the global history table.')) {
              const { error } = await supabase.from('global_history').delete().neq('id', 0);
              if (error) alert("Error: " + error.message);
              else { alert('Sales history cleared.'); fetchData(); }
            } 
          }} className="w-full sm:w-auto px-4 py-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition-colors">Clear Sales History</button>
          
          <button onClick={async () => { 
            if(confirm('Factory Reset? This will wipe ALL tables (Inventory, Parties, Banks, History, Expenses). THIS CANNOT BE UNDONE.')) {
              await Promise.all([
                supabase.from('global_history').delete().neq('id', 0),
                supabase.from('inventory').delete().neq('id', 0),
                supabase.from('parties').delete().neq('id', 0),
                supabase.from('banks').delete().neq('id', 0),
                supabase.from('expenses').delete().neq('id', 0),
                supabase.from('scrap_inventory').delete().neq('id', 0),
                supabase.from('returns_inventory').select('*').then(({data}) => data && Promise.all(data.map(r => supabase.from('returns_inventory').delete().eq('id', r.id))))
              ]);
              alert('All data has been reset.');
              fetchData();
            } 
          }} className="w-full sm:w-auto px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">Factory Reset</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 7. SALE & PURCHASE HISTORY MODULE
// ------------------------------------------
function HistoryModule({ history }: { history: HistoryEntry[] }) {
  const [typeFilter, setTypeFilter] = useState<'All'|'Sale'|'Purchase'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = history.filter(h => {
    if (typeFilter !== 'All' && h.type !== typeFilter) return false;
    if (dateFrom && h.date < dateFrom) return false;
    if (dateTo && h.date > dateTo) return false;
    return true;
  });

  const totalSales = filtered.filter(h => h.type === 'Sale').reduce((a, h) => a + h.amount, 0);
  const totalPurchases = filtered.filter(h => h.type === 'Purchase').reduce((a, h) => a + h.amount, 0);
  const salesCount = filtered.filter(h => h.type === 'Sale').length;
  const purchaseCount = filtered.filter(h => h.type === 'Purchase').length;

  const clearFilters = () => { setTypeFilter('All'); setDateFrom(''); setDateTo(''); };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Sale & Purchase History</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Complete log of all sales and purchases across the system.</p>
        </div>
        <button onClick={clearFilters} className="btn-primary w-full md:w-auto bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200 shadow-none text-sm">Clear Filters</button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl p-4 md:p-5 border border-zinc-200 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase">Records</p>
          <p className="text-xl md:text-3xl font-black text-zinc-900 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 border border-emerald-200 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase">Sales</p>
          <p className="text-xl md:text-3xl font-black text-emerald-600 mt-1">Rs. {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 border border-rose-200 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-rose-500 uppercase">Purchases</p>
          <p className="text-xl md:text-3xl font-black text-rose-600 mt-1">Rs. {totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 border border-blue-200 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-blue-500 uppercase">Net Flow</p>
          <p className={`text-xl md:text-3xl font-black mt-1 ${totalSales - totalPurchases >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Rs. {(totalSales - totalPurchases).toLocaleString()}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase flex items-center gap-1"><Filter size={14} /> Type</label>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
              {(['All','Sale','Purchase'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`flex-1 px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-colors ${typeFilter === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>{t === 'All' ? 'All' : t + 's'}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-[2]">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase flex items-center gap-1"><CalendarDays size={14} /> From</label>
              <input type="date" className="input-field py-2 w-full" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase flex items-center gap-1"><CalendarDays size={14} /> To</label>
              <input type="date" className="input-field py-2 w-full" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-bold uppercase">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Party / Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-zinc-400 font-medium">No transactions found for the selected filters.</td></tr>
              ) : (
                filtered.map(h => (
                  <tr key={h.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-600 font-medium whitespace-nowrap">{h.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${h.type === 'Sale' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{h.type}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{h.customer}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">{h.items}</td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-700">{h.qty}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-semibold uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">{h.mode}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-black text-lg ${h.type === 'Sale' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {h.type === 'Sale' ? '+' : '-'}Rs. {h.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 8. RETURNS & WARRANTY MODULE
// ------------------------------------------
function ReturnsModule({ returnsInventory, returnsHistory, scrapInventory }: { returnsInventory: ReturnItem[], returnsHistory: any[], scrapInventory: ScrapItem[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'warranty'|'scrap'|'history'>('warranty');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Returns & Warranty</h2>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage faulty items, warranty claims, and scrap inventory.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setActiveSubTab('warranty')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeSubTab === 'warranty' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Warranty</button>
          <button onClick={() => setActiveSubTab('scrap')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeSubTab === 'scrap' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Scrap</button>
          <button onClick={() => setActiveSubTab('history')} className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeSubTab === 'history' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>History</button>
        </div>
      </div>

      {activeSubTab === 'warranty' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-bold uppercase">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {returnsInventory.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-400">No items in warranty/faulty inventory.</td></tr>
              ) : (
                returnsInventory.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-zinc-500 font-medium">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{item.name}</td>
                    <td className="px-6 py-4 text-center font-bold">{item.qty}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.type === 'Faulty' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{item.customer}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs italic">{item.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'scrap' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-bold uppercase">
                <th className="px-6 py-4">Date Received</th>
                <th className="px-6 py-4">Scrap Item Name</th>
                <th className="px-6 py-4 text-center">Stock (Qty)</th>
                <th className="px-6 py-4 text-right">Unit Value (Rs.)</th>
                <th className="px-6 py-4 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {scrapInventory.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-400">Scrap inventory is empty.</td></tr>
              ) : (
                scrapInventory.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-zinc-500 font-medium">{item.date}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{item.name}</td>
                    <td className="px-6 py-4 text-center font-bold">{item.qty}</td>
                    <td className="px-6 py-4 text-right">Rs. {item.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-zinc-900">Rs. {(item.qty * item.price).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-bold uppercase">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {returnsHistory.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-zinc-400">No return history found.</td></tr>
              ) : (
                returnsHistory.map(h => (
                  <tr key={h.id} className="hover:bg-zinc-50 transition-colors text-sm">
                    <td className="px-6 py-4 text-zinc-500 font-medium">{h.date}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{h.items}</td>
                    <td className="px-6 py-4 text-zinc-600">{h.customer}</td>
                    <td className="px-6 py-4 text-center font-bold">{h.qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
