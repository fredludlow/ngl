import Buffer from './buffer.js'

import '../shader/Line.vert'
import '../shader/Line.frag'

class CrossBuffer extends Buffer {
  /**
   * Cross buffer. Draws a cross at each provided point.
   *
   * @param {Object} data - attribute object
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Number} data.crossSize - length of cross
   * @param {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    var size = data.position.length / 3
    // Each atom requires 6 vertices
    var attrSize = 6 * size

    super({
      position: new Float32Array(attrSize * 3),
      color: new Float32Array(attrSize * 3)
    }, params)

    this.setAttributes(data)
  }

  setAttributes (data) {
    let position
    let color
    let aPosition
    let aColor
    let attributes = this.geometry.attributes

    if (data.position) {
      position = data.position
      aPosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    if (data.color) {
      color = data.color
      aColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    const cSize = data.crossSize
    const n = this.size // buffer takes from data.position

    for (let v = 0; v < n; v++) {
      const j = v * 3
      const i = v * 6 * 3
      const x = position[j]
      const y = position[j + 1]
      const z = position[j + 2]

      if (data.position) {
        aPosition[ i ] = x - cSize
        aPosition[ i + 1 ] = y
        aPosition[ i + 2 ] = z
        aPosition[ i + 3 ] = x + cSize
        aPosition[ i + 4 ] = y
        aPosition[ i + 5 ] = z

        aPosition[ i + 7 ] = x
        aPosition[ i + 8 ] = y - cSize
        aPosition[ i + 9 ] = z
        aPosition[ i + 10 ] = x
        aPosition[ i + 11 ] = y + cSize
        aPosition[ i + 12 ] = z

        aPosition[ i + 13 ] = x
        aPosition[ i + 14 ] = y
        aPosition[ i + 15 ] = z - cSize
        aPosition[ i + 16 ] = x
        aPosition[ i + 17 ] = y
        aPosition[ i + 18 ] = z + cSize
      }
      if (data.color) {
        const cimax = i + 18
        for (let ci = i; ci < cimax; ci += 3) {
          aColor[ ci ] = color[ j ]
          aColor[ ci + 1 ] = color[ j + 1 ]
          aColor[ ci + 2 ] = color[ j + 2 ]
        }
      }
    }
  }
  get isLine () { return true }
  get vertexShader () { return 'Line.vert' }
  get fragmentShader () { return 'Line.frag' }
}

export default CrossBuffer
