import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
    Plus, 
    Trash2, 
    AlertTriangle, 
    Loader2, 
    AlertCircle, 
    Sliders,
    X,
    Utensils,
    Car,
    ShoppingBag,
    Film,
    Receipt,
    Activity,
    GraduationCap,
    Layers
} from 'lucide-react';

const CategoryIcon = ({ iconName, className = "h-4.5 w-4.5" }) => {
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

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            setError('');
            const response = await api.get('/budgets/status', {
                params: { month, year }
            });
            if (response.data?.status === 'success') {
                setBudgets(response.data.data.budgets);
            }
        } catch (err) {
            setError('Failed to fetch budget status logs.');
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
        fetchBudgets();
    }, [month, year]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setSelectedCategoryId(categories[0]?.id || '');
        setAmount('');
        setModalError('');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalError('');
        setSaving(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setModalError('Amount limit must be a positive number.');
            setSaving(false);
            return;
        }

        try {
            const response = await api.post('/budgets', {
                categoryId: Number(selectedCategoryId),
                amount: parsedAmount,
                month: Number(month),
                year: Number(year)
            });

            if (response.data?.status === 'success') {
                setSuccessMsg('Budget configured successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
                setIsModalOpen(false);
                fetchBudgets();
            }
        } catch (err) {
            setModalError(err.response?.data?.message || 'Failed to update limit.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (budgetId) => {
        if (!window.confirm('Remove this category budget limit?')) return;
        try {
            const response = await api.delete(`/budgets/${budgetId}`);
            if (response.data?.status === 'success') {
                setSuccessMsg('Budget limit deleted.');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchBudgets();
            }
        } catch (err) {
            setError('Failed to remove limit.');
        }
    };

    // Calculate elapsed time velocity pacing ratio in current selected month
    const getPacingContext = () => {
        const today = new Date();
        if (today.getFullYear() === Number(year) && (today.getMonth() + 1) === Number(month)) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const elapsed = today.getDate();
            return {
                ratio: elapsed / daysInMonth,
                text: `Day ${elapsed} of ${daysInMonth} (${((elapsed / daysInMonth) * 100).toFixed(0)}% month elapsed)`
            };
        }
        return null;
    };

    const pacing = getPacingContext();

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Budgets Management
                    </h1>
                    <p className="text-[#94A3B8] text-sm">Regulate and paced monthly expenditures.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-[#9d72f8] hover:to-[#7579f3] active:scale-[0.98] transition-all duration-300"
                >
                    <Plus className="h-4 w-4" />
                    Configure Budget
                </button>
            </div>

            {/* Success notification */}
            {successMsg && (
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                    {successMsg}
                </div>
            )}

            {/* CONTROLS BAR: Month / Year selection */}
            <div className="glass-card rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                    <Sliders className="h-5 w-5 text-purple-400" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Select Pacing Period</span>
                </div>
                <div className="flex gap-3">
                    {/* Month selector */}
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-2xl bg-white/3 border border-white/8 py-2 px-3.5 text-sm text-white focus:outline-none transition-all"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i+1} value={i+1} className="bg-[#050816]">
                                {new Date(2000, i).toLocaleString('en-US', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    {/* Year Selector */}
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-2xl bg-white/3 border border-white/8 py-2 px-3.5 text-sm text-white focus:outline-none transition-all"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y} className="bg-[#050816]">{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* PACING VELOCITY ANCHOR METRIC BANNER */}
            {pacing && (
                <div className="glass-card border-l-4 border-[#8B5CF6] rounded-2xl p-4.5 text-xs text-violet-300 flex items-center gap-3.5 border-t border-r border-b border-white/5">
                    <AlertTriangle className="h-5 w-5 text-violet-400 shrink-0" />
                    <div className="font-medium leading-relaxed">
                        <span className="font-extrabold text-white">Month Progression Alert:</span> We compare spending vs. <span className="font-extrabold">{pacing.text}</span>. Spending pacing lines represent target guidelines to avoid overspending.
                    </div>
                </div>
            )}

            {/* BUDGET PROGRESS METERS GRID */}
            {loading ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                </div>
            ) : budgets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {budgets.map((b) => {
                        const pacingBreach = pacing && (b.spentAmount / b.budgetLimit) > pacing.ratio + 0.15 && !b.isOverBudget;
                        // Frontend calculation to support negative values for overspending
                        const exactRemaining = b.budgetLimit - b.spentAmount;

                        return (
                            <div key={b.budgetId} className="glass-card hover-glass-glow rounded-3xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden">
                                
                                {/* Background gradient accent color */}
                                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: b.categoryColor }}></div>
                                
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/3" style={{ color: b.categoryColor }}>
                                            <CategoryIcon iconName={b.categoryIcon} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg tracking-tight leading-none">{b.categoryName}</h3>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1.5">ID: {b.budgetId.slice(0,8)}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(b.budgetId)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                </div>

                                {/* Limit balances display */}
                                <div className="my-6 grid grid-cols-3 gap-2 border-y border-white/5 py-4 font-medium">
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider">Limit</span>
                                        <span className="text-sm font-semibold text-white mt-1 block">₹{b.budgetLimit.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider">Spent</span>
                                        <span className="text-sm font-semibold text-white mt-1 block">₹{b.spentAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider">Remaining</span>
                                        <span className={`text-sm font-extrabold mt-1 block ${exactRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            ₹{exactRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Pacing Indicators */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-gray-400">Pacing Utilization: {b.utilizationPercentage}%</span>
                                        {b.isOverBudget ? (
                                            <span className="text-red-400 font-bold flex items-center gap-1">
                                                <AlertTriangle className="h-3.5 w-3.5" /> Over Limit
                                            </span>
                                        ) : pacingBreach ? (
                                            <span className="text-amber-400 font-bold flex items-center gap-1">
                                                <AlertTriangle className="h-3.5 w-3.5" /> Pacing Fast
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 font-bold">On Track</span>
                                        )}
                                    </div>

                                    {/* Utilization progress slider */}
                                    <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden relative border border-white/5">
                                        {/* Optional pacing target line */}
                                        {pacing && (
                                            <div 
                                                className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10 border-l border-black" 
                                                style={{ left: `${pacing.ratio * 100}%` }}
                                                title="Pacing Limit Target"
                                            ></div>
                                        )}
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                b.isOverBudget 
                                                    ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                                                    : pacingBreach 
                                                        ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                                                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                                            }`}
                                            style={{ width: `${Math.min(100, b.utilizationPercentage)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card text-center text-gray-500 py-16 rounded-3xl border border-white/10 flex flex-col items-center">
                    <Sliders className="h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-sm font-semibold">No monthly limits defined for this period.</p>
                    <button 
                        onClick={openAddModal}
                        className="mt-5 rounded-2xl bg-[#8B5CF6] hover:bg-[#7c4fe0] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-violet-500/20"
                    >
                        Configure Limit Now
                    </button>
                </div>
            )}

            {/* CONFIGURE BUDGET LIMIT DIALOG MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">Set Category Budget</h3>
                            <p className="text-xs text-gray-400 mt-1">Specify limits for {new Date(year, month-1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}.</p>

                            {modalError && (
                                <div className="mt-4 flex items-start gap-2.5 rounded bg-red-950/20 border border-red-500/20 p-3 text-xs text-red-400">
                                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                    <span className="font-semibold">{modalError}</span>
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                                {/* Category selection */}
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

                                {/* Amount input */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly Limit (INR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="5000.00"
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
                                        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3 text-sm font-bold text-white hover:from-[#9d72f8] hover:to-[#7579f3] transition-all"
                                    >
                                        {saving && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                                        Configure Limit
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

export default BudgetsPage;
