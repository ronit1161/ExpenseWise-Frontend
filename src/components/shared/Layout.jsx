import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Receipt, 
    PiggyBank, 
    ArrowLeftRight, 
    BarChart3, 
    LogOut,
    Wallet
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Expenses', to: '/expenses', icon: Receipt },
        { name: 'Budgets', to: '/budgets', icon: PiggyBank },
        { name: 'Lending & Borrowing', to: '/debts', icon: ArrowLeftRight },
        { name: 'Reports', to: '/reports', icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#050816] text-[#f8fafc] relative">
            {/* Ambient Background Glow Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none animate-blob-slow-1"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-blob-slow-2"></div>

            {/* DESKTOP FLOATING SIDEBAR */}
            <aside className="hidden w-64 p-6 md:flex md:flex-col justify-between relative z-10">
                <div className="flex flex-col gap-8 fixed w-52 h-[calc(100vh-3rem)] justify-between">
                    <div className="flex flex-col gap-8">
                        {/* App Logo */}
                        <div className="flex items-center gap-3.5 px-2">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A855F7] shadow-lg shadow-violet-500/25 border border-white/10">
                                <Wallet className="h-5.5 w-5.5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                                ExpenseWise
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    className={({ isActive }) => 
                                        `flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 border ${
                                            isActive 
                                                ? 'bg-white/5 border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold' 
                                                : 'border-transparent text-gray-400 hover:bg-white/3 hover:text-white'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-[#8B5CF6] scale-110' : 'text-gray-400'}`} />
                                            <span>{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* User Profile Card & Log Out */}
                    <div className="flex flex-col gap-4 border-t border-white/5 pt-5">
                        <div className="flex items-center gap-3 px-2 py-1.5 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-md">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30">
                                <span className="text-xs font-bold text-violet-300">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="truncate text-xs font-bold text-white leading-tight">{user?.name}</h4>
                                <p className="truncate text-[10px] text-gray-400 mt-0.5">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400/80 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/10"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN APP PANEL SHELL */}
            <div className="flex flex-1 flex-col overflow-hidden min-h-screen relative z-10">
                {/* HEADER */}
                <header className="flex h-16 items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#050816]/30 backdrop-blur-xl">
                    {/* Mobile Branding */}
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#A855F7] border border-white/10">
                            <Wallet className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                            ExpenseWise
                        </span>
                    </div>

                    <div className="hidden md:block">
                        <h2 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Personal Ledger // Welcome Back, <span className="font-bold text-white normal-case">{user?.name}</span>
                        </h2>
                    </div>

                    {/* Mobile Log Out Icon */}
                    <div className="md:hidden">
                        <button 
                            onClick={handleLogout} 
                            className="p-2.5 text-red-400/80 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </header>

                {/* MAIN SCROLLING CONTENT SHELL */}
                <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 pb-24 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* MOBILE FLOATING BOTTOM BAR (Translucent design on small viewports) */}
            <nav className="fixed bottom-4 left-4 right-4 z-40 flex h-16 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl md:hidden justify-around items-center px-2 shadow-2xl">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) => 
                            `flex flex-col items-center gap-1 text-[10px] py-1 px-3.5 rounded-xl transition-all duration-300 ${
                                isActive 
                                    ? 'text-white bg-white/5 border border-white/5 shadow-inner' 
                                    : 'text-gray-500 border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`h-4.5 w-4.5 transition-transform ${isActive ? 'text-[#8B5CF6] scale-110' : 'text-gray-500'}`} />
                                <span className="font-medium">{item.name.split(' ')[0]}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
