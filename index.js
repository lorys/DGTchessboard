const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Chess = require('chess.js').Chess;
const fs = require('fs');

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
const serialPortPath = '/dev/tty.usbserial-FTE4GW8P';

const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });

let game = new Chess();
let moves = [];
let tmp = '';

port.on('open', a => {
    console.log("Connected", a);
    let test = 0;
    port.write([0x45]);
});

let lastMove = {
    from: "",
    to: ""
};

let serialNumber = "";

port.on('data', a => {
    tmp += a.toString('hex');
    if (tmp.length >= 10) {
        if (!serialNumber) {
            serialNumber = tmp;
            console.log({serialNumber});
            tmp = "";
            return;
        }
        const pieceIndex = parseInt(tmp.substring(8), 16);
        const square = `${squares[0][parseInt(tmp.substring(6,8), 16)%8]}${squares[1][parseInt(tmp.substring(6,8), 16)/8 << 0]}`;

        if (pieceIndex === 0) {
            lastMove.from = square;
            lastMove.to = null;
        } else if (lastMove.from !== square) {
            try {
                game.move(lastMove, { sloppy: true });
                console.log(game.pgn());
            } catch (e) {
                try {
                    console.log("Undoing last move", game.undo());
                    console.log(game.pgn());
                    game.move({ from: lastMove.from, to: square }, { sloppy: true });
                    console.log(game.pgn());
                } catch (e) {
                    console.log("Illegal move", lastMove);
                }
            }
        }
        console.log("Received message", tmp, lastMove, chessPieces[parseInt(tmp.substring(8), 16)]);
        tmp = "";
    }
})

port.on('error', err => {
  console.error('Serial port error:', err.message);
});