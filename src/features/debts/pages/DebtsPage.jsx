import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
    Plus, 
    Trash2, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    User, 
    History,
    X 
} from 'lucide-react';

const DebtsPage = () => {
    const [loans, setLoans] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [summary, setSummary] = useState({ totalReceivable: 0, totalPayable: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Tab state: 'loans' | 'contacts'
    const [activeTab, setActiveTab] = useState('loans');

    // Create Loan Modal state
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState('new');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [loanType, setLoanType] = useState('LENT');
    const [amount, setAmount] = useState('');
    const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [loanSaving, setLoanSaving] = useState(false);
    const [loanError, setLoanError] = useState('');

    // Settlement Modal state
    const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [settleAmount, setSettleAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [settlementHistory, setSettlementHistory] = useState([]);
    const [settleSaving, setSettleSaving] = useState(false);
    const [settleError, setSettleError] = useState('');

    const fetchLedgerData = async () => {
        setLoading(true);
        try {
            setError('');
            const response = await api.get('/loans');
            if (response.data?.status === 'success') {
                setLoans(response.data.data.loans);
                setSummary(response.data.data.summary);
            }
            const contactsRes = await api.get('/loans/contacts');
            if (contactsRes.data?.status === 'success') {
                setContacts(contactsRes.data.data.contacts);
            }
        } catch (err) {
            setError('Failed to fetch lending and borrowing registers.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedgerData();
    }, []);

    // HANDLE CONTACT OPTION CHANGE
    const handleContactSelectChange = (e) => {
        const val = e.target.value;
        setSelectedContactId(val);
        if (val === 'new') {
            setContactName('');
            setContactEmail('');
        } else {
            const found = contacts.find(c => c.id === val);
            if (found) {
                setContactName(found.name);
                setContactEmail(found.email || '');
            }
        }
    };

    // HANDLE CREATE LOAN
    const handleCreateLoan = async (e) => {
        e.preventDefault();
        setLoanError('');
        setLoanSaving(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setLoanError('Loan principal must be a positive number.');
            setLoanSaving(false);
            return;
        }

        try {
            const response = await api.post('/loans', {
                contactName,
                contactEmail: contactEmail || undefined,
                type: loanType,
                amount: parsedAmount,
                loanDate,
                dueDate: dueDate || undefined,
                description
            });

            if (response.data?.status === 'success') {
                setSuccessMsg('Loan record added successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
                setIsLoanModalOpen(false);
                // Clear fields
                setSelectedContactId('new');
                setContactName('');
                setContactEmail('');
                setAmount('');
                setDescription('');
                setDueDate('');
                fetchLedgerData();
            }
        } catch (err) {
            setLoanError(err.response?.data?.message || 'Failed to submit loan details.');
        } finally {
            setLoanSaving(false);
        }
    };

    // OPEN SETTLEMENT VIEW
    const openSettlement = async (loan) => {
        setSelectedLoan(loan);
        setSettleAmount(loan.remainingAmount.toString());
        setNotes('');
        setSettleError('');
        setSettlementHistory([]);
        setIsSettlementModalOpen(true);

        // Fetch settlement audits
        try {
            const response = await api.get(`/loans/${loan.id}`);
            if (response.data?.status === 'success') {
                setSettlementHistory(response.data.data.settlements);
            }
        } catch (err) {
            console.error('Failed to load settlement history', err);
        }
    };

    // HANDLE SETTLEMENT TRANSACTION
    const handleAddSettlement = async (e) => {
        e.preventDefault();
        setSettleError('');
        setSettleSaving(true);

        const parsedSettle = parseFloat(settleAmount);
        if (isNaN(parsedSettle) || parsedSettle <= 0) {
            setSettleError('Settlement must be a positive decimal.');
            setSettleSaving(false);
            return;
        }

        try {
            const response = await api.post(`/loans/${selectedLoan.id}/settlements`, {
                amount: parsedSettle,
                paymentMethod,
                settlementDate,
                notes
            });

            if (response.data?.status === 'success') {
                setSuccessMsg('Settlement transaction captured successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
                setIsSettlementModalOpen(false);
                fetchLedgerData();
            }
        } catch (err) {
            setSettleError(err.response?.data?.message || 'Settlement execution failed.');
        } finally {
            setSettleSaving(false);
        }
    };

    // DELETE LOAN
    const handleDeleteLoan = async (id) => {
        if (!window.confirm('Delete this loan record? Settled histories will be wiped.')) return;
        try {
            const response = await api.delete(`/loans/${id}`);
            if (response.data?.status === 'success') {
                setSuccessMsg('Record deleted successfully.');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchLedgerData();
            }
        } catch (err) {
            setError('Delete action failed.');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Title */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Debt Ledgers
                    </h1>
                    <p className="text-[#94A3B8] text-sm">Track capital loans, outstanding payables, and peer settlements.</p>
                </div>
                <button
                    onClick={() => setIsLoanModalOpen(true)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-[#9d72f8] hover:to-[#7579f3] active:scale-[0.98] transition-all duration-300"
                >
                    <Plus className="h-4 w-4" />
                    Record Loan
                </button>
            </div>

            {/* Notification alert banner */}
            {successMsg && (
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                    {successMsg}
                </div>
            )}

            {/* BALANCE TILES ROW */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Total Receivables */}
                <div className="glass-card rounded-3xl p-5 flex items-center justify-between border-l-4 border-emerald-500 hover-glass-glow relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Receivables (Lent)</span>
                        <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">₹{summary.totalReceivable.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/15">
                        <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                    </div>
                </div>

                {/* Total Payables */}
                <div className="glass-card rounded-3xl p-5 flex items-center justify-between border-l-4 border-red-500 hover-glass-glow relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Payables (Borrowed)</span>
                        <h3 className="text-3xl font-extrabold text-red-400 mt-1.5">₹{summary.totalPayable.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/15">
                        <ArrowDownLeft className="h-6 w-6 text-red-400" />
                    </div>
                </div>
            </div>

            {/* TABS SWITCH: Loans vs. Contacts */}
            <div className="border-b border-white/5 flex gap-6">
                <button
                    onClick={() => setActiveTab('loans')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${
                        activeTab === 'loans' ? 'border-[#8B5CF6] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Outstanding Contracts
                </button>
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${
                        activeTab === 'contacts' ? 'border-[#8B5CF6] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Contact Registry
                </button>
            </div>

            {/* OUTSTANDING CONTRACTS VIEW */}
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
            ) : activeTab === 'loans' ? (
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                    {loans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm text-gray-400">
                                <thead className="bg-white/3 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/8">
                                    <tr>
                                        <th className="px-6 py-4">Borrower / Lender</th>
                                        <th className="px-6 py-4">Ledger Type</th>
                                        <th className="px-6 py-4 text-right">Principal</th>
                                        <th className="px-6 py-4 text-right">Outstanding</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Settlement Action</th>
                                        <th className="px-6 py-4 text-center">Remove</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loans.map((loan) => (
                                        <tr key={loan.id} className="hover:bg-white/3 transition-colors">
                                            {/* Peer Profile name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/3 border border-white/10 text-sm font-bold text-violet-400">
                                                        <User className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-white font-semibold leading-tight">{loan.contactName}</span>
                                                        <span className="block text-[10px] text-gray-500 mt-1">Date: {new Date(loan.loanDate).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Type indicator */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                                    loan.type === 'LENT' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    {loan.type === 'LENT' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                                                    {loan.type === 'LENT' ? 'Lent (Receivable)' : 'Borrowed (Payable)'}
                                                </span>
                                            </td>

                                            {/* Principal Amount */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-gray-300">
                                                ₹{parseFloat(loan.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Remaining Balance */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap font-extrabold text-white text-base">
                                                ₹{parseFloat(loan.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                                                    loan.status === 'SETTLED' 
                                                        ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' 
                                                        : loan.status === 'PARTIAL' 
                                                            ? 'bg-amber-950/20 text-amber-400 border border-amber-500/20' 
                                                            : 'bg-red-950/20 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {loan.status}
                                                </span>
                                            </td>

                                            {/* Repayment Settlement actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {loan.status !== 'SETTLED' ? (
                                                    <button
                                                        onClick={() => openSettlement(loan)}
                                                        className="rounded-2xl bg-white/3 border border-white/8 px-4 py-2 text-xs font-bold text-violet-400 hover:text-white hover:border-[#8B5CF6]/55 transition-all"
                                                    >
                                                        Record Settlement
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => openSettlement(loan)}
                                                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                                    >
                                                        <History className="h-3.5 w-3.5" /> History
                                                    </button>
                                                )}
                                            </td>

                                            {/* Remove Button */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleDeleteLoan(loan.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-16 font-medium">No outstanding contracts found.</div>
                    )}
                </div>
            ) : (
                /* CONTACT REGISTRY CRM TAB */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {contacts.length > 0 ? (
                        contacts.map((c) => (
                            <div key={c.id} className="glass-card hover-glass-glow rounded-3xl p-5 border border-white/10 flex items-center gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-10 w-10 bg-white/3 rounded-bl-full pointer-events-none"></div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#6366F1]/20 border border-[#8B5CF6]/20 text-sm font-bold text-violet-400">
                                    {c.name[0].toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-white truncate text-sm leading-tight">{c.name}</h4>
                                    {c.phone && <p className="text-xs text-gray-500 mt-1 truncate">{c.phone}</p>}
                                    {c.email && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.email}</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full glass-card text-center text-gray-500 py-16 rounded-3xl border border-white/10 font-medium">No contacts registered yet.</div>
                    )}
                </div>
            )}

            {/* DIALOG 1: RECORD PEER LOAN MODAL */}
            {isLoanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                        <button 
                            onClick={() => setIsLoanModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">Create Debt Contract</h3>
                            <p className="text-xs text-gray-400 mt-1">Document lending or borrowing relationships.</p>

                            {loanError && (
                                <div className="mt-4 flex items-start gap-2.5 rounded bg-red-950/20 border border-red-500/20 p-3 text-xs text-red-400">
                                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                    <span className="font-semibold">{loanError}</span>
                                </div>
                            )}

                            <form onSubmit={handleCreateLoan} className="space-y-4 mt-6">
                                {/* Choose Existing Contact or New */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Peer Contact</label>
                                    <select
                                        value={selectedContactId}
                                        onChange={handleContactSelectChange}
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    >
                                        <option value="new" className="bg-[#050816] font-semibold text-violet-400">+ Add New Contact</option>
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id} className="bg-[#050816]">{c.name} ({c.email || 'No email'})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedContactId === 'new' && (
                                    <>
                                        {/* Contact Name input for new contacts */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={contactName}
                                                onChange={(e) => setContactName(e.target.value)}
                                                placeholder="Friend name..."
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            />
                                        </div>

                                        {/* Contact Email input for new contacts */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Email (Optional)</label>
                                            <input
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                placeholder="friend@example.com"
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Type: Lent vs Borrowed */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Ledger Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setLoanType('LENT')}
                                            className={`rounded-2xl py-3 text-xs font-bold border transition-all duration-300 ${
                                                loanType === 'LENT' 
                                                    ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                                    : 'bg-white/3 border-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            LENT (Receivable)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLoanType('BORROWED')}
                                            className={`rounded-2xl py-3 text-xs font-bold border transition-all duration-300 ${
                                                loanType === 'BORROWED' 
                                                    ? 'bg-red-950/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                                                    : 'bg-white/3 border-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            BORROWED (Payable)
                                        </button>
                                    </div>
                                </div>

                                {/* Principal Amount */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount (INR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    />
                                </div>

                                {/* Loan Date and Due Date */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Issue Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={loanDate}
                                            onChange={(e) => setLoanDate(e.target.value)}
                                            className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Due Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Notes / Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Weekend trip split, lunch bill..."
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsLoanModalOpen(false)}
                                        className="rounded-2xl bg-white/3 border border-white/8 px-5 py-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loanSaving}
                                        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3 text-sm font-bold text-white hover:from-[#9d72f8] hover:to-[#7579f3] active:scale-[0.98] transition-all disabled:opacity-40"
                                    >
                                        {loanSaving && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                                        Create Loan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* DIALOG 2: RECORD REPAYMENT SETTLEMENT MODAL */}
            {isSettlementModalOpen && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                        <button 
                            onClick={() => setIsSettlementModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            
                            {/* LEFT SIDE: Settlement Form */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white tracking-tight">Repayment Settlement</h3>
                                <p className="text-xs text-gray-400 mt-1">Log payment transactions against contact debt.</p>

                                {settleError && (
                                    <div className="mt-4 flex items-start gap-2.5 rounded bg-red-950/20 border border-red-500/20 p-3 text-xs text-red-400">
                                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                        <span className="font-semibold">{settleError}</span>
                                    </div>
                                )}

                                {selectedLoan.status !== 'SETTLED' ? (
                                    <form onSubmit={handleAddSettlement} className="space-y-4 mt-6">
                                        {/* Settle amount input */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Amount (Max: ₹{selectedLoan.remainingAmount.toLocaleString('en-IN')})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                max={selectedLoan.remainingAmount}
                                                value={settleAmount}
                                                onChange={(e) => setSettleAmount(e.target.value)}
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            />
                                        </div>

                                        {/* Settle Date */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={settlementDate}
                                                onChange={(e) => setSettlementDate(e.target.value)}
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            />
                                        </div>

                                        {/* Method */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Method</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            >
                                                <option value="UPI" className="bg-[#050816]">UPI</option>
                                                <option value="CASH" className="bg-[#050816]">Cash</option>
                                                <option value="CREDIT_CARD" className="bg-[#050816]">Credit Card</option>
                                                <option value="DEBIT_CARD" className="bg-[#050816]">Debit Card</option>
                                                <option value="NET_BANKING" className="bg-[#050816]">Net Banking</option>
                                            </select>
                                        </div>

                                        {/* Repayment Notes */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Repayment Notes</label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="UPI transaction ID, notes..."
                                                className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={settleSaving}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] py-3.5 text-sm font-bold text-white hover:from-[#9d72f8] hover:to-[#7579f3] transition-all"
                                        >
                                            {settleSaving && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                                            Record Settlement
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-12 text-emerald-400 font-bold flex flex-col items-center gap-3">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        Debt Fully Settled
                                    </div>
                                )}
                            </div>

                            {/* RIGHT SIDE: Historical Payments Timeline */}
                            <div className="p-6 flex flex-col h-[400px] md:h-auto">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                    <History className="h-4.5 w-4.5 text-violet-400" /> Payment History Audits
                                </h4>
                                <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
                                    {settlementHistory.length > 0 ? (
                                        settlementHistory.map((s) => (
                                            <div key={s.id} className="rounded-2xl bg-white/3 border border-white/5 p-4 text-xs space-y-1 relative">
                                                <div className="flex justify-between items-center text-white font-extrabold text-sm">
                                                    <span>₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold">
                                                        {new Date(s.settlementDate).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                                <div className="text-gray-400 font-medium text-[11px] pt-1">
                                                    <span>Method: {s.paymentMethod}</span>
                                                </div>
                                                {s.notes && <p className="text-[10px] text-gray-500 italic mt-1 bg-black/20 p-2 rounded-lg">"{s.notes}"</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs text-gray-600 py-12 font-medium">
                                            No settlements recorded.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtsPage;
