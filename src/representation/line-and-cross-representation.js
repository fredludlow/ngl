 /**
 * @file Line And Cross Representation
 * @author  Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import StructureRepresentation from './structure-representation.js'
import { getIsolatedAtomSet } from './cross-representation.js'

import CrossBuffer from '../buffer/cross-buffer.js'
import LineBuffer from '../buffer/line-buffer.js'
import PointBuffer from '../buffer/point-buffer.js'

class LineAndCrossRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'line+cross'

    this.parameters = Object.assign({
      crossAll: {
        type: 'boolean', rebuild: true
      },
      crossSize: {
        type: 'number', precision: 2, max: 1.0, min: 0.05, rebuild: true
      },
      pickable: {
        type: 'boolean', rebuild: true
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
    this.crossSize = defaults(p.crossSize, 0.20)
    this.crossAll = defaults(p.crossAll, false)
    this.pickable = defaults(p.pickable, false)

    super.init(p)
  }

  crossData (what, sview) {
    const crossAtomParams = {}

    if (!this.crossAll) {
      crossAtomParams.atomSet = getIsolatedAtomSet(sview)
    }

    return sview.getAtomData(this.getAtomParams(what, crossAtomParams))
  }

  lineData (what, sview) {
    return sview.getBondData(this.getBondParams(what))
  }

  pointData (what, sview) {
    return sview.getAtomData(this.getAtomParams(what))
  }

  createData (sview) {
    const what = { position: true, color: true, picking: this.pickable }

    const crossBuffer = new CrossBuffer(
      this.crossData(what, sview),
      this.getBufferParams({
        crossSize: this.crossSize
      })
    )

    const lineBuffer = new LineBuffer(
      this.lineData(what, sview),
      this.getBufferParams()
    )

    const bufferList = [ crossBuffer, lineBuffer ]

    if (this.pickable) {
      const pointBuffer = new PointBuffer(
        this.pointData(what, sview),
        this.getBufferParams({
          pointSize: 10,
          sizeAttenuation: false,
          opacity: 0.0
        })

      )
      bufferList.push(pointBuffer)
    }

    return {
      bufferList: bufferList
    }
  }

  updateData (what, data) {
    const crossAttributes = {}
    const lineAttributes = {}
    const pointAttributes = {}

    const crossData = this.crossData(what, data.sview)
    const lineData = this.lineData(what, data.sview)

    let pointData = {}
    if (this.pickable) {
      pointData = this.pointData(what, data.sview)
    }

    if (!what || what.position) {
      crossAttributes.position = crossData.position
      lineAttributes.position1 = lineData.position1
      lineAttributes.position2 = lineData.position2
      pointAttributes.position = pointData.position
    }

    if (!what || what.color) {
      crossAttributes.color = crossData.color
      lineAttributes.color = lineData.color
      lineAttributes.color2 = lineData.color2
    }

    data.bufferList[0].setAttributes(crossAttributes)
    data.bufferList[1].setAttributes(lineAttributes)

    if (this.pickable) {
      data.bufferList[2].setAttributes(pointAttributes)
    }
  }

  setParameters (params) {
    let rebuild = false
    const what = {}

    if (params && (params.crossAll || params.crossSize)) {
      what.position = true
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('line+cross', LineAndCrossRepresentation)

export default LineAndCrossRepresentation
