export interface AlbionKillEvent {
  EventId: number
  TimeStamp: string
  Version: number
  Killer: AlbionPlayer
  Victim: AlbionPlayer
  TotalVictimKillFame: number
  Location: string | null
  Participants: AlbionPlayer[]
  GroupMembers: AlbionPlayer[]
  GvGMatch: null
  BattleId: number
  Type: string
  NumberOfParticipants: number
}

export interface AlbionPlayer {
  Id: string
  Name: string
  GuildId: string | null
  GuildName: string | null
  AllianceId: string | null
  AllianceName: string | null
  AllianceTag: string | null
  Avatar: string | null
  AvatarRing: string | null
  DeathFame: number
  KillFame: number
  FameRatio: number
  LifetimeStatistics: object
  Equipment: AlbionEquipment
  Inventory: null
}

export interface AlbionEquipment {
  MainHand: AlbionItem | null
  OffHand: AlbionItem | null
  Head: AlbionItem | null
  Armor: AlbionItem | null
  Shoes: AlbionItem | null
  Bag: AlbionItem | null
  Cape: AlbionItem | null
  Mount: AlbionItem | null
  Potion: AlbionItem | null
  Food: AlbionItem | null
}

export interface AlbionItem {
  Type: string
  Count: number
  Quality: number
  ActiveSpells: unknown[]
  PassiveSpells: unknown[]
}

export interface AlbionBattle {
  Id: number
  StartTime: string
  EndTime: string
  TotalFame: number
  TotalKills: number
  Guilds: Record<string, AlbionBattleGuild>
  Players: Record<string, AlbionBattlePlayer>
  Events: AlbionKillEvent[]
}

export interface AlbionBattleGuild {
  Name: string
  Id: string
  AllianceId: string | null
  AllianceName: string | null
  AllianceTag: string | null
  TotalKills: number
  TotalDeaths: number
  TotalFame: number
  KillsHist: number[]
}

export interface AlbionBattlePlayer {
  Name: string
  Id: string
  GuildId: string | null
  GuildName: string | null
  AllianceId: string | null
  AllianceName: string | null
  AllianceTag: string | null
  TotalKills: number
  TotalDeaths: number
  TotalFame: number
  KillsHist: number[]
}

export type AlbionRegion = 'west' | 'eu' | 'asia'
