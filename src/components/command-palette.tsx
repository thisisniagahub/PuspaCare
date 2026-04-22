'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/stores/app-store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { ViewId } from '@/types'

const VIEW_ITEMS: { id: ViewId; label: string; keywords: string[] }[] = [
  { id: 'dashboard', label: 'Dashboard', keywords: ['home', 'utama', 'papan pemuka'] },
  { id: 'members', label: 'Ahli Asnaf', keywords: ['ahli', 'asnaf', 'member', 'penerima'] },
  { id: 'cases', label: 'Kes', keywords: ['kes', 'case', 'permohonan', 'application'] },
  { id: 'programmes', label: 'Program', keywords: ['program', 'aktiviti', 'projek'] },
  { id: 'donations', label: 'Donasi', keywords: ['donasi', 'sumbangan', 'derma', 'zakat'] },
  { id: 'disbursements', label: 'Pembayaran', keywords: ['pembayaran', 'disbursement', 'bayar'] },
  { id: 'compliance', label: 'Compliance', keywords: ['compliance', 'pematuhan', 'audit'] },
  { id: 'admin', label: 'Pentadbiran', keywords: ['admin', 'tetapan', 'settings', 'profil'] },
  { id: 'reports', label: 'Laporan Kewangan', keywords: ['laporan', 'report', 'kewangan', 'financial'] },
  { id: 'activities', label: 'Aktiviti', keywords: ['aktiviti', 'activity', 'kanban'] },
  { id: 'ai', label: 'Alat AI', keywords: ['ai', 'kecerdasan buatan', 'chatbot'] },
  { id: 'volunteers', label: 'Sukarelawan', keywords: ['sukarelawan', 'volunteer'] },
  { id: 'donors', label: 'Penderma', keywords: ['penderma', 'donor', 'crm'] },
  { id: 'documents', label: 'Dokumen', keywords: ['dokumen', 'document', 'fail', 'file'] },
  { id: 'agihan-bulan', label: 'Agihan Bulan', keywords: ['agihan', 'bulan', 'makan ruji', 'staple food', 'distribusi'] },
  { id: 'sedekah-jumaat', label: 'Sedekah Jumaat', keywords: ['sedekah', 'jumaat', 'rumah kebajikan', 'mahad tahfiz', 'makanan tengahari'] },
  { id: 'openclaw-mcp', label: 'OpenClaw MCP', keywords: ['mcp', 'server', 'openclaw'] },
  { id: 'openclaw-plugins', label: 'OpenClaw Plugins', keywords: ['plugin', 'openclaw'] },
  { id: 'openclaw-integrations', label: 'OpenClaw Integrasi', keywords: ['integrasi', 'integration', 'openclaw'] },
  { id: 'openclaw-terminal', label: 'OpenClaw Terminal', keywords: ['terminal', 'console', 'openclaw'] },
  { id: 'openclaw-agents', label: 'OpenClaw Ejen', keywords: ['agent', 'ejen', 'ai', 'openclaw'] },
  { id: 'openclaw-models', label: 'OpenClaw Model', keywords: ['model', 'llm', 'openclaw'] },
  { id: 'openclaw-automation', label: 'OpenClaw Automasi', keywords: ['automasi', 'automation', 'openclaw'] },
  { id: 'ops-conductor', label: 'Ops Conductor', keywords: ['conductor', 'ops', 'operasi', 'chat', 'task', 'work', 'reminder', 'trace'] },
]

const SECTIONS = [
  {
    heading: 'Utama',
    ids: ['dashboard', 'members', 'cases', 'programmes', 'donations', 'disbursements'] as ViewId[],
  },
  {
    heading: 'Compliance & Laporan',
    ids: ['compliance', 'reports'] as ViewId[],
  },
  {
    heading: 'Pengurusan',
    ids: ['activities', 'volunteers', 'donors', 'documents', 'agihan-bulan', 'sedekah-jumaat'] as ViewId[],
  },
  {
    heading: 'AI & Automasi',
    ids: ['ops-conductor', 'ai', 'openclaw-mcp', 'openclaw-plugins', 'openclaw-integrations', 'openclaw-terminal', 'openclaw-agents', 'openclaw-models', 'openclaw-automation'] as ViewId[],
  },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setView } = useAppStore()
  const [query, setQuery] = useState('')

  const handleSelect = useCallback(
    (viewId: ViewId) => {
      setView(viewId)
      setCommandPaletteOpen(false)
    },
    [setView, setCommandPaletteOpen],
  )

  // Filter items based on search query
  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS

    const q = query.toLowerCase().trim()
    const matchingIds = new Set<ViewId>()

    VIEW_ITEMS.forEach((item) => {
      const haystack = `${item.label} ${item.keywords.join(' ')} ${item.id}`.toLowerCase()
      if (haystack.includes(q)) matchingIds.add(item.id)
    })

    return SECTIONS
      .map((section) => ({
        ...section,
        ids: section.ids.filter((id) => matchingIds.has(id)),
      }))
      .filter((section) => section.ids.length > 0)
  }, [query])

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
        <Image
          src="/puspa-logo-official.png"
          alt="PUSPA"
          width={22}
          height={22}
          className="object-contain"
        />
        <span className="text-xs font-semibold" style={{ color: '#4B0082' }}>PUSPA Command</span>
      </div>
      <CommandInput
        placeholder="Cari modul, ciri, atau tetapan..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Tiada hasil dijumpai.</CommandEmpty>
        {filteredSections.map((section) => (
          <CommandGroup key={section.heading} heading={section.heading}>
            {section.ids.map((id) => {
              const item = VIEW_ITEMS.find((v) => v.id === id)
              if (!item) return null
              return (
                <CommandItem
                  key={id}
                  value={`${item.label} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(id)}
                >
                  <span className="font-medium">{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
