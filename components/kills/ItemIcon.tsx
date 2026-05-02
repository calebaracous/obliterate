import Image from 'next/image'
import { cn } from '@/lib/utils'

const QUALITY_BORDER: Record<number, string> = {
  1: 'border-border-subtle',
  2: 'border-[#3a6a3a]',
  3: 'border-[#3a4a8a]',
  4: 'border-[#6a6a20]',
  5: 'border-[#7a4a20]',
}

interface ItemIconProps {
  itemId: string | null
  quality?: number
  size?: number
  className?: string
}

export function ItemIcon({ itemId, quality = 1, size = 20, className }: ItemIconProps) {
  if (!itemId) {
    return (
      <div
        className={cn('bg-bg-subtle border border-border-subtle rounded-[2px] flex-shrink-0', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={cn(
        'border rounded-[2px] flex-shrink-0 overflow-hidden bg-bg-subtle',
        QUALITY_BORDER[quality] ?? QUALITY_BORDER[1],
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/api/items/${encodeURIComponent(itemId)}/render`}
        alt={itemId}
        width={size}
        height={size}
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
