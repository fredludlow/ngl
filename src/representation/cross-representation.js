import {defaults} from '../utils.js'
import { RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import CrossBuffer from '../buffer/cross-buffer.js'
// import Selection from '../selection/selection.js'

/** Determine which atoms in a Structure[View] are isolated in the
  current view.

  For a Structure object this is equivalent to
  `structure.getAtomSet(new Selection("not bonded"))`

  For a StructureView it takes into account the selection applied to
  the view.

  E.g. if selection is ".CA" (C-alphas) then this function will return
  all C-alphas (as none of them form bonds to other selected atoms)
*/
function getIsolatedAtomSet (structure) {
  const atomSet = structure.getAtomSet()
  const bondSet = structure.getBondSet()
  const bp = structure.getBondProxy()
  bondSet.forEach(function (idx) {
    bp.index = idx
    atomSet.clear(bp.atomIndex1)
    atomSet.clear(bp.atomIndex2)
  })
  return atomSet
}

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
        min: 0.05,
        rebuild: true
      },
      nonBonded: {
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

    this.crossSize = defaults(p.crossSize, 0.2)
    this.nonBonded = defaults(p.nonBonded, true)
    super.init(p)
  }

  createData (sview) {
    const what = { position: true, color: true }
    const p = {}

    if (this.nonBonded) {
      p.atomSet = getIsolatedAtomSet(sview)
      // p.atomSet = sview.getAtomSet(new Selection('not bonded'))
    }

    const atomData = sview.getAtomData(this.getAtomParams(what, p))

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
    const p = {}
    if (this.nonBonded) {
      p.atomSet = getIsolatedAtomSet(data.sview)
      // p.atomSet = data.sview.getAtomSet(new Selection('not bonded'))
    }

    const atomData = data.sview.getAtomData(this.getAtomParams(what, p))
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
