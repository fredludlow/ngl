import {defaults} from '../utils.js'
import { RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'

/**
 * Cross representation
 */
class CrossRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'cross'
    this.parameters = Object.assign({
      crossSize: {
        type: 'number',
        precision: 2,
        max: 1.0,
        min: 0.2,
        rebuild: true
      },
      nonBondedOnly: {
        type: 'boolean',
        rebuild: true
      }
    }, this.parameters, {
      flatShaded: null,
      side: null,
      wireframe: null,
      roughness: null,
      metalness: null,
      diffuse: null
    })

    this.init(params)
  }

  init (params) {
    const p = params || {}

    this.crossSize = defaults(p.crossSize, 0.8)
    this.nonBondedOnly = defaults(p.nonBondedOnly, false)
    super.init(p)
  }

  createData (sview) {
    var what = { position: true, color: true }
    var atomData = sview.getAtomData(this.getAtomParams(what))

    var crossBuffer = new CrossBuffer(
        atomData, this.getBufferParams()
      )
  }

  updateData (what, data) {

  }

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && params.crossSize) {
      what.position = true
    }
    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('cross', CrossRepresentation)

export default CrossRepresentation
