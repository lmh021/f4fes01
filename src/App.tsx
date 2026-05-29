import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Undo,
  Users,
  UserCheck,
  Play,
  Pause,
  Square,
  Search,
  Moon,
  Sun,
  Filter,
  Award,
  ChevronRight,
  Menu,
  Check,
  RotateCcw,
  Info,
  Printer,
  ChevronDown
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { Student, AttendanceStatus, StudentMarks, HistoryAction, ExamSessionInfo } from './types';
import { getInitialStudents, EXAM_SESSIONS } from './studentsData';

export default function App() {
  // Theme state (default dark)
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'marks' | 'results' | 'timer'>('dashboard');
  
  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Student list and History actions
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<HistoryAction[]>([]);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // State initialization & LocalStorage sync
  useEffect(() => {
    const savedStudents = localStorage.getItem('speaking_exam_students');
    const savedHistory = localStorage.getItem('speaking_exam_history');
    const savedTheme = localStorage.getItem('speaking_exam_theme');
    
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
    
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {
        setStudents(getInitialStudents());
      }
    } else {
      setStudents(getInitialStudents());
    }
    
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('speaking_exam_students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem('speaking_exam_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('speaking_exam_theme', darkMode.toString());
  }, [darkMode]);

  // Show a temporary message
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filters State
  const [sessionFilter, setSessionFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Results Sorting State
  const [resultsSortKey, setResultsSortKey] = useState<string>('id');
  const [resultsSortOrder, setResultsSortOrder] = useState<'asc' | 'desc'>('asc');

  // Results Sheet Specific Filters
  const [resultsClassFilter, setResultsClassFilter] = useState<string>('All');
  const [resultsNameFilter, setResultsNameFilter] = useState<string>('');
  const [resultsStartDate, setResultsStartDate] = useState<string>('');
  const [resultsEndDate, setResultsEndDate] = useState<string>('');

  // Input Marks Specific State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [pronunciation, setPronunciation] = useState<number>(0);
  const [vocabulary, setVocabulary] = useState<number>(0);
  const [ideas, setIdeas] = useState<number>(0);
  const [communication, setCommunication] = useState<number>(0);
  const [individualResponse, setIndividualResponse] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');

  // Timer / Stopwatch state
  const [stopwatchMode, setStopwatchMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // countdown starting value (10 min in seconds)
  const [countUpTime, setCountUpTime] = useState<number>(0); // stopwatch in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [lastChimeTime, setLastChimeTime] = useState<number>(0); // to avoid repeating beep
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synth for countdown completion (audible alert)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Triple beep patterns
      const now = ctx.currentTime;
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + delay); // A5 note
        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.25);
        
        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } catch (err) {
      console.warn('Audio Context not allowed by browser policy yet.', err);
    }
  };

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (stopwatchMode === 'countdown') {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              playChime();
              triggerToast('Preparation Timer Finished! Please stop writing.', 'error');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setCountUpTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, stopwatchMode]);

  // Handle preset timing count clicks
  const applyPresetTime = (sec: number, label: string) => {
    setIsTimerRunning(false);
    setStopwatchMode('countdown');
    setTimeRemaining(sec);
    triggerToast(`Timer preset applied: ${label}`, 'info');
  };

  // Reset actual timer
  const resetTimer = () => {
    setIsTimerRunning(false);
    if (stopwatchMode === 'countdown') {
      setTimeRemaining(600); // reset back to 10 mins
    } else {
      setCountUpTime(0);
    }
    triggerToast('Timer reset successful', 'info');
  };

  // Core Actions: Attendance change
  const handleAttendanceChange = (studentId: number, status: AttendanceStatus) => {
    const studentIdx = students.findIndex((s) => s.id === studentId);
    if (studentIdx === -1) return;
    
    const targetStudent = students[studentIdx];
    const prevAttendance = targetStudent.attendance;
    if (prevAttendance === status) return; // no change

    // Add to undo history
    const actionId = `act-${Math.random().toString(36).substring(2, 9)}`;
    const action: HistoryAction = {
      id: actionId,
      studentId,
      studentName: targetStudent.ename,
      type: 'attendance',
      description: `Updated attendance of ${targetStudent.ename} (${targetStudent.class} #${targetStudent.no}) to ${status}`,
      prevAttendance,
      newAttendance: status,
      timestamp: Date.now(),
    };

    setHistory((prev) => [action, ...prev].slice(0, 50));
    
    // Update State
    const updatedStudents = [...students];
    updatedStudents[studentIdx] = {
      ...targetStudent,
      attendance: status,
    };
    setStudents(updatedStudents);
    triggerToast(`Recorded ${targetStudent.ename} as ${status}`, 'success');
  };

  // Submit marks action
  const handleSubmitMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId === null) {
      triggerToast('Please select a student first.', 'error');
      return;
    }

    const studentIdx = students.findIndex((s) => s.id === selectedStudentId);
    if (studentIdx === -1) return;

    const student = students[studentIdx];
    const prevMarks = { ...student.marks };
    
    const calculatedTotal = pronunciation + vocabulary + ideas + communication + individualResponse;
    
    const newMarks: StudentMarks = {
      pronunciation,
      vocabulary,
      ideas,
      communication,
      individualResponse,
      total: calculatedTotal,
      remarks,
      marked: true,
    };

    // Add to Undo history
    const actionId = `act-${Math.random().toString(36).substring(2, 9)}`;
    const action: HistoryAction = {
      id: actionId,
      studentId: selectedStudentId,
      studentName: student.ename,
      type: 'marks',
      description: `Input marks for ${student.ename} (${student.class} #${student.no}) - Total: ${calculatedTotal}/30`,
      prevMarks,
      newMarks,
      timestamp: Date.now(),
    };

    setHistory((prev) => [action, ...prev].slice(0, 50));

    const updatedStudents = [...students];
    updatedStudents[studentIdx] = {
      ...student,
      marks: newMarks,
    };

    setStudents(updatedStudents);
    triggerToast(`Saves marks for ${student.ename} (Score: ${calculatedTotal})`, 'success');
  };

  // Global Undo Action Handler (most recent, or by ID)
  const handleUndo = (actionId?: string) => {
    if (history.length === 0) {
      triggerToast('Nothing to undo.', 'info');
      return;
    }

    const itemToUndo = actionId ? history.find((h) => h.id === actionId) : history[0];
    if (!itemToUndo) {
      triggerToast('Selected action not found in undo history.', 'error');
      return;
    }

    const studentIdx = students.findIndex((s) => s.id === itemToUndo.studentId);
    if (studentIdx === -1) {
      triggerToast('Target candidate student no longer exists.', 'error');
      return;
    }

    const student = students[studentIdx];
    const updated = [...students];

    if (itemToUndo.type === 'attendance') {
      updated[studentIdx] = {
        ...student,
        attendance: itemToUndo.prevAttendance || 'Unmarked',
      };
      triggerToast(`Undone attendance update for ${itemToUndo.studentName}`, 'info');
    } else {
      updated[studentIdx] = {
        ...student,
        marks: itemToUndo.prevMarks || {
          pronunciation: 0,
          vocabulary: 0,
          ideas: 0,
          communication: 0,
          individualResponse: 0,
          total: 0,
          remarks: '',
          marked: false,
        },
      };
      
      // Sync the marks panel sliders if they are currently active for this student
      if (selectedStudentId === itemToUndo.studentId) {
        const pm = itemToUndo.prevMarks || { pronunciation: 0, vocabulary: 0, ideas: 0, communication: 0, individualResponse: 0, remarks: '' };
        setPronunciation(pm.pronunciation);
        setVocabulary(pm.vocabulary);
        setIdeas(pm.ideas);
        setCommunication(pm.communication);
        setIndividualResponse(pm.individualResponse);
        setRemarks(pm.remarks);
      }
      triggerToast(`Undone evaluated marks input for ${itemToUndo.studentName}`, 'info');
    }

    setStudents(updated);
    setHistory((prev) => prev.filter((h) => h.id !== itemToUndo.id));
  };

  // Full Reset to default data
  const handleResetAllData = () => {
    if (window.confirm('WARNING: Are you sure you want to completely RESET all records? This will clear all attendance logs, marks, and history!')) {
      localStorage.removeItem('speaking_exam_students');
      localStorage.removeItem('speaking_exam_history');
      setStudents(getInitialStudents());
      setHistory([]);
      setSelectedStudentId(null);
      triggerToast('All applet records have been restored to initial list.', 'error');
    }
  };

  // Select first student in selected marks view list automatically
  const handleSelectStudentForScoring = (student: Student) => {
    setSelectedStudentId(student.id);
    setPronunciation(student.marks.pronunciation);
    setVocabulary(student.marks.vocabulary);
    setIdeas(student.marks.ideas);
    setCommunication(student.marks.communication);
    setIndividualResponse(student.marks.individualResponse);
    setRemarks(student.marks.remarks || '');
  };

  // Calculate quick dashboard metrics
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.attendance === 'Present').length;
    const absent = students.filter((s) => s.attendance === 'Absent').length;
    const late = students.filter((s) => s.attendance === 'Late').length;
    const unmarked = students.filter((s) => s.attendance === 'Unmarked').length;
    
    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;
    
    const gradedStudents = students.filter((s) => s.marks.marked);
    const gradedTotal = gradedStudents.length;
    const marksSum = gradedStudents.reduce((acc, s) => acc + s.marks.total, 0);
    const averageScore = gradedTotal > 0 ? marksSum / gradedTotal : 0;

    // Grades calculation
    // A: >=24, B: 18-23, C: 12-17, D/F: <=11
    const countA = gradedStudents.filter((s) => s.marks.total >= 24).length;
    const countB = gradedStudents.filter((s) => s.marks.total >= 18 && s.marks.total < 24).length;
    const countC = gradedStudents.filter((s) => s.marks.total >= 12 && s.marks.total < 18).length;
    const countD = gradedStudents.filter((s) => s.marks.total < 12).length;

    return {
      total,
      present,
      absent,
      late,
      unmarked,
      attendanceRate,
      gradedTotal,
      averageScore,
      countA,
      countB,
      countC,
      countD,
    };
  }, [students]);

  // Filters candidates in local states
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSession = sessionFilter === 'All' || s.session === sessionFilter;
      const matchGroup = groupFilter === 'All' || s.group.toString() === groupFilter;
      const matchClass = classFilter === 'All' || s.class === classFilter;
      
      const text = searchQuery.toLowerCase();
      const matchSearch =
        text === '' ||
        s.ename.toLowerCase().includes(text) ||
        s.class.toLowerCase().includes(text) ||
        s.id.toString().includes(text) ||
        s.group.toString().includes(text);

      return matchSession && matchGroup && matchClass && matchSearch;
    });
  }, [students, sessionFilter, groupFilter, classFilter, searchQuery]);

  // Dynamic class options derived for results tab filter dropdown
  const resultsClassOptions = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => s.class)));
    return ['All', ...classes.sort()];
  }, [students]);

  // Handle column header mouse click to trigger sort
  const toggleResultsSort = (key: string) => {
    if (resultsSortKey === key) {
      setResultsSortOrder(resultsSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setResultsSortKey(key);
      const defaultDescKeys = ['total', 'pronunciation', 'vocabulary', 'ideas', 'communication', 'individualResponse', 'level'];
      setResultsSortOrder(defaultDescKeys.includes(key) ? 'desc' : 'asc');
    }
  };

  // Results sheet specific filtering and sorting
  const sortedAndFilteredResults = useMemo(() => {
    // Filter candidates based on results-specific filters
    const filtered = students.filter((s) => {
      // 1. Class filter
      const matchClass = resultsClassFilter === 'All' || s.class === resultsClassFilter;
      
      // 2. Student name / search query (matches name or ID)
      const text = resultsNameFilter.trim().toLowerCase();
      const matchName = text === '' || 
        s.ename.toLowerCase().includes(text) || 
        s.id.toString() === text;
      
      // 3. Date range filter
      let matchDate = true;
      if (resultsStartDate) {
        matchDate = matchDate && s.date >= resultsStartDate;
      }
      if (resultsEndDate) {
        matchDate = matchDate && s.date <= resultsEndDate;
      }
      
      return matchClass && matchName && matchDate;
    });

    // Sort key comparison
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (resultsSortKey) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'ename':
          comparison = a.ename.localeCompare(b.ename);
          break;
        case 'class':
          comparison = `${a.class}-${a.no.toString().padStart(3, '0')}`.localeCompare(`${b.class}-${b.no.toString().padStart(3, '0')}`);
          break;
        case 'session':
          comparison = a.session.localeCompare(b.session);
          break;
        case 'group':
          comparison = a.group - b.group;
          break;
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'attendance':
          comparison = a.attendance.localeCompare(b.attendance);
          break;
        case 'pronunciation':
          comparison = a.marks.pronunciation - b.marks.pronunciation;
          break;
        case 'vocabulary':
          comparison = a.marks.vocabulary - b.marks.vocabulary;
          break;
        case 'ideas':
          comparison = a.marks.ideas - b.marks.ideas;
          break;
        case 'communication':
          comparison = a.marks.communication - b.marks.communication;
          break;
        case 'individualResponse':
          comparison = a.marks.individualResponse - b.marks.individualResponse;
          break;
        case 'total':
          comparison = a.marks.total - b.marks.total;
          break;
        case 'level':
          // Estimate level comparison
          const getLevelNum = (st: Student) => {
            if (!st.marks.marked) return -1;
            return st.marks.total;
          };
          comparison = getLevelNum(a) - getLevelNum(b);
          break;
        case 'remarks':
          comparison = (a.marks.remarks || '').localeCompare(b.marks.remarks || '');
          break;
        default:
          comparison = 0;
      }

      return resultsSortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [students, resultsClassFilter, resultsNameFilter, resultsStartDate, resultsEndDate, resultsSortKey, resultsSortOrder]);

  // Generate dynamic group options based on selected session filter
  const availableGroups = useMemo(() => {
    if (sessionFilter === 'All') {
      // Return 1 to 42
      return Array.from({ length: 42 }, (_, i) => (i + 1).toString());
    }
    const sessInfo = EXAM_SESSIONS.find((s) => s.session === sessionFilter);
    return sessInfo ? sessInfo.groups.map(String) : [];
  }, [sessionFilter]);

  // Sync group filters when session changes
  useEffect(() => {
    setGroupFilter('All');
  }, [sessionFilter]);

  // Export results CSV content
  const handleExportCSV = (onlyFiltered: boolean = false) => {
    const listToExport = onlyFiltered ? sortedAndFilteredResults : students;

    const headers = [
      'Candidate ID',
      'Class',
      'Class No',
      'English Name',
      'Session',
      'Group Number',
      'Report Time',
      'Exam Date',
      'Attendance Status',
      'Pronunciation & Delivery (0-6)',
      'Vocabulary & Language (0-6)',
      'Ideas & Organization (0-6)',
      'Communication Strategies (0-6)',
      'Individual Response (0-6)',
      'Total Marks (0-30)',
      'Remarks',
      'Marking Status'
    ];

    const rows = listToExport.map((s) => [
      s.id,
      s.class,
      s.no,
      s.ename,
      s.session,
      s.group,
      s.reportTime,
      s.date,
      s.attendance,
      s.marks.marked ? s.marks.pronunciation : '-',
      s.marks.marked ? s.marks.vocabulary : '-',
      s.marks.marked ? s.marks.ideas : '-',
      s.marks.marked ? s.marks.communication : '-',
      s.marks.marked ? s.marks.individualResponse : '-',
      s.marks.marked ? s.marks.total : '-',
      s.marks.marked ? `"${s.marks.remarks.replace(/"/g, '""')}"` : '""',
      s.marks.marked ? 'Marked' : 'Unmarked'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const filename = onlyFiltered
      ? `Speaking_Exam_Results_Filtered_${Date.now()}.csv`
      : 'Speaking_Exam_Results_Form_4_2026.csv';

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(
      onlyFiltered
        ? `Filtered ledger containing ${listToExport.length} candidates exported!`
        : 'All 167 global student results exported successfully!',
      'success'
    );
  };

  // Convert seconds to readable MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Design tokens based on Dark/Light Theme values
  const css = {
    canvas: darkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-[#0f172a]',
    sidebar: darkMode ? 'bg-[#09090b] border-r border-[#1f1f23]' : 'bg-white border-r border-[#e2e8f0]',
    card: darkMode ? 'bg-[#141416]/90 border border-[#1f1f23] rounded-3xl shadow-xl' : 'bg-white border border-[#e2e8f0] rounded-3xl shadow-sm',
    badgeSecondary: darkMode ? 'bg-[#1f1f23] text-[#a1a1aa] border border-[#27272a]' : 'bg-slate-100 text-slate-600 border border-slate-200',
    title: darkMode ? 'text-white' : 'text-slate-900',
    subtitle: darkMode ? 'text-[#a1a1aa]' : 'text-slate-500',
    input: darkMode ? 'bg-[#1f1f23] border-[#27272a] text-white focus:ring-blue-500focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600 focus:border-blue-600',
    trHover: darkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50',
    border: darkMode ? 'border-[#1f1f23]' : 'border-slate-100',
    buttonOutline: darkMode ? 'bg-[#1f1f23] border-[#27272a] text-[#f4f4f5] hover:bg-[#27272a]' : 'bg-white border-[#cbd5e1] text-slate-700 hover:bg-slate-50',
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${css.canvas}`}>
      
      {/* Top Mobile Bar */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b ${css.border} ${darkMode ? 'bg-[#09090b]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-xs">F4</span>
          </div>
          <span className="font-bold text-sm tracking-tight">Speaking Board</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${css.border}`}
            alt="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border ${css.border}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className={`lg:flex flex-col w-64 p-6 ${css.sidebar} ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl block w-72' : 'hidden'} lg:relative lg:block`}>
          
          {/* Close button for Mobile drawer */}
          {mobileMenuOpen && (
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs"
            >
              Close
            </button>
          )}

          <div className="flex items-center gap-3 mb-10 px-2 mt-2 lg:mt-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-extrabold text-[#f4f4f5] text-sm">F4</span>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block">Form 4A-K Exam</span>
              <span className="text-[10px] text-blue-500 font-semibold tracking-widest uppercase">Speaking Board</span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                  : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Dashboard Summary
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                  : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" />
                Take Attendance
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">Supervisor</span>
            </button>

            <button
              onClick={() => { setActiveTab('marks'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === 'marks'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                  : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Award className="w-4 h-4" />
                Input Student Marks
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-500 border border-purple-500/20 px-1.5 py-0.5 rounded">Teacher</span>
            </button>

            <button
              onClick={() => { setActiveTab('results'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                  : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4" />
                Results Sheet
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('timer'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === 'timer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                  : 'text-zinc-500 hover:text-blue-500 hover:bg-blue-500/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                Timer / Stopwatch
              </span>
              {isTimerRunning && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          </nav>

          {/* Quick timer reference card on sidebar */}
          <div className="mt-6 p-4 rounded-2xl border border-blue-500/10 bg-blue-600/[0.02]">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Preparation Countdown</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-mono tracking-tight font-extrabold text-blue-500">
                {stopwatchMode === 'countdown' ? formatTime(timeRemaining) : formatTime(countUpTime)}
              </span>
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className={`p-1.5 rounded-lg text-white ${isTimerRunning ? 'bg-amber-600' : 'bg-blue-600'}`}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-800">
            <div className="p-4 rounded-2xl bg-blue-900/[0.04] border border-blue-800/10">
              <p className="text-[10px] text-zinc-500 mb-1 tracking-wider uppercase font-bold">Shift &amp; Duty Date</p>
              <p className="text-xs font-semibold">11 June 2026 (08:30-12:00)</p>
              <p className="text-[10px] text-zinc-500 mt-2">Prep Rooms I &amp; II</p>
              <p className="text-[10px] text-zinc-500">Exam Rooms 5A - 5D</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Service Operational
              </div>
            </div>
            
            <button
              onClick={handleResetAllData}
              className="mt-4 w-full text-center py-2 text-[10px] text-red-500 hover:text-red-400 font-semibold uppercase tracking-widest border border-dashed border-red-500/20 rounded-xl hover:bg-red-500/5 transition-all"
            >
              Reset All Workspace
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
          
          {/* Main App Desktop Header */}
          <header className="hidden lg:flex items-center justify-between mb-8 pb-5 border-b border-zinc-800/20">
            <div>
              <h1 className="text-2xl font-black tracking-tight select-none">
                {activeTab === 'dashboard' && 'Supervisory Overview & Settings'}
                {activeTab === 'attendance' && 'Report Room Attendance Log'}
                {activeTab === 'marks' && 'Student Scoring Worksheet'}
                {activeTab === 'results' && 'Student Cumulative Results Sheet'}
                {activeTab === 'timer' && 'Timekeeper Station'}
              </h1>
              <p className="text-xs text-zinc-500">
                Form 4A-E Final Examination 2025-2026 • English Speaking Administration Board
              </p>
            </div>
            
            {/* Control buttons */}
            <div className="flex items-center gap-4">
              
              {/* Global Undo Trigger Button */}
              {history.length > 0 && (
                <button
                  onClick={() => handleUndo()}
                  className="px-3 py-1.5 rounded-2xl text-xs bg-amber-600/10 border border-amber-500/20 text-amber-500 font-bold hover:bg-amber-600/25 transition-all flex items-center gap-2"
                >
                  <Undo className="w-3.5 h-3.5" />
                  Undo Last Choice ({history.length} left)
                </button>
              )}

              {/* Theme Toggle bar */}
              <div className="flex bg-zinc-900/40 p-1 rounded-xl border border-zinc-805">
                <button
                  onClick={() => setDarkMode(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    darkMode ? 'bg-[#1f1f23] text-blue-400 shadow' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button
                  onClick={() => setDarkMode(false)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    !darkMode ? 'bg-white text-blue-600 shadow' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
              </div>

              {/* Active User Badge */}
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                  EP
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">English Panel</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Report &amp; Marks Duty</p>
                </div>
              </div>

            </div>
          </header>

          {/* Quick Stats banner for Mobile under the top border */}
          <div className="lg:hidden flex justify-between items-center mb-4 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 text-xs">
            <div>
              <span className="text-zinc-500">Present Rate:</span> <strong className="text-emerald-500">{stats.attendanceRate.toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Graded:</span> <strong>{stats.gradedTotal}/{stats.total}</strong>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => handleUndo()}
                className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold"
              >
                Undo Last ({history.length})
              </button>
            )}
          </div>

          {/* Toast Message banner */}
          {toast && (
            <div className={`fixed bottom-6 right-6 z-55 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-transform animate-bounce border ${
              toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400' 
              : toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/40 text-red-400'
              : 'bg-blue-950/90 border-blue-500/40 text-blue-400'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          )}

          {/* --- VIEW TABS CONTENTS --- */}
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Bento Row: Numbers Metrics (Grid 4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <div className={`${css.card} p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.01]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase">Attendance Rate</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black tracking-tight">{stats.attendanceRate.toFixed(1)}%</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {stats.present + stats.late} present / late out of {stats.total} total students
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                </div>

                {/* Metric 2 */}
                <div className={`${css.card} p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.01]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-emerald-500 uppercase">Marking Status</span>
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black tracking-tight">
                      {((stats.gradedTotal / stats.total) * 100).toFixed(1)}%
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {stats.gradedTotal} scored candidates • {stats.total - stats.gradedTotal} pending marks
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                </div>

                {/* Metric 3 */}
                <div className={`${css.card} p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-purple-500/[0.03] to-pink-500/[0.01]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-purple-500 uppercase">Average Exam Score</span>
                    <Award className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black tracking-tight">{stats.averageScore.toFixed(1)} <span className="text-xs font-normal text-zinc-500">/ 30</span></h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Calculated across all formatted {stats.gradedTotal} submitted grades
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>

                {/* Metric 4 */}
                <div className={`${css.card} p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.01]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">Absent / Late Toll</span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-black tracking-tight">{stats.absent} <span className="text-xs text-red-500 font-bold">Absent</span> / {stats.late} <span className="text-xs text-amber-500 font-bold font-mono">Late</span></h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {stats.unmarked} unmarked candidates remaining
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                </div>

              </div>

              {/* Middle Bento Row: Sessions Map (8 Columns) & Grade Distribution Chart (4 Columns) */}
              <div className="grid grid-cols-12 gap-4">
                
                {/* 1. Exam Session Info status chart (Double size Bento container) */}
                <div className="col-span-12 lg:col-span-8 p-6 rounded-3xl border border-zinc-800/10 bg-zinc-900/20 shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold">Speaking Examination Shift Progress Map</h2>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Completion stats for 42 student groups under different scheduling slots</p>
                    </div>
                    <span className="text-xs font-semibold py-1 px-2.5 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/20 font-mono text-[10px]">
                      Thursday, 11 June 2026
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800/30 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                          <th className="py-2.5">Session</th>
                          <th className="py-2.5">Prep Time</th>
                          <th className="py-2.5">Exam Time</th>
                          <th className="py-2.5">Groups</th>
                          <th className="py-2.5">Present Rate</th>
                          <th className="py-2.5">Scored Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/20">
                        {EXAM_SESSIONS.map((sess) => {
                          const sessStudents = students.filter((s) => s.session === sess.session);
                          const total = sessStudents.length;
                          const attended = sessStudents.filter((s) => s.attendance === 'Present' || s.attendance === 'Late').length;
                          const marked = sessStudents.filter((s) => s.marks.marked).length;
                          
                          const attPct = total > 0 ? (attended / total) * 100 : 0;
                          const markPct = total > 0 ? (marked / total) * 100 : 0;

                          return (
                            <tr key={sess.session} className={css.trHover}>
                              <td className="py-2.5 font-bold text-blue-500 font-mono">Session ({sess.session})</td>
                              <td className="py-2.5 font-mono text-[11px] font-bold">{sess.prepTime}</td>
                              <td className="py-2.5 font-mono text-[11px] text-zinc-500">{sess.examTime}</td>
                              <td className="py-2.5">
                                <span className="bg-[#1f1f23] text-zinc-400 text-[9px] px-2 py-0.5 rounded-md font-bold font-mono">
                                  G{sess.groups[0]} - G{sess.groups[sess.groups.length - 1]}
                                </span>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono">{attPct.toFixed(0)}%</span>
                                  <div className="w-12 bg-zinc-800/50 rounded-full h-1 overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${attPct}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono">{markPct.toFixed(0)}%</span>
                                  <div className="w-12 bg-zinc-800/50 rounded-full h-1 overflow-hidden">
                                    <div className="bg-purple-500 h-full" style={{ width: `${markPct}%` }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Grades distribution visual bento box */}
                <div className="col-span-12 lg:col-span-4 p-6 rounded-3xl border border-zinc-800/10 bg-zinc-900/20 shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-bold">Estimated Grade Index</h2>
                    <p className="text-[10px] text-zinc-500 mt-1">Based on global grading scale for {stats.gradedTotal} scored candidates</p>
                  </div>
                  
                  {/* Vertical bar charts manually plotted using divs */}
                  <div className="flex-1 flex items-end justify-around gap-2 my-6 h-36">
                    
                    {/* Grade A */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-600/15 border-t-2 border-blue-500 rounded-t-lg transition-all duration-300 relative group flex items-end justify-center" 
                           style={{ height: `${stats.gradedTotal > 0 ? (stats.countA / stats.gradedTotal) * 100 : 5}%` }}>
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-blue-500">
                          {stats.countA}
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-2">A</span>
                      <span className="text-[9px] text-zinc-500">(&gt;=24)</span>
                    </div>

                    {/* Grade B */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-emerald-600/15 border-t-2 border-emerald-500 rounded-t-lg transition-all duration-300 relative flex items-end justify-center" 
                           style={{ height: `${stats.gradedTotal > 0 ? (stats.countB / stats.gradedTotal) * 100 : 5}%` }}>
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-emerald-500">
                          {stats.countB}
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-2">B</span>
                      <span className="text-[9px] text-zinc-500">(18-23)</span>
                    </div>

                    {/* Grade C */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-amber-600/15 border-t-2 border-amber-500 rounded-t-lg transition-all duration-300 relative flex items-end justify-center" 
                           style={{ height: `${stats.gradedTotal > 0 ? (stats.countC / stats.gradedTotal) * 100 : 5}%` }}>
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-amber-500">
                          {stats.countC}
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-2">C</span>
                      <span className="text-[9px] text-zinc-500">(12-17)</span>
                    </div>

                    {/* Grade D / F */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-red-600/15 border-t-2 border-red-500 rounded-t-lg transition-all duration-300 relative flex items-end justify-center" 
                           style={{ height: `${stats.gradedTotal > 0 ? (stats.countD / stats.gradedTotal) * 100 : 5}%` }}>
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-red-500">
                          {stats.countD}
                        </span>
                      </div>
                      <span className="text-xs font-bold mt-2">D / F</span>
                      <span className="text-[9px] text-zinc-500">(&lt;12)</span>
                    </div>

                  </div>

                  <div className="border-t border-zinc-800/20 pt-3 text-[10px] text-zinc-500 text-center leading-relaxed">
                    Students are graded out of 30 total marks (5 domains x 6 level criteria).
                  </div>
                </div>

              </div>

              {/* Bottom Row: Exam Logistics and History Tracker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Audit / History Log of supervisor actions */}
                <div className={`${css.card} p-6 flex flex-col`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold">System Actions Log</h2>
                      <p className="text-[10px] text-zinc-500">Confirm or undo the attendance and mark entries</p>
                    </div>
                    {history.length > 0 && (
                      <button
                        onClick={() => handleUndo()}
                        className="text-[10.5px] text-blue-500 hover:underline flex items-center gap-1.5 font-semibold"
                      >
                        <Undo className="w-3 h-3" />
                        Undo Last Action
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 max-h-56 overflow-y-auto pr-1">
                    {history.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-xs">No administrative actions logged in this session.</p>
                      </div>
                    ) : (
                      history.map((act) => (
                        <div key={act.id} className="flex items-start justify-between p-3 rounded-2xl bg-[#1c1c1e]/40 border border-zinc-800/20 text-xs">
                          <div className="space-y-1 pr-2">
                            <p className="font-semibold text-zinc-50">{act.description}</p>
                            <p className="text-[9px] text-zinc-500">
                              {new Date(act.timestamp).toLocaleTimeString()} • ID: {act.id}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUndo(act.id)}
                            className="bg-zinc-800 hover:bg-zinc-700 hover:text-white px-2.5 py-1 rounded-xl text-[10px] border border-zinc-700 text-zinc-300 font-semibold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                          >
                            <Undo className="w-2.5 h-2.5" /> Undo Choice
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Key Speaking Guidelines and Schedule constraints briefing */}
                <div className={`${css.card} p-6 flex flex-col justify-between`}>
                  <div>
                    <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      F.4 Speaking Exam Directives Sheet
                    </h2>
                    
                    <ul className="space-y-2 text-xs text-zinc-400">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>
                          <strong>Supervisor Attendance Labeling:</strong> Give each present candidate one physical name label card before prep-timer starts.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>
                          <strong>Discussion Prep Stage:</strong> Exactly 10 minutes discussion preparation (Supervisor counts down 10:00). No talking or written collaboration.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>
                          <strong>Speaking Assessment Breakdown:</strong> Part 1: Group Discussion. Part 2: Individual Response (Examiners grade 5 segments from levels 0 to 6).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <span>
                          <strong>Punctuality &amp; Penalties:</strong> Latecomers use remaining prep time; no extra is allowed. Immediate school ground exit post-exam to prevent leaking prep details.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-3 text-[10px] text-zinc-500 leading-relaxed mt-4">
                    Report room Supervisors: English Rooms I &amp; II. Exams are hosted in classrooms 5A to 5D. 
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TAKE ATTENDANCE VIEW */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              
              {/* Header block with search & filters */}
              <div className={`${css.card} p-6`}>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold">Preparation Room Attendance Log</h2>
                    <p className="text-xs text-zinc-500">Record candidate arrivals, designate name label pins, and queue them for prep time.</p>
                  </div>
                  
                  {/* Master stats inside view */}
                  <div className="flex items-center gap-3 bg-[#1c1c1e]/40 border border-zinc-800/10 p-2.5 rounded-2xl text-xs max-w-xs justify-around">
                    <div className="text-center px-2">
                      <p className="text-[10px] text-zinc-500 leading-none">Present</p>
                      <p className="text-sm font-bold mt-1 text-emerald-500">{stats.present}</p>
                    </div>
                    <div className="text-center px-2 border-l border-zinc-800">
                      <p className="text-[10px] text-zinc-500 leading-none">Absent</p>
                      <p className="text-sm font-bold mt-1 text-red-500">{stats.absent}</p>
                    </div>
                    <div className="text-center px-2 border-l border-zinc-800">
                      <p className="text-[10px] text-zinc-500 leading-none">Late</p>
                      <p className="text-sm font-bold mt-1 text-amber-500">{stats.late}</p>
                    </div>
                    <div className="text-center px-2 border-l border-zinc-800">
                      <p className="text-[10px] text-zinc-500 leading-none">Pending</p>
                      <p className="text-sm font-bold mt-1 text-zinc-400">{stats.unmarked}</p>
                    </div>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1.5">Scheduled Session</label>
                    <div className="relative">
                      <select
                        value={sessionFilter}
                        onChange={(e) => setSessionFilter(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${css.input} appearance-none`}
                      >
                        <option value="All">All Sessions (A - K)</option>
                        {EXAM_SESSIONS.map((s) => (
                          <option key={s.session} value={s.session}>
                            Session {s.session} ({s.prepTime})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1.5">Group Number</label>
                    <div className="relative">
                      <select
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${css.input} appearance-none`}
                      >
                        <option value="All">All Groups</option>
                        {availableGroups.map((g) => (
                          <option key={g} value={g}>Group {g}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1.5">Form 4 Class</label>
                    <div className="relative">
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border ${css.input} appearance-none`}
                      >
                        <option value="All">All Classes</option>
                        <option value="4A">4A</option>
                        <option value="4B">4B</option>
                        <option value="4C">4C</option>
                        <option value="4D">4D</option>
                        <option value="4E">4E</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1.5">Quick Search</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search Candidate name, ID, class"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${css.input}`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Attendance layout: Candidate list on Left, Candidate Label Card mockup on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* List Container (Left) */}
                <div className="col-span-12 lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between px-2 text-xs">
                    <span className="text-zinc-500 font-bold">Candidates Found: {filteredStudents.length}</span>
                    <span className="text-zinc-500">Unmarked in list: {filteredStudents.filter((f) => f.attendance === 'Unmarked').length}</span>
                  </div>

                  <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
                    {filteredStudents.length === 0 ? (
                      <div className={`${css.card} p-12 text-center text-zinc-500`}>
                        <Search className="w-12 h-12 mx-auto opacity-10 mb-2" />
                        <p className="text-sm font-bold">No candidates matches specified filters.</p>
                        <button
                          onClick={() => { setSessionFilter('All'); setGroupFilter('All'); setClassFilter('All'); setSearchQuery(''); }}
                          className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-white text-xs font-semibold"
                        >
                          Clear Attendance Filters
                        </button>
                      </div>
                    ) : (
                      filteredStudents.map((student) => {
                        return (
                          <div
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer transition-all border ${
                              selectedStudentId === student.id
                                ? 'bg-blue-600/5 border-blue-500/40 relative shadow-md'
                                : `${css.card} hover:border-zinc-700/60`
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Avatar design */}
                              <div className={`w-10 h-10 rounded-full font-extrabold text-[12px] flex items-center justify-center shrink-0 ${
                                student.attendance === 'Present'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/5'
                                : student.attendance === 'Absent'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-red-500/5'
                                : student.attendance === 'Late'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/5'
                                : 'bg-[#1f1f23] text-zinc-400 border border-zinc-800'
                              }`}>
                                {student.class}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm tracking-tight">{student.ename}</span>
                                  <span className="text-[10px] text-zinc-500 select-none">#{student.id}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                                  <span>Class No: <strong>{student.no}</strong></span>
                                  <span>•</span>
                                  <span>Session: <strong className="text-blue-500 font-mono">({student.session})</strong></span>
                                  <span>•</span>
                                  <span>Group: <strong className="text-amber-500">Group {student.group}</strong></span>
                                  <span>•</span>
                                  <span>Report Time: <strong className="font-mono">{student.reportTime}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Active Choice buttons. Each Choice triggers the history and can be easily undone */}
                            <div className="flex items-center gap-1.5 self-end md:self-auto uppercase tracking-tighter shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleAttendanceChange(student.id, 'Present')}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border transition-all ${
                                  student.attendance === 'Present'
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-zinc-800/40 text-emerald-500 border-zinc-800/80 hover:bg-emerald-500/10'
                                }`}
                              >
                                Present
                              </button>
                              
                              <button
                                onClick={() => handleAttendanceChange(student.id, 'Late')}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border transition-all ${
                                  student.attendance === 'Late'
                                    ? 'bg-amber-600 text-white border-amber-500'
                                    : 'bg-zinc-800/40 text-amber-500 border-zinc-800/80 hover:bg-amber-500/10'
                                }`}
                              >
                                Late
                              </button>

                              <button
                                onClick={() => handleAttendanceChange(student.id, 'Absent')}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border transition-all ${
                                  student.attendance === 'Absent'
                                    ? 'bg-red-600 text-white border-red-500'
                                    : 'bg-zinc-800/40 text-red-500 border-zinc-800/80 hover:bg-red-500/10'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Name Tag Preview Area & Quick Undo Logs (Right) */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  
                  {/* Label card mockups based on guidelines ("give each student one name label. Students should place the name labels on their chests") */}
                  <div className={`${css.card} p-6 border-blue-600/10 relative overflow-hidden bg-gradient-to-tr from-blue-900/[0.04] to-zinc-900/10 flex flex-col justify-between min-h-[300px]`}>
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-800/20 pb-3 mb-4">
                        <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-extrabold flex items-center gap-1.5">
                          <Printer className="w-3.5 h-3.5 text-blue-500" />
                          Candidate Label Pin View
                        </span>
                        <span className="text-[9px] bg-blue-600/15 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                          100% Authentic
                        </span>
                      </div>

                      {(() => {
                        const target = students.find((s) => s.id === selectedStudentId);
                        if (!target) {
                          return (
                            <div className="text-center py-10 text-zinc-500">
                              <Printer className="w-10 h-10 mx-auto opacity-20 mb-3" />
                              <p className="text-xs">Select a student from the list to preview their official physical breast-pin name label.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {/* Real paper badge design block */}
                            <div className="p-6 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-md text-center space-y-3 font-sans relative">
                              <div className="absolute top-2 left-2 text-[9px] font-bold text-slate-400">
                                FORM 4 ENGLISH SPEAKING EXAM 2026
                              </div>
                              
                              <div className="text-2xl font-black text-blue-800 tracking-tight leading-none mt-2">
                                {target.ename.toUpperCase()}
                              </div>
                              
                              <div className="flex justify-around items-center pt-2 border-t border-dashed border-slate-300">
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Class Info</p>
                                  <p className="text-sm font-black text-slate-850 font-mono">{target.class} ({target.no})</p>
                                </div>
                                <div className="border-l border-slate-200 h-6"></div>
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Session Key</p>
                                  <p className="text-sm font-black text-slate-850 font-mono">Sess {target.session}</p>
                                </div>
                                <div className="border-l border-slate-200 h-6"></div>
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Group No</p>
                                  <p className="text-sm font-black text-blue-800 font-mono">Group {target.group}</p>
                                </div>
                              </div>

                              <div className="bg-slate-100 py-1.5 px-3 rounded-lg text-[9px] font-bold text-slate-600 flex items-center justify-between">
                                <span>CANDIDATE SEQ: #{target.id}</span>
                                <span>REPORT TIME: {target.reportTime}</span>
                              </div>
                            </div>

                            <div className="text-center text-[11px] text-zinc-500 leading-normal">
                              ⚠️ Check chest label and school uniform before admitting. Label must be visible to oral examiners and peer speakers at 5A-5D.
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="border-t border-zinc-800/10 pt-3 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Selection ID: {selectedStudentId ? `#${selectedStudentId}` : 'None'}</span>
                      {selectedStudentId && (
                        <button
                          onClick={() => window.print()}
                          className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Print Label
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Immediate undo shortcuts log box */}
                  <div className={`${css.card} p-5 space-y-3`}>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">Attendance Log Undo</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {history.filter(h => h.type === 'attendance').length === 0 ? (
                        <p className="text-[10px] text-zinc-500 italic">No attendance revisions recorded yet.</p>
                      ) : (
                        history.filter(h => h.type === 'attendance').slice(0, 4).map((hist) => (
                          <div key={hist.id} className="flex justify-between items-center text-[11px] bg-[#1c1c1e]/40 p-2.5 rounded-xl border border-zinc-800/10">
                            <span className="text-zinc-400 select-none">
                              {hist.studentName} → <strong className="text-blue-500">{hist.newAttendance}</strong>
                            </span>
                            <button
                              onClick={() => handleUndo(hist.id)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              Undo
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: INPUT STUDENT MARKS VIEW */}
          {activeTab === 'marks' && (
            <div className="space-y-6">
              
              {/* Header card info */}
              <div className={`${css.card} p-6`}>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold">English Examiner Evaluation Console</h2>
                    <p className="text-xs text-zinc-500">
                      Standardized grading for Part 1 (Group Discussion) &amp; Part 2 (Individual Response). Level criteria limits: 0 to 6.
                    </p>
                  </div>

                  {/* Filter elements inside scoring tab to quickly find speakers */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={sessionFilter}
                      onChange={(e) => setSessionFilter(e.target.value)}
                      className={`px-3 py-1.5 text-xs rounded-xl border ${css.input}`}
                    >
                      <option value="All">All Sessions</option>
                      {EXAM_SESSIONS.map((s) => (
                        <option key={s.session} value={s.session}>Session {s.session}</option>
                      ))}
                    </select>

                    <select
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      className={`px-3 py-1.5 text-xs rounded-xl border ${css.input}`}
                    >
                      <option value="All">All Groups</option>
                      {availableGroups.map((g) => (
                        <option key={g} value={g}>Group {g}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Search surname..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`px-3 py-1.5 text-xs rounded-xl border ${css.input} w-32`}
                    />
                  </div>
                </div>
              </div>

              {/* Main Split panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Peer speakers index select (Left) */}
                <div className="col-span-12 lg:col-span-4 space-y-2">
                  <div className="flex items-center justify-between px-2 text-xs text-zinc-500 font-bold">
                    <span>Candidates matching filter: {filteredStudents.length}</span>
                    <span>Scored: {filteredStudents.filter((f) => f.marks.marked).length}</span>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                    {filteredStudents.length === 0 ? (
                      <div className={`${css.card} p-10 text-center text-zinc-500`}>
                        <Search className="w-8 h-8 mx-auto opacity-10 mb-2" />
                        <p className="text-xs">No students fit. Try shifting session/group selections.</p>
                      </div>
                    ) : (
                      filteredStudents.map((stud) => {
                        const scoreSubmitted = stud.marks.marked;
                        return (
                          <div
                            key={stud.id}
                            onClick={() => handleSelectStudentForScoring(stud)}
                            className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                              selectedStudentId === stud.id
                                ? 'bg-blue-600/5 border-blue-500/40 shadow-sm'
                                : `${css.card} hover:bg-zinc-800/20`
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs">{stud.ename}</span>
                                <span className="text-[10px] text-zinc-500">({stud.class} #{stud.no})</span>
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Session {stud.session} • Group {stud.group}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status Indicators */}
                              {stud.attendance !== 'Present' && stud.attendance !== 'Late' ? (
                                <span className="text-[9px] bg-red-500/10 text-red-500 font-bold border border-red-500/20 px-2 py-0.5 rounded-lg uppercase">
                                  {stud.attendance}
                                </span>
                              ) : scoreSubmitted ? (
                                <span className="text-[9px] bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-lg font-bold font-mono">
                                  {stud.marks.total} Marks
                                </span>
                              ) : (
                                <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-lg border border-zinc-700 font-bold uppercase">
                                  Pending Sc
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Specific Marks inputs with buttons (Right) */}
                <div className="col-span-12 lg:col-span-8">
                  {(() => {
                    const target = students.find((s) => s.id === selectedStudentId);
                    if (!target) {
                      return (
                        <div className={`${css.card} p-16 text-center text-zinc-500 flex flex-col items-center justify-center h-full min-h-[400px]`}>
                          <Award className="w-12 h-12 text-zinc-600 opacity-20 mb-3" />
                          <h4 className="text-base font-bold text-zinc-300">No Student Selected for Scoring</h4>
                          <p className="text-xs max-w-sm mt-1">Select a candidate student on the left deck to view and input their levels of speaking assessment.</p>
                        </div>
                      );
                    }

                    const isAbsent = target.attendance === 'Absent' || target.attendance === 'Unmarked';

                    return (
                      <form onSubmit={handleSubmitMarks} className={`${css.card} p-6 space-y-6 relative`}>
                        
                        {/* Selected speaker summary header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800/10 pb-4 gap-2">
                          <div>
                            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest block mb-0.5">Scoring Candidate Paper</span>
                            <h3 className="text-xl font-bold">{target.ename}</h3>
                            <p className="text-xs text-zinc-500 mt-1">
                              Class: <strong className="text-zinc-300">{target.class} ({target.no})</strong> • Group: <strong className="text-zinc-300">{target.group}</strong> • Registered Seq No: <strong className="text-blue-500 font-mono">#{target.id}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Attendance warning banner */}
                            {isAbsent && (
                              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                Student absent or unmarked!
                              </div>
                            )}
                            
                            {/* Calculation preview */}
                            <div className="bg-[#1c1c1e]/80 border border-zinc-800/20 px-4 py-2 rounded-2xl text-center">
                              <p className="text-[8px] text-zinc-500 font-extrabold uppercase">Total Score</p>
                              <p className="text-2xl font-black text-blue-500 font-mono">
                                {isAbsent ? 0 : pronunciation + vocabulary + ideas + communication + individualResponse}
                                <span className="text-xs font-normal text-zinc-500"> / 30</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sliders and Touch score buttons */}
                        <div className={`space-y-4 ${isAbsent ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                          
                          {/* Segment 1 */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="font-bold text-xs">A. Pronunciation &amp; Delivery (0 - 6)</span>
                                <p className="text-[10px] text-zinc-500">Clearness of sounds, syllable stress, intonation patterns, volume &amp; fluency.</p>
                              </div>
                              <span className="font-mono font-bold text-blue-500 text-sm bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{pronunciation}</span>
                            </div>
                            <div className="flex gap-1.5 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => setPronunciation(num)}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    pronunciation === num 
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/10 scale-105' 
                                    : 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Segment 2 */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="font-bold text-xs">B. Vocabulary &amp; Language Patterns (0 - 6)</span>
                                <p className="text-[10px] text-zinc-500">Appropriate vocabulary choice and correct structure of speaking points.</p>
                              </div>
                              <span className="font-mono font-bold text-blue-500 text-sm bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{vocabulary}</span>
                            </div>
                            <div className="flex gap-1.5 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => setVocabulary(num)}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    vocabulary === num 
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/10 scale-105' 
                                    : 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Segment 3 */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="font-bold text-xs">C. Ideas &amp; Organization (0 - 6)</span>
                                <p className="text-[10px] text-zinc-500">Cohesion of arguments, brainstorming capacity, structure and supporting details.</p>
                              </div>
                              <span className="font-mono font-bold text-blue-500 text-sm bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{ideas}</span>
                            </div>
                            <div className="flex gap-1.5 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => setIdeas(num)}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    ideas === num 
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/10 scale-105' 
                                    : 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Segment 4 */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="font-bold text-xs">D. Communication Strategies (0 - 6)</span>
                                <p className="text-[10px] text-zinc-500">Eye contact, body language gesture, prompt interaction, turntaking, and active listening.</p>
                              </div>
                              <span className="font-mono font-bold text-blue-500 text-sm bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{communication}</span>
                            </div>
                            <div className="flex gap-1.5 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => setCommunication(num)}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    communication === num 
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/10 scale-105' 
                                    : 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Segment 5 */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <span className="font-bold text-xs">E. Part 2: Individual Response (0 - 6)</span>
                                <p className="text-[10px] text-zinc-500">Responsiveness to the examiner's follow-up questions, elaboration limits.</p>
                              </div>
                              <span className="font-mono font-bold text-blue-500 text-sm bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">{individualResponse}</span>
                            </div>
                            <div className="flex gap-1.5 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => setIndividualResponse(num)}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    individualResponse === num 
                                    ? 'bg-blue-600 text-white shadow shadow-blue-500/10 scale-105' 
                                    : 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Remarks area */}
                          <div>
                            <label className="block text-xs font-bold mb-1.5">Examiner Qualitative Remarks / Observations</label>
                            <textarea
                              rows={2}
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Write key performance points here e.g. 'Strong vocab, cohesive layout, slight delivery hesitation..."
                              className={`w-full px-3 py-2 text-xs rounded-xl border ${css.input}`}
                            />
                          </div>

                        </div>

                        {/* Undo Marks Submission inline button */}
                        <div className="flex items-center justify-between border-t border-zinc-800/10 pt-4">
                          <div>
                            {target.marks.marked ? (
                              <p className="text-[10.5px] text-emerald-500 font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" /> Scores Submitted • Marks recorded in Sheet
                              </p>
                            ) : (
                              <p className="text-[10px] text-zinc-500 italic">Score draft is temporarily held in local memory.</p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            {/* Revert Specific entry with Undo history trigger */}
                            {history.some((h) => h.studentId === target.id && h.type === 'marks') && (
                              <button
                                type="button"
                                onClick={() => {
                                  const matchingAction = history.find((h) => h.studentId === target.id && h.type === 'marks');
                                  if (matchingAction) handleUndo(matchingAction.id);
                                }}
                                className="px-4 py-2 bg-amber-600/10 border border-amber-500/20 hover:bg-[#1c1c1e] text-amber-500 text-xs font-bold rounded-xl transition-all"
                              >
                                Revert Marks Entry
                              </button>
                            )}
                            
                            <button
                              type="submit"
                              disabled={isAbsent}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                                isAbsent 
                                ? 'bg-zinc-800 cursor-not-allowed text-zinc-500 shadow-none' 
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/10'
                              }`}
                            >
                              {target.marks.marked ? 'Recalculate & Save Changes' : 'Submit Candidate Marks'}
                            </button>
                          </div>
                        </div>

                      </form>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: STUDENT RESULTS SHEET VIEW */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              
              {/* Controls block */}
              <div className={`${css.card} p-6 bg-gradient-to-r from-blue-900/[0.04] to-zinc-900/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                    Speaking Examination Cumulative Results Sheet
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Comprehensive ledger of grades, attendance, and exam marks. Feel free to filter, search, and click column headers to sort candidates.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                  {/* Filtered CSV export button */}
                  <button
                    onClick={() => handleExportCSV(true)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export Filtered CSV ({sortedAndFilteredResults.length})
                  </button>

                  {/* Master spreadsheet download button */}
                  <button
                    onClick={() => handleExportCSV(false)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow shadow-black/10 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-zinc-600" />
                    Export Complete Ledger (All {students.length})
                  </button>
                </div>
              </div>

              {/* Data Table block (Bento item with high responsive support) */}
              <div className={`${css.card} p-6 flex flex-col`}>
                
                {/* Embedded dynamic filters in results sheet tab */}
                <div className="space-y-4 mb-6 pb-6 border-b border-zinc-800/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Name / ID Search */}
                    <div className="relative">
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block mb-1">Search Candidate Name or ID</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="w-4 h-4 text-zinc-500" />
                        </span>
                        <input
                          type="text"
                          value={resultsNameFilter}
                          onChange={(e) => setResultsNameFilter(e.target.value)}
                          placeholder="Type name or ID to filter..."
                          className={`${css.input} pl-9 pr-4 py-2 w-full text-xs rounded-xl border focus:outline-none transition-all`}
                        />
                        {resultsNameFilter && (
                          <button
                            onClick={() => setResultsNameFilter('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white text-xs font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Class Selector dropdown */}
                    <div>
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block mb-1">Form Class Filter</label>
                      <select
                        value={resultsClassFilter}
                        onChange={(e) => setResultsClassFilter(e.target.value)}
                        className={`${css.input} px-3 py-2 w-full text-xs rounded-xl border focus:outline-none transition-all cursor-pointer`}
                      >
                        <option value="All">All Form Classes</option>
                        {resultsClassOptions.filter(c => c !== 'All').map((c) => (
                          <option key={c} value={c}>Class {c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date picker (Start) */}
                    <div>
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block mb-1">Exam Date Range (Start)</label>
                      <input
                        type="date"
                        value={resultsStartDate}
                        onChange={(e) => setResultsStartDate(e.target.value)}
                        className={`${css.input} px-3 py-2 w-full text-xs rounded-xl border focus:outline-none transition-all`}
                      />
                    </div>

                    {/* Date picker (End) */}
                    <div>
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-300 block mb-1">Exam Date Range (End)</label>
                      <input
                        type="date"
                        value={resultsEndDate}
                        onChange={(e) => setResultsEndDate(e.target.value)}
                        className={`${css.input} px-3 py-2 w-full text-xs rounded-xl border focus:outline-none transition-all`}
                      />
                    </div>
                  </div>

                  {/* Filter Status Badge and Quick Range presets */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] w-full sm:w-auto">
                      <span className="text-zinc-500 font-bold mr-1 shrink-0">Day Presets:</span>
                      <button
                        onClick={() => { setResultsStartDate(''); setResultsEndDate(''); }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                          !resultsStartDate && !resultsEndDate
                            ? 'bg-blue-600/10 text-blue-500 border-blue-500/25 shadow-sm'
                            : `${css.badgeSecondary} hover:text-white hover:border-zinc-700`
                        }`}
                      >
                        All Scheduled Days
                      </button>
                      <button
                        onClick={() => { setResultsStartDate('2026-06-11'); setResultsEndDate('2026-06-11'); }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                          resultsStartDate === '2026-06-11' && resultsEndDate === '2026-06-11'
                            ? 'bg-blue-600/10 text-blue-500 border-blue-500/25 shadow-sm'
                            : `${css.badgeSecondary} hover:text-white hover:border-zinc-700`
                        }`}
                      >
                        Day 1 (11 Jun)
                      </button>
                      <button
                        onClick={() => { setResultsStartDate('2026-06-12'); setResultsEndDate('2026-06-12'); }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                          resultsStartDate === '2026-06-12' && resultsEndDate === '2026-06-12'
                            ? 'bg-blue-600/10 text-blue-500 border-blue-500/25 shadow-sm'
                            : `${css.badgeSecondary} hover:text-white hover:border-zinc-700`
                        }`}
                      >
                        Day 2 (12 Jun)
                      </button>
                      <button
                        onClick={() => { setResultsStartDate('2026-06-15'); setResultsEndDate('2026-06-15'); }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                          resultsStartDate === '2026-06-15' && resultsEndDate === '2026-06-15'
                            ? 'bg-blue-600/10 text-blue-500 border-blue-500/25 shadow-sm'
                            : `${css.badgeSecondary} hover:text-white hover:border-zinc-700`
                        }`}
                      >
                        Day 3 (15 Jun)
                      </button>
                    </div>

                    <div className="flex gap-2 items-center text-xs shrink-0 self-end sm:self-auto">
                      <span className="text-zinc-500 font-bold">Active filters:</span>
                      <span className="px-2.5 py-1 bg-zinc-800 rounded-xl text-zinc-300 font-mono text-[10px]">
                        Class: {resultsClassFilter} • Name: {resultsNameFilter || 'Any'} • Date: {resultsStartDate ? `${resultsStartDate.replace('2026-06-', '')} to ${resultsEndDate.replace('2026-06-', '')}` : 'All'}
                      </span>
                      {(resultsClassFilter !== 'All' || resultsNameFilter !== '' || resultsStartDate !== '' || resultsEndDate !== '') && (
                        <button
                          onClick={() => {
                            setResultsClassFilter('All');
                            setResultsNameFilter('');
                            setResultsStartDate('');
                            setResultsEndDate('');
                            triggerToast('Cleared results sheet filters!', 'info');
                          }}
                          className="text-xs text-blue-500 hover:underline font-semibold"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table with interactive click-sort columns */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-c800/30 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                        {/* Seq ID Header */}
                        <th 
                          onClick={() => toggleResultsSort('id')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1 active:text-blue-500">
                            Seq #
                            <span className={resultsSortKey === 'id' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 invisible group-hover:visible ml-0.5'}>
                              {resultsSortKey === 'id' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Candidate Name Header */}
                        <th 
                          onClick={() => toggleResultsSort('ename')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Candidate
                            <span className={resultsSortKey === 'ename' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'ename' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Class Header */}
                        <th 
                          onClick={() => toggleResultsSort('class')} 
                          className="py-3 px-3 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Class (Roll)
                            <span className={resultsSortKey === 'class' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'class' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Session Header */}
                        <th 
                          onClick={() => toggleResultsSort('session')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Session
                            <span className={resultsSortKey === 'session' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'session' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Group Header */}
                        <th 
                          onClick={() => toggleResultsSort('group')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Group
                            <span className={resultsSortKey === 'group' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'group' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Exam Date Header */}
                        <th 
                          onClick={() => toggleResultsSort('date')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Exam Date
                            <span className={resultsSortKey === 'date' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'date' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Attendance Header */}
                        <th 
                          onClick={() => toggleResultsSort('attendance')} 
                          className="py-3 px-2 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Attendance
                            <span className={resultsSortKey === 'attendance' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'attendance' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▲'}
                            </span>
                          </div>
                        </th>

                        {/* Pron Scoring Column */}
                        <th 
                          onClick={() => toggleResultsSort('pronunciation')} 
                          className="py-3 px-1 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Pron
                            {resultsSortKey === 'pronunciation' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Vocab Scoring Column */}
                        <th 
                          onClick={() => toggleResultsSort('vocabulary')} 
                          className="py-3 px-1 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Vocab
                            {resultsSortKey === 'vocabulary' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Ideas Scoring Column */}
                        <th 
                          onClick={() => toggleResultsSort('ideas')} 
                          className="py-3 px-1 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Ideas
                            {resultsSortKey === 'ideas' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Comm Scoring Column */}
                        <th 
                          onClick={() => toggleResultsSort('communication')} 
                          className="py-3 px-1 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Comm
                            {resultsSortKey === 'communication' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Indiv Scoring Column */}
                        <th 
                          onClick={() => toggleResultsSort('individualResponse')} 
                          className="py-3 px-1 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Indiv
                            {resultsSortKey === 'individualResponse' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Total Marks Out of 30 Column */}
                        <th 
                          onClick={() => toggleResultsSort('total')} 
                          className="py-3 px-2 text-center font-bold cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            Total (30)
                            <span className={resultsSortKey === 'total' ? 'text-blue-500 ml-0.5' : 'text-zinc-600 ml-0.5'}>
                              {resultsSortKey === 'total' ? (resultsSortOrder === 'asc' ? '▲' : '▼') : '▼'}
                            </span>
                          </div>
                        </th>

                        {/* Level mapping column */}
                        <th 
                          onClick={() => toggleResultsSort('level')} 
                          className="py-3 px-2 text-center cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            Grade lvl
                            {resultsSortKey === 'level' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>

                        {/* Remarks Column */}
                        <th 
                          onClick={() => toggleResultsSort('remarks')} 
                          className="py-3 px-4 cursor-pointer hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            Remarks
                            {resultsSortKey === 'remarks' && (resultsSortOrder === 'asc' ? '▲' : '▼')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/20 font-sans">
                      {sortedAndFilteredResults.length === 0 ? (
                        <tr>
                          <td colSpan={15} className="py-12 text-center text-zinc-500">
                            No candidates match your filters. Try selecting "All Scheduled Days" or adjust form classes.
                          </td>
                        </tr>
                      ) : (
                        sortedAndFilteredResults.map((candidate) => {
                          const m = candidate.marks;
                          const hasMarks = m.marked;

                          // calculate dynamic grade level
                          let level = '-';
                          let lvlColor = 'text-zinc-500';
                          if (hasMarks) {
                            if (m.total >= 24) { level = 'Level 5 (A)'; lvlColor = 'text-blue-500 font-bold'; }
                            else if (m.total >= 18) { level = 'Level 4 (B)'; lvlColor = 'text-emerald-500 font-medium'; }
                            else if (m.total >= 12) { level = 'Level 3 (C)'; lvlColor = 'text-amber-500'; }
                            else if (m.total >= 6) { level = 'Level 2 (D)'; lvlColor = 'text-orange-400'; }
                            else { level = 'Level 1 (U)'; lvlColor = 'text-red-400 font-bold'; }
                          }

                          return (
                            <tr key={candidate.id} className={`${css.trHover} transition-all`}>
                              <td className="py-3 px-2 font-mono font-bold text-zinc-400">#{candidate.id}</td>
                              <td className="py-3 px-2 font-bold">{candidate.ename}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold ${
                                  candidate.class.startsWith('4A') ? 'bg-amber-500/10 text-amber-500' :
                                  candidate.class.startsWith('4B') ? 'bg-blue-500/10 text-blue-500' :
                                  candidate.class.startsWith('4C') ? 'bg-purple-500/10 text-purple-500' :
                                  candidate.class.startsWith('4D') ? 'bg-emerald-500/10 text-emerald-500' :
                                  'bg-pink-500/10 text-pink-500'
                                }`}>
                                  {candidate.class} ({candidate.no})
                                </span>
                              </td>
                              <td className="py-3 px-2 font-bold text-zinc-400 font-mono">{candidate.session}</td>
                              <td className="py-3 px-2 font-mono">G{candidate.group}</td>
                              <td className="py-3 px-2 font-mono text-zinc-400 whitespace-nowrap">
                                {candidate.date === '2026-06-11' ? '11 Jun 2026' :
                                 candidate.date === '2026-06-12' ? '12 Jun 2026' :
                                 candidate.date === '2026-06-15' ? '15 Jun 2026' : candidate.date}
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                  candidate.attendance === 'Present'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm'
                                    : candidate.attendance === 'Late'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm'
                                    : candidate.attendance === 'Absent'
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                  {candidate.attendance}
                                </span>
                              </td>
                              <td className="py-3 px-1 text-center font-mono text-zinc-400">{hasMarks ? m.pronunciation : '-'}</td>
                              <td className="py-3 px-1 text-center font-mono text-zinc-400">{hasMarks ? m.vocabulary : '-'}</td>
                              <td className="py-3 px-1 text-center font-mono text-zinc-400">{hasMarks ? m.ideas : '-'}</td>
                              <td className="py-3 px-1 text-center font-mono text-zinc-400">{hasMarks ? m.communication : '-'}</td>
                              <td className="py-3 px-1 text-center font-mono text-zinc-400">{hasMarks ? m.individualResponse : '-'}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`font-black font-mono text-sm ${hasMarks ? 'text-blue-500' : 'text-zinc-500'}`}>
                                  {hasMarks ? m.total : '-'}
                                </span>
                              </td>
                              <td className={`py-3 px-2 text-center text-[10px] font-bold ${lvlColor}`}>{level}</td>
                              <td className="py-3 px-4 max-w-xs truncate text-[11px] text-zinc-400 italic" title={m.remarks}>
                                {m.remarks || <span className="text-zinc-600">-</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Stats / Reset link */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 mt-6 pt-4 border-t border-zinc-800/20 gap-3">
                  <span>Filtered Candidates shown above: <strong>{sortedAndFilteredResults.length}</strong> (Out of {students.length} global database roster)</span>
                  <div className="flex gap-4">
                    <span>Attendance Rate: <strong className="text-emerald-500 font-mono">{stats.attendanceRate.toFixed(1)}%</strong></span>
                    <span>Grading Completed: <strong className="text-purple-500 font-mono">{stats.gradedTotal}/{stats.total}</strong></span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: DEDICATED TIMER / STOPWATCH VIEW */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Visual Timer Display station (8 Column Bento block) */}
                <div className="col-span-12 lg:col-span-8 p-6 rounded-3xl border border-zinc-800/10 bg-zinc-900/20 shadow-md flex flex-col items-center justify-between text-center min-h-[480px]">
                  
                  {/* Timer Header toggle */}
                  <div className="w-full flex items-center justify-between border-b border-zinc-800/20 pb-4">
                    <div className="text-left">
                      <h2 className="text-base font-bold">Preparation Desk Clock Station</h2>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Countdown for candidates discussion preparation or Stopwatch timing</p>
                    </div>

                    <div className="flex bg-[#1c1c1e] p-1 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => { setIsTimerRunning(false); setStopwatchMode('countdown'); }}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all ${
                          stopwatchMode === 'countdown' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                        }`}
                      >
                        Countdown Timer (Study)
                      </button>
                      <button
                        onClick={() => { setIsTimerRunning(false); setStopwatchMode('stopwatch'); }}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all ${
                          stopwatchMode === 'stopwatch' ? 'bg-blue-600 text-white' : 'text-zinc-500'
                        }`}
                      >
                        Stopwatch (Speaker duration)
                      </button>
                    </div>
                  </div>

                  {/* Mega Timer Numbers */}
                  <div className="my-10 space-y-2 relative">
                    
                    {/* Ring highlight glows if clock is ticking */}
                    <div className={`absolute -inset-10 bg-blue-500/1 rounded-full blur-3xl transition-opacity duration-500 ${isTimerRunning ? 'opacity-40' : 'opacity-0'}`}></div>

                    <p className="text-[10px] uppercase text-zinc-500 tracking-widest font-extrabold select-none">
                      {stopwatchMode === 'countdown' ? 'DISCUSSION PREPARATION COUNTDOWN' : 'EXAMINER CHRONO STOPWATCH'}
                    </p>
                    
                    <h1 className="text-7xl md:text-8xl font-black font-mono tracking-tight text-blue-500 select-all">
                      {stopwatchMode === 'countdown' ? formatTime(timeRemaining) : formatTime(countUpTime)}
                    </h1>

                    <div className="flex items-center justify-center gap-2 mt-4">
                      <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] text-zinc-500 font-bold select-none">{isTimerRunning ? 'ACTIVE TICKING' : 'CLOCK PAUSED'}</span>
                    </div>
                  </div>

                  {/* Timer Primary Controls */}
                  <div className="w-full max-w-md space-y-4">
                    
                    {/* Start, Pause, Reset Buttons */}
                    <div className="flex justify-between items-center gap-3">
                      
                      <button
                        onClick={resetTimer}
                        className="flex-1 py-3 text-xs font-extrabold rounded-2xl border border-zinc-800 bg-[#1c1c1e] text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Reset Time
                      </button>

                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`flex-2 py-3.5 px-6 rounded-2xl text-xs font-black text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 leading-none ${
                          isTimerRunning 
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-4 h-4" /> PAUSE TIMER
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" /> START TIMEKEEPER
                          </>
                        )}
                      </button>

                    </div>

                    <div className="text-[11px] text-zinc-500 italic">
                      💡 Click presets on the right dashboard to quickly initialize the official Discussion Study or candidate break timings.
                    </div>
                  </div>

                </div>

                {/* Clock Presets Station (4 Column Bento block) */}
                <div className="col-span-12 lg:col-span-4 p-6 rounded-3xl border border-zinc-800/10 bg-zinc-900/20 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold border-b border-zinc-800/10 pb-2 mb-4">Official Presets Quick Selection</h3>
                    
                    <div className="space-y-3">
                      
                      {/* Study preset */}
                      <button
                        onClick={() => applyPresetTime(600, '10 Mins Study Prep')}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          stopwatchMode === 'countdown' && timeRemaining === 600
                          ? 'bg-blue-600/5 border-blue-500/40'
                          : 'bg-zinc-900/40 border-zinc-805 hover:bg-zinc-850'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-50">10 Minutes Discussion Prep</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Authentic duration for Part 1 preparation study.</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-500">10:00</span>
                      </button>

                      {/* Group Discussion duration of exam preset */}
                      <button
                        onClick={() => applyPresetTime(900, '15 Mins Speaking Examination Slot')}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          stopwatchMode === 'countdown' && timeRemaining === 900
                          ? 'bg-blue-600/5 border-blue-500/40'
                          : 'bg-zinc-900/40 border-zinc-805 hover:bg-zinc-850'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-50">15 Minutes Exam Duration</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Matches standard speaking slot for 4 candidates.</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-500">15:00</span>
                      </button>

                      {/* Shift Breakdown Break session timer */}
                      <button
                        onClick={() => applyPresetTime(300, '5 Mins Break')}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          stopwatchMode === 'countdown' && timeRemaining === 300
                          ? 'bg-blue-600/5 border-blue-500/40'
                          : 'bg-zinc-900/40 border-zinc-805 hover:bg-zinc-850'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-50">5 Minutes Short Room Break</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Short respite between exam groupings.</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-500">05:00</span>
                      </button>

                      {/* Long breakdown break preset */}
                      <button
                        onClick={() => applyPresetTime(900, '15 Mins Interval Break')}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          stopwatchMode === 'countdown' && timeRemaining === 900
                          ? 'bg-blue-600/5 border-blue-500/40'
                          : 'bg-zinc-900/40 border-zinc-805 hover:bg-zinc-850'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-50">15 Minutes Duty Break</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Scheduled Break for examiners and supervisors.</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-500">15:00</span>
                      </button>

                    </div>
                  </div>

                  <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-3 text-[10px] text-zinc-500 leading-normal mt-4">
                    🔊 Browser chime plays automatically when the active countdown session concludes at 00:00.
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>
      
      <Analytics />
    </div>
  );
}
