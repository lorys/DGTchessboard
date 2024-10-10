const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Chess = require('chess.js').Chess;
const fs = require('fs');
const { exit } = require('process');

const DGT_SEND_RESET = 0x40;
const DGT_SEND_BRD = 0x42;
const DGT_SEND_UPDATE_BRD = 0x44;
const DGT_SEND_UPDATE_NICE = 0x4b;
const DGT_RETURN_SERIALNR = 0x45;
const DGT_RETURN_LONG_SERIALNR = 0x55;
const DGT_SEND_BATTERY_STATUS = 0x4C;
const DGT_SEND_VERSION = 0x4D;
const DGT_FONE = 0x00;
const DGT_BOARD_DUMP = 0x06;
const DGT_BWTIME = 0x0D;
const DGT_FIELD_UPDATE = 0x0E;
const DGT_EE_MOVES = 0x0F;
const DGT_BUSADRES = 0x10;
const DGT_SERIALNR = 0x11;
const DGT_TRADEMARK = 0x12;
const DGT_VERSION = 0x13;
const DGT_BOARD_DUMP_50B = 0x14;
const DGT_BOARD_DUMP_50W = 0x15;
const DGT_BATTERY_STATUS = 0x20;
const DGT_LONG_SERIALNR = 0x22;
const MESSAGE_BIT = 0x80;
const DGT_CLOCK_MESSAGE = 0x2b;
const DGT_CLOCK_START_MESSAGE = 0x03;
const DGT_CLOCK_END_MESSAGE = 0x00;
const DGT_CLOCK_DISPLAY = 0x01;
const DGT_CLOCK_END = 0x03;
const DGT_CLOCK_SETNRUN = 0x0a;
const DGT_CLOCK_BEEP = 0x0b;
const DGT_CLOCK_ASCII = 0x0c;
const DGT_CLOCK_SEND_VERSION = 0x09;


const chessPieces = {
    1: "pawn",
    2: "rook",
    3: "Night",
    4: "bishop",
    5: "king",
    6: "queen",
    7:  "pawn",
    8:  "rook",
    9:  "Night",
    10: "bishop",
    11: "king",
    12: "queen"
};

const squares = [
    "abcdefgh",
    "87654321"
]

const usbPath = '/media/pi/usb'; // Chemin de la clé USB (à adapter)
const localPath = '/home/pi/partie.pgn';
// const serialPortPath = '/dev/tty.usbserial-FTE4GW8P';

// const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });

let game = new Chess();
let fromList = [];

let dump = '';

const move = (move) => {
    if (!move)
        return null;
    const pieceIndex = parseInt(move.substring(8), 16);
    const square = `${squares[0][parseInt(move.substring(6,8), 16)%8]}${squares[1][parseInt(move.substring(6,8), 16)/8 << 0]}`;
   
    if (pieceIndex === 0) { // Picking up piece
        const pickedUpPiece = game.get(square);
        dump += `FROM ${pickedUpPiece.type} ${square}\n`;
        if (game.turn() === pickedUpPiece.color) { // Player is playing on his turn
            fromList.push(square);
        } else { // Previous player is undoing his last valid move
            game.undo();
        }
    } else { // Putting down piece
        const puttingPiece = game.get(square);
        console.log(`${(pieceIndex === 7 || pieceIndex === 1) ? '' : chessPieces[pieceIndex].substring(0,1).toLowerCase()}${square}`);
        
        try {
            dump += `TO ${chessPieces[pieceIndex]} ${square}\n`;
            game.move(`${(pieceIndex === 7 || pieceIndex === 1) ? '' : chessPieces[pieceIndex].substring(0,1).toLowerCase()}${square}`);
        } catch (e) {
            dump += `INVALID MOVE ${chessPieces[pieceIndex]} ${square}\n`;
            console.log(`Invalid move ${(pieceIndex === 7 || pieceIndex === 1) ? '' : chessPieces[pieceIndex].substring(0,1).toLowerCase()}${square}`);
            for (let a = 0; fromList[a]; a++) {
                try {
                    game.move(`${fromList[a]}-${square}`);
                    fromList = [];
                    break;
                } catch (e) {
                    console.log(`Tested invalid move ${fromList[a]}-${square}`);
                }
            }
        }
        console.log(game.pgn());
    }
    console.log({ fromList });
    

};

const clock = () => {

};

// let chessboard = '';
// for (let a = 0; a < 8*8; a++) {
//     chessboard += `${a}${((a+1)%8 === 0) ? '\n' : '\t'}`;
// }
// console.log(chessboard);

// const tests = [
//     "8e00053400", // from e2
//     "8e00052401", // to e4
//     "8e00052400", // Changing my mind, from e4
//     "8e00052c01", // to e3
//     "8e00050c00", // black to move, from e7
//     "8e00051c07", // to e5
//     "8e00051c00", // finally, take back and go from e5
//     "8e00050c07", // to e7
//     "8e00050b00", // from d7
//     "8e00051b07", // to d5
//     "8e00052c00", // from e3
//     "8e00052401", // to e4
//     "8e00051b00", // from d5 
//     "8e00052407",  // to e4
//     "8e00052400", // takeback, goes from e4 
//     "8e00052307",  // to d4
//     "8e00053900", // from b1
//     "8e00052a03", // to c3
//     "8e00052300", // from b2
//     "8e00052a07", // to b3
// ];
// let a = 0;
// let testsInter = setInterval(() => {
//     move(tests[a]);
//     a++;
//     if (!tests[a]) {
//         clearInterval(testsInter);
//         console.log(dump);
//     }
// }, 500);

port.on('open', a => {
    console.log("Connected", a);
    let test = 0;
    port.write([DGT_RETURN_SERIALNR]);
});

let serialNumber = "";
let msg = "";
port.on('data', a => {
    tmp += a.toString('hex');
    if (tmp?.indexOf('8d') === 0 && tmp.length >= 20) { // Clock
        msg = tmp.substring(0,19);
        const clock1 = { // black
            minutes: parseInt(msg.substring(7, 10), 16),
            seconds: parseInt(msg.substring(10, 12))
        };
        const clock2 = { // white
            minutes: parseInt(msg.substring(13, 16), 16),
            seconds: parseInt(msg.substring(16, 18))
        };
        console.log("CLOCK", msg, {
            clock1,
            clock2
        });
        tmp = tmp.substring(20);
    }
    else if (tmp?.indexOf('8e') === 0 && tmp.length > 10) { // Move
        msg = tmp.substring(0,10);
        move(msg);
    } else if (tmp?.indexOf('8e') === -1 && tmp?.indexOf('8d') === -1) {
        console.log("Dump unknown command");
        tmp = "";
    }

})

port.on('error', err => {
  console.error('Serial port error:', err.message);
});