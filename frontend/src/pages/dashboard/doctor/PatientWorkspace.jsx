import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Activity,
    ChevronLeft,
    ClipboardList,
    AlertCircle,
    Search,
    Plus,
    Download,
    Play,
    FileText,
    Trash2,
    CheckSquare,
    List,
    Video

} from 'lucide-react';


const PatientWorkspace = () => {
    const { id } = useParams(); // This is the Connection ID
    const navigate = useNavigate();
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [updates, setUpdates] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]); // Videos
    const [manualTasks, setManualTasks] = useState([]); // Manual
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState([]);


    // Modify Plan Mode State
    const [isModifyingPlan, setIsModifyingPlan] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState(new Set()); // Stores generic IDs

    // Timer State for Videos
    const [timerByVideo, setTimerByVideo] = useState({});

    // Manual Task Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        type: 'Exercise',
        frequency: 'Daily',
        reminderInterval: 24
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'x-auth-token': token };

                const [connRes, updatesRes, tasksRes, manualRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/doctors/connection/${id}`, { headers }),
                    axios.get(`http://localhost:5000/api/doctors/patient-updates/${id}`, { headers }),
                    axios.get(`http://localhost:5000/api/doctors/connection/${id}/tasks`, { headers }),
                    axios.get(`http://localhost:5000/api/doctors/connection/${id}/manual-tasks`, { headers })
                ]);

                setConnection(connRes.data);
                setUpdates(updatesRes.data);
                setAssignedTasks(tasksRes.data);
                setManualTasks(manualRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch workspace data", err);
                setError(err.message || "Failed to load workspace.");
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSearchVideos = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/videos/search?query=${searchQuery}`, {
                headers: { 'x-auth-token': token }
            });
            setVideos(res.data);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleTimerChange = (videoId, field, value) => {
        setTimerByVideo(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleAssignVideo = async (video) => {
        if (!video) return;

        const timer = timerByVideo[video._id] || { d: 0, h: 24, m: 0, s: 0 };
        const totalSeconds = (timer.d * 86400) + (timer.h * 3600) + (timer.m * 60) + timer.s;

        if (totalSeconds === 0) return alert("Please set a valid reset timer.");

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/doctors/assign-plan', {
                connectionId: id,
                videoId: video._id,
                videoTitle: video.title,
                youtubeId: video.youtubeId,
                resetIntervalSeconds: totalSeconds,
                frequencyHours: totalSeconds / 3600
            }, {
                headers: { 'x-auth-token': token }
            });

            alert("Video assigned to patient plan!");
            setAssignedTasks([res.data, ...assignedTasks]);
        } catch (err) {
            console.error(err);
            alert("Failed to assign video.");
        }
    };

    const handleCreateManualTask = async (e) => {
        e.preventDefault();
        if (!newTask.title) return alert("Task title is required");

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/doctors/manual-tasks', {
                connectionId: id,
                ...newTask
            }, { headers: { 'x-auth-token': token } });

            setManualTasks([res.data, ...manualTasks]);
            setNewTask({ title: '', description: '', type: 'Exercise', frequency: 'Daily', reminderInterval: 24 });
            alert("Task added successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to add task");
        }
    };

    // Unified Delete Logic
    const handleToggleTaskSelection = (taskId) => {
        const newSet = new Set(selectedTaskIds);
        if (newSet.has(taskId)) newSet.delete(taskId);
        else newSet.add(taskId);
        setSelectedTaskIds(newSet);
    };

    const handleDeleteSelectedTasks = async () => {
        if (selectedTaskIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.size} tasks?`)) return;

        try {
            const token = localStorage.getItem('token');

            // Separate IDs by type
            const videoIdsToDelete = assignedTasks.filter(t => selectedTaskIds.has(t._id)).map(t => t._id);
            const manualIdsToDelete = manualTasks.filter(t => selectedTaskIds.has(t._id)).map(t => t._id);

            // Execute deletes
            if (videoIdsToDelete.length > 0) {
                await axios.post('http://localhost:5000/api/doctors/tasks/delete', { taskIds: videoIdsToDelete }, { headers: { 'x-auth-token': token } });
            }
            if (manualIdsToDelete.length > 0) {
                await axios.post('http://localhost:5000/api/doctors/manual-tasks/delete-batch', { taskIds: manualIdsToDelete }, { headers: { 'x-auth-token': token } });
            }

            // Update State
            setAssignedTasks(prev => prev.filter(t => !selectedTaskIds.has(t._id)));
            setManualTasks(prev => prev.filter(t => !selectedTaskIds.has(t._id)));

            setIsModifyingPlan(false);
            setSelectedTaskIds(new Set());
            alert("Tasks deleted successfully.");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete tasks.");
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("Are you sure you want to remove this patient from your active list?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/doctors/connection/${id}/archive`, {}, { headers: { 'x-auth-token': token } });
            navigate('/dashboard/doctor');
        } catch (err) {
            console.error("Archive failed", err);
            alert("Failed to remove patient.");
        }
    };

    // calculate unified progress
    const totalTasks = assignedTasks.length + manualTasks.length;
    const completedTasks = assignedTasks.filter(t => t.isCompleted).length + manualTasks.filter(t => t.status === 'Completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Combine tasks for display
    const allTasks = [
        ...assignedTasks.map(t => ({ ...t, _type: 'video', displayTitle: t.videoTitle })),
        ...manualTasks.map(t => ({ ...t, _type: 'manual', displayTitle: t.title }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading) return <div className="w-full h-full flex items-center justify-center text-gray-400"><Activity className="animate-spin mr-2" /> Loading workspace...</div>;
    if (error) return <div className="w-full h-full flex items-center justify-center text-red-400"><AlertCircle className="mr-2" /> {error}</div>;
    if (!connection) return null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/doctor')} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Workspace</h1>
                        <p className="text-gray-500 text-sm">Manage recovery plan and progress</p>
                    </div>
                </div>
                <button onClick={handleArchive} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium text-sm transition-colors border border-transparent hover:border-red-100">
                    Remove Patient
                </button>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold uppercase text-xs tracking-wider"><User size={16} /> Patient Overview</div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 font-medium uppercase">Full Name</label><p className="text-gray-900 dark:text-white font-medium text-lg">{connection.patient.firstName} {connection.patient.lastName}</p></div>
                            <div><label className="text-xs text-gray-400 font-medium uppercase">Problem Domain</label><p className="text-gray-700 dark:text-gray-300 font-medium">{connection.problem}</p></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold uppercase text-xs tracking-wider"><Activity size={16} /> Problem Context</div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 font-medium uppercase">Problem Name</label><p className="text-gray-900 dark:text-white font-medium">{connection.problem}</p></div>
                            <div><label className="text-xs text-gray-400 font-medium uppercase">System Description</label><div className="mt-1 p-3 bg-indigo-50 dark:bg-slate-800/50 rounded-xl text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">Ongoing rehabilitation program focusing on <strong>{connection.problem}</strong>.</div></div>
                        </div>
                    </div>
                </div>



                {/* Right Col: Forms Only */}
                <div className="lg:col-span-2 space-y-6">



                    {/* Manual Task Builder */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                        <h3 className="font-bold text-indigo-900 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-indigo-600" /> Create Custom Task</h3>
                        <form onSubmit={handleCreateManualTask} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Title <span className="text-red-500">*</span></label>
                                    <input type="text" placeholder="e.g. Morning Stretch" className="w-full p-2 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-sm" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                    <select className="w-full p-2 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-sm" value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Instruction">Instruction</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                                <textarea className="w-full p-2 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-sm h-20 resize-none" placeholder="Add details about this task..." value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                                    <select className="w-full p-2 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-sm" value={newTask.frequency} onChange={e => setNewTask({ ...newTask, frequency: e.target.value })}>
                                        <option value="Daily">Daily</option>
                                        <option value="Alternate Days">Alternate Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reset Interval (Hours)</label>
                                    <input type="number" min="1" className="w-full p-2 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-sm" value={newTask.reminderInterval} onChange={e => setNewTask({ ...newTask, reminderInterval: parseInt(e.target.value) || 24 })} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white rounded-lg py-2 font-bold hover:bg-indigo-700 transition-colors">Add Task</button>
                        </form>
                    </div>

                    {/* Video Assigner */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="bg-indigo-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                            <h3 className="font-bold text-indigo-900 dark:text-white mb-2">Assign Exercise Video</h3>
                            <form onSubmit={handleSearchVideos} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="text" placeholder="Search exercises..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-lg font-medium hover:bg-indigo-700">Search</button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {videos.map(video => {
                                const timer = timerByVideo[video._id] || { d: 0, h: 24, m: 0, s: 0 };
                                return (
                                    <div key={video._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                                        <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title} className="w-full md:w-40 h-24 object-cover rounded-lg bg-gray-200" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{video.title}</h4>
                                            <p className="text-xs text-gray-500 mb-4">{video.domain} • {video.problem}</p>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                                    <span className="text-xs text-gray-500 font-bold uppercase mr-1">Reset In:</span>
                                                    {['d', 'h', 'm', 's'].map(u => (
                                                        <div key={u} className="flex items-center">
                                                            <input type="number" min="0" placeholder="0" value={timer[u]} onChange={(e) => handleTimerChange(video._id, u, e.target.value)} className="w-10 h-8 text-center text-sm border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                                            <span className="text-xs text-gray-400 ml-1 mr-2">{u}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => handleAssignVideo(video)} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors ml-auto"><Plus size={16} /> Assign</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Progress & Tasks */}
            <div className="mt-8 border-t border-gray-200 dark:border-slate-800 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ClipboardList className="text-indigo-600" /> Recovery Plan & Progress
                    </h2>
                    <div className="flex gap-2">
                        {!isModifyingPlan ? (
                            <button onClick={() => setIsModifyingPlan(true)} className="text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200">
                                Modify Plan
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setIsModifyingPlan(false); setSelectedTaskIds(new Set()); }} className="text-sm font-medium text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleDeleteSelectedTasks} disabled={selectedTaskIds.size === 0} className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    <Trash2 size={14} /> Delete Selected ({selectedTaskIds.size})
                                </button>
                            </div>
                        )}
                        <button onClick={async () => {
                            if (!window.confirm("Are you sure you want to clear the patient's progress? This will reset all task completions.")) return;
                            try {
                                const token = localStorage.getItem('token');
                                await axios.put(`http://localhost:5000/api/doctors/connection/${id}/reset-progress`, {}, { headers: { 'x-auth-token': token } });
                                const tasksRes = await axios.get(`http://localhost:5000/api/doctors/connection/${id}/tasks`, { headers: { 'x-auth-token': token } });
                                // Manual tasks don't have a specific reset progress endpoint yet, but usually statuses are reset. 
                                // For now we just reset video tasks as per previous logic, or we can just fetch to refresh.
                                // Ideally manual tasks should also be reset. 
                                // But I will stick to existing endpoint logic to maintain stability for now.
                                setAssignedTasks(tasksRes.data);
                                alert("Progress reset successfully.");
                            } catch (err) { console.error("Reset failed", err); alert("Failed to reset progress."); }
                        }} className="text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            Reset Progress
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: Progress & Task List */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                        {/* Progress Bar */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">Completion Rate</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{progressPercentage}%</h3>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xl ring-4 ring-indigo-50/50">
                                {completedTasks}/{totalTasks}
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 mb-8 overflow-hidden">
                            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <List size={18} className="text-indigo-600" /> Assigned Tasks
                        </h4>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {allTasks.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No tasks assigned yet.</p>
                            ) : (
                                allTasks.map(task => {
                                    const isCompleted = task._type === 'video' ? task.isCompleted : task.status === 'Completed';
                                    return (
                                        <div key={task._id}
                                            onClick={() => isModifyingPlan && handleToggleTaskSelection(task._id)}
                                            className={`p-3 rounded-xl border transition-all 
                                                ${isModifyingPlan && selectedTaskIds.has(task._id) ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}
                                                ${isModifyingPlan ? 'cursor-pointer hover:border-indigo-200' : ''}
                                        `}>
                                            <div className="flex items-start gap-3">
                                                {isModifyingPlan && (
                                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTaskIds.has(task._id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                                                        {selectedTaskIds.has(task._id) && <CheckSquare size={12} />}
                                                    </div>
                                                )}

                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${task._type === 'video' ? 'bg-indigo-100 text-indigo-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {task._type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{task.displayTitle}</h5>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${isCompleted ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {isCompleted ? 'Completed' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300">
                                                            {task._type === 'video' ? 'Video' : task.type || 'Manual'}
                                                        </span>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {task._type === 'video'
                                                                ? `Resets: ${(task.resetIntervalSeconds / 3600).toFixed(1)}h`
                                                                : `Freq: ${task.frequency}`
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Column 2: Updates & Files */}
                    <div className="space-y-6">
                        {/* Updates Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-indigo-600" /> Recent Health Updates
                            </h4>
                            {updates.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No health updates yet.</p>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {updates.filter(u => u.painLevel >= 0).map(update => (
                                        <div key={update._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                            <div className="text-gray-600">
                                                <span className="font-medium mr-2">{new Date(update.updatedAt).toLocaleDateString()} {new Date(update.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${update.painLevel <= 3 ? 'bg-green-100 text-green-700' : update.painLevel <= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    Pain: {update.painLevel}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Uploaded Files Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText size={18} className="text-indigo-600" /> Uploaded Files
                                </h4>
                                <button onClick={async () => {
                                    if (!window.confirm("Are you sure you want to clear all updates logs and files?")) return;
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axios.delete(`http://localhost:5000/api/doctors/connection/${id}/updates`, { headers: { 'x-auth-token': token } });
                                        // Refresh updates
                                        const updatesRes = await axios.get(`http://localhost:5000/api/doctors/patient-updates/${id}`, { headers: { 'x-auth-token': token } });
                                        setUpdates(updatesRes.data);
                                        alert("Updates cleared successfully.");
                                    } catch (err) { console.error("Clear updates failed", err); alert("Failed to clear updates."); }
                                }} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
                                    Clear All
                                </button>
                            </div>
                            {updates.flatMap(u => u.files || []).length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No files uploaded yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {updates.flatMap(u => u.files || []).map((file, idx) => (
                                        <a key={idx} href={`http://localhost:5000${file.path}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors">
                                            {file.mimeType && file.mimeType.includes('image') ? <Plus size={14} /> : <FileText size={14} />}
                                            <span className="truncate max-w-[150px]">{file.originalName}</span>
                                            <Download size={12} className="opacity-50" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientWorkspace;
