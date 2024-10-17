
// let chessboard = '';
// for (let a = 0; a < 8*8; a++) {
//     chessboard += `${a}${((a+1)%8 === 0) ? '\n' : '\t'}`;
// }
// console.log(chessboard);

import { move, play } from "./utils.js";

const tests = [
    [
        "8e00053400", // from e2
        "8e00052401", // to e4
        "8e00052400", // Changing my mind, from e4
        "8e00052c01", // to e3
        "8e00050c00", // black to move, from e7
        "8e00051c07", // to e5
        "8e00051c00", // finally, take back and go from e5
        "8e00050c07", // to e7
        "8e00050b00", // from d7
        "8e00051b07", // to d5
        "8e00052c00", // from e3
        "8e00052401", // to e4
        "8e00051b00", // from d5 
        "8e00052407",  // to e4
        "8e00052400", // takeback, goes from e4 
        "8e00052307",  // to d4
        "8e00053900", // from b1
        "8e00052a03", // to c3
        "8e00052300", // from b2
        "8e00052a07", // to b3
    ],
    [
        '8e00053600',
        '8e00052601',
        '8e00050e00',
        '8e00051e07',
        '8e00053d00',
        '8e00052f04',
        '8e00050500',
        '8e0005170a',
        '8e00053400',
        '8e00052c01',
        '8e00050d00',
        '8e00051d07',
        '8e00053e00',
        '8e00053403',
        '8e00050a00',
        '8e00051207',
        '8e00053c00',
        '8e00053e05',
        '8e00053f00',
        '8e00053d02',
        '8e00050400',
        '8e00050d0b'
    ]    
];

let testIndex = 0;
let testsNumber = 0;

let testsInter = setInterval(() => {
    move(tests[1][testIndex]);
    testIndex++;
}, 500);

play();