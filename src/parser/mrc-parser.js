/**
 * @file Mrc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import VolumeParser from "./volume-parser.js";


function MrcParser( streamer, params ){

    VolumeParser.call( this, streamer, params );

}

MrcParser.prototype = Object.assign( Object.create(

    VolumeParser.prototype ), {

    constructor: MrcParser,
    type: "mrc",

    _parse: function( callback ){

        // MRC
        // http://ami.scripps.edu/software/mrctools/mrc_specification.php
        // http://www2.mrc-lmb.cam.ac.uk/research/locally-developed-software/image-processing-software/#image
        // http://bio3d.colorado.edu/imod/doc/mrc_format.txt

        // CCP4 (MAP)
        // http://www.ccp4.ac.uk/html/maplib.html

        // MRC format does not use the skew transformation header records (words 25-37)
        // CCP4 format does not use the ORIGIN header records (words 50-52)

        if( Debug ) Log.time( "MrcParser._parse " + this.name );

        var bin = this.streamer.data;

        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }

        var v = this.volume;
        var header = {};

        var intView = new Int32Array( bin, 0, 56 );
        var floatView = new Float32Array( bin, 0, 56 );

        var dv = new DataView( bin );

        // 53  MAP         Character string 'MAP ' to identify file type
        header.MAP = String.fromCharCode(
            dv.getUint8( 52 * 4 ), dv.getUint8( 52 * 4 + 1 ),
            dv.getUint8( 52 * 4 + 2 ), dv.getUint8( 52 * 4 + 3 )
        );

        // 54  MACHST      Machine stamp indicating machine type which wrote file
        //                 17 and 17 for big-endian or 68 and 65 for little-endian
        header.MACHST = [ dv.getUint8( 53 * 4 ), dv.getUint8( 53 * 4 + 1 ) ];

        // swap byte order when big endian
        if( header.MACHST[ 0 ] === 17 && header.MACHST[ 1 ] === 17 ){
            var n = bin.byteLength;
            for( var i = 0; i < n; i+=4 ){
                dv.setFloat32( i, dv.getFloat32( i ), true );
            }
        }

        header.NX = intView[ 0 ];  // NC - columns (fastest changing)
        header.NY = intView[ 1 ];  // NR - rows
        header.NZ = intView[ 2 ];  // NS - sections (slowest changing)

        // mode
        //  0 image : signed 8-bit bytes range -128 to 127
        //  1 image : 16-bit halfwords
        //  2 image : 32-bit reals
        //  3 transform : complex 16-bit integers
        //  4 transform : complex 32-bit reals
        //  6 image : unsigned 16-bit range 0 to 65535
        // 16 image: unsigned char * 3 (for rgb data, non-standard)
        //
        // Note: Mode 2 is the normal mode used in the CCP4 programs.
        //       Other modes than 2 and 0 may NOT WORK
        header.MODE = intView[ 3 ];

        // start
        header.NXSTART = intView[ 4 ];  // NCSTART - first column
        header.NYSTART = intView[ 5 ];  // NRSTART - first row
        header.NZSTART = intView[ 6 ];  // NSSTART - first section

        // intervals
        header.MX = intView[ 7 ];  // intervals along x
        header.MY = intView[ 8 ];  // intervals along y
        header.MZ = intView[ 9 ];  // intervals along z

        // cell length (Angstroms in CCP4)
        header.xlen = floatView[ 10 ];
        header.ylen = floatView[ 11 ];
        header.zlen = floatView[ 12 ];

        // cell angle (Degrees)
        header.alpha = floatView[ 13 ];
        header.beta  = floatView[ 14 ];
        header.gamma = floatView[ 15 ];

        // axis correspondence (1,2,3 for X,Y,Z)
        header.MAPC = intView[ 16 ];  // column
        header.MAPR = intView[ 17 ];  // row
        header.MAPS = intView[ 18 ];  // section

        // density statistics
        header.DMIN  = floatView[ 19 ];
        header.DMAX  = floatView[ 20 ];
        header.DMEAN = floatView[ 21 ];

        // space group number 0 or 1 (default=0)
        header.ISPG = intView[ 22 ];

        // number of bytes used for symmetry data (0 or 80)
        header.NSYMBT = intView[ 23 ];

        // Flag for skew transformation, =0 none, =1 if foll
        header.LSKFLG = intView[ 24 ];

        // 26-34  SKWMAT  Skew matrix S (in order S11, S12, S13, S21 etc) if
        //                LSKFLG .ne. 0.
        // 35-37  SKWTRN  Skew translation t if LSKFLG != 0.
        //                Skew transformation is from standard orthogonal
        //                coordinate frame (as used for atoms) to orthogonal
        //                map frame, as Xo(map) = S * (Xo(atoms) - t)

        // 38      future use       (some of these are used by the MSUBSX routines
        //  .          "              in MAPBRICK, MAPCONT and FRODO)
        //  .          "   (all set to zero by default)
        //  .          "
        // 52          "

        // 50-52 origin in X,Y,Z used for transforms
        header.originX = floatView[ 49 ];
        header.originY = floatView[ 50 ];
        header.originZ = floatView[ 51 ];

        // 53  MAP         Character string 'MAP ' to identify file type
        // => see top of this parser

        // 54  MACHST      Machine stamp indicating machine type which wrote file
        // => see top of this parser

        // Rms deviation of map from mean density
        header.ARMS = floatView[ 54 ];

        // 56      NLABL           Number of labels being used
        // 57-256  LABEL(20,10)    10  80 character text labels (ie. A4 format)

        v.header = header;

        // Log.log( header )

        // FIXME depends on mode
        var data = new Float32Array(
            bin, 256 * 4 + header.NSYMBT,
            header.NX * header.NY * header.NZ
        );

        v.setData( data, header.NX, header.NY, header.NZ );

        if( Debug ) Log.timeEnd( "MrcParser._parse " + this.name );
        callback();

    },

    getMatrix: function(){

        var h = this.volume.header;

        var basisX = [
            h.xlen,
            0,
            0
        ];

        var basisY = [
            h.ylen * Math.cos( Math.PI / 180.0 * h.gamma ),
            h.ylen * Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];

        var basisZ = [
            h.zlen * Math.cos( Math.PI / 180.0 * h.beta ),
            h.zlen * (
                    Math.cos( Math.PI / 180.0 * h.alpha ) -
                    Math.cos( Math.PI / 180.0 * h.gamma ) *
                    Math.cos( Math.PI / 180.0 * h.beta )
                ) / Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];
        basisZ[ 2 ] = Math.sqrt(
            h.zlen * h.zlen * Math.sin( Math.PI / 180.0 * h.beta ) *
            Math.sin( Math.PI / 180.0 * h.beta ) - basisZ[ 1 ] * basisZ[ 1 ]
        );

        var basis = [ 0, basisX, basisY, basisZ ];
        var nxyz = [ 0, h.MX, h.MY, h.MZ ];
        var mapcrs = [ 0, h.MAPC, h.MAPR, h.MAPS ];

        var matrix = new THREE.Matrix4();

        matrix.set(

            basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
            0,

            0, 0, 0, 1

        );

        matrix.setPosition( new THREE.Vector3(
            h.originX, h.originY, h.originZ
        ) );

        matrix.multiply( new THREE.Matrix4().makeTranslation(
            h.NXSTART, h.NYSTART, h.NZSTART
        ) );

        return matrix;

    }

} );

ParserRegistry.add( "mrc", MrcParser );
ParserRegistry.add( "ccp4", MrcParser );
ParserRegistry.add( "map", MrcParser );


export default MrcParser;