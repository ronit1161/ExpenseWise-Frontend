import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    AlertCircle, 
    Utensils,
    Car,
    ShoppingBag,
    Film,
    Receipt,
    Activity,
    GraduationCap,
    Layers,
    X
} from 'lucide-react';

const CategoryIcon = ({ iconName, className = "h-4 w-4" }) => {
    switch(iconName) {
        case 'Utensils': return <Utensils className={className} />;
        case 'Car': return <Car className={className} />;
        case 'ShoppingBag': return <ShoppingBag className={className} />;
        case 'Film': return <Film className={className} />;
        case 'Receipt': return <Receipt className={className} />;
        case 'Activity': return <Activity className={className} />;
        case 'GraduationCap': return <GraduationCap className={className} />;
        case 'Layers': return <Layers className={className} />;
        default: return <Layers className={className} />;
    }
};

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Pagination & Filters State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryId, setCategoryId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    // FETCH DATA
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            setError('');
            const response = await api.get('/expenses', {
                params: {
                    page,
                    limit: 10,
                    categoryId: categoryId || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }
            });
            if (response.data?.status === 'success') {
                setExpenses(response.data.data.expenses);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (err) {
            setError('Failed to fetch expense records.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/expenses/categories');
            if (response.data?.status === 'success') {
                setCategories(response.data.data.categories);
            }
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, categoryId, startDate, endDate]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // OPEN MODAL FOR ADD
    const openAddModal = () => {
        setModalMode('add');
        setEditingExpenseId(null);
        setAmount('');
        setSelectedCategoryId(categories[0]?.id || '');
        setDescription('');
        setPaymentMethod('CASH');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setModalError('');
        setIsModalOpen(true);
    };

    // OPEN MODAL FOR EDIT
    const openEditModal = (expense) => {
        setModalMode('edit');
        setEditingExpenseId(expense.id);
        setAmount(expense.amount.toString());
        setSelectedCategoryId(expense.categoryId);
        setDescription(expense.description || '');
        setPaymentMethod(expense.paymentMethod);
        setExpenseDate(expense.expenseDate.split('T')[0]);
        setModalError('');
        setIsModalOpen(true);
    };

    // SUBMIT FORM
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setSaving(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setModalError('Amount must be a positive number.');
            setSaving(false);
            return;
        }

        const payload = {
            categoryId: Number(selectedCategoryId),
            amount: parsedAmount,
            description,
            paymentMethod,
            expenseDate
        };

        try {
            let response;
            if (modalMode === 'add') {
                response = await api.post('/expenses', payload);
            } else {
                response = await api.put(`/expenses/${editingExpenseId}`, payload);
            }

            if (response.data?.status === 'success') {
                setSuccessMsg(`Expense ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
                setTimeout(() => setSuccessMsg(''), 3000);
                setIsModalOpen(false);
                fetchExpenses();
            }
        } catch (err) {
            setModalError(err.response?.data?.message || 'Transaction processing failed.');
        } finally {
            setSaving(false);
        }
    };

    // DELETE EXPENSE
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense record?')) return;
        try {
            const response = await api.delete(`/expenses/${id}`);
            if (response.data?.status === 'success') {
                setSuccessMsg('Expense deleted successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchExpenses();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Delete operation failed.');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Expense Register
                    </h1>
                    <p className="text-[#94A3B8] text-sm">Review, filter, and document daily transactions.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-[#9d72f8] hover:to-[#7579f3] transition-all duration-300"
                >
                    <Plus className="h-4 w-4" />
                    Record Expense
                </button>
            </div>

            {/* Notification alert banner */}
            {successMsg && (
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                    {successMsg}
                </div>
            )}

            {/* FILTER PANEL */}
            <div className="glass-card rounded-3xl p-5 flex flex-wrap gap-4 items-end border border-white/10">
                {/* Category filter */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                    >
                        <option value="" className="bg-[#050816]">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id} className="bg-[#050816]">{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date filter */}
                <div className="min-w-[150px] space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">From Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                    />
                </div>

                {/* End Date filter */}
                <div className="min-w-[150px] space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">To Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                    />
                </div>

                {/* Clear filters */}
                <button
                    onClick={() => { setCategoryId(''); setStartDate(''); setEndDate(''); setPage(1); }}
                    className="rounded-2xl bg-white/3 border border-white/8 px-5 py-3 text-sm text-gray-300 hover:text-white transition-all hover:bg-white/8"
                >
                    Reset
                </button>
            </div>

            {/* HISTORICAL EXPENSES GRID TABLE */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                {loading ? (
                    <div className="flex h-60 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                    </div>
                ) : expenses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-gray-400">
                            <thead className="bg-white/3 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/8">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                                            {new Date(expense.expenseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/3" style={{ color: expense.categoryColor }}>
                                                    <CategoryIcon iconName={expense.categoryIcon} className="h-4 w-4" />
                                                </div>
                                                <span className="text-white font-semibold">{expense.categoryName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-xs">{expense.description || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="rounded-lg bg-white/3 border border-white/5 px-2.5 py-1 text-xs text-gray-300 font-semibold uppercase tracking-wider">
                                                {expense.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-white font-extrabold text-base">
                                            ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => openEditModal(expense)}
                                                    className="p-1.5 text-gray-400 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-xl transition-all"
                                                >
                                                    <Pencil className="h-4.5 w-4.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-16 font-medium">No expense records found.</div>
                )}

                {/* PAGINATION PANEL */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/8 bg-white/3 px-6 py-4">
                        <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-2 rounded-xl bg-white/3 border border-white/8 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/8 text-white transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-xl bg-white/3 border border-white/8 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/8 text-white transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL DIALOG COMPONENT (Record / Modify Expense) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                        {/* Close button */}
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {modalMode === 'add' ? 'Record Expense' : 'Modify Expense'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Specify payment parameters below.</p>

                            {modalError && (
                                <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-red-950/20 border border-red-500/20 p-3 text-xs text-red-400">
                                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                    <span className="font-semibold">{modalError}</span>
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                                {/* Amount field */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount (INR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all animate-none"
                                    />
                                </div>

                                {/* Category select */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id} className="bg-[#050816]">{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Field */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    >
                                        <option value="CASH" className="bg-[#050816]">Cash</option>
                                        <option value="CREDIT_CARD" className="bg-[#050816]">Credit Card</option>
                                        <option value="DEBIT_CARD" className="bg-[#050816]">Debit Card</option>
                                        <option value="UPI" className="bg-[#050816]">UPI</option>
                                        <option value="NET_BANKING" className="bg-[#050816]">Net Banking</option>
                                    </select>
                                </div>

                                {/* Description field */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Groceries, gas rent, restaurant bill..."
                                        className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                    />
                                </div>

                                {/* Form actions */}
                                <div className="flex gap-3 justify-end pt-5">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-2xl bg-white/3 border border-white/8 px-5 py-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3 text-sm font-bold text-white hover:from-[#9d72f8] hover:to-[#7579f3] disabled:opacity-40 transition-all"
                                    >
                                        {saving && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                                        Save Transaction
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesPage;
