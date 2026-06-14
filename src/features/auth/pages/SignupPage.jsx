import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Wallet, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-12 relative overflow-hidden">
            {/* Ambient Background Glowing Blobs */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none animate-blob-slow-1"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none animate-blob-slow-2"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Branding Logo & Header */}
                <div className="flex flex-col items-center">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A855F7] shadow-xl shadow-violet-500/25 border border-white/10">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-violet-300">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-[#94A3B8] font-medium">
                        Begin tracking your wealth with absolute precision.
                    </p>
                </div>

                {/* Form Card Container */}
                <div className="glass-card rounded-3xl p-8 border border-white/10">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-950/20 border border-red-500/20 p-4 text-xs text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                            <span className="font-medium leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                                    <User className="h-4.5 w-4.5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                                    <Mail className="h-4.5 w-4.5" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                                    <Lock className="h-4.5 w-4.5" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl bg-white/3 border border-white/8 py-3.5 pl-11 pr-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/40 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Action Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] py-4 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:from-[#9d72f8] hover:to-[#7579f3] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                'Create Premium Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-400 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-[#8B5CF6] hover:underline ml-1">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
