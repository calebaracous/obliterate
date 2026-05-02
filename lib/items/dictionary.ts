export interface ItemEntry {
  id: string
  name: string
  tier: number
  enchantment: number
  slot: string
  category: string
  subcategory: string | null
  twoHanded: boolean
}

export interface RawItem {
  UniqueName: string
  LocalizedNames?: Record<string, string> | null
  ShopCategory?: string | null
  ShopSubCategory1?: string | null
  Tier?: number | null
}

let itemMap: Map<string, ItemEntry> | null = null

function inferSlotAndCategory(id: string): { slot: string; category: string } {
  if (id.includes('_MAIN_')) return { slot: 'mainhand', category: 'weapon' }
  if (id.includes('_OFF_')) return { slot: 'offhand', category: 'weapon' }
  if (id.includes('_HEAD_') || id.includes('_HELMET_')) return { slot: 'head', category: 'armor' }
  if (id.includes('_ARMOR_') || id.includes('_CHEST_')) return { slot: 'chest', category: 'armor' }
  if (id.includes('_SHOES_')) return { slot: 'shoes', category: 'armor' }
  if (id.includes('_CAPE_')) return { slot: 'cape', category: 'accessory' }
  if (id.includes('_BAG_')) return { slot: 'bag', category: 'accessory' }
  if (id.includes('_MOUNT_')) return { slot: 'mount', category: 'mount' }
  if (id.includes('_FOOD_')) return { slot: 'food', category: 'consumable' }
  if (id.includes('_POTION_')) return { slot: 'potion', category: 'consumable' }
  return { slot: 'unknown', category: 'unknown' }
}

function parseSubcategory(id: string): string | null {
  // Strip trailing enchantment suffix (@1, @2, @3) before splitting
  const baseId = id.includes('@') ? id.slice(0, id.lastIndexOf('@')) : id
  const segments = baseId.split('_')
  // e.g. T8_MAIN_CURSEDSTAFF_MORGANA → segments[2] = 'CURSEDSTAFF'
  if (segments.length >= 3) {
    return segments[2]!.toLowerCase()
  }
  return null
}

export function parseItemEntry(item: RawItem): ItemEntry {
  const rawId = item.UniqueName

  // Strip enchantment suffix for structural parsing
  const enchantmentMatch = rawId.match(/@(\d+)$/)
  const enchantment = enchantmentMatch ? parseInt(enchantmentMatch[1]!, 10) : 0
  const idWithoutEnchant = enchantmentMatch
    ? rawId.slice(0, rawId.lastIndexOf('@'))
    : rawId

  // Tier from item ID prefix: T8_... → 8
  const tierMatch = idWithoutEnchant.match(/^T(\d)/)
  const tier = tierMatch ? parseInt(tierMatch[1]!, 10) : 0

  const name = item.LocalizedNames?.['EN-US'] ?? rawId

  const { slot, category } = inferSlotAndCategory(rawId)
  const subcategory = parseSubcategory(rawId)
  const twoHanded = rawId.includes('_2H_')

  return {
    id: rawId,
    name,
    tier,
    enchantment,
    slot,
    category,
    subcategory,
    twoHanded,
  }
}

export function loadItemsFromJson(items: RawItem[]): void {
  const map = new Map<string, ItemEntry>()
  for (const item of items) {
    if (!item.UniqueName) continue
    const entry = parseItemEntry(item)
    map.set(entry.id, entry)
  }
  itemMap = map
}

export function getItem(id: string): ItemEntry | undefined {
  return itemMap?.get(id)
}

export function isLoaded(): boolean {
  return itemMap !== null
}

export function itemCount(): number {
  return itemMap?.size ?? 0
}
