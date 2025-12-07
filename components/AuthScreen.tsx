import React, { useState } from 'react';
import { Department } from '../types';
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface AuthScreenProps {
    onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
    const { login, register, error: authError } = useProject();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        department: 'PRODUCTION' as Department | 'PRODUCTION'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Les mots de passe ne correspondent pas");
                }
                // @ts-ignore - register will be added to context
                await register(formData.email, formData.password, formData.name, formData.department);
            } else {
                // @ts-ignore - login signature will change
                await login(formData.email, formData.password);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-cinema-800 border border-cinema-700 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isSignUp ? "Créer un compte" : "Bon retour parmi nous !"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isSignUp
                            ? "Rejoignez la communauté A Better Set"
                            : "Connectez-vous pour accéder à vos projets"}
                    </p>
                </div>

                {authError && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 text-red-200 text-sm text-center">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* SignUp Fields */}
                    {isSignUp && (
                        <>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Prénom Nom"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-500 z-10" />
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-eco-500 focus:outline-none appearance-none"
                                >
                                    <option value="PRODUCTION">PRODUCTION (Admin)</option>
                                    {Object.values(Department).map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Common Fields */}
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email professionnel"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            placeholder={isSignUp ? "Code personnel (6 car. min)" : "Code personnel"}
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    {isSignUp && (
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmer le code"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                minLength={6}
                                className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-eco-600 hover:bg-eco-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-eco-900/20 hover:shadow-eco-900/40 transition-all transform hover:scale-[1.02] mt-6 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? "Créer mon espace" : "Me connecter"}
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-400 hover:text-white text-sm transition-colors border-b border-dashed border-slate-600 hover:border-white pb-0.5"
                    >
                        {isSignUp
                            ? "Déjà un compte ? Connectez-vous"
                            : "Nouveau sur A Better Set ? Créer un compte"}
                    </button>
                </div>
            </div>
        </div>
    );
};
