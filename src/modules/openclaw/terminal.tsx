'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Terminal as TerminalIcon,
  Minus,
  Square,
  X,
  ChevronRight,
} from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
}

const initialLines: TerminalLine[] = [
  { type: 'info', content: 'PUSPA NGO OpenClaw Terminal v1.0.0' },
  { type: 'info', content: 'Taip "help" untuk senarai arahan yang tersedia.\n' },
  {
    type: 'command',
    content: 'puspa@ngo:~$ help',
  },
  {
    type: 'output',
    content:
      'Arahan yang tersedia:\n' +
      '  help              - Papar senarai arahan\n' +
      '  status            - Semak status sistem\n' +
      '  list-members      - Senarai ahli PUSPA\n' +
      '  donations --summary - Ringkasan derma\n' +
      '  config            - Papar konfigurasi\n' +
      '  clear             - Kosongkan terminal\n',
  },
  {
    type: 'command',
    content: 'puspa@ngo:~$ status',
  },
  {
    type: 'output',
    content:
      '═══════════════════════════════════════\n' +
      '  Status Sistem PUSPA NGO\n' +
      '═══════════════════════════════════════\n' +
      '  Versi:            2.4.1-stable\n' +
      '  Status:           ✓ Berjalan\n' +
      '  Pelayan MCP:      2/3 aktif\n' +
      '  Plugin:           2/4 dipasang\n' +
      '  Pangkalan Data:   ✓ Sambungan OK\n' +
      '  Uptime:           14j 23m 45s\n' +
      '  Memori:           2.1GB / 8GB\n' +
      '═══════════════════════════════════════\n',
  },
  {
    type: 'command',
    content: 'puspa@ngo:~$ list-members',
  },
  {
    type: 'output',
    content:
      '┌────┬──────────────────┬───────────────┬─────────┐\n' +
      '│ #  │ Nama             │ Peranan       │ Status  │\n' +
      '├────┼──────────────────┼───────────────┼─────────┤\n' +
      '│ 01 │ Ahmad Faizal     │ Pengerusi     │ Aktif   │\n' +
      '│ 02 │ Siti Nurhaliza   │ Setiausaha    │ Aktif   │\n' +
      '│ 03 │ Mohamed Ali      │ Bendahari     │ Aktif   │\n' +
      '│ 04 │ Nurul Aisyah     │ AJK           │ Aktif   │\n' +
      '│ 05 │ Razak Daud       │ Ahli          │ Tidak   │\n' +
      '└────┴──────────────────┴───────────────┴─────────┘\n' +
      '  Jumlah: 5 ahli (4 aktif, 1 tidak aktif)\n',
  },
  {
    type: 'command',
    content: 'puspa@ngo:~$ donations --summary',
  },
  {
    type: 'output',
    content:
      '📊 Ringkasan Derma PUSPA NGO\n' +
      '────────────────────────────────\n' +
      '  Jumlah Derma (2024):    RM 125,750.00\n' +
      '  Bilangan Penderma:      89 orang\n' +
      '  Purata Derma:           RM 1,412.92\n' +
      '  Derma Tertinggi:        RM 10,000.00\n' +
      '  Derma Terendah:         RM 50.00\n' +
      '────────────────────────────────\n' +
      '  Kategori:\n' +
      '    • Korporat:  RM 85,000 (67.6%)\n' +
      '    • Individu:  RM 32,500 (25.8%)\n' +
      '    • Kerajaan:  RM  8,250 (6.6%)\n' +
      '────────────────────────────────\n' +
      '  Bulan Ini: RM 12,350 (+15.2%)\n',
  },
];

const commandResponses: Record<string, TerminalLine[]> = {
  help: [
    {
      type: 'output',
      content:
        'Arahan yang tersedia:\n' +
        '  help              - Papar senarai arahan\n' +
        '  status            - Semak status sistem\n' +
        '  list-members      - Senarai ahli PUSPA\n' +
        '  donations --summary - Ringkasan derma\n' +
        '  config            - Papar konfigurasi\n' +
        '  clear             - Kosongkan terminal\n',
    },
  ],
  status: [
    {
      type: 'output',
      content:
        'Status: ✓ Berjalan | Uptime: 14j 23m 45s | Memori: 2.1GB / 8GB',
    },
  ],
  clear: [],
};

export default function TerminalPage() {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'command', content: `puspa@ngo:~$ ${trimmed}` },
    ];

    const baseCmd = trimmed.split(' ')[0].toLowerCase();

    if (baseCmd === 'clear') {
      setLines([]);
      setInput('');
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      return;
    }

    const response = commandResponses[baseCmd];
    if (response) {
      newLines.push(...response);
    } else {
      newLines.push({
        type: 'error',
        content: `Arahan tidak dikenali: "${trimmed}". Taip "help" untuk bantuan.`,
      });
    }

    setLines(newLines);
    setInput('');
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TerminalIcon className="h-6 w-6" />
            Terminal
          </h1>
          <p className="text-muted-foreground mt-1">
            Antara muka baris arahan untuk mengurus sistem PUSPA
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Sesi Aktif
        </Badge>
      </div>

      {/* Terminal Window */}
      <Card className="overflow-hidden border-zinc-700 bg-zinc-900">
        {/* Title Bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <button className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
            <button className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
            <button className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-zinc-400 font-mono">
              puspa@ngo — OpenClaw Terminal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <Square className="h-3 w-3" />
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto font-mono text-sm cursor-text"
          onClick={focusInput}
        >
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              {line.type === 'command' && (
                <span className="text-emerald-400 font-semibold">
                  {line.content}
                </span>
              )}
              {line.type === 'output' && (
                <span className="text-zinc-300">{line.content}</span>
              )}
              {line.type === 'error' && (
                <span className="text-red-400">{line.content}</span>
              )}
              {line.type === 'info' && (
                <span className="text-cyan-400">{line.content}</span>
              )}
            </div>
          ))}

          {/* Input Line */}
          <div className="flex items-center mt-1">
            <span className="text-emerald-400 font-semibold whitespace-pre">
              puspa@ngo:~${' '}
            </span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-zinc-200 outline-none caret-emerald-400 font-mono text-sm"
                autoFocus
                spellCheck={false}
              />
              {input.length === 0 && (
                <span className="absolute top-0 left-0 text-zinc-600 animate-pulse pointer-events-none">
                  ▋
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-t border-zinc-700 text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              bash
            </span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{lines.length} baris</span>
            <span>
              {history.length > 0
                ? `${history.length} arahan dalam sejarah`
                : 'Tiada sejarah'}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Commands */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center mr-1">
          Arahan pantas:
        </span>
        {['help', 'status', 'list-members', 'donations --summary', 'clear'].map(
          (cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="px-3 py-1.5 text-xs font-mono rounded-md bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors border"
            >
              {cmd}
            </button>
          )
        )}
      </div>
    </div>
  );
}
