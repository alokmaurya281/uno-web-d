import React, { useEffect, useState, useRef } from 'react';
import { getLogs } from '../../services/adminApi';
import { Terminal, RefreshCw, Download, Search, AlertCircle, ArrowDown } from 'lucide-react';

interface LogRecord {
  ts?: string;
  level?: string;
  event?: string;
  pid?: number;
  [key: string]: unknown;
}

const LogsViewer: React.FC = () => {
  const [rawLogs, setRawLogs] = useState<string>('');
  const [truncated, setTruncated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  
  // Auto Refresh
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(5);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getLogs();
      if (response.ok) {
        setRawLogs(response.logs || '');
        setTruncated(response.truncated || false);
        setError(null);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  // Handle Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchLogs(false);
    }, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalSec]);

  // Parse log lines (each line is a JSON string or plain text)
  const processedLines = React.useMemo(() => {
    if (!rawLogs) return [];
    
    const lines = rawLogs.split('\n').filter(Boolean);
    const parsedLines = lines.map((line) => {
      try {
        const parsed = JSON.parse(line) as LogRecord;
        return {
          raw: line,
          parsed,
          isJson: true,
          level: parsed.level?.toLowerCase() || 'info',
          event: parsed.event || '',
          timestamp: parsed.ts || '',
          message: line
        };
      } catch {
        // Fallback for non-JSON lines
        return {
          raw: line,
          parsed: null,
          isJson: false,
          level: 'info',
          event: '',
          timestamp: '',
          message: line
        };
      }
    });

    // Apply level filter
    let filtered = parsedLines;
    if (levelFilter !== 'all') {
      filtered = filtered.filter((line) => line.level === levelFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((line) => line.message.toLowerCase().includes(term));
    }

    return filtered;
  }, [rawLogs, levelFilter, searchTerm]);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownload = () => {
    const blob = new Blob([rawLogs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'server.log');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-scroll when new logs load
  useEffect(() => {
    if (autoRefresh) {
      scrollToBottom();
    }
  }, [rawLogs, autoRefresh]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-950/30 border-red-900/30';
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/20 border-yellow-900/30';
      case 'debug':
        return 'text-blue-400 bg-blue-950/20 border-blue-900/30';
      default:
        return 'text-green-400 bg-green-950/10 border-green-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-2">
            System <span className="text-uno-red">Logs</span> <Terminal className="text-uno-red" size={28} />
          </h1>
          <p className="text-sm text-gray-500">View and inspect live backend logs.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => void fetchLogs(true)} 
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button 
            onClick={handleDownload} 
            disabled={!rawLogs}
            className="inline-flex items-center gap-2 rounded-lg bg-uno-red/10 border border-uno-red/30 px-4 py-3 text-xs font-black uppercase tracking-widest text-uno-red hover:bg-uno-red/20 disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} /> Download
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {truncated && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-500">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <span className="font-bold">Large log file:</span> The logs have been truncated to the last 5MB of entries to protect performance. Use the <strong>Download</strong> button to retrieve the full file.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <span className="font-bold">Error loading logs:</span> {error}
          </div>
        </div>
      )}

      {/* Toolbar Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event, endpoint, or message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-uno-red/50 transition-all text-sm"
          />
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-uno-red/50 text-white font-bold cursor-pointer"
            >
              <option value="all" className="bg-[#0a0a0a] text-white">ALL LEVELS</option>
              <option value="info" className="bg-[#0a0a0a] text-green-400 font-bold">INFO</option>
              <option value="warn" className="bg-[#0a0a0a] text-yellow-400 font-bold">WARN</option>
              <option value="error" className="bg-[#0a0a0a] text-red-400 font-bold">ERROR</option>
              <option value="debug" className="bg-[#0a0a0a] text-blue-400 font-bold">DEBUG</option>
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-3 border-l border-white/15 pl-4">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer">
              <input 
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-uno-red focus:ring-0 cursor-pointer"
              />
              Auto Refresh
            </label>
            {autoRefresh && (
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-[10px] focus:outline-none focus:border-uno-red/50 text-white cursor-pointer"
              >
                <option value="2" className="bg-[#0a0a0a]">2s</option>
                <option value="5" className="bg-[#0a0a0a]">5s</option>
                <option value="10" className="bg-[#0a0a0a]">10s</option>
                <option value="30" className="bg-[#0a0a0a]">30s</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Terminal logs panel */}
      <div className="relative rounded-lg border border-white/10 bg-[#060606] shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-white/[0.02] border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Console Terminal Output</span>
          </div>
          <div className="text-[10px] font-bold text-gray-400">
            Showing {processedLines.length} / {rawLogs.split('\n').filter(Boolean).length} lines
          </div>
        </div>

        {/* Console Box */}
        <pre 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-gray-300 break-all select-text space-y-1.5 scrollbar-thin whitespace-pre-wrap"
        >
          {processedLines.map((line, idx) => {
            if (line.isJson && line.parsed) {
              const { ts, level, event, pid, ...meta } = line.parsed;
              return (
                <div key={idx} className={`p-1.5 rounded border ${getLevelColor(level || 'info')} flex flex-col md:flex-row md:items-start gap-2`}>
                  {/* Timestamp */}
                  <span className="text-gray-500 font-bold flex-shrink-0">[{ts ? new Date(ts).toLocaleString() : ''}]</span>
                  
                  {/* PID / Level */}
                  <span className="font-bold flex-shrink-0 uppercase tracking-widest text-[9px] border border-current px-1 rounded leading-none pt-[3px] pb-[2px]">{level}</span>
                  
                  {/* Content details */}
                  <div className="flex-1 min-w-0 break-all whitespace-pre-wrap">
                    <span className="font-black text-white">{event}</span>
                    {Object.keys(meta).length > 0 && (
                      <span className="text-gray-400 ml-2 text-[11px] font-light break-all whitespace-pre-wrap">
                        {JSON.stringify(meta)}
                      </span>
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={idx} className="p-1 rounded bg-white/[0.01] border border-white/5 font-mono text-gray-400 break-all whitespace-pre-wrap">
                  {line.message}
                </div>
              );
            }
          })}

          {processedLines.length === 0 && (
            <div className="h-full flex items-center justify-center flex-col py-20 text-gray-500 gap-2">
              <Terminal size={32} />
              <p className="font-bold">No matching log entries found.</p>
            </div>
          )}

          <div ref={consoleEndRef} />
        </pre>

        {/* Sticky scroll to bottom button */}
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 p-3 rounded-full bg-uno-red text-white shadow-lg hover:bg-uno-red/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="Scroll to Bottom"
        >
          <ArrowDown size={18} />
        </button>
      </div>
    </div>
  );
};

export default LogsViewer;
