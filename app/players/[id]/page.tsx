import type { Metadata } from 'next'
import { StatCard } from '@/components/ui/StatCard'
import { KillFeed } from '@/components/kills/KillFeed'
import { Card } from '@/components/ui/Card'

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

interface PlayerData {
  player: {
    id: string
    name: string
    guildName: string | null
    allianceName: string | null
  }
  stats: {
    totalKills: number
    totalDeaths: number
    kd: number
    totalFame: number
    avgKillerIp: number | null
    favoriteWeapons: { weaponId: string; weaponName: string; count: number }[]
  }
}

async function getPlayerData(id: string): Promise<PlayerData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/players/${id}`, { next: { revalidate: 300 } })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as PlayerData
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getPlayerData(id)
  const name = data?.player.name ?? 'Unknown Player'
  return { title: `${name} — Albion PvP Analytics` }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const data = await getPlayerData(id)

  if (!data) {
    return (
      <div className="p-8 text-center text-text-secondary">Player not found.</div>
    )
  }

  const { player, stats } = data
  const kd =
    stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : '∞'
  const fame =
    stats.totalFame >= 1_000_000
      ? `${(stats.totalFame / 1_000_000).toFixed(1)}M`
      : `${(stats.totalFame / 1000).toFixed(0)}K`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-[22px] font-semibold text-text-primary">
          {player.name}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
          {player.guildName && <span>{player.guildName}</span>}
          {player.allianceName && (
            <span className="text-text-tertiary">· {player.allianceName}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard label="Kills" value={stats.totalKills.toLocaleString()} />
        <StatCard label="Deaths" value={stats.totalDeaths.toLocaleString()} />
        <StatCard label="K/D" value={kd} />
        <StatCard
          label="Avg IP"
          value={stats.avgKillerIp ? Math.round(stats.avgKillerIp).toString() : '—'}
        />
        <StatCard label="Fame" value={fame} />
      </div>

      {/* Favorite weapons */}
      {stats.favoriteWeapons.length > 0 && (
        <Card>
          <h2 className="text-[13px] font-medium text-text-secondary uppercase tracking-wide mb-3">
            Top Weapons
          </h2>
          <div className="space-y-2">
            {stats.favoriteWeapons.map((w) => (
              <div key={w.weaponId} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{w.weaponName || w.weaponId}</span>
                <span className="font-mono text-[12px] text-text-secondary">{w.count} kills</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Kill feed */}
      <div>
        <h2 className="font-display text-[16px] font-semibold text-text-primary mb-3">
          Recent Kills
        </h2>
        <KillFeed playerId={id} />
      </div>
    </div>
  )
}
