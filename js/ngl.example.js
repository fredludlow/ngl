

NGL.Examples = {

    load: function( name, stage ){

        NGL.Examples.data[ name ]( stage );

    },

    data: {

        "trajectory": function( stage ){

            stage.loadFile( "../data/__example__/md.gro", function( o ){

                o.addRepresentation( "line", "*" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            } );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "../data/__example__/md.gro", function( o ){

                o.addRepresentation( "line", "*" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                var traj = o.addTrajectory( "__example__/md.xtc" );

                var i = 0;
                var foo = setInterval(function(){
                    
                    traj.setFrame( i++ % 51 );
                    if( i >= 102 ) clearInterval( foo );

                }, 50);

            } );

        },

        "3pqr": function( stage ){

            stage.loadFile( "../data/__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "135:A 347:B 223:A" );
                o.addRepresentation( "licorice", "hetero" );
                
                o.structure.eachAtom(
                    function( a ){
                        stage.centerView( a );
                    },
                    new NGL.Selection( "347:B.CA" )
                );

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "../data/__example__/1blu.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "licorice", "*" );
                o.centerView();

            } );

        },

        "multi_model": function( stage ){

            stage.loadFile( "../data/__example__/1LVZ.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                // o.addRepresentation( "licorice", "*" );
                o.centerView();

                // console.log( o.structure.toPdb() );

            } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "../data/__example__/1crn.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

            stage.loadFile( "../data/__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "tube", "*" );
                o.addRepresentation( "ball+stick", "hetero" );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "../data/__example__/3dqb.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "tube", s );

                stage.loadFile( "../data/__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "tube", s );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, false, s );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "alignment": function( stage ){

            stage.loadFile( "../data/__example__/3dqb.pdb", function( o1 ){

                o1.addRepresentation( "tube" );
                o1.addRepresentation( "ball+stick", "hetero" );
                o1.centerView();

                stage.loadFile( "../data/__example__/3sn6.pdb", function( o2 ){

                    o2.addRepresentation( "tube" );
                    o2.addRepresentation( "ball+stick", "hetero" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "alignment2": function( stage ){

            stage.loadFile( "../data/__example__/1gzm.pdb", function( o1 ){

                o1.addRepresentation( "tube" );
                o1.centerView();

                stage.loadFile( "../data/__example__/1u19.pdb", function( o2 ){

                    o2.addRepresentation( "tube" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        // alexpc
        
        "rho_traj": function( stage ){

            var path = "projects/rho/3pqr/GaCT/all/"

            stage.loadFile( "../data/" + path + "md01_protein.gro", function( o ){

                // o.addRepresentation( "line", "! H" );
                o.addRepresentation( "ribbon", "protein" );
                o.centerView();

                o.addTrajectory( path + "md_all.xtc" );

            } );

        },

    }

};
