import { KillFeed } from '@/components/kills/KillFeed'

export default function HomePage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[22px] font-semibold text-text-primary tracking-wide">
          Kill Feed
        </h1>
        <p className="text-sm text-text-secondary">Live PvP kills across all regions</p>
      </div>
      <KillFeed />
    </div>
  )
}
