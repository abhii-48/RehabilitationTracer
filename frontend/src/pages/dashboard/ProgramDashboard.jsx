import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Activity,
    Calendar,
    FileText,
    MessageSquare,
    ChevronLeft,
    Upload,
    Play,
    CheckCircle,
    Circle,
    Image as ImageIcon,
    List,
    Info
} from 'lucide-react';
import ProgressSummaryPanel from '../../components/dashboard/patient/ProgressSummaryPanel';
import ChatWindow from '../../components/chat/ChatWindow';

const ProgramDashboard = () => {
    const { id } = useParams(); // Connection ID
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Feature States
    const [painLevel, setPainLevel] = useState(5);
    const [files, setFiles] = useState([]); // array of file objects
    const [uploadType, setUploadType] = useState('image'); // image, document, other
    const [isUpdatingPain, setIsUpdatingPain] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);

    // Tasks State
    const [tasks, setTasks] = useState([]);
    const [manualTasks, setManualTasks] = useState([]); // Manual Tasks State
    const [activeVideo, setActiveVideo] = useState(null); // { youtubeId, title }
    const [showChat, setShowChat] = useState(false); // Kept for safety if used elsewhere, but effectively unused.

    useEffect(() => {
        const fetchProgramData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'x-auth-token': token };

                // Parallel fetch
                const [progRes, tasksRes, manualRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/doctors/connection/${id}`, { headers }),
                    axios.get(`http://localhost:5000/api/patient/tasks/${id}`, { headers }),
                    axios.get(`http://localhost:5000/api/patient/manual-tasks/${id}`, { headers })
                ]);

                setProgram(progRes.data);
                setTasks(tasksRes.data);
                setManualTasks(manualRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load program data", err);
                const msg = err.response?.data?.msg || err.message || "Failed to load program.";
                setError(msg);
                setLoading(false);
            }
        };
        fetchProgramData();
    }, [id]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const handleUpdatePain = async () => {
        if (!painLevel) return alert("Please select a pain level.");
        setIsUpdatingPain(true);
        try {
            const formData = new FormData();
            formData.append('connectionId', id);
            formData.append('painLevel', painLevel);

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/patient/update', formData, {
                headers: {
                    'x-auth-token': token
                }
            });

            alert("Pain level updated!");
            setIsUpdatingPain(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update pain level.");
            setIsUpdatingPain(false);
        }
    };

    const handleUploadFiles = async () => {
        if (files.length === 0) return alert("Please select files to upload.");
        setIsUploadingFiles(true);
        try {
            const formData = new FormData();
            formData.append('connectionId', id);
            // Don't append painLevel here, backend handles partial updates
            files.forEach(f => formData.append('files', f));

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/patient/update', formData, {
                headers: {
                    'x-auth-token': token
                }
            });

            alert("Files uploaded successfully!");
            setFiles([]);
            setIsUploadingFiles(false);
        } catch (err) {
            console.error("Upload Error:", err);
            const msg = err.response?.data || err.message || "Failed to upload files.";
            // If it's a multer error it might be an HTML string if using standard express error handler without json, 
            // but usually we want to see the text.
            // Let's rely on checking if it's an object or string.
            const displayMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
            alert(`Failed: ${displayMsg}`);
            setIsUploadingFiles(false);
        }
    };

    const handleTaskComplete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/patient/task/${taskId}/complete`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Optimistic update
            setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: true } : t));
        } catch (err) {
            console.error(err);
        }
    };

    const handleManualTaskComplete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/patient/manual-tasks/${taskId}/complete`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Optimistic update
            setManualTasks(manualTasks.map(t => t._id === taskId ? { ...t, status: 'Completed' } : t));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="w-full h-full flex items-center justify-center text-gray-400 py-20">
            <Activity className="animate-spin mr-2" /> Loading program...
        </div>
    );

    if (error) return (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-500 py-20">
            <p className="font-bold text-lg mb-2">Unable to load program</p>
            <p className="text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 text-indigo-600 hover:underline"
            >
                Retry
            </button>
        </div>
    );

    if (!program) return (
        <div className="w-full h-full flex items-center justify-center text-gray-400 py-20">
            <p>Program not found or access denied.</p>
        </div>
    );

    const getPainColor = (level) => {
        if (level <= 3) return 'text-green-500';
        if (level <= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-8 relative">
            {/* Video Modal */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-black w-full max-w-4xl aspect-video rounded-xl overflow-hidden relative shadow-2xl">
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-full transition-colors"
                        >
                            Close
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                            title={activeVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}


            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rehab Program</h1>
                        <p className="text-gray-500 text-sm">Tracking recovery under Dr. {program.doctor.lastName}</p>
                    </div>
                </div>
            </div>

            {/* Read-Only Banner */}
            {program.status !== 'accepted' && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-xl flex items-center gap-3">
                    <Info className="flex-shrink-0" />
                    <div>
                        <p className="font-bold">Program Ended</p>
                        <p className="text-sm">This program is {program.status}. You can view the history but cannot make updates.</p>
                    </div>
                </div>
            )}

            {/* Top Row: Action Cards & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Current Check-in (Pain Level) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Activity className="text-indigo-600" size={20} /> Current Check-in
                        </h2>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                            <span>Pain Level</span>
                            <span className={`font-bold ${getPainColor(painLevel)}`}>{painLevel}/10</span>
                        </label>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${painLevel > 6 ? 'bg-red-500' : painLevel > 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${(painLevel / 10) * 100}%` }}
                            ></div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={painLevel}
                                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                                disabled={program.status !== 'accepted'}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdatePain}
                        disabled={isUpdatingPain || program.status !== 'accepted'}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdatingPain ? 'Updating...' : 'Update Pain Level'}
                    </button>
                </div>

                {/* 2. Upload Reports */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="text-blue-500" size={20} /> Upload Reports
                        </h2>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upload Progress (Optional)
                        </label>
                        <div className="flex flex-col gap-3 mb-6">
                            <select
                                value={uploadType}
                                onChange={(e) => setUploadType(e.target.value)}
                                disabled={program.status !== 'accepted'}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full disabled:opacity-50"
                            >
                                <option value="image">Body Image</option>
                                <option value="document">Medical Report (PDF)</option>
                            </select>
                            <label className={`cursor-pointer w-full ${program.status !== 'accepted' ? 'cursor-not-allowed opacity-50' : ''}`}>
                                <div className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-500">
                                    <Upload size={16} />
                                    <span className="truncate">{files.length > 0 ? `${files.length} files` : "Choose Files..."}</span>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept={uploadType === 'image' ? 'image/*' : '.pdf'}
                                    onChange={handleFileChange}
                                    disabled={program.status !== 'accepted'}
                                />
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={handleUploadFiles}
                        disabled={isUploadingFiles || files.length === 0 || program.status !== 'accepted'}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploadingFiles ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>


            </div>

            {/* Patient Progress Summary Panel */}
            <ProgressSummaryPanel connectionId={id} />

            {/* Unified Task List Section: Today's Tasks */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">Today's Tasks</h3>
                    {program.status === 'accepted' && (
                        <button
                            onClick={async () => {
                                const allTasks = [...tasks, ...manualTasks];
                                const completedCount = allTasks.filter(t => t.isCompleted || t.status === 'Completed').length;
                                if (completedCount === 0) return alert("Please complete at least one task before notifying.");

                                if (!window.confirm("Notify doctor about your progress?")) return;
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.post('http://localhost:5000/api/patient/notify-tasks', { connectionId: id }, {
                                        headers: { 'x-auth-token': token }
                                    });
                                    alert("Doctor notified of your progress!");
                                } catch (e) { console.error(e); alert("Failed to notify."); }
                            }}
                            className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                        >
                            Notify Doctor of Progress
                        </button>
                    )}
                </div>

                {[...tasks, ...manualTasks].length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-gray-400">
                        <Activity size={32} className="mb-2 opacity-50" />
                        <p>No tasks assigned for today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Unified List */}
                        {[...tasks.map(t => ({ ...t, _type: 'video' })), ...manualTasks.map(t => ({ ...t, _type: 'manual' }))]
                            .sort((a, b) => {
                                const aDone = a.isCompleted || a.status === 'Completed';
                                const bDone = b.isCompleted || b.status === 'Completed';
                                if (aDone === bDone) return 0;
                                return aDone ? 1 : -1;
                            })
                            .map((task) => {
                                const isVideo = task._type === 'video';
                                const isCompleted = isVideo ? task.isCompleted : task.status === 'Completed';

                                return (
                                    <div key={task._id} className={`group flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all hover:shadow-md ${isCompleted ? 'border-green-100 dark:border-green-900/30 bg-green-50/30' : 'border-gray-100 dark:border-slate-800'}`}>

                                        {/* Left: Icon & Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer 
                                                ${isCompleted
                                                        ? 'bg-green-100 text-green-600'
                                                        : isVideo ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-orange-50 text-orange-600'}`}
                                                onClick={() => isVideo && setActiveVideo({ youtubeId: task.youtubeId, title: task.videoTitle })}
                                            >
                                                {isCompleted ? <CheckCircle size={22} fill="currentColor" /> : (
                                                    isVideo ? <Play size={22} fill="currentColor" /> : (
                                                        task.type === 'Instruction' ? <Info size={22} /> : <List size={22} />
                                                    )
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className={`font-bold text-base truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                        {isVideo ? task.videoTitle : task.title}
                                                    </h4>
                                                    {!isCompleted && (
                                                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                            {isVideo ? 'Exercise' : task.type}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {isVideo ? 'Watch video and follow along' : (task.description || `${task.frequency || 'Daily'} • ${task.type}`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Action Button */}
                                        <div className="pl-4 shrink-0">
                                            <button
                                                onClick={() => isVideo ? handleTaskComplete(task._id) : handleManualTaskComplete(task._id)}
                                                disabled={isCompleted || program.status !== 'accepted'}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                                                ${isCompleted
                                                        ? 'bg-transparent text-green-600 cursor-default'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:bg-indigo-400'}`}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <span>Completed</span>
                                                        <CheckCircle size={18} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Mark Done</span>
                                                        <Circle size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramDashboard;
