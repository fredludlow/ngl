/**
 * @file Contact Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { RepresentationRegistry } from '../globals'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'
import { calculateContacts, getContactData, getLabelData, ContactColorDefaultParams } from '../chemistry/interactions/contact'
import CylinderBuffer from '../buffer/cylinder-buffer'
import TextBuffer from '../buffer/text-buffer'
import { getFixedCountDashData } from '../geometry/dash'
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';
// @ts-ignore: unused import ContactPicker required for declaration only
import { ContactPicker } from '../utils/picker';

export interface ContactRepresentationParameters extends StructureRepresentationParameters {
  hydrogenBond: boolean
  hydrogenBondColor: string
  weakHydrogenBond: boolean
  weakHydrogenBondColor: string
  waterHydrogenBond: boolean
  waterHydrogenBondColor: string
  backboneHydrogenBond: boolean
  backboneHydrogenBondColor: string
  hydrophobic: boolean
  hydrophobicColor: string
  halogenBond: boolean
  halogenBondColor: string
  ionicInteraction: boolean
  ionicInteractionColor: string
  metalCoordination: boolean
  metalCoordinationColor: string
  cationPi: boolean
  cationPiColor: string
  piStacking: boolean
  piStackingColor: string
  filterSele: string|[string, string]
  maxHydrophobicDist: number
  maxHbondDist: number
  maxHbondSulfurDist: number
  maxHbondAccAngle: number
  maxHbondDonAngle: number
  maxHbondAccPlaneAngle: number
  maxHbondDonPlaneAngle: number
  maxPiStackingDist: number
  maxPiStackingOffset: number
  maxPiStackingAngle: number
  maxCationPiDist: number
  maxCationPiOffset: number
  maxIonicDist: number
  maxHalogenBondDist: number
  maxHalogenBondAngle: number
  maxMetalDist: number
  refineSaltBridges: boolean
  masterModelIndex: number
  lineOfSightDistFactor: number
}

/**
 * Contact representation.
 */
class ContactRepresentation extends StructureRepresentation {
  protected hydrogenBond: boolean
  protected hydrogenBondColor: string
  protected weakHydrogenBond: boolean
  protected weakHydrogenBondColor: string
  protected waterHydrogenBond: boolean
  protected waterHydrogenBondColor: string
  protected backboneHydrogenBond: boolean
  protected backboneHydrogenBondColor: string
  protected hydrophobic: boolean
  protected hydrophobicColor: string
  protected halogenBond: boolean
  protected halogenBondColor: string
  protected ionicInteraction: boolean
  protected ionicInteractionColor: string
  protected metalCoordination: boolean
  protected metalCoordinationColor: string
  protected cationPi: boolean
  protected cationPiColor: string
  protected piStacking: boolean
  protected piStackingColor: string

  protected filterSele: string|[string, string]
  protected maxHydrophobicDist: number
  protected maxHbondDist: number
  protected maxHbondSulfurDist: number
  protected maxHbondAccAngle: number
  protected maxHbondDonAngle: number
  protected maxHbondAccPlaneAngle: number
  protected maxHbondDonPlaneAngle: number
  protected maxPiStackingDist: number
  protected maxPiStackingOffset: number
  protected maxPiStackingAngle: number
  protected maxCationPiDist: number
  protected maxCationPiOffset: number
  protected maxIonicDist: number
  protected maxHalogenBondDist: number
  protected maxHalogenBondAngle: number
  protected maxMetalDist: number
  protected refineSaltBridges: boolean
  protected masterModelIndex: number
  protected lineOfSightDistFactor: number

  constructor (structure: Structure, viewer: Viewer, params: Partial<ContactRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'contact'

    this.parameters = Object.assign({
      hydrogenBond: {
        type: 'boolean', rebuild: true
      },
      hydrogenBondColor: {
        type: 'color', rebuild: true
      },
      weakHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      weakHydrogenBondColor: {
        type: 'color', rebuild: true
      },
      waterHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      waterHydrogenBondColor: {
        type: 'color', rebuild: true
      },
      backboneHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      backboneHydrogenBondColor: {
        type: 'color', rebuild: true
      },
      hydrophobic: {
        type: 'boolean', rebuild: true
      },
      hydrophobicColor: {
        type: 'color', rebuild: true
      },
      halogenBond: {
        type: 'boolean', rebuild: true
      },
      halogenBondColor: {
        type: 'color', rebuild: true
      },
      ionicInteraction: {
        type: 'boolean', rebuild: true
      },
      ionicInteractionColor: {
        type: 'color', rebuild: true
      },
      metalCoordination: {
        type: 'boolean', rebuild: true
      },
      metalCoordinationColor: {
        type: 'color', rebuild: true
      },
      cationPi: {
        type: 'boolean', rebuild: true
      },
      cationPiColor: {
        type: 'color', rebuild: true
      },
      piStacking: {
        type: 'boolean', rebuild: true
      },
      piStackingColor: {
        type: 'color', rebuild: true
      },
      filterSele: {
        type: 'text', rebuild: true
      },

      labelVisible: {
        type: 'boolean', rebuild: true
      },

      labelFixedSize: {
        type: 'boolean', buffer: 'fixedSize'
      },

      labelSize: {
        type: 'number', precision: 3, max: 10.0, min: 0.001, rebuild: true
      },

      labelUnit: {
        type: 'select',
        rebuild: true,
        options: { '': '', angstrom: 'angstrom', nm: 'nm' }
      },

      maxHydrophobicDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondSulfurDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondAccAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxHbondDonAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxHbondAccPlaneAngle: {
        type: 'integer', max: 90, min: 0, rebuild: true
      },
      maxHbondDonPlaneAngle: {
        type: 'integer', max: 90, min: 0, rebuild: true
      },
      maxPiStackingDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxCationPiDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxCationPiOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxIonicDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxMetalDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      refineSaltBridges: {
        type: 'boolean', rebuild: true
      },
      masterModelIndex: {
        type: 'integer', max: 1000, min: -1, rebuild: true
      },
      lineOfSightDistFactor: {
        type: 'number', precision: 1, max: 10, min: 0.0, rebuild: true
      },

      radialSegments: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params: Partial<ContactRepresentationParameters>) {
    var p = params || {}
    p.radiusSize = defaults(p.radiusSize, 0.05)
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    this.hydrogenBond = defaults(p.hydrogenBond, true)
    this.hydrogenBondColor = defaults(p.hydrogenBondColor, ContactColorDefaultParams.hydrogenBondColor)
    this.weakHydrogenBond = defaults(p.weakHydrogenBond, false)
    this.weakHydrogenBondColor = defaults(p.weakHydrogenBondColor, ContactColorDefaultParams.weakHydrogenBondColor)
    this.waterHydrogenBond = defaults(p.waterHydrogenBond, false)
    this.waterHydrogenBondColor = defaults(p.waterHydrogenBondColor, ContactColorDefaultParams.waterHydrogenBondColor)
    this.backboneHydrogenBond = defaults(p.backboneHydrogenBond, false)
    this.backboneHydrogenBondColor = defaults(p.backboneHydrogenBondColor, ContactColorDefaultParams.backboneHydrogenBondColor)
    this.hydrophobic = defaults(p.hydrophobic, false)
    this.hydrophobicColor = defaults(p.hydrophobicColor, ContactColorDefaultParams.hydrophobicColor)
    this.halogenBond = defaults(p.halogenBond, true)
    this.halogenBondColor = defaults(p.halogenBondColor, ContactColorDefaultParams.halogenBondColor)
    this.ionicInteraction = defaults(p.ionicInteraction, true)
    this.ionicInteractionColor = defaults(p.ionicInteractionColor, ContactColorDefaultParams.ionicInteractionColor)
    this.metalCoordination = defaults(p.metalCoordination, true)
    this.metalCoordinationColor = defaults(p.metalCoordinationColor, ContactColorDefaultParams.metalCoordinationColor)
    this.cationPi = defaults(p.cationPi, true)
    this.cationPiColor = defaults(p.cationPiColor, ContactColorDefaultParams.cationPiColor)
    this.piStacking = defaults(p.piStacking, true)
    this.piStackingColor = defaults(p.piStackingColor, ContactColorDefaultParams.piStackingColor)

    this.filterSele = defaults(p.filterSele, '')
    this.labelVisible = defaults(p.labelVisible, false)
    this.labelFixedSize = defaults(p.labelFixedSize, false)
    this.labelSize = defaults(p.labelSize, 2.0)
    this.labelUnit = defaults(p.labelUnit, '')

    this.maxHydrophobicDist = defaults(p.maxHydrophobicDist, 4.0)
    this.maxHbondDist = defaults(p.maxHbondDist, 3.5)
    this.maxHbondSulfurDist = defaults(p.maxHbondSulfurDist, 4.1)
    this.maxHbondAccAngle = defaults(p.maxHbondAccAngle, 45)
    this.maxHbondDonAngle = defaults(p.maxHbondDonAngle, 45)
    this.maxHbondAccPlaneAngle = defaults(p.maxHbondAccPlaneAngle, 90)
    this.maxHbondDonPlaneAngle = defaults(p.maxHbondDonPlaneAngle, 30)
    this.maxPiStackingDist = defaults(p.maxPiStackingDist, 5.5)
    this.maxPiStackingOffset = defaults(p.maxPiStackingOffset, 2.0)
    this.maxPiStackingAngle = defaults(p.maxPiStackingAngle, 30)
    this.maxCationPiDist = defaults(p.maxCationPiDist, 6.0)
    this.maxCationPiOffset = defaults(p.maxCationPiOffset, 2.0)
    this.maxIonicDist = defaults(p.maxIonicDist, 5.0)
    this.maxHalogenBondDist = defaults(p.maxHalogenBondDist, 3.5)
    this.maxHalogenBondAngle = defaults(p.maxHalogenBondAngle, 30)
    this.maxMetalDist = defaults(p.maxMetalDist, 3.0)
    this.refineSaltBridges = defaults(p.refineSaltBridges, true)
    this.masterModelIndex = defaults(p.masterModelIndex, -1)
    this.lineOfSightDistFactor = defaults(p.lineOfSightDistFactor, 1.0)

    super.init(p)
  }

  getAtomRadius () {
    return 0
  }

  getContactData (sview: StructureView) {
    const params = {
      maxHydrophobicDist: this.maxHydrophobicDist,
      maxHbondDist: this.maxHbondDist,
      maxHbondSulfurDist: this.maxHbondSulfurDist,
      maxHbondAccAngle: this.maxHbondAccAngle,
      maxHbondDonAngle: this.maxHbondDonAngle,
      maxHbondAccPlaneAngle: this.maxHbondAccPlaneAngle,
      maxHbondDonPlaneAngle: this.maxHbondDonPlaneAngle,
      maxPiStackingDist: this.maxPiStackingDist,
      maxPiStackingOffset: this.maxPiStackingOffset,
      maxPiStackingAngle: this.maxPiStackingAngle,
      maxCationPiDist: this.maxCationPiDist,
      maxCationPiOffset: this.maxCationPiOffset,
      maxIonicDist: this.maxIonicDist,
      maxHalogenBondDist: this.maxHalogenBondDist,
      maxHalogenBondAngle: this.maxHalogenBondAngle,
      maxMetalDist: this.maxMetalDist,
      refineSaltBridges: this.refineSaltBridges,
      masterModelIndex: this.masterModelIndex,
      lineOfSightDistFactor: this.lineOfSightDistFactor
    }

    const dataParams = {
      hydrogenBond: this.hydrogenBond,
      hydrogenBondColor: this.hydrogenBondColor,
      weakHydrogenBond: this.weakHydrogenBond,
      weakHydrogenBondColor: this.weakHydrogenBond,
      waterHydrogenBond: this.waterHydrogenBond,
      waterHydrogenBondColor: this.waterHydrogenBondColor,
      backboneHydrogenBond: this.backboneHydrogenBond,
      backboneHydrogenBondColor: this.backboneHydrogenBondColor,
      hydrophobic: this.hydrophobic,
      hydrophobicColor: this.hydrophobicColor,
      halogenBond: this.halogenBond,
      halogenBondColor: this.halogenBondColor,
      ionicInteraction: this.ionicInteraction,
      ionicInteractionColor: this.ionicInteractionColor,
      metalCoordination: this.metalCoordination,
      metalCoordinationColor: this.metalCoordinationColor,
      cationPi: this.cationPi,
      cationPiColor: this.cationPiColor,
      piStacking: this.piStacking,
      piStackingColor: this.piStackingColor,
      radius: this.radiusSize * this.radiusScale,
      filterSele: this.filterSele
    }

    const contacts = calculateContacts(sview, params)
    return getContactData(contacts, sview, dataParams)
  }

  createData (sview: StructureView) {
    const contactData = this.getContactData(sview)

    const bufferList = [
      new CylinderBuffer(
        getFixedCountDashData(contactData),
        this.getBufferParams({
          sphereDetail: 1,
          dullInterior: true,
          disableImpostor: this.disableImpostor
        })
      ) as (CylinderGeometryBuffer | CylinderImpostorBuffer | TextBuffer)
    ]

    if (this.labelVisible) {
      const labelParams = {
        size: this.labelSize,
        unit: this.labelUnit
      }
      bufferList.push(new TextBuffer(
        getLabelData(contactData, labelParams),
        this.getBufferParams({fixedSize: this.labelFixedSize})
      ))
    }

    return { bufferList }
  }
}

RepresentationRegistry.add('contact', ContactRepresentation)

export default ContactRepresentation
