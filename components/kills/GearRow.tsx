import { ItemIcon } from './ItemIcon'

interface GearRowProps {
  gear: {
    mainhand?: { id: string; ip: number } | null
    offhand?: { id: string; ip: number } | null
    head?: { id: string; ip: number } | null
    chest?: { id: string; ip: number } | null
    shoes?: { id: string; ip: number } | null
  } | null
  size?: number
}

export function GearRow({ gear, size = 20 }: GearRowProps) {
  const slots = [
    gear?.mainhand?.id ?? null,
    gear?.offhand?.id ?? null,
    gear?.head?.id ?? null,
    gear?.chest?.id ?? null,
    gear?.shoes?.id ?? null,
  ]
  return (
    <div className="flex items-center gap-0.5">
      {slots.map((id, i) => (
        <ItemIcon key={i} itemId={id} size={size} />
      ))}
    </div>
  )
}
