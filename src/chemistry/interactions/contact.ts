/**
 * @file Contact
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Color } from 'three'

import { Debug, Log } from '../../globals'
import { createParams } from '../../utils'
import { TextBufferData } from '../../buffer/text-buffer'
import Structure from '../../structure/structure'
import AtomProxy from '../../proxy/atom-proxy'
import SpatialHash from '../../geometry/spatial-hash'
import { calculateCenterArray, calculateDirectionArray, uniformArray } from '../../math/array-utils'
import ContactStore from '../../store/contact-store'
import BitArray from '../../utils/bitarray'
import Selection from '../../selection/selection'
import { ContactPicker } from '../../utils/picker'
import { createAdjacencyList, AdjacencyList } from '../../utils/adjacency-list'
import { createFeatures, Features } from './features'
import { addAromaticRings, addNegativeCharges, addPositiveCharges, addChargedContacts } from './charged'
import { addHydrogenAcceptors, addHydrogenDonors, addHydrogenBonds, addWeakHydrogenDonors } from './hydrogen-bonds'
import { addMetalBinding, addMetals, addMetalComplexation } from './metal-binding'
import { addHydrophobic, addHydrophobicContacts } from './hydrophobic'
import { addHalogenAcceptors, addHalogenDonors, addHalogenBonds } from './halogen-bonds'
import {
  refineLineOfSight,
  refineHydrophobicContacts, refineSaltBridges, refinePiStacking, refineMetalCoordination
} from './refine-contacts'

export interface Contacts {
  features: Features
  spatialHash: SpatialHash
  contactStore: ContactStore
  featureSet: BitArray
}

export interface FrozenContacts extends Contacts {
  contactSet: BitArray
  adjacencyList: AdjacencyList
}

export const enum ContactType {
  Unknown = 0,
  IonicInteraction = 1,
  CationPi = 2,
  PiStacking = 3,
  HydrogenBond = 4,
  HalogenBond = 5,
  Hydrophobic = 6,
  MetalCoordination = 7,
  WeakHydrogenBond = 8,
  WaterHydrogenBond = 9,
  BackboneHydrogenBond = 10
}

export const ContactDefaultParams = {
  maxHydrophobicDist: 4.0,
  maxHbondDist: 3.5,
  maxHbondSulfurDist: 4.1,
  maxHbondAccAngle: 45,
  maxHbondDonAngle: 45,
  maxHbondAccPlaneAngle: 90,
  maxHbondDonPlaneAngle: 30,
  maxPiStackingDist: 5.5,
  maxPiStackingOffset: 2.0,
  maxPiStackingAngle: 30,
  maxCationPiDist: 6.0,
  maxCationPiOffset: 2.0,
  maxIonicDist: 5.0,
  maxHalogenBondDist: 4.0,
  maxHalogenBondAngle: 30,
  maxMetalDist: 3.0,
  refineSaltBridges: true,
  masterModelIndex: -1,
  lineOfSightDistFactor: 1.0
}

export function isMasterContact (ap1: AtomProxy, ap2: AtomProxy, masterIdx: number) {
  return (
    (ap1.modelIndex === masterIdx && ap2.modelIndex !== masterIdx) ||
    (ap2.modelIndex === masterIdx && ap1.modelIndex !== masterIdx)
  )
}

export function invalidAtomContact (ap1: AtomProxy, ap2: AtomProxy, masterIdx: number) {
  return !isMasterContact(ap1, ap2, masterIdx) && (
    ap1.modelIndex !== ap2.modelIndex ||
    ap1.residueIndex === ap2.residueIndex ||
    (ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc)
  )
}

export function createContacts (features: Features): Contacts {
  const { types, centers } = features

  const spatialHash = new SpatialHash(centers)
  const contactStore = new ContactStore()
  const featureSet = new BitArray(types.length, false)

  return { features, spatialHash, contactStore, featureSet }
}

export function createFrozenContacts (contacts: Contacts): FrozenContacts {
  const { index1, index2, count } = contacts.contactStore

  const adjacencyList = createAdjacencyList({
    nodeArray1: index1,
    nodeArray2: index2,
    edgeCount: count,
    nodeCount: contacts.featureSet.length
  })
  const contactSet = new BitArray(contacts.contactStore.count, true)

  return Object.assign({ adjacencyList, contactSet }, contacts)
}

function calculateFeatures (structure: Structure) {
  const features = createFeatures()

  if (Debug) Log.time('calculateFeatures')

  addPositiveCharges(structure, features)
  addNegativeCharges(structure, features)
  addAromaticRings(structure, features)

  addHydrogenAcceptors(structure, features)
  addHydrogenDonors(structure, features)
  addWeakHydrogenDonors(structure, features)

  addMetalBinding(structure, features)
  addMetals(structure, features)

  addHydrophobic(structure, features)

  addHalogenAcceptors(structure, features)
  addHalogenDonors(structure, features)

  if (Debug) Log.timeEnd('calculateFeatures')

  return features
}

export function calculateContacts (structure: Structure, params = ContactDefaultParams) {
  const features = calculateFeatures(structure)
  const contacts = createContacts(features)

  if (Debug) Log.time('calculateContacts')

  addChargedContacts(structure, contacts, params)
  addHydrogenBonds(structure, contacts, params)
  addMetalComplexation(structure, contacts, params)
  addHydrophobicContacts(structure, contacts, params)
  addHalogenBonds(structure, contacts, params)

  const frozenContacts = createFrozenContacts(contacts)

  refineLineOfSight(structure, frozenContacts, params)
  refineHydrophobicContacts(structure, frozenContacts)
  if (params.refineSaltBridges) refineSaltBridges(structure, frozenContacts)
  refinePiStacking(structure, frozenContacts)
  refineMetalCoordination(structure, frozenContacts)

  if (Debug) Log.timeEnd('calculateContacts')

  return frozenContacts
}

export function contactTypeName (type: ContactType) {
  switch (type) {
    case ContactType.HydrogenBond:
    case ContactType.WaterHydrogenBond:
    case ContactType.BackboneHydrogenBond:
      return 'hydrogen bond'
    case ContactType.Hydrophobic:
      return 'hydrophobic contact'
    case ContactType.HalogenBond:
      return 'halogen bond'
    case ContactType.IonicInteraction:
      return 'ionic interaction'
    case ContactType.MetalCoordination:
      return 'metal coordination'
    case ContactType.CationPi:
      return 'cation-pi interaction'
    case ContactType.PiStacking:
      return 'pi-pi stacking'
    case ContactType.WeakHydrogenBond:
      return 'weak hydrogen bond'
    default:
      return 'unknown contact'
  }
}

export const ContactColorDefaultParams = {
  hydrogenBondColor: '#95C1DC',
  weakHydrogenBondColor: '#C5DDEC',
  waterHydrogenBondColor: '#95C1DC',
  backboneHydrogenBondColor: '#95C1DC',
  hydrophobicColor: '#808080',
  halogenBondColor: '#40FFBF',
  ionicInteractionColor: '#F0C814',
  metalCoordinationColor: '#8C4099',
  cationPiColor: '#FF8000',
  piStackingColor: '#8CB366',
}

type ContactColorParams = typeof ContactColorDefaultParams

export const ContactDataDefaultParams = Object.assign({
  hydrogenBond: true,
  hydrophobic: true,
  halogenBond: true,
  ionicInteraction: true,
  metalCoordination: true,
  cationPi: true,
  piStacking: true,
  weakHydrogenBond: true,
  waterHydrogenBond: true,
  backboneHydrogenBond: true,
  radius: 1,
  filterSele: ''
}, ContactColorDefaultParams)

export type ContactDataParams = typeof ContactDataDefaultParams
  | { filterSele: string|[string, string] }

export const ContactLabelDefaultParams = {
  unit: '',
  size: 2.0
}

export type ContactLabelParams = typeof ContactLabelDefaultParams

const tmpColor = new Color()

class ContactColorMaker {
  
  contactColor: (type: ContactType) => number[]

  constructor(params: ContactColorParams) {
    // const p = createParams(params, ContactColorDefaultParams)
    const p = params
    const hydrogenBondColor = tmpColor.set(p.hydrogenBondColor).toArray()
    const weakHydrogenBondColor = tmpColor.set(p.weakHydrogenBondColor).toArray()
    const waterHydrogenBondColor = tmpColor.set(p.waterHydrogenBondColor).toArray()
    const backboneHydrogenBondColor = tmpColor.set(p.backboneHydrogenBondColor).toArray()
    const hydrophobicColor = tmpColor.set(p.hydrophobicColor).toArray()
    const halogenBondColor = tmpColor.set(p.halogenBondColor).toArray()
    const ionicInteractionColor = tmpColor.set(p.ionicInteractionColor).toArray()
    const metalCoordinationColor = tmpColor.set(p.metalCoordinationColor).toArray()
    const cationPiColor = tmpColor.set(p.cationPiColor).toArray()
    const piStackingColor = tmpColor.set(p.piStackingColor).toArray()
    const defaultColor = tmpColor.set(0xCCCCCC).toArray()

    this.contactColor = function(type: ContactType) {
      switch(type) {
        case ContactType.HydrogenBond:
          return hydrogenBondColor
        case ContactType.WaterHydrogenBond:
          return waterHydrogenBondColor
        case ContactType.BackboneHydrogenBond:
          return backboneHydrogenBondColor
        case ContactType.Hydrophobic:
          return hydrophobicColor
        case ContactType.HalogenBond:
          return halogenBondColor
        case ContactType.IonicInteraction:
          return ionicInteractionColor
        case ContactType.MetalCoordination:
          return metalCoordinationColor
        case ContactType.CationPi:
          return cationPiColor
        case ContactType.PiStacking:
          return piStackingColor
        case ContactType.WeakHydrogenBond:
          return weakHydrogenBondColor
        default:
          return defaultColor
      }
    }
  }
}

export interface ContactData {
  position1: Float32Array,
  position2: Float32Array,
  color: Float32Array,
  color2: Float32Array,
  radius: Float32Array,
  picking: ContactPicker
}

export function getContactData (contacts: FrozenContacts, structure: Structure, params: ContactDataParams): ContactData {
  const p = createParams(params, ContactDataDefaultParams)
  const contactColor = new ContactColorMaker(p).contactColor
  const types: ContactType[] = []
  if (p.hydrogenBond) types.push(ContactType.HydrogenBond)
  if (p.hydrophobic) types.push(ContactType.Hydrophobic)
  if (p.halogenBond) types.push(ContactType.HalogenBond)
  if (p.ionicInteraction) types.push(ContactType.IonicInteraction)
  if (p.metalCoordination) types.push(ContactType.MetalCoordination)
  if (p.cationPi) types.push(ContactType.CationPi)
  if (p.piStacking) types.push(ContactType.PiStacking)
  if (p.weakHydrogenBond) types.push(ContactType.WeakHydrogenBond)
  if (p.waterHydrogenBond) types.push(ContactType.WaterHydrogenBond)
  if (p.backboneHydrogenBond) types.push(ContactType.BackboneHydrogenBond)

  const { features, contactSet, contactStore } = contacts
  const { centers, atomSets } = features
  const { x, y, z } = centers
  const { index1, index2, type } = contactStore

  const position1: number[] = []
  const position2: number[] = []
  const color: number[] = []
  const radius: number[] = []
  const picking: number[] = []

  let filterSet: BitArray | BitArray[] | undefined
  if (p.filterSele) {
    if (Array.isArray(p.filterSele)) {
      filterSet = p.filterSele.map(sele => {
        return structure.getAtomSet(new Selection(sele))
      })
    } else {
      filterSet = structure.getAtomSet(new Selection(p.filterSele))
    }
  }

  contactSet.forEach(i => {
    const ti = type[ i ]
    if (!types.includes(ti)) return

    if (filterSet) {
      const idx1 = atomSets[index1[i]][0]
      const idx2 = atomSets[index2[i]][0]

      if (Array.isArray(filterSet)) {
        if (!(filterSet[0].isSet(idx1) && filterSet[1].isSet(idx2) || (filterSet[1].isSet(idx1) && filterSet[0].isSet(idx2)))) return
      } else {
        if (!filterSet.isSet(idx1) && !filterSet.isSet(idx2)) return
      }
    }

    const k = index1[i]
    const l = index2[i]
    position1.push(x[k], y[k], z[k])
    position2.push(x[l], y[l], z[l])
    color.push(...contactColor(ti))
    radius.push(p.radius)
    picking.push(i)
  })

  return {
    position1: new Float32Array(position1),
    position2: new Float32Array(position2),
    color: new Float32Array(color),
    color2: new Float32Array(color),
    radius: new Float32Array(radius),
    picking: new ContactPicker(picking, contacts, structure)
  }
}

export function getLabelData (contactData: ContactData, params: ContactLabelParams): TextBufferData {

  const position = calculateCenterArray(contactData.position1, contactData.position2)
  const text: string[] = []

  const direction = calculateDirectionArray(contactData.position1, contactData.position2)

  const n = direction.length / 3
  for (let i=0; i<n; i++) {
    const j = 3 * i
    const d = Math.sqrt(direction[j]**2 + direction[j+1]**2 + direction[j+2]**2)
    switch (params.unit) {
        case 'angstrom':
          text[ i ] = d.toFixed(2) + ' ' + String.fromCharCode(0x212B)
          break
        case 'nm':
          text[ i ] = (d / 10).toFixed(2) + ' nm'
          break
        default:
          text[ i ] = d.toFixed(2)
          break
      }
  }
  return {
    position,
    size: uniformArray(position.length / 3, params.size),
    color: contactData.color,
    text
  }
}
