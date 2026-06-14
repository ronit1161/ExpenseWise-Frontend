import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
    Download, 
    FileText, 
    Calendar, 
    Loader2, 
    AlertCircle, 
    TrendingUp, 
    Coins,
    BarChart3,
    Utensils,
    Car,
    ShoppingBag,
    Film,
    Receipt,
    Activity,
    GraduationCap,
    Layers
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

const ReportsPage = () => {
    const [reportType, setReportType] = useState('expenses'); // 'expenses' | 'categories' | 'budgets' | 'loans'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const fetchReportData = async () => {
        setLoading(true);
        setError('');
        try {
            if (reportType === 'expenses') {
                const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
                const endDay = new Date(year, month, 0).getDate();
                const endStr = `${year}-${String(month).padStart(2, '0')}-${endDay}`;
                
                const response = await api.get('/expenses', {
                    params: { page: 1, limit: 100, startDate: startStr, endDate: endStr }
                });
                if (response.data?.status === 'success') {
                    setData(response.data.data.expenses);
                }
            } 
            else if (reportType === 'categories') {
                const response = await api.get('/dashboard/analytics');
                if (response.data?.status === 'success') {
                    setData(response.data.data.categoryBreakdown);
                }
            } 
            else if (reportType === 'budgets') {
                const response = await api.get('/budgets/status', { params: { month, year } });
                if (response.data?.status === 'success') {
                    setData(response.data.data.budgets);
                }
            } 
            else if (reportType === 'loans') {
                const response = await api.get('/loans');
                if (response.data?.status === 'success') {
                    setData(response.data.data.loans);
                }
            }
        } catch (err) {
            setError('Failed to query ledger logs for this criteria.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [reportType, month, year]);

    // CSV DOWNLOAD GENERATOR
    const exportToCSV = () => {
        if (data.length === 0) return;

        let csvContent = '';
        let fileName = `ExpenseWise_${reportType}_${year}_${month}.csv`;

        if (reportType === 'expenses') {
            const headers = ['Date', 'Category', 'Description', 'Method', 'Amount (INR)'];
            const rows = data.map(e => [
                e.expenseDate.split('T')[0],
                e.categoryName,
                `"${(e.description || '').replace(/"/g, '""')}"`,
                e.paymentMethod,
                e.amount
            ]);
            csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        } 
        else if (reportType === 'categories') {
            const headers = ['Category', 'Color Code', 'Total Spent (INR)'];
            const rows = data.map(c => [
                c.categoryName,
                c.categoryColor,
                c.total
            ]);
            csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
            fileName = `ExpenseWise_Categories_${year}_${month}.csv`;
        } 
        else if (reportType === 'budgets') {
            const headers = ['Category', 'Limit (INR)', 'Spent (INR)', 'Remaining (INR)', 'Utilization (%)', 'Is Over Budget'];
            const rows = data.map(b => [
                b.categoryName,
                b.budgetLimit,
                b.spentAmount,
                b.remainingAmount,
                b.utilizationPercentage,
                b.isOverBudget ? 'Yes' : 'No'
            ]);
            csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        } 
        else if (reportType === 'loans') {
            const headers = ['Date', 'Peer Contact', 'Direction', 'Principal (INR)', 'Remaining (INR)', 'Status', 'Due Date'];
            const rows = data.map(l => [
                l.loanDate.split('T')[0],
                l.contactName,
                l.type,
                l.amount,
                l.remainingAmount,
                l.status,
                l.dueDate ? l.dueDate.split('T')[0] : 'None'
            ]);
            csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
            fileName = `ExpenseWise_Ledger_Debts.csv`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Financial Statement Exports
                    </h1>
                    <p className="text-[#94A3B8] text-sm">Query custom data sheets and export logs to CSV files.</p>
                </div>
                <button
                    disabled={data.length === 0 || loading}
                    onClick={exportToCSV}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:from-[#9d72f8] hover:to-[#7579f3] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                >
                    <Download className="h-4 w-4" />
                    Export CSV Statement
                </button>
            </div>

            {/* SELECTION GRID CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Left Side: Selecting Report Types */}
                <div className="space-y-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Statement Template</span>
                    <div className="flex flex-col gap-2">
                        {/* 1. Personal Expenses list */}
                        <button
                            onClick={() => { setReportType('expenses'); setData([]); }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-bold border transition-all duration-300 ${
                                reportType === 'expenses' 
                                    ? 'bg-white/5 border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                                    : 'bg-white/3 border-transparent text-gray-400 hover:bg-white/8 hover:text-white'
                            }`}
                        >
                            <FileText className="h-4.5 w-4.5 text-[#8B5CF6]" />
                            Expenses Log
                        </button>

                        {/* 2. Category aggregates */}
                        <button
                            onClick={() => { setReportType('categories'); setData([]); }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-bold border transition-all duration-300 ${
                                reportType === 'categories' 
                                    ? 'bg-white/5 border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                                    : 'bg-white/3 border-transparent text-gray-400 hover:bg-white/8 hover:text-white'
                            }`}
                        >
                            <BarChart3 className="h-4.5 w-4.5 text-[#8B5CF6]" />
                            Category Totals
                        </button>

                        {/* 3. Budget Limits limits */}
                        <button
                            onClick={() => { setReportType('budgets'); setData([]); }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-bold border transition-all duration-300 ${
                                reportType === 'budgets' 
                                    ? 'bg-white/5 border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                                    : 'bg-white/3 border-transparent text-gray-400 hover:bg-white/8 hover:text-white'
                            }`}
                        >
                            <TrendingUp className="h-4.5 w-4.5 text-[#8B5CF6]" />
                            Budget Performance
                        </button>

                        {/* 4. Peer Loans Ledger */}
                        <button
                            onClick={() => { setReportType('loans'); setData([]); }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-bold border transition-all duration-300 ${
                                reportType === 'loans' 
                                    ? 'bg-white/5 border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                                    : 'bg-white/3 border-transparent text-gray-400 hover:bg-white/8 hover:text-white'
                            }`}
                        >
                            <Coins className="h-4.5 w-4.5 text-[#8B5CF6]" />
                            Lending & Borrowing
                        </button>
                    </div>
                </div>

                {/* Right Side: Data view and Date selection options */}
                <div className="md:col-span-3 space-y-4">
                    {/* Period selection filters */}
                    {(reportType === 'expenses' || reportType === 'budgets') && (
                        <div className="glass-card rounded-2xl p-4 flex gap-4 items-center justify-between border border-white/10">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Calendar className="h-4 w-4 text-[#8B5CF6]" /> Specify Statement Range
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="rounded-xl bg-white/3 border border-white/8 py-1.5 px-3 text-xs text-white outline-none"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i+1} value={i+1} className="bg-[#050816]">
                                            {new Date(2000, i).toLocaleString('en-US', { month: 'short' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="rounded-xl bg-white/3 border border-white/8 py-1.5 px-3 text-xs text-white outline-none"
                                >
                                    {[2024, 2025, 2026, 2027].map(y => (
                                        <option key={y} value={y} className="bg-[#050816]">{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* REPORT DATA PANEL DISPLAY */}
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden min-h-[300px]">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                            </div>
                        ) : data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs text-gray-400">
                                    <thead className="bg-white/3 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-white/8">
                                        {/* Dynamic headers mapping */}
                                        {reportType === 'expenses' && (
                                            <tr>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Description</th>
                                                <th className="px-6 py-4">Method</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                            </tr>
                                        )}
                                        {reportType === 'categories' && (
                                            <tr>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-right">Aggregated Spending</th>
                                            </tr>
                                        )}
                                        {reportType === 'budgets' && (
                                            <tr>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4 text-right">Limit Set</th>
                                                <th className="px-6 py-4 text-right">Amount Spent</th>
                                                <th className="px-6 py-4 text-right">Remaining</th>
                                                <th className="px-6 py-4 text-center">Breach Status</th>
                                            </tr>
                                        )}
                                        {reportType === 'loans' && (
                                            <tr>
                                                <th className="px-6 py-4">Peer Name</th>
                                                <th className="px-6 py-4">Ledger Type</th>
                                                <th className="px-6 py-4 text-right">Principal</th>
                                                <th className="px-6 py-4 text-right">Outstanding Balance</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300">
                                        {/* Dynamic row data rendering */}
                                        {reportType === 'expenses' && data.map((e) => (
                                            <tr key={e.id} className="hover:bg-white/3">
                                                <td className="px-6 py-3.5 font-medium">{new Date(e.expenseDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3" style={{ color: e.categoryColor }}>
                                                            <CategoryIcon iconName={e.categoryIcon} className="h-3 w-3" />
                                                        </div>
                                                        <span className="text-white font-semibold">{e.categoryName}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 max-w-[150px] truncate">{e.description || '—'}</td>
                                                <td className="px-6 py-3.5">{e.paymentMethod}</td>
                                                <td className="px-6 py-3.5 text-right font-extrabold text-white">₹{parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}

                                        {reportType === 'categories' && data.map((c, i) => (
                                            <tr key={i} className="hover:bg-white/3">
                                                <td className="px-6 py-3.5 font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/3" style={{ color: c.categoryColor }}>
                                                            <CategoryIcon iconName={c.categoryIcon} className="h-3 w-3" />
                                                        </div>
                                                        <span className="text-white font-semibold">{c.categoryName}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-right font-extrabold text-white">₹{c.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}

                                        {reportType === 'budgets' && data.map((b) => {
                                            const remaining = b.budgetLimit - b.spentAmount;
                                            return (
                                                <tr key={b.budgetId} className="hover:bg-white/3">
                                                    <td className="px-6 py-3.5 font-semibold text-white">{b.categoryName}</td>
                                                    <td className="px-6 py-3.5 text-right">₹{b.budgetLimit.toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-3.5 text-right">₹{b.spentAmount.toLocaleString('en-IN')}</td>
                                                    <td className={`px-6 py-3.5 text-right font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center">
                                                        <span className={`rounded-lg px-2 py-0.5 font-bold text-[10px] ${
                                                            b.isOverBudget ? 'bg-red-950/20 text-red-400 border border-red-500/20' : 'bg-violet-950/20 text-violet-400 border border-violet-500/20'
                                                        }`}>
                                                            {b.isOverBudget ? 'Breached' : 'Within Limit'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {reportType === 'loans' && data.map((l) => (
                                            <tr key={l.id} className="hover:bg-white/3">
                                                <td className="px-6 py-3.5 font-semibold text-white">{l.contactName}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${l.type === 'LENT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {l.type === 'LENT' ? 'Lent (Receivable)' : 'Borrowed (Payable)'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">₹{parseFloat(l.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-3.5 text-right text-white font-extrabold">₹{parseFloat(l.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <span className={`rounded-lg px-2 py-0.5 font-bold text-[10px] ${
                                                        l.status === 'SETTLED' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-950/20 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center text-gray-500 gap-2 font-medium">
                                <AlertCircle className="h-6 w-6 text-gray-600" />
                                <span className="text-sm">No dataset matched this query period.</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportsPage;
