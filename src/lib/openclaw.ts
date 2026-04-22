export interface OpenClawSnapshot {
  generatedAt: string
  controlUrl: string
  gateway: {
    connected: boolean
    status: string
    latencyMs: number
    gatewayUrl: string
    healthUrl: string
    error?: string
  }
  channels: {
    total: number
    connected: number
    items: Array<{
      channelId: string
      accountId: string
      enabled: boolean
      running: boolean
      connected: boolean
      healthState: string
      mode: string | null
      label: string | null
      lastEventAt: number | null
      detail: string | null
    }>
  }
  models: {
    defaultModel: string | null
    resolvedDefault: string | null
    fallbacks: string[]
    aliases: Record<string, string>
    allowedCount: number
    oauthProviders: Array<{
      provider: string
      profileCount: number
      oauthCount: number
      apiKeyCount: number
      tokenCount: number
    }>
  }
  agents: Array<{
    id: string
    sessionCount: number
    lastUpdatedAt: number | null
    lastModel: string | null
    lastKey: string | null
  }>
  automation: {
    cron: Array<{
      id: string
      name: string
      enabled: boolean
      schedule: string | null
      nextRunAtMs: number | null
      lastRunStatus: string | null
    }>
    tasks: {
      total: number
      byStatus: Record<string, number>
      byRuntime: Record<string, number>
      recent: Array<{
        taskId: string
        runtime: string
        status: string
        task: string | null
        lastEventAt: number | null
        endedAt: number | null
      }>
    }
  }
  plugins: {
    entries: Array<{
      key: string
      enabled: boolean
    }>
    webhookRoutes: Array<{
      key: string
      path: string | null
    }>
  }
  mcp: {
    servers: Array<{
      name: string
      transport: string
      enabled: boolean
      source: string | null
    }>
  }
}

export const DEFAULT_OPENCLAW_BRIDGE_URL = 'https://operator.gangniaga.my/puspa-bridge'
