import type { AlbionEquipment, AlbionKillEvent, AlbionRegion } from '../../types/albion'
import { classify } from '../classifier/classify'

export interface GearJson {
  mainhand: { id: string; ip: number } | null
  offhand: { id: string; ip: number } | null
  head: { id: string; ip: number } | null
  chest: { id: string; ip: number } | null
  shoes: { id: string; ip: number } | null
  cape: { id: string; ip: number } | null
  bag: { id: string; ip: number } | null
  food: { id: string; ip: number } | null
  potion: { id: string; ip: number } | null
  mount: { id: string; ip: number } | null
}

export interface NewKill {
  id: number
  region: string
  killedAt: Date
  killerId: string
  killerName: string
  killerGuildId: string | null
  killerAllianceId: string | null
  killerIp: number | null
  killerAvgIp: number | null
  victimId: string
  victimName: string
  victimGuildId: string | null
  victimAllianceId: string | null
  victimIp: number | null
  victimAvgIp: number | null
  killerGear: GearJson
  victimGear: GearJson
  participants: number
  killerPartySize: number | null
  victimPartySize: number | null
  totalFame: number | null
  killZone: string | null
  contentType: string
  contentConfidence: number
  patchSlug: string | null
}

function mapEquipment(equip: AlbionEquipment): GearJson {
  return {
    mainhand: equip.MainHand ? { id: equip.MainHand.Type, ip: 0 } : null,
    offhand: equip.OffHand ? { id: equip.OffHand.Type, ip: 0 } : null,
    head: equip.Head ? { id: equip.Head.Type, ip: 0 } : null,
    chest: equip.Armor ? { id: equip.Armor.Type, ip: 0 } : null,
    shoes: equip.Shoes ? { id: equip.Shoes.Type, ip: 0 } : null,
    cape: equip.Cape ? { id: equip.Cape.Type, ip: 0 } : null,
    bag: equip.Bag ? { id: equip.Bag.Type, ip: 0 } : null,
    food: equip.Food ? { id: equip.Food.Type, ip: 0 } : null,
    potion: equip.Potion ? { id: equip.Potion.Type, ip: 0 } : null,
    mount: equip.Mount ? { id: equip.Mount.Type, ip: 0 } : null,
  }
}

export function normalize(event: AlbionKillEvent, region: AlbionRegion): NewKill {
  const killerGear = mapEquipment(event.Killer.Equipment)
  const victimGear = mapEquipment(event.Victim.Equipment)

  // killer party = the group members listed on the kill + the killer themselves
  const killerPartySize = event.GroupMembers.length + 1

  // victim party is the remainder of participants after subtracting killer's party
  // minimum 1 because the victim must exist
  const victimPartySize = Math.max(1, event.NumberOfParticipants - killerPartySize)

  const classifyResult = classify({
    participants: event.NumberOfParticipants,
    killerPartySize,
    victimPartySize,
    totalFame: event.TotalVictimKillFame,
    killerIp: null,
    victimIp: null,
    killZone: event.Location,
    killedAt: new Date(event.TimeStamp),
    killerMainhand: event.Killer.Equipment.MainHand?.Type ?? null,
  })

  return {
    id: event.EventId,
    region,
    killedAt: new Date(event.TimeStamp),
    killerId: event.Killer.Id,
    killerName: event.Killer.Name,
    killerGuildId: event.Killer.GuildId,
    killerAllianceId: event.Killer.AllianceId,
    killerIp: null,
    killerAvgIp: null,
    victimId: event.Victim.Id,
    victimName: event.Victim.Name,
    victimGuildId: event.Victim.GuildId,
    victimAllianceId: event.Victim.AllianceId,
    victimIp: null,
    victimAvgIp: null,
    killerGear,
    victimGear,
    participants: event.NumberOfParticipants,
    killerPartySize,
    victimPartySize,
    totalFame: event.TotalVictimKillFame,
    killZone: event.Location,
    contentType: classifyResult.contentType,
    contentConfidence: classifyResult.contentConfidence,
    patchSlug: null,
  }
}
