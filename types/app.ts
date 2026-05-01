export type ContentType =
  | 'solo'
  | '2v2'
  | '5v5'
  | 'zvz'
  | 'corrupted_dungeon'
  | 'hellgate'
  | 'mists'
  | 'unknown'

export type IpBracket = 'sub800' | '800' | '900' | '1000' | '1100' | '1200' | '1300plus'

export interface BuildSlug {
  mainHand: string
  offHand: string | null
  head: string | null
  armor: string | null
  shoes: string | null
}

export interface WinRateRow {
  buildSlug: BuildSlug
  contentType: ContentType
  ipBracket: IpBracket
  kills: number
  deaths: number
  winRate: number
  sampleSize: number
}

export interface MetaTier {
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  builds: BuildSlug[]
}

export interface ApiMeta {
  freshness: string
  region: string | null
  generatedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}
