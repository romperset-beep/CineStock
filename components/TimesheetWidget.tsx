import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { TimeLog } from '../types';
import { Clock, Calendar, Save, Trash2, StopCircle, PlayCircle, Utensils } from 'lucide-react';

export const TimesheetWidget: React.FC = () => {
    const { project, updateProjectDetails, user } = useProject();

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [callTime, setCallTime] = useState('');
    const [mealTime, setMealTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [hasShortenedMeal, setHasShortenedMeal] = useState(false);

    // Calculate hours helper
    const calculateHours = (start: string, meal: string, end: string, shortMeal: boolean) => {
        if (!start || !end) return 0;

        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        let startMin = startH * 60 + startM;
        let endMin = endH * 60 + endM;

        // Handle overnight shifts (crossing midnight)
        if (endMin < startMin) {
            endMin += 24 * 60;
        }

        let duration = endMin - startMin;

        // Deduct meal
        const mealDeduction = shortMeal ? 30 : 60;
        duration -= mealDeduction;

        return Math.max(0, duration / 60);
    };

    const handleSaveLog = async () => {
        if (!callTime || !endTime || !user) return;

        const totalHours = calculateHours(callTime, mealTime, endTime, hasShortenedMeal);
        const logId = `${date}_${user.email}`;

        const newLog: TimeLog = {
            id: logId,
            userId: user.email,
            userName: user.name,
            department: user.department,
            date,
            callTime,
            mealTime: mealTime || '', // Optional if no meal break? Usually mandatory but let's handle empty
            hasShortenedMeal,
            endTime,
            totalHours
        };

        // Remove existing log for same day/user if any, then add new
        const otherLogs = (project.timeLogs || []).filter(l => l.id !== logId);
        const newLogs = [...otherLogs, newLog];

        await updateProjectDetails({ timeLogs: newLogs });

        // Reset form (optional, maybe keep date?)
        // setCallTime('');
        // setMealTime('');
        // setEndTime('');
    };

    const handleDeleteLog = async (logId: string) => {
        if (!window.confirm('Supprimer cette entrée ?')) return;
        const newLogs = (project.timeLogs || []).filter(l => l.id !== logId);
        await updateProjectDetails({ timeLogs: newLogs });
    };

    // Group logs by week
    const getWeekNumber = (d: Date) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return { week: weekNo, year: d.getUTCFullYear() };
    };

    const myLogs = useMemo(() => {
        if (!user || !project.timeLogs) return [];
        return project.timeLogs
            .filter(l => l.userId === user.email)
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [project.timeLogs, user]);

    const weeklyData = useMemo(() => {
        const weeks: Record<string, { totalHours: number, logs: TimeLog[] }> = {};

        myLogs.forEach(log => {
            const d = new Date(log.date);
            const { week, year } = getWeekNumber(d);
            const key = `${year}-W${week}`;

            if (!weeks[key]) weeks[key] = { totalHours: 0, logs: [] };
            weeks[key].logs.push(log);
            weeks[key].totalHours += log.totalHours;
        });

        // Sort weeks descending
        return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0]));
    }, [myLogs]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 bg-cinema-800 p-6 rounded-xl border border-cinema-700">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Clock className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Les Heures</h2>
                    <p className="text-slate-400">Saisie et suivi de vos heures de travail</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="lg:col-span-1 bg-cinema-800 p-6 rounded-xl border border-cinema-700 h-fit sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        Saisie Journalière
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-cinema-900 border border-cinema-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3" /> Convocation
                                </label>
                                <input
                                    type="time"
                                    value={callTime}
                                    onChange={(e) => setCallTime(e.target.value)}
                                    className="w-full bg-cinema-900 border border-cinema-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-1">
                                    <StopCircle className="h-3 w-3" /> Fin (Wrap)
                                </label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-cinema-900 border border-cinema-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-cinema-900/50 p-4 rounded-lg border border-cinema-700/50">
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
                                <Utensils className="h-3 w-3" /> Pause Repas
                            </label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="time"
                                    value={mealTime}
                                    onChange={(e) => setMealTime(e.target.value)}
                                    className="flex-1 bg-cinema-900 border border-cinema-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasShortenedMeal}
                                        onChange={(e) => setHasShortenedMeal(e.target.checked)}
                                        className="w-4 h-4 rounded border-cinema-600 bg-cinema-800 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-300">Écourté (30m)</span>
                                </label>
                            </div>
                        </div>

                        {/* Live Total Preview */}
                        <div className="text-center py-2">
                            <span className="text-slate-400 text-sm uppercase font-bold">Total Journée :</span>
                            <span className="text-2xl font-bold text-white ml-2">
                                {calculateHours(callTime, mealTime, endTime, hasShortenedMeal).toFixed(2)}h
                            </span>
                        </div>

                        <button
                            onClick={handleSaveLog}
                            disabled={!date || !callTime || !endTime}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            Enregistrer
                        </button>
                    </div>
                </div>

                {/* Weekly Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {weeklyData.length > 0 ? weeklyData.map(([weekKey, data]) => (
                        <div key={weekKey} className="bg-cinema-800 rounded-xl border border-cinema-700 overflow-hidden">
                            <div className="bg-cinema-900/50 px-6 py-4 flex justify-between items-center border-b border-cinema-700">
                                <h3 className="font-bold text-white text-lg">{weekKey}</h3>
                                <div className="text-sm font-bold bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                    Total Hebdo : {data.totalHours.toFixed(2)}h
                                </div>
                            </div>

                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-slate-500 uppercase border-b border-cinema-700 bg-cinema-900/20 text-left">
                                        <th className="px-6 py-3 font-medium">Jour</th>
                                        <th className="px-6 py-3 font-medium">Début</th>
                                        <th className="px-6 py-3 font-medium">Repas</th>
                                        <th className="px-6 py-3 font-medium">Fin</th>
                                        <th className="px-6 py-3 font-medium text-right">Total</th>
                                        <th className="px-6 py-3 font-medium text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cinema-700">
                                    {data.logs
                                        .sort((a, b) => a.date.localeCompare(b.date))
                                        .map(log => (
                                            <tr key={log.id} className="hover:bg-cinema-700/30 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">
                                                    {new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{log.callTime}</td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {log.mealTime}
                                                    {log.hasShortenedMeal && <span className="ml-1 text-[10px] text-orange-400">(30m)</span>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{log.endTime}</td>
                                                <td className="px-6 py-4 text-right text-white font-bold">{log.totalHours.toFixed(2)}h</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteLog(log.id)}
                                                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )) : (
                        <div className="bg-cinema-800 rounded-xl border border-cinema-700 p-12 text-center">
                            <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Aucune heure saisie</h3>
                            <p className="text-slate-400">Utilisez le formulaire à gauche pour ajouter vos horaires.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
