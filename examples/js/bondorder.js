/** 
* Experimental bond-order stuff!
*/
document.addEventListener( "DOMContentLoaded", function(){
    window.stage = new NGL.Stage( "viewport" );
    stage.viewer.container.addEventListener( "dblclick", function(){
        stage.toggleFullscreen();
    } );
    stage.loadFile( "../data/1ajx_ligand.sdf" ).then( afterload );
    
} );

/** 
 * A quick class for playing around with drawing higher order bonds and stuff
 * Basic outline is:
 * An inefficient way of doing this is to first build the mapping of atoms to bonds
 * atomIndex -> [bond1, bond2, bond3, ...]
 * Then simply for each higher-order bond, lookup a1.bonds to find a different bond
   and try to construct the offset with that.
 */
function BondBuilder( structure ) {

  // Iterate over bonds, storing higher-order ones in a new bitset (and keeping
  // count of how many there are).
  
  this.structure = structure;

  this.init();




}

BondBuilder.prototype = {

  constructor: BondBuilder,
  
  /** Setup local storage */
  init: function() {
    
    // A bitset of bonds w/ order > 1:
    var n = this.structure.bondStore.count;
    var dbs = this.dblBondSet = new NGL.Bitset( n );

    // Our atom->bond mapping:
    var m = this.atomBondMapping = {};
    
    // Need to be careful as some bonds specified multiple times
    // Probably want a canonical way to pick reference atoms so 
    // immune to this (i.e. same bond specified multiple times 
    // will always generate the offfset representation in the same place)
    
    this.structure.eachBond( function( bp ) {

      // Build the mapping 
      var a1 = m[bp.atomIndex1] = (m[bp.atomIndex1] || []);
      var a2 = m[bp.atomIndex2] = (m[bp.atomIndex2] || []);
      a1.push(bp.index);
      a2.push(bp.index);

      // If bond is double or higher, add to dblBondSet
      if (bp.bondOrder > 1) {
        dbs.add_unsafe(bp.index);
      }

    });

    var ndbl = dbs.size();

    // Now pick reference atoms for each bond:
    var bondReferenceAtoms = this.bondReferenceAtoms = {} // Bond-index -> reference atom index
    var ap1 = this.structure.getAtomProxy(),
    ap2 = this.structure.getAtomProxy(),
    ap3 = this.structure.getAtomProxy();
    var bp = this.structure.getBondProxy();
    var refbp = this.structure.getBondProxy();

    var offsets = this.offsets = new Float32Array( ndbl * 3 );

    var self = this;

    dbs.forEach( function( bondIndex, iterIndex )  {

      bp.index = bondIndex;
      // Canonical way of picking a reference atom:
      var bondAtoms = [bp.atomIndex1, bp.atomIndex2].sort();
      var foundReference = false;

      for (var i=0; i<2; i++) {
        var ai1 = bondAtoms[i];
        var ai2 = bondAtoms[1-i];

        ap1.index = ai1;
        ap2.index = ai2;


        var bonds = m[ai1].sort();
        for (var j=0; j<bonds.length; j++) {
          if (bonds[j] != bondIndex) {
            refbp.index = bonds[j];

            var ai3 = (refbp.atomIndex1 === ai1) ? refbp.atomIndex2 : refbp.atomIndex1;
            ap3.index = ai3;

            bondReferenceAtoms[bondIndex] = ai3;

            if (self.calculateOffset(ap1, ap2, ap3, offsets, iterIndex*3)) {
              foundReference = true;
              break;

            }
          }
        }
        if (foundReference) { break; }
        
      }

      if (!foundReference) {
        console.log("Warning: no non-colinear bonded atom found for bond:"
                    + " picking an arbitrary offset");
      }

    });
    


  },

  /*
   * Given atom proxies pointing to a1 (double bonded to a2, also bonded to a3):
   * 1) Determine if 
   */
  calculateOffset: function(ap1, ap2, ap3, offsets, ix) {

    var coLinear = false;

    var p1 = ap1.positionToVector3();
    var v12 = ap2.positionToVector3().sub(p1).normalize();
    var v13 = ap3.positionToVector3().sub(p1).normalize();

    var dp = v12.clone().dot(v13);
    if (1 - Math.abs(dp) < 1e-5) {
      // More or less colinear:
      coLinear = true;
    }

    // But set stuff regardless anyway, caller decides what to do
    (v13.sub( v12.multiplyScalar(dp) ) ).normalize().toArray(offsets, ix);

    return !coLinear;

  },
  
  createBufferData: function() {
    
    var ndbl = this.dblBondSet.size();
    this.bufferData = {}

    // We ultimately need to call LineBuffer with arrays of 
    // start positions, end positions and colours (1|2) (plus other params)
    // Colors are simply the same as single bond colours

    // We need to calculate and store a series of offsets, and the new start
    // and finish points
    var pos1 = this.bufferData.position1 = new Float32Array( ndbl * 3 );
    var pos2 = this.bufferData.position2 = new Float32Array( ndbl * 3 );

    var color1 = this.bufferData.color1 = new Float32Array( ndbl * 3 );
    var color2 = this.bufferData.color2 = new Float32Array( ndbl * 3 );

    var colorMaker = NGL.ColorMakerRegistry.getScheme( {structure: this.structure} );

    var bp = this.structure.getBondProxy();
    var ap1 = this.structure.getAtomProxy();
    var ap2 = this.structure.getAtomProxy();

    var offsets = this.offsets;

    this.dblBondSet.forEach( function (bondIndex, iterIndex) {

      var i3 = 3 * iterIndex;
      bp.index = bondIndex;
      ap1.index = bp.atomIndex1;
      ap2.index = bp.atomIndex2;

      var offset = new THREE.Vector3()
                   .fromArray(offsets, i3)
                   .multiplyScalar(0.25);      

      ap1.positionToVector3().add(offset).toArray(pos1, i3);
      ap2.positionToVector3().add(offset).toArray(pos2, i3);

      colorMaker.bondColorToArray( bp, 1, color1, i3 );
      colorMaker.bondColorToArray( bp, 0, color2, i3 );
      

    });
  

  }
  
  
  
};

function afterload(component) {
   
  component.addRepresentation("line");
  component.centerView();
  
  var s = window.s = component.structure;
  
  
  var bb = window.bb = new BondBuilder(s);
  bb.createBufferData();

  component.addBufferRepresentation(
    new NGL.LineBuffer( bb.bufferData.position1,
                        bb.bufferData.position2,
                        bb.bufferData.color1,
                        bb.bufferData.color2,
                        {
                          
                          clipNear: this.clipNear,
                          flatShaded: this.flatShaded,
                          opacity: this.opacity,
                          side: this.side,
                          wireframe: this.wireframe,
                          linewidth: this.linewidth,
                          
                          roughness: this.roughness,
                          metalness: this.metalness,
                          diffuse: this.diffuse
                          
                        }
                      ));
  
};


