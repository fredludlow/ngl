import VolumeParser from './volume-parser'
import { Matrix4 } from 'three'
import { ParserRegistry } from '../ngl'

interface Header {
  title: string,
  format: string,
  lx: number,
  ly: number,
  lz: number,
  alpha: number,
  beta: number,
  gamma: number
  nx: number,
  ny: number,
  nz: number,
  dx: number,
  dy: number,
  dz: number,
  ox: number,
  oy: number,
  oz: number

}

/** Parse the InsightII grid format:
 * TODO: Link to any formal documentation of this format
 * Currently rejects non-orthogonal grids (could handle using method employed in mrc-parser)
 */
export default class GrdParser extends VolumeParser {
  _parse () {
    const v = this.volume
    const headerLines: string[] = this.streamer.peekLines(5)
    const header: Partial<Header> = {}

    header.title = headerLines[0].trim()
    header.format = headerLines[1].trim()
    let headerTokenizer: (line: string) => number[] 

    // Try to match format string
    const match = header.format.match(/F(\d+)\.(\d+)/)
    
    if (match !== null) { 
      const fieldLength = parseInt(match[1])
      headerTokenizer = line => {
        const a = []
        for (let i=0; i<line.length; i+= fieldLength) {
          a.push(parseFloat(line.slice(i, i+fieldLength)))
        }
        return a
      }
    } else {
      // Fallback to whitespace splitting
      headerTokenizer = line => {
        return line.trim().split(/\s+/).map(parseFloat)
      }
    }

    const lengthAngles = headerTokenizer(headerLines[2])
    header.lx = lengthAngles[0]
    header.ly = lengthAngles[1]
    header.lz = lengthAngles[2]
    header.alpha = lengthAngles[3]
    header.beta = lengthAngles[4]
    header.gamma = lengthAngles[5]

    const size = headerTokenizer(headerLines[3])
    header.nx = size[0] + 1
    header.ny = size[1] + 1
    header.nz = size[2] + 1

    header.dx = header.lx / size[0]
    header.dy = header.ly / size[1]
    header.dz = header.lz / size[2]

    const finalLine = headerTokenizer(headerLines[4])
    header.ox = header.dx * finalLine[1]
    header.oy = header.dy * finalLine[3]
    header.oz = header.dz * finalLine[5]

    const data = new Float32Array(header.nx * header.ny * header.nz)

    let lineNo = 0
    let count = 0

    function _parseChunkOfLines(_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ].trim()
        if (line !== '' && lineNo >= 5) {
          data[count++] = parseFloat(line)
        }
        ++lineNo
      }
    }

    v.header = header
    v.setData(data, header.nx, header.ny, header.nz)

    this.streamer.eachChunkOfLines(function (lines) {
      _parseChunkOfLines(0, lines.length, lines)
    })
  }

  getMatrix () {
    const h = this.volume.header
    const matrix = new Matrix4()

    matrix.multiply(
      new Matrix4().makeTranslation(
        h.ox, h.oy, h.oz
      )
    )

    matrix.multiply(
      new Matrix4().makeScale(
        h.dx, h.dy, h.dz
      )
    )

    return matrix
  }

}

ParserRegistry.add('grd', GrdParser)
