import React, { useState, useEffect } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,
  parseISO
} from 'date-fns';
import { Play, Square, SkipBack, SkipForward, X, Plus, Minus, Trash2, Settings2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Tracker = ({ title, statKey, data, updateStat, colorHex, prefix = "", step = 1, className = "mb-4" }) => {
  const currentVal = Number(data.current) || 0;
  const normaVal = Number(data.norma) || 0;
  const progress = normaVal > 0 ? Math.min((currentVal / normaVal) * 100, 100) : 0;

  return (
    <div className={`bg-fl-panel p-3 border border-fl-borderOuter shadow-fl-panel rounded-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fl-textMuted">{title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => updateStat(statKey, 'current', Math.max(0, currentVal - step))}
            className="w-5 h-5 flex items-center justify-center bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm hover:brightness-125 active:shadow-fl-btn-active text-fl-textMuted"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => updateStat(statKey, 'current', currentVal + step)}
            className="w-5 h-5 flex items-center justify-center bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm hover:brightness-125 active:shadow-fl-btn-active text-fl-textMuted"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-2 text-xs">
        <div className="flex-1 bg-fl-gridDark p-1.5 border border-fl-borderOuter shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center">
          <span className="text-[9px] text-[#4A4E57] uppercase font-bold mb-0.5">Done</span>
          <div className="flex items-center justify-center font-lcd text-base" style={{ color: colorHex, textShadow: `0 0 5px ${colorHex}` }}>
            {prefix && <span className="mr-0.5">{prefix}</span>}
            <input
              type="number"
              value={data.current}
              onChange={(e) => updateStat(statKey, 'current', e.target.value)}
              className="bg-transparent w-full text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
        <div className="flex-1 bg-fl-gridDark p-1.5 border border-fl-borderOuter shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center">
          <span className="text-[9px] text-[#4A4E57] uppercase font-bold mb-0.5">Target</span>
          <div className="flex items-center justify-center font-lcd text-base text-fl-textMuted">
            {prefix && <span className="mr-0.5">{prefix}</span>}
            <input
              type="number"
              value={data.norma}
              onChange={(e) => updateStat(statKey, 'norma', e.target.value)}
              className="bg-transparent w-full text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-fl-gridDark border border-fl-borderOuter shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="h-full transition-all duration-300 relative" style={{ width: `${progress}%`, backgroundColor: colorHex }}>
          {/* Add segmented look for progress bar */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)', backgroundSize: '4px 100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionComment, setCompletionComment] = useState('');
  const [activeView, setActiveView] = useState('calendar');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('beatTasks_en')) || []);

  const [stats, setStats] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('beatStats_en'));
    const defaultStats = {
      beats: { current: 0, norma: 15 },
      videos: { current: 0, norma: 4 },
      loops: { current: 0, norma: 20 },
      revenue: { current: 0, norma: 100000 }
    };
    return saved ? { ...defaultStats, ...saved } : defaultStats;
  });

  const [streak, setStreak] = useState(() => JSON.parse(localStorage.getItem('beatStreak_en')) || { count: 0, lastDate: null });
  const [ideas, setIdeas] = useState(() => localStorage.getItem('beatIdeas_en') || '');

  const [prices, setPrices] = useState(() => JSON.parse(localStorage.getItem('beatPrices_ru')) || [
    { id: '1', name: 'Lease (mp3)', amount: 1500 },
    { id: '2', name: 'Exclusive', amount: 15000 },
    { id: '3', name: 'Private Beat', amount: 10000 },
  ]);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [newPriceName, setNewPriceName] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');

  const initialForm = { title: '', comment: '', type: 'Beats', startDate: '', endDate: '', priority: 'Medium' };
  const [taskForm, setTaskForm] = useState(initialForm);

  useEffect(() => { localStorage.setItem('beatTasks_en', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('beatStats_en', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('beatStreak_en', JSON.stringify(streak)); }, [streak]);
  useEffect(() => { localStorage.setItem('beatIdeas_en', ideas); }, [ideas]);
  useEffect(() => { localStorage.setItem('beatPrices_ru', JSON.stringify(prices)); }, [prices]);

  useEffect(() => {
    if (selectedDate) {
      setTaskForm(prev => ({ ...prev, startDate: format(selectedDate, 'yyyy-MM-dd') }));
    }
  }, [selectedDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateStat = (key, field, value) => {
    setStats(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value === '' ? '' : Number(value) }
    }));
  };

  const handleSaveTask = () => {
    if (!taskForm.startDate || !taskForm.title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      completed: false,
      ...taskForm
    };
    setTasks([...tasks, newTask]);
    setSelectedDate(null);
    setTaskForm(initialForm);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    setTasks(tasks.map(t =>
      t.id === selectedTask.id
        ? { ...t, completed: true, completionComment }
        : t
    ));
    setSelectedTask(null);
    setCompletionComment('');
  };

  const handleAddPrice = () => {
    if (!newPriceName.trim() || !newPriceAmount) return;
    setPrices([...prices, { id: Date.now().toString(), name: newPriceName, amount: Number(newPriceAmount) }]);
    setNewPriceName('');
    setNewPriceAmount('');
  };

  const handleDeletePrice = (id) => {
    setPrices(prices.filter(p => p.id !== id));
  };

  const handleQuickSale = (amount) => {
    const currentRevenue = Number(stats.revenue.current) || 0;
    updateStat('revenue', 'current', currentRevenue + amount);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isStreakActiveToday = streak.lastDate === todayStr;

  const handleLogSession = () => {
    if (isStreakActiveToday) return;
    let newCount = 1;
    if (streak.lastDate) {
      const lastDateObj = parseISO(streak.lastDate);
      if (isSameDay(addDays(lastDateObj, 1), new Date())) {
        newCount = streak.count + 1;
      }
    }
    setStreak({ count: newCount, lastDate: todayStr });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Beats': return '#00E676';
      case 'Videos': return '#D500F9';
      case 'Drumkits': return '#FF6600';
      case 'Loops': return '#00B0FF';
      case 'Send Beats/Loops': return '#FFEA00';
      default: return '#9BA0A8';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500 shadow-[0_0_5px_#EF4444]';
      case 'Medium': return 'bg-orange-400 shadow-[0_0_5px_#FB923C]';
      case 'Low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const renderTaskBrowser = () => {
    const filteredTasks = tasks.filter(t => {
      if (filterStatus === 'Completed' && !t.completed) return false;
      if (filterStatus === 'Pending' && t.completed) return false;
      if (filterType !== 'All' && t.type !== filterType) return false;
      return true;
    });

    return (
      <div className="flex-1 flex flex-col p-6 overflow-hidden bg-fl-bg relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 20px)', backgroundSize: '100% 20px' }}></div>

        <div className="flex items-center justify-between mb-4 z-10 bg-fl-panel p-2 rounded-sm border border-fl-borderOuter shadow-fl-panel">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-fl-textMuted uppercase font-bold tracking-widest">Filter by:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-fl-gridDark border border-fl-borderOuter text-white text-xs px-2 py-1.5 rounded-sm shadow-fl-btn focus:border-fl-orange outline-none">
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-fl-gridDark border border-fl-borderOuter text-white text-xs px-2 py-1.5 rounded-sm shadow-fl-btn focus:border-fl-orange outline-none">
              <option>All</option>
              <option>Beats</option>
              <option>Videos</option>
              <option>Drumkits</option>
              <option>Loops</option>
              <option>Send Beats/Loops</option>
            </select>
          </div>
          <div className="text-[10px] font-bold text-fl-orange uppercase tracking-wider">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'Event' : 'Events'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 z-10 pb-4">
          {filteredTasks.length === 0 && <div className="text-fl-textMuted text-xs text-center mt-10 font-bold uppercase tracking-widest">No events found in this category.</div>}
          {filteredTasks.map(t => (
            <div key={t.id} className={`flex items-stretch bg-fl-panel border shadow-fl-panel rounded-sm hover:border-fl-textMuted transition-colors group overflow-hidden ${t.completed ? 'border-fl-borderOuter opacity-70' : 'border-[#383B42]'}`}>

              <div className="w-1" style={{ backgroundColor: getTypeColor(t.type) }}></div>

              <div className="flex-1 p-3 flex items-center justify-between">
                <div className="flex flex-col gap-1 w-1/3">
                  <span className={`font-bold text-sm ${t.completed ? 'text-fl-textMuted line-through' : 'text-white'}`}>{t.title || t.type}</span>
                  <span className="text-[10px] text-fl-textMuted tracking-wider font-bold">
                    <span className="text-fl-orange">{t.startDate && format(parseISO(t.startDate), 'dd.MM.yyyy')}</span> • {t.type}
                  </span>
                </div>

                <div className="flex-1 px-4 border-l border-fl-borderOuter flex flex-col justify-center min-h-[40px]">
                  {t.comment && <span className="text-[10px] text-white/70 italic line-clamp-2">{t.comment}</span>}
                  {t.completed && t.completionComment && <span className="text-[10px] text-fl-green font-bold mt-1 line-clamp-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-fl-green"></span>
                    {t.completionComment}
                  </span>}
                </div>

                <div className="flex items-center gap-6 ml-4 border-l border-fl-borderOuter pl-4">
                  <div className="flex flex-col items-center gap-1 w-16">
                    <span className="text-[9px] uppercase font-bold text-fl-textMuted">Status</span>
                    {t.completed ? <span className="text-[10px] text-fl-green font-bold bg-fl-green/10 px-2 py-0.5 rounded-sm">DONE</span> : <span className="text-[10px] text-fl-orange font-bold bg-fl-orange/10 px-2 py-0.5 rounded-sm">PENDING</span>}
                  </div>
                  <button
                    onClick={() => { setTasks(tasks.filter(task => task.id !== t.id)); if (selectedTask?.id === t.id) setSelectedTask(null); }}
                    className="text-fl-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors p-2 rounded-sm"
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStarts: 1 });
    const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayTasks = tasks.filter(t => isSameDay(parseISO(t.startDate), cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        let bg = isCurrentMonth ? 'bg-fl-stepOff' : 'bg-[#222429]';
        let border = 'border-fl-borderOuter';

        if (isSelected) {
          bg = 'bg-[#3A3F47]';
          border = 'border-fl-orange shadow-[inset_0_0_10px_rgba(255,102,0,0.5)]';
        }

        days.push(
          <div
            key={day}
            className={`min-h-[100px] border flex flex-col p-1.5 transition-colors cursor-pointer rounded-sm ${bg} ${border}`}
            onClick={() => { setSelectedDate(cloneDay); setSelectedTask(null); }}
            style={{
              boxShadow: isSelected ? 'inset 1px 1px 0px rgba(255,255,255,0.1), inset -1px -1px 0px rgba(0,0,0,0.5), 0 0 10px rgba(255,102,0,0.5)' : 'inset 1px 1px 0px rgba(255,255,255,0.05), inset -1px -1px 0px rgba(0,0,0,0.5)'
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-fl-textMuted font-bold opacity-50"></span>
              <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-sm ${isToday ? 'bg-fl-orange text-black shadow-[0_0_8px_#FF6600]' : 'text-fl-textMuted'}`}>
                {formattedDate}
              </span>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
              {dayTasks.map(t => (
                <div
                  key={t.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedTask(t); setSelectedDate(null); setCompletionComment(''); }}
                  className={`flex flex-col gap-0.5 text-[10px] p-1 rounded-sm border text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer hover:brightness-110 ${t.completed ? 'opacity-50 line-through grayscale' : ''}`}
                  style={{
                    backgroundColor: `${getTypeColor(t.type)}20`,
                    borderColor: getTypeColor(t.type),
                    boxShadow: `inset 1px 1px 0px rgba(255,255,255,0.2), inset -1px -1px 0px rgba(0,0,0,0.5)`
                  }}
                  title={t.title || t.type}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityDot(t.priority)}`}></span>
                    <span className="truncate">{t.title || t.type}</span>
                  </div>
                  {t.comment && !t.completed && <span className="text-[9px] text-white/70 truncate ml-3">{t.comment}</span>}
                  {t.completed && t.completionComment && <span className="text-[9px] text-fl-green truncate ml-3">✓ {t.completionComment}</span>}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="flex-1 overflow-y-auto p-4 bg-fl-bg custom-scrollbar flex flex-col">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] text-fl-textMuted py-1 uppercase tracking-widest font-bold">
              {d}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-fl-bg text-fl-textMain flex flex-col overflow-hidden select-none">

      {/* Top Toolbar (Transport) */}
      <div className="h-14 bg-fl-panel border-b border-fl-borderOuter shadow-md flex items-center px-4 gap-6 shrink-0 z-20">

        {/* Brand/Logo Area */}
        <div className="flex items-center gap-2 mr-6 bg-[#1A1C20] p-1 pr-3 rounded border border-fl-borderOuter shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fl-orange to-[#cc2b00] border border-[#111215] shadow-[0_0_10px_rgba(255,102,0,0.3)] flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-black italic tracking-widest text-sm drop-shadow-md text-white">WAVEROUTE</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fl-green shadow-[0_0_5px_#00E676] animate-pulse"></span>
              <span className="font-lcd tracking-widest text-[9px] text-fl-textMuted uppercase">CALENDAR</span>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex bg-fl-panel p-1 rounded-sm border border-fl-borderOuter shadow-fl-btn gap-1">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm hover:brightness-125 active:shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.1)] text-fl-textMuted active:text-fl-orange transition-all">
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 h-8 flex items-center justify-center bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm hover:brightness-125 active:shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.1)] text-fl-textMuted active:text-fl-green transition-all uppercase text-[10px] font-bold tracking-widest min-w-[120px]" title="Back to Today">
            {format(currentDate, 'MMMM yyyy')}
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm hover:brightness-125 active:shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.1)] text-fl-textMuted active:text-fl-orange transition-all">
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>

        {/* LCD Display (Date) */}
        <div className="bg-black border-2 border-[#111215] rounded flex items-center p-1.5 px-4 gap-4 shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#4A4E57] uppercase font-bold -mb-1">Today</span>
            <span className="font-lcd text-fl-orange text-lg tracking-widest drop-shadow-fl-led font-bold min-w-[140px] text-center">
              {format(new Date(), 'dd-MM-yyyy')}
            </span>
          </div>
        </div>

      </div>

      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Panel - Task Creator & Details */}
        <div className={`absolute top-0 bottom-0 left-0 w-64 bg-fl-panel border-r border-fl-borderOuter shadow-2xl transition-transform duration-300 ease-in-out z-30 ${selectedDate || selectedTask ? 'translate-x-0' : '-translate-x-full'}`}>

          {selectedDate && (
            <>
              <div className="h-8 bg-fl-panelLight border-b border-fl-borderOuter flex justify-between items-center px-2 shadow-fl-btn shrink-0">
                <span className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider">Add Event</span>
                <button onClick={() => setSelectedDate(null)} className="hover:bg-red-500/80 p-0.5 rounded-sm transition-colors text-fl-textMuted hover:text-white">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-3 overflow-y-auto h-[calc(100%-2rem)] custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Event title..."
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange placeholder:text-white/20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Type</label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange"
                  >
                    <option>Beats</option>
                    <option>Private Videos</option>
                    <option>Drumkits</option>
                    <option>Loops</option>
                    <option>Send Beats/Loops</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Start Date</label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange [color-scheme:dark]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.endDate}
                    onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value })}
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange [color-scheme:dark]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-fl-textMuted uppercase font-bold">Comment</label>
                  <textarea
                    value={taskForm.comment}
                    onChange={(e) => setTaskForm({ ...taskForm, comment: e.target.value })}
                    placeholder="Optional details..."
                    className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-orange placeholder:text-white/20 resize-none h-16"
                  />
                </div>

                <button
                  onClick={handleSaveTask}
                  disabled={!taskForm.title.trim()}
                  className="mt-2 px-4 py-2 bg-fl-orange text-black font-bold text-xs uppercase tracking-wider rounded-sm shadow-[inset_1px_1px_0px_rgba(255,255,255,0.5),inset_-1px_-1px_0px_rgba(0,0,0,0.5)] hover:brightness-110 active:shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Event
                </button>
              </div>
            </>
          )}

          {selectedTask && (
            <>
              <div className="h-8 bg-fl-panelLight border-b border-fl-borderOuter flex justify-between items-center px-2 shadow-fl-btn shrink-0">
                <span className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider">Event Details</span>
                <button onClick={() => setSelectedTask(null)} className="hover:bg-red-500/80 p-0.5 rounded-sm transition-colors text-fl-textMuted hover:text-white">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-2rem)] custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <span className="text-fl-orange font-bold text-sm leading-tight break-words">{selectedTask.title || selectedTask.type}</span>
                  <span className="text-[10px] text-fl-textMuted">{selectedTask.type} • {selectedTask.priority} Priority</span>
                </div>

                {selectedTask.comment && (
                  <div className="bg-fl-gridDark p-2 rounded-sm border border-fl-borderOuter text-xs text-white/80 whitespace-pre-wrap">
                    {selectedTask.comment}
                  </div>
                )}

                {!selectedTask.completed ? (
                  <div className="flex flex-col gap-2 mt-2 border-t border-fl-borderOuter pt-4">
                    <label className="text-[10px] text-fl-textMuted uppercase font-bold">Completion Note (Optional)</label>
                    <textarea
                      value={completionComment}
                      onChange={(e) => setCompletionComment(e.target.value)}
                      placeholder="How did it go?"
                      className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-fl-green placeholder:text-white/20 resize-none h-16"
                    />
                    <button
                      onClick={handleCompleteTask}
                      className="px-4 py-2 bg-fl-green text-black font-bold text-xs uppercase tracking-wider rounded-sm shadow-[inset_1px_1px_0px_rgba(255,255,255,0.5),inset_-1px_-1px_0px_rgba(0,0,0,0.5)] hover:brightness-110 active:shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 mt-1"
                    >
                      ✔ Complete Task
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-2 border-t border-fl-borderOuter pt-4">
                    <span className="text-[10px] text-fl-green uppercase font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-fl-green shadow-[0_0_5px_#00E676]"></span>
                      Completed
                    </span>
                    {selectedTask.completionComment && (
                      <div className="bg-black/40 p-2 rounded-sm border border-fl-green/30 text-xs text-fl-green italic whitespace-pre-wrap">
                        {selectedTask.completionComment}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button
                    onClick={() => { setTasks(tasks.filter(t => t.id !== selectedTask.id)); setSelectedTask(null); }}
                    className="w-full px-4 py-1.5 border border-red-500/50 text-red-400 font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-red-500/10 transition-all"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center Panel (Playlist) & Bottom (Mixer) */}
        <div className="flex-1 flex flex-col h-full z-10 bg-fl-bg relative">

          <div className="h-6 bg-[#26282E] border-b border-fl-borderOuter flex items-center px-3 shadow-sm z-10 shrink-0 justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveView('calendar')}
                className={`${activeView === 'calendar' ? 'text-fl-orange' : 'text-fl-textMuted hover:text-white'} transition-colors`}
              >
                Playlist
              </button>
              <span className="text-fl-textMuted">|</span>
              <button
                onClick={() => setActiveView('tasks')}
                className={`${activeView === 'tasks' ? 'text-fl-orange' : 'text-fl-textMuted hover:text-white'} transition-colors`}
              >
                Task Browser
              </button>
            </div>
          </div>

          {activeView === 'calendar' ? renderCalendar() : renderTaskBrowser()}

          {/* Bottom Mixer Panel (Revenue & Sales) */}
          <div className="h-56 bg-fl-panel border-t border-fl-borderOuter flex shadow-[0_-10px_20px_rgba(0,0,0,0.5)] relative z-20">

            {/* Master Channel (Revenue) */}
            <div className="w-64 border-r border-fl-borderOuter p-3 flex flex-col justify-between shadow-fl-panel">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider">Master (Rev)</span>
              </div>
              <Tracker title="" statKey="revenue" data={stats.revenue} updateStat={updateStat} colorHex="#00E676" prefix="₽" step={500} className="flex-1 border-none bg-transparent shadow-none p-0 !mb-0" />
            </div>

            {/* Mixer Channels (Quick Sales) */}
            <div className="flex-1 flex flex-col bg-fl-gridDark">
              <div className="h-6 bg-[#26282E] border-b border-fl-borderOuter flex items-center px-3 justify-between">
                <span className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider">Mixer - Quick Sales</span>
                <button onClick={() => setShowPriceEditor(!showPriceEditor)} className="text-fl-textMuted hover:text-fl-orange">
                  <Settings2 size={12} />
                </button>
              </div>

              <div className="flex-1 p-2 overflow-y-auto custom-scrollbar flex gap-2">
                {showPriceEditor ? (
                  <div className="w-full max-w-md flex flex-col gap-2 p-2">
                    <div className="flex gap-2">
                      <input type="text" value={newPriceName} onChange={e => setNewPriceName(e.target.value)} placeholder="Title" className="flex-1 bg-fl-input border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 text-xs text-white" />
                      <input type="number" value={newPriceAmount} onChange={e => setNewPriceAmount(e.target.value)} placeholder="₽" className="w-20 bg-fl-input border border-fl-borderOuter shadow-fl-panel rounded-sm px-2 text-xs text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <button onClick={handleAddPrice} className="bg-fl-panelLight shadow-fl-btn border border-fl-borderOuter text-white px-3 py-1 rounded-sm"><Plus size={14} /></button>
                    </div>
                    {prices.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-fl-panel p-1.5 rounded-sm border border-fl-borderOuter shadow-fl-panel text-xs">
                        <span className="text-white font-bold">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-fl-green font-lcd">{p.amount} ₽</span>
                          <button onClick={() => handleDeletePrice(p.id)} className="text-fl-textMuted hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 p-1">
                    {prices.map(p => (
                      <button key={p.id} onClick={() => handleQuickSale(p.amount)} className="w-32 h-16 bg-fl-panelLight border border-fl-borderOuter shadow-fl-btn rounded-sm flex flex-col items-center justify-center hover:brightness-125 active:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5),inset_-1px_-1px_0px_rgba(255,255,255,0.1)] group transition-all relative overflow-hidden border-t-[#383B42] border-l-[#383B42]">
                        <span className="text-[10px] font-bold text-fl-textMuted group-hover:text-white uppercase tracking-wider text-center px-1 z-10 transition-colors">{p.name}</span>
                        <span className="font-lcd text-fl-orange text-sm drop-shadow-fl-led z-10 font-bold mt-1">+{p.amount}₽</span>
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-fl-gridDark border border-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] group-active:bg-fl-green group-active:shadow-[0_0_5px_#00E676] transition-all"></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Plugins (Stats/Notes) */}
        <div className="w-80 bg-fl-panel border-l border-fl-borderOuter shadow-[-10px_0_20px_rgba(0,0,0,0.3)] flex flex-col z-20">

          <div className="h-6 bg-[#26282E] border-b border-fl-borderOuter flex items-center px-3 justify-between shrink-0">
            <span className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider">Plugins - Stats & Notes</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">

            {/* Activity (Streak) */}
            <div className="bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm p-3">
              <h3 className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider mb-2">Daily Streak</h3>
              <div className="flex items-center justify-between">
                <div className="font-lcd text-3xl text-fl-orange drop-shadow-fl-led">
                  {streak.count} <span className="text-xl">🔥</span>
                </div>
                <button
                  onClick={handleLogSession}
                  disabled={isStreakActiveToday}
                  className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border shadow-fl-btn transition-all ${isStreakActiveToday
                    ? 'bg-fl-panelLight border-fl-borderOuter text-fl-textMuted opacity-50 cursor-not-allowed'
                    : 'bg-fl-orange border-orange-300 text-black hover:brightness-110 active:shadow-fl-btn-active'
                    }`}
                >
                  {isStreakActiveToday ? 'Cooked' : 'Log Session'}
                </button>
              </div>
            </div>

            {/* Trackers */}
            <div className="flex flex-col gap-2">
              <Tracker title="Monthly Beats" statKey="beats" data={stats.beats} updateStat={updateStat} colorHex="#00E676" />
              <Tracker title="Videos" statKey="videos" data={stats.videos} updateStat={updateStat} colorHex="#D500F9" />
              <Tracker title="Loops" statKey="loops" data={stats.loops} updateStat={updateStat} colorHex="#00B0FF" />
            </div>

            {/* Notes Area */}
            <div className="flex-1 flex flex-col min-h-[150px]">
              <h3 className="text-[10px] font-bold text-fl-textMuted uppercase tracking-wider mb-2">Notebook</h3>
              <textarea
                value={ideas}
                onChange={(e) => setIdeas(e.target.value)}
                className="flex-1 bg-fl-gridDark border border-fl-borderOuter shadow-fl-panel rounded-sm p-2 text-xs text-white focus:outline-none focus:border-fl-orange resize-none custom-scrollbar font-lcd"
                placeholder="Drop ideas here..."
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
