import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Activity,
    CheckCircle,
    BarChart2,
    TrendingUp,
    Calendar
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const ProgressSummaryPanel = ({ connectionId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/patient/progress/${connectionId}`, {
                    headers: { 'x-auth-token': token }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch progress", err);
                setError("Unable to load progress data.");
                setLoading(false);
            }
        };

        if (connectionId) {
            fetchProgress();
        }
    }, [connectionId]);

    if (loading) return (
        <div className="w-full h-48 flex items-center justify-center text-gray-400 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
            <Activity className="animate-spin mr-2" /> Loading progress...
        </div>
    );

    if (error || !data) return (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg text-center border border-red-100 mb-6">
            <p className="font-bold">Debug: Failed to load progress</p>
            <p className="text-xs">{error || "No data received"}</p>
        </div>
    );

    const { recoveryScore, painTrend, stats } = data;

    // Format Date for Chart
    const chartData = painTrend.map(pt => ({
        date: new Date(pt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        pain: pt.value,
        fullDate: new Date(pt.date).toLocaleDateString()
    }));

    // Recovery Score Color
    const getScoreColor = (score) => {
        if (score >= 70) return 'text-green-600 dark:text-green-400';
        if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={24} /> Your Recovery Progress
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Recovery Score */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <h4 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Recovery Score</h4>
                    <div className={`text-6xl font-black mb-2 ${getScoreColor(recoveryScore)}`}>
                        {recoveryScore}%
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                        {recoveryScore >= 70 ? "You are making good progress" :
                            recoveryScore >= 40 ? "Keep following your recovery plan" :
                                "Consistency is key to recovery"}
                    </p>
                </div>

                {/* 2. Pain Trend Graph */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Pain Trend</h4>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-bold">
                            Improving over time
                        </span>
                    </div>
                    <div className="flex-1 w-full min-h-[150px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value) => [`${value}/10`, 'Pain Level']}
                                        labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="pain"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                                <Activity className="mb-2 opacity-50" />
                                <p>Not enough data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Task & Exercise Summary */}
                <div className="grid grid-rows-3 gap-3 h-full">
                    {/* Tasks */}
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tasks</p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {stats.tasksCompleted} <span className="text-gray-400 text-sm font-normal">/ {stats.totalTasks}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Exercises */}
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Exercises</p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {stats.exercisesCompleted} <span className="text-gray-400 text-sm font-normal">/ {stats.totalExercises}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Consistency */}
                    <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Consistency</p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {stats.consistency}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProgressSummaryPanel;
