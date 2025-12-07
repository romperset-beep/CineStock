import React, { useState } from 'react';
import { Building2, Film, ArrowRight, Loader2, Plus, LogOut } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface ProjectSelectionProps {
    onProjectSelected: () => void;
}

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({ onProjectSelected }) => {
    const { updateProjectDetails, user, logout } = useProject();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        productionName: user?.productionName || '',
        filmTitle: user?.filmTitle || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productionName || !formData.filmTitle) return;

        setIsLoading(true);
        try {
            // @ts-ignore - Assuming updateProjectDetails or a new joinProject function will handle this
            // For now, we reuse the context update logic 
            // In the context update, we will need to ensure this sets the Active Project
            await updateProjectDetails({
                productionCompany: formData.productionName,
                name: formData.filmTitle,
                // ID generation happens inside context usually, or we pass generated ID
            });
            onProjectSelected();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-cinema-800 border border-cinema-700 p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-eco-500 to-emerald-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                        <Film className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Sur quel projet travaillez-vous ?
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Rejoignez ou créez l'espace de travail de votre tournage.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Nom de la Production"
                            value={formData.productionName}
                            onChange={(e) => setFormData({ ...formData, productionName: e.target.value })}
                            className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Film className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-eco-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Titre du Film / Projet"
                            value={formData.filmTitle}
                            onChange={(e) => setFormData({ ...formData, filmTitle: e.target.value })}
                            className="w-full bg-cinema-900 border border-cinema-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-eco-500 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all transform hover:scale-[1.02] mt-6 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                Accéder au Plateau
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={logout}
                        className="w-full text-slate-500 hover:text-red-400 text-sm py-2 flex items-center justify-center gap-2 transition-colors mt-2"
                    >
                        <LogOut className="h-4 w-4" /> Se déconnecter
                    </button>
                </form>
            </div>
        </div>
    );
};
