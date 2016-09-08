/**
 * @file Molecular Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { WorkerRegistry } from "../globals.js";
import Worker from "../worker/worker.js";
import EDTSurface from "./edt-surface.js";
import Surface from "./surface.js";


WorkerRegistry.add( "molsurf", function func( e, callback ){

    var a = e.data.args;
    var p = e.data.params;
    if( a && p ){

        var edtsurf = new EDTSurface( a.coordList, a.radiusList, a.indexList );
        var sd = edtsurf.getSurface(
            p.type, p.probeRadius, p.scaleFactor, p.cutoff, true, p.smooth, p.contour
        );
        var transferList = [ sd.position.buffer, sd.index.buffer ];
        if( sd.normal ) transferList.push( sd.normal.buffer );
        if( sd.atomindex ) transferList.push( sd.atomindex.buffer );
        callback( {
            sd: sd,
            p: p
        }, transferList );
    }

}, [ EDTSurface ] );



function MolecularSurface( structure ){

    this.structure = structure;

}

MolecularSurface.prototype = {

    getAtomData: function(){

        return this.structure.getAtomData( {
            what: { position: true, radius: true, index: true },
            radiusParams: { radius: "vdw", scale: 1 }
        } );

    },

    makeSurface: function( sd, p ){

        var surface = new Surface( "", "", sd );

        surface.info.type = p.type;
        surface.info.probeRadius = p.probeRadius;
        surface.info.scaleFactor = p.scaleFactor;
        surface.info.smooth = p.smooth;
        surface.info.cutoff = p.cutoff;
        // TODO contour 

        return surface;

    },

    getSurface: function( params ){

        var p = params || {};

        var atomData = this.getAtomData();
        var coordList = atomData.position;
        var radiusList = atomData.radius;
        var indexList = atomData.index;

        var edtsurf = new EDTSurface( coordList, radiusList, indexList );
        var sd = edtsurf.getSurface(
            p.type, p.probeRadius, p.scaleFactor, p.cutoff, true, p.smooth, p.contour
        );

        return this.makeSurface( sd, p );

    },

    getSurfaceWorker: function( params, callback ){

        var p = Object.assign( {}, params );

        if( window.Worker ){

            if( this.worker === undefined ){
                this.worker = new Worker( "molsurf" );
            }

            var atomData = this.getAtomData();
            var coordList = atomData.position;
            var radiusList = atomData.radius;
            var indexList = atomData.index;

            var msg = {
                args: {
                    coordList: coordList,
                    radiusList: radiusList,
                    indexList: indexList
                },
                params: p
            };

            var transferList = [
                coordList.buffer, radiusList.buffer, indexList.buffer
            ];

            this.worker.post( msg, transferList,

                function( e ){
                    var sd = e.data.sd;
                    callback( this.makeSurface( sd, p ) );
                }.bind( this ),

                function( e ){
                    console.warn(
                        "MolecularSurface.getSurfaceWorker error - trying without worker", e
                    );
                    this.worker.terminate();
                    this.worker = undefined;
                    var surface = this.getSurface( p );
                    callback( surface );
                }.bind( this )

            );

        }else{

            var surface = this.getSurface( p );
            callback( surface );

        }

    },

    dispose: function(){

        if( this.worker ) this.worker.terminate();

    }

};


export default MolecularSurface;
