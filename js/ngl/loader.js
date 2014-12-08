/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Uint8ToString = function( u8a ){
    // from http://stackoverflow.com/a/12713326/1435042
    var CHUNK_SZ = 0x8000;
    var c = [];
    for( var i = 0; i < u8a.length; i += CHUNK_SZ ){
        c.push( String.fromCharCode.apply(
            null, u8a.subarray( i, i + CHUNK_SZ )
        ) );
    }
    return c.join("");
}


NGL.decompress = function( data, file ){

    var decompressedData;
    var ext = NGL.getFileInfo( file ).ext;

    console.time( "decompress " + ext );

    if( data instanceof ArrayBuffer ){
        data = new Uint8Array( data );
    }

    if( ext === "gz" ){

        var gz = pako.ungzip( data, { "to": "string" } );
        decompressedData = gz;

    }else if( ext === "zip" ){

        var zip = new JSZip( data );
        var name = Object.keys( zip.files )[ 0 ];
        decompressedData = zip.files[ name ].asText();

    }else if( ext === "lzma" ){

        var inStream = {
            data: data,
            offset: 0,
            readByte: function(){
                return this.data[this.offset ++];
            }
        };

        var outStream = {
            data: [ /* Uncompressed data will be putted here */ ],
            offset: 0,
            writeByte: function(value){
                this.data[this.offset ++] = value;
            }
        };

        LZMA.decompressFile( inStream, outStream );
        // console.log( outStream );
        var bytes = new Uint8Array( outStream.data );
        decompressedData = NGL.Uint8ToString( bytes );

    }else if( ext === "bz2" ){

        var bitstream = bzip2.array( data );
        decompressedData = bzip2.simple( bitstream )

    }else{

        console.warn( "no decompression method available for '" + ext + "'" );
        decompressedData = data;

    }

    console.timeEnd( "decompress " + ext );

    return decompressedData;

}


///////////
// Loader


NGL.XHRLoader = function ( manager ) {

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.XHRLoader.prototype = {

    constructor: NGL.XHRLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( url );

        if ( cached !== undefined ) {

            if ( onLoad ) onLoad( cached );
            return;

        }

        var request = new XMLHttpRequest();
        request.open( 'GET', url, true );

        request.addEventListener( 'load', function ( event ) {

            if ( request.status === 200 || request.status === 304 ) {

                var data = this.response;

                if( scope.responseType === "arraybuffer" ){

                    data = NGL.decompress( data, url );

                }

                scope.cache.add( url, data );

                if ( onLoad ) onLoad( data );

            } else {

                if ( onError ) onError( request.status );

            }

            scope.manager.itemEnd( url );

        }, false );

        if ( onProgress !== undefined ) {

            request.addEventListener( 'progress', function ( event ) {

                onProgress( event );

            }, false );

        }

        if ( onError !== undefined ) {

            request.addEventListener( 'error', function ( event ) {

                onError( event );

            }, false );

        }

        if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
        if ( this.responseType !== undefined ) request.responseType = this.responseType;

        request.send( null );

        scope.manager.itemStart( url );

    },

    setResponseType: function ( value ) {

        this.responseType = value;

    },

    setCrossOrigin: function ( value ) {

        this.crossOrigin = value;

    }

};


NGL.FileLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            // scope.cache.add( file, this.response );

            var data = event.target.result;

            if( scope.responseType === "arraybuffer" ){

                data = NGL.decompress( data, file );

            }

            onLoad( data );
            scope.manager.itemEnd( file );

        }

        if ( onProgress !== undefined ) {

            reader.onprogress = function ( event ) {

                onProgress( event );

            }

        }

        if ( onError !== undefined ) {

            reader.onerror = function ( event ) {

                onError( event );

            }

        }

        if( this.responseType === "arraybuffer" ){

            console.log( "moin" )
            reader.readAsArrayBuffer( file );

        }else{

            reader.readAsText( file );

        }

        scope.manager.itemStart( file );

    },

    setResponseType: function ( value ) {

        this.responseType = value.toLowerCase();

    }

};


NGL.StructureLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.StructureLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.init = function( str, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "cif": NGL.CifParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( str, callback );

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var obj = new NGL.Surface( data, name, path )

    if( typeof callback === "function" ) callback( obj );

    return obj;

};


NGL.PlyLoader = function( manager ){

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.PlyLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var ply = new NGL.Surface( data, name, path );

    if( typeof callback === "function" ) callback( ply );

    return ply;

};


NGL.ScriptLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ScriptLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.ScriptLoader.prototype.init = function( data, name, path, ext, callback ){

    var script = new NGL.Script( data, name, path );

    if( typeof callback === "function" ) callback( script );

    return script;

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.StructureLoader,
        "pdb": NGL.StructureLoader,
        "cif": NGL.StructureLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

        "ngl": NGL.ScriptLoader,

    }

    return function( file, onLoad, onProgress, onError, params ){

        var object, rcsb, loader;

        var fileInfo = NGL.getFileInfo( file );

        var path = fileInfo.path;
        var name = fileInfo.name;
        var ext = fileInfo.ext;

        var compressed = false;

        // FIXME can lead to false positives
        // maybe use a fake protocoll like rcsb://
        if( name.length === 4 && name == path && name.toLowerCase() === ext ){

            ext = "pdb";
            file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";

            rcsb = true;

        }

        if( ext === "gz" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 3 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "zip" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 4 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "lzma" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 5 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "bz2" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 4 ) );
            ext = fileInfo.ext;
            compressed = true;
        }

        if( ext in loaders ){

            loader = new loaders[ ext ];

        }else{

            error( "NGL.autoLoading: ext '" + ext + "' unknown" );

            return null;

        }

        function init( data ){

            if( data ){

                object = loader.init( data, name, path, ext, function( _object ){

                    if( typeof onLoad === "function" ) onLoad( _object );

                }, params );

            }else{

                error( "empty response" );

            }

        }

        function error( e ){

            if( typeof onError === "function" ){

                onError( e );

            }else{

                console.error( e );

            }

        }

        if( file instanceof File ){

            name = file.name;

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setResponseType( "arraybuffer" );
            fileLoader.load( file, init, onProgress, error );

        }else if( rcsb ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( file, init, onProgress, error );

        }else{

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../data/" + file, init, onProgress, error );

        }

        return object;

    }

}();
