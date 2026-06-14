import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { 
    TrendingDown, 
    Calendar, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Sparkles, 
    ShieldAlert, 
    Loader2,
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
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [insights, setInsights] = useState([]);
    const [dismissedInsights, setDismissedInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setError('');
            const [sumRes, anaRes, insRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/analytics'),
                api.get('/dashboard/insights')
            ]);
            setSummary(sumRes.data.data);
            setAnalytics(anaRes.data.data);
            setInsights(insRes.data.data.insights);
        } catch (err) {
            setError('Failed to refresh dashboard indicators.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const dismissInsight = (idx) => {
        setDismissedInsights([...dismissedInsights, idx]);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#8B5CF6]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-red-950/20 border border-red-500/20 p-6 text-center text-red-400 max-w-md mx-auto mt-12">
                <p className="font-semibold">{error}</p>
                <button 
                    onClick={() => { setLoading(true); fetchDashboardData(); }}
                    className="mt-5 rounded-2xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7c4fe0] transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Colors matched from database seeds
    const RADIAN = Math.PI / 185;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
                {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
            </text>
        );
    };

    const activeInsights = insights.filter((_, idx) => !dismissedInsights.includes(idx));

    return (
        <div className="space-y-8 pb-12">
            {/* Page Title Header */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Financial Hub
                    </h1>
                    <p className="text-[#94A3B8] text-sm mt-1">Real-time overview of your cash balances, active budgets, and peer accounts.</p>
                </div>
            </div>

            {/* KEY METRICS SUMMARY ROW */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* 1. Monthly Expenses */}
                <div className="glass-card hover-glass-glow rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between text-gray-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Monthly Spending</span>
                        <TrendingDown className="h-4.5 w-4.5 text-red-400" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-extrabold text-white">₹{summary?.monthSpent?.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-normal font-medium">Expenses in {new Date().toLocaleString('en-US', { month: 'long' })}</p>
                    </div>
                </div>

                {/* 2. Today's Expenses */}
                <div className="glass-card hover-glass-glow rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-[#8B5CF6]/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between text-gray-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Today's Spend</span>
                        <Calendar className="h-4.5 w-4.5 text-[#8B5CF6]" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-extrabold text-white">₹{summary?.todaySpent?.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-normal font-medium">Logged today</p>
                    </div>
                </div>

                {/* 3. Receivables (Lending) */}
                <div className="glass-card hover-glass-glow rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between text-gray-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Receivable</span>
                        <ArrowUpRight className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-extrabold text-emerald-400">₹{summary?.receivable?.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-normal font-medium">Lent to contacts</p>
                    </div>
                </div>

                {/* 4. Payables Owed */}
                <div className="glass-card hover-glass-glow rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex items-center justify-between text-gray-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Payable</span>
                        <ArrowDownLeft className="h-4.5 w-4.5 text-rose-400" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-extrabold text-rose-400">₹{summary?.payable?.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 leading-normal font-medium">Owed to contacts</p>
                    </div>
                </div>
            </div>

            {/* ANALYTICS CHARTS GRID */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Spending Trend (Area Chart) - 2/3 Width */}
                <div className="glass-card rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Expenditure Trend</h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Chronological overview of monthly billing cycles</p>
                    </div>
                    <div className="h-64 w-full mt-6">
                        {analytics?.monthlyTrend?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                                    <XAxis dataKey="period" stroke="#4b5563" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(5, 8, 22, 0.85)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16 }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500 font-medium">
                                Log your expenses to view trends.
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Analysis (Pie Chart) - 1/3 Width */}
                <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Category Analysis</h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Budget segment breakdown for this month</p>
                    </div>
                    <div className="h-48 w-full mt-6 relative flex items-center justify-center">
                        {analytics?.categoryBreakdown?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.categoryBreakdown}
                                        dataKey="total"
                                        nameKey="categoryName"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={75}
                                        innerRadius={52}
                                        paddingAngle={4}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                    >
                                        {analytics.categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.categoryColor || '#8B5CF6'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-sm text-gray-500 font-medium">No records matching period.</div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center mt-4">
                        {analytics?.categoryBreakdown?.slice(0, 4).map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.categoryColor }}></span>
                                <span>{c.categoryName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BUDGET UTILIZATION & DEBTS COLUMNS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Active budgets (Left column) - 2/3 Width */}
                <div className="glass-card rounded-3xl p-6 lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Active Budgets</h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Monthly allocation limits utilization status</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {analytics?.budgets?.length > 0 ? (
                            analytics.budgets.map((b) => (
                                <div key={b.budgetId} className="space-y-2.5 p-4 rounded-2xl bg-white/3 border border-white/5">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon iconName={b.categoryIcon} className="h-4 w-4" style={{ color: b.categoryColor }} />
                                            <span className="text-white font-bold">{b.categoryName}</span>
                                        </div>
                                        <span className="text-[#94A3B8]">
                                            {b.utilizationPercentage}%
                                        </span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                b.isOverBudget 
                                                    ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                                                    : b.utilizationPercentage >= 80 
                                                        ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                                                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                                            }`}
                                            style={{ width: `${Math.min(100, b.utilizationPercentage)}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                                        <span>Spent: ₹{b.spentAmount.toLocaleString('en-IN')}</span>
                                        <span className="font-semibold text-white">Limit: ₹{b.budgetLimit.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-sm text-gray-500 py-6 col-span-2 font-medium">
                                No budgets configured for this month.
                            </div>
                        )}
                    </div>
                </div>

                {/* Proactive Insights Engine Panel - 1/3 Width */}
                <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-white">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <h3 className="text-lg font-bold tracking-tight">Smart Insights</h3>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Real-time heuristics analysis</p>
                    </div>

                    <div className="mt-6 flex-1 space-y-3.5 overflow-y-auto max-h-60 pr-1">
                        {activeInsights.length > 0 ? (
                            activeInsights.map((insight, idx) => (
                                <div 
                                    key={idx} 
                                    className={`rounded-2xl border p-4 text-xs flex gap-3 relative ${
                                        insight.severity === 'high' 
                                            ? 'bg-red-950/10 border-red-500/20 text-red-300' 
                                            : insight.severity === 'medium'
                                                ? 'bg-amber-950/10 border-amber-500/20 text-amber-300'
                                                : 'bg-violet-950/10 border-violet-500/20 text-violet-300'
                                    }`}
                                >
                                    <ShieldAlert className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                                        insight.severity === 'high' 
                                            ? 'text-red-400' 
                                            : insight.severity === 'medium'
                                                ? 'text-amber-400'
                                                : 'text-violet-400'
                                    }`} />
                                    <div className="pr-4 leading-normal font-medium">{insight.message}</div>
                                    <button 
                                        onClick={() => dismissInsight(idx)}
                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-gray-500 py-12 font-medium">
                                All statements cleared. No active alerts.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
