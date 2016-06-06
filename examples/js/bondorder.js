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
	this.dblBondSet = new NGL.Bitset( n );
	// Our atom->bond mapping:
	var m = this.atomBondMapping = {};

	// Hmm, this is generating each bond twice(or more) 
	// No deduplication done during parsing it seems?
	this.structure.eachBond( function( bp ) {

	    var a1 = m[bp.atomIndex1] = (m[bp.atomIndex1] || []);
	    var a2 = m[bp.atomIndex2] = (m[bp.atomIndex2] || []);
	    a1.push(bp.index);
	    a2.push(bp.index);


	});

    },
    
    createBuffer: function() {

	var bondDetails = this.getHigherOrderBondDetails();

    },

    /** Return an object with 
	{ bonds: bitset of bonds with order > 1,
	  
     */
    getHigherOrderBondDetails: function() {

	var bs = new NGL.Bitset(this.structure.bondSet.length);
	var bp = this.structure.getBondProxy();
	
	

    }

    

};

function afterload(component) {
   
    component.addRepresentation("line");
    component.centerView();

    var s = window.s = component.structure;
    
    
    window.bb = new BondBuilder(s);



};


