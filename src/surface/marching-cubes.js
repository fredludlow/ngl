/**
 * @file Marching Cubes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function getEdgeTable(){
    return new Uint32Array( [
        0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
        0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
        0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
        0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
        0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
        0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
        0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
        0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
        0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
        0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
        0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
        0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
        0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
        0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
        0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
        0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
        0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
        0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
        0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
        0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
        0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
        0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
        0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
        0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
        0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
        0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
        0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
        0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
        0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
        0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
        0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
        0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
    ] );
}

function getTriTable(){
    return new Int32Array( [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
        3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
        4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
        9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
        10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
        5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
        8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
        2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
        11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
        5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
        11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
        11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
        9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
        6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
        6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
        8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
        7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
        3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
        9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
        8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
        0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
        6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
        10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
        10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
        0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
        3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
        9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
        8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
        3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
        10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
        10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
        7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
        1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
        11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
        8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
        0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
        7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
        7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
        10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
        0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
        7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
        9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
        6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
        4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
        10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
        8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
        1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
        10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
        10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
        9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
        7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
        3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
        7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
        3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
        6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
        9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
        1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
        4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
        7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
        6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
        0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
        6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
        0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
        11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
        6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
        5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
        9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
        1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
        10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
        0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
        5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
        11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
        9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
        7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
        2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
        9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
        1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
        10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
        2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
        0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
        0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
        9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
        5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
        5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
        9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
        1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
        3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
        4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
        9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
        11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
        2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
        9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
        3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
        1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
        4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
        0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
        1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
    ] );
}

// array[edge1][edge1] indicates whether to draw. 
function getAllowedContours() { return [

    [ 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0 ], // 1 2 3 4 8 9
    [ 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0 ], // 0 2 3 5 9 10
    [ 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1 ], // 0 1 3 6 10 11
    [ 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1 ], // 0 1 2 7 8 11
    [ 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0 ], // 0 5 6 7 8 9
    [ 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0 ], // And rotate it
    [ 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1 ],
    [ 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1 ],
    [ 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1 ], // 0 3 4 7 9 11
    [ 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0 ], // And rotate some more
    [ 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1 ],
    [ 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0 ]
    
]}


function MarchingCubes( field, nx, ny, nz, atomindex ){

    // Based on alteredq / http://alteredqualia.com/
    // port of greggman's ThreeD version of marching cubes to Three.js
    // http://webglsamples.googlecode.com/hg/blob/blob.html
    //
    // Adapted for NGL by Alexander Rose

    var isolevel = 0;
    var noNormals = false;
    var contour = false;

    var n = nx * ny * nz;

    // deltas
    var yd = nx;
    var zd = nx * ny;

    var normalCache, vertexIndex;
    var count, icount;

    var ilist = new Int32Array( 12 );

    var positionArray = [];
    var normalArray = [];
    var indexArray = [];
    var atomindexArray = [];

    var fromArray = [];
    var toArray = [];

    var edgeTable = getEdgeTable();
    var triTable = getTriTable();
    var allowedContours = getAllowedContours();

    //

    this.triangulate = function( _isolevel, _noNormals, _box, _contour ){

        isolevel = _isolevel;
        noNormals = _noNormals;
        contour = _contour;

        if( !noNormals && !normalCache ){
            normalCache = new Float32Array( n * 3 );
        }

        if( !vertexIndex ){
            vertexIndex = new Int32Array( n );
        }

        count = 0;
        icount = 0;

        if( _box !== undefined ){

            var min = _box[ 0 ].map( Math.round );
            var max = _box[ 1 ].map( Math.round );
            triangulate(
                min[ 0 ], min[ 1 ], min[ 2 ],
                max[ 0 ], max[ 1 ], max[ 2 ]
            );

        }else{

            triangulate();

        }

        if( contour ) {

            return {

                from: new Float32Array( fromArray ),
                to: new Float32Array( toArray )
                // TODO: Are atomindex/index meaningful here?
                
            };

        } else {

            positionArray.length = count * 3;
            if( !noNormals ) normalArray.length = count * 3;
            indexArray.length = icount;
            if( atomindex ) atomindexArray.length = count;

            var TypedArray = positionArray.length / 3 > 65535 ? Uint32Array : Uint16Array;
            return {
                position: new Float32Array( positionArray ),
                normal: noNormals ? undefined : new Float32Array( normalArray ),
                index: new TypedArray( indexArray ),
                atomindex: atomindex ? new Int32Array( atomindexArray ) : undefined
            };
        }
    };

    // polygonization

    function lerp( a, b, t ) { return a + ( b - a ) * t; }

    function VIntX( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c + 0 ] = x + mu;
            positionArray[ c + 1 ] = y;
            positionArray[ c + 2 ] = z;

            if( !noNormals ){

                var q3 = q * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q3 + 3 ], mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q3 + 4 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q3 + 5 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function VIntY( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c ]     = x;
            positionArray[ c + 1 ] = y + mu;
            positionArray[ c + 2 ] = z;

            if( !noNormals ){

                var q3 = q * 3;
                var q6 = q3 + yd * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q6 ],     mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q6 + 1 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q6 + 2 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu * yd ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function VIntZ( q, offset, x, y, z, valp1, valp2 ) {

        if( vertexIndex[ q ] < 0 ){

            var mu = ( isolevel - valp1 ) / ( valp2 - valp1 );
            var nc = normalCache;

            var c = count * 3;

            positionArray[ c ]     = x;
            positionArray[ c + 1 ] = y;
            positionArray[ c + 2 ] = z + mu;

            if( !noNormals ){

                var q3 = q * 3;
                var q6 = q3 + zd * 3;

                normalArray[ c ]     = -lerp( nc[ q3 ],     nc[ q6 ],     mu );
                normalArray[ c + 1 ] = -lerp( nc[ q3 + 1 ], nc[ q6 + 1 ], mu );
                normalArray[ c + 2 ] = -lerp( nc[ q3 + 2 ], nc[ q6 + 2 ], mu );

            }

            if( atomindex ) atomindexArray[ count ] = atomindex[ q + mu * zd ];

            vertexIndex[ q ] = count;
            ilist[ offset ] = count;

            count += 1;

        }else{

            ilist[ offset ] = vertexIndex[ q ];

        }

    }

    function compNorm( q ) {

        var q3 = q * 3;

        if ( normalCache[ q3 ] === 0.0 ) {

            normalCache[ q3     ] = field[ q - 1  ] - field[ q + 1 ];
            normalCache[ q3 + 1 ] = field[ q - yd ] - field[ q + yd ];
            normalCache[ q3 + 2 ] = field[ q - zd ] - field[ q + zd ];

        }

    }

    function polygonize( fx, fy, fz, q ) {

        // cache indices
        var q1 = q + 1,
            qy = q + yd,
            qz = q + zd,
            q1y = q1 + yd,
            q1z = q1 + zd,
            qyz = q + yd + zd,
            q1yz = q1 + yd + zd;

        var cubeindex = 0,
            field0 = field[ q ],
            field1 = field[ q1 ],
            field2 = field[ qy ],
            field3 = field[ q1y ],
            field4 = field[ qz ],
            field5 = field[ q1z ],
            field6 = field[ qyz ],
            field7 = field[ q1yz ];

        if ( field0 < isolevel ) cubeindex |= 1;
        if ( field1 < isolevel ) cubeindex |= 2;
        if ( field2 < isolevel ) cubeindex |= 8;
        if ( field3 < isolevel ) cubeindex |= 4;
        if ( field4 < isolevel ) cubeindex |= 16;
        if ( field5 < isolevel ) cubeindex |= 32;
        if ( field6 < isolevel ) cubeindex |= 128;
        if ( field7 < isolevel ) cubeindex |= 64;

        // if cube is entirely in/out of the surface - bail, nothing to draw

        var bits = edgeTable[ cubeindex ];
        if ( bits === 0 ) return 0;

        var fx2 = fx + 1,
            fy2 = fy + 1,
            fz2 = fz + 1;

        // top of the cube

        if ( bits & 1 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( q1 );
            }
            VIntX( q, 0, fx, fy, fz, field0, field1 );

        }

        if ( bits & 2 ) {

            if( !noNormals ){
                compNorm( q1 );
                compNorm( q1y );
            }
            VIntY( q1, 1, fx2, fy, fz, field1, field3 );

        }

        if ( bits & 4 ) {

            if( !noNormals ){
                compNorm( qy );
                compNorm( q1y );
            }
            VIntX( qy, 2, fx, fy2, fz, field2, field3 );

        }

        if ( bits & 8 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( qy );
            }
            VIntY( q, 3, fx, fy, fz, field0, field2 );

        }

        // bottom of the cube

        if ( bits & 16 ) {

            if( !noNormals ){
                compNorm( qz );
                compNorm( q1z );
            }
            VIntX( qz, 4, fx, fy, fz2, field4, field5 );

        }

        if ( bits & 32 ) {

            if( !noNormals ){
                compNorm( q1z );
                compNorm( q1yz );
            }
            VIntY( q1z, 5, fx2, fy, fz2, field5, field7 );

        }

        if ( bits & 64 ) {

            if( !noNormals ){
                compNorm( qyz );
                compNorm( q1yz );
            }
            VIntX( qyz, 6, fx, fy2, fz2, field6, field7 );

        }

        if ( bits & 128 ) {

            if( !noNormals ){
                compNorm( qz );
                compNorm( qyz );
            }
            VIntY( qz, 7, fx, fy, fz2, field4, field6 );

        }

        // vertical lines of the cube

        if ( bits & 256 ) {

            if( !noNormals ){
                compNorm( q );
                compNorm( qz );
            }
            VIntZ( q, 8, fx, fy, fz, field0, field4 );

        }

        if ( bits & 512 ) {

            if( !noNormals ){
                compNorm( q1 );
                compNorm( q1z );
            }
            VIntZ( q1, 9, fx2, fy, fz, field1, field5 );

        }

        if ( bits & 1024 ) {

            if( !noNormals ){
                compNorm( q1y );
                compNorm( q1yz );
            }
            VIntZ( q1y, 10, fx2, fy2, fz, field3, field7 );

        }

        if ( bits & 2048 ) {

            if( !noNormals ){
                compNorm( qy );
                compNorm( qyz );
            }
            VIntZ( qy, 11, fx, fy2, fz, field2, field6 );

        }

        cubeindex <<= 4;  // re-purpose cubeindex into an offset into triTable

        var i = 0;

        if ( contour ) {

            var e1, e2;
            // Rather than creating triangles, we add the lines, but omit
            // those that do not lie within the face of a cube.
            while ( triTable[ cubeindex + i + 1 ] != -1 ) {

                e1 = triTable[ cubeindex + i ];
                e2 = triTable[ cubeindex + i + 1 ];

                if (allowedContours[ e1 ][ e2 ]) {
                    var pOffset = 3 * ilist[ e1 ];
                    fromArray[ icount ] = positionArray[ pOffset ];
                    fromArray[ icount + 1 ] = positionArray[ pOffset + 1 ];
                    fromArray[ icount + 2 ] = positionArray[ pOffset + 2 ];
                    pOffset = 3 * ilist[ e2 ] ;
                    toArray[ icount ] = positionArray[ pOffset ];
                    toArray[ icount + 1 ] = positionArray[ pOffset + 1 ];
                    toArray[ icount + 2 ] = positionArray[ pOffset + 2 ];
                    icount += 3;
                }

                i += 1;

            }
            
            
        }

        // here is where triangles are created
        else {
            var o1, o2, o3;
            while ( triTable[ cubeindex + i ] != -1 ) {
                
                o1 = cubeindex + i;
                o2 = o1 + 1;
                o3 = o1 + 2;

                // FIXME normals flipping (see above) and vertex order reversal
                indexArray[ icount ]     = ilist[ triTable[ o2 ] ];
                indexArray[ icount + 1 ] = ilist[ triTable[ o1 ] ];
                indexArray[ icount + 2 ] = ilist[ triTable[ o3 ] ];
                
                icount += 3;
                i += 3;
            }
        }

    }

    function triangulate( xBeg, yBeg, zBeg, xEnd, yEnd, zEnd ) {

        var q, x, y, z, y_offset, z_offset;

        xBeg = xBeg !== undefined ? xBeg : 0;
        yBeg = yBeg !== undefined ? yBeg : 0;
        zBeg = zBeg !== undefined ? zBeg : 0;

        xEnd = xEnd !== undefined ? xEnd : nx - 1;
        yEnd = yEnd !== undefined ? yEnd : ny - 1;
        zEnd = zEnd !== undefined ? zEnd : nz - 1;

        if( noNormals ){

            xBeg = Math.max( 0, xBeg );
            yBeg = Math.max( 0, yBeg );
            zBeg = Math.max( 0, zBeg );

            xEnd = Math.min( nx - 1, xEnd );
            yEnd = Math.min( ny - 1, yEnd );
            zEnd = Math.min( nz - 1, zEnd );

        }else{

            xBeg = Math.max( 1, xBeg );
            yBeg = Math.max( 1, yBeg );
            zBeg = Math.max( 1, zBeg );

            xEnd = Math.min( nx - 2, xEnd );
            yEnd = Math.min( ny - 2, yEnd );
            zEnd = Math.min( nz - 2, zEnd );

        }

        // init part of the vertexIndex
        // (takes a significant amount of time to do for all)

        var xBeg2 = Math.max( 0, xBeg - 2);
        var yBeg2 = Math.max( 0, yBeg - 2 );
        var zBeg2 = Math.max( 0, zBeg - 2 );

        var xEnd2 = Math.min( nx, xEnd + 2 );
        var yEnd2 = Math.min( ny, yEnd + 2 );
        var zEnd2 = Math.min( nz, zEnd + 2 );

        for ( z = zBeg2; z < zEnd2; ++z ) {
            z_offset = zd * z;
            for ( y = yBeg2; y < yEnd2; ++y ) {
                y_offset = z_offset + yd * y;
                for ( x = xBeg2; x < xEnd2; ++x ) {
                    q = y_offset + x;
                    vertexIndex[ q ] = -1;
                }
            }
        }

        // clip space where the isovalue is too low

        var __break;
        var __xBeg = xBeg; var __yBeg = yBeg; var __zBeg = zBeg;
        var __xEnd = xEnd; var __yEnd = yEnd; var __zEnd = zEnd;

        __break = false;
        for ( z = zBeg; z < zEnd; ++z ) {
            for ( y = yBeg; y < yEnd; ++y ) {
                for ( x = xBeg; x < xEnd; ++x ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __zBeg = z;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        __break = false;
        for ( y = yBeg; y < yEnd; ++y ) {
            for ( z = __zBeg; z < zEnd; ++z ) {
                for ( x = xBeg; x < xEnd; ++x ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __yBeg = y;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        __break = false;
        for ( x = xBeg; x < xEnd; ++x ) {
            for ( y = __yBeg; y < yEnd; ++y ) {
                for ( z = __zBeg; z < zEnd; ++z ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __xBeg = x;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        __break = false;
        for ( z = zEnd; z >= zBeg; --z ) {
            for ( y = yEnd; y >= yBeg; --y ) {
                for ( x = xEnd; x >= xBeg; --x ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __zEnd = z;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        __break = false;
        for ( y = yEnd; y >= yBeg; --y ) {
            for ( z = __zEnd; z >= zBeg; --z ) {
                for ( x = xEnd; x >= xBeg; --x ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __yEnd = y;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        __break = false;
        for ( x = xEnd; x >= xBeg; --x ) {
            for ( y = __yEnd; y >= yBeg; --y ) {
                for ( z = __zEnd; z >= zBeg; --z ) {
                    q = ( ( nx * ny ) * z ) + ( nx * y ) + x;
                    if( field[ q ] >= isolevel ){
                        __xEnd = x;
                        __break = true;
                        break;
                    }
                }
                if( __break ) break;
            }
            if( __break ) break;
        }

        //

        if( noNormals ){

            xBeg = Math.max( 0, __xBeg - 1);
            yBeg = Math.max( 0, __yBeg - 1 );
            zBeg = Math.max( 0, __zBeg - 1 );

            xEnd = Math.min( nx - 1, __xEnd + 1 );
            yEnd = Math.min( ny - 1, __yEnd + 1 );
            zEnd = Math.min( nz - 1, __zEnd + 1 );

        }else{

            xBeg = Math.max( 1, __xBeg - 1 );
            yBeg = Math.max( 1, __yBeg - 1 );
            zBeg = Math.max( 1, __zBeg - 1 );

            xEnd = Math.min( nx - 2, __xEnd + 1 );
            yEnd = Math.min( ny - 2, __yEnd + 1 );
            zEnd = Math.min( nz - 2, __zEnd + 1 );

        }

        // polygonize part of the grid

        for ( z = zBeg; z < zEnd; ++z ) {
            z_offset = zd * z;
            for ( y = yBeg; y < yEnd; ++y ) {
                y_offset = z_offset + yd * y;
                for ( x = xBeg; x < xEnd; ++x ) {
                    q = y_offset + x;
                    polygonize( x, y, z, q );
                }
            }
        }

    }

}
MarchingCubes.__deps = [ getEdgeTable, getTriTable, getAllowedContours ];


export default MarchingCubes;
