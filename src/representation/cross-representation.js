import {defaults} from '../utils.js'
import { RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import CrossBuffer from '../buffer/cross-buffer.js'

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
    super.init(p)
  }

  createData (sview) {
    const what = { position: true, color: true }
    const atomData = sview.getAtomData(this.getAtomParams(what))

    const crossBuffer = new CrossBuffer(
        atomData, this.getBufferParams({
          crossSize: this.crossSize
        })
    )

    return {
      bufferList: [ crossBuffer ]
    }
  }

  updateData (what, data) {
    const atomData = data.sview.getAtomData(this.getAtomParams(what))
    const crossData = {}

    if (!what || what.position) {
      crossData.position = atomData.position
    }

    if (!what || what.color) {
      crossData.color = atomData.color
    }

    data.bufferList[ 0 ].setAttributes(crossData)
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
