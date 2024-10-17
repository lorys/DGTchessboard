import { Chess } from 'chess.js';
import fs from 'fs';

let inGame = false;
let boardRotation = false; // false = standard | true = inverted

export const chessPieces = {
    1: "pawn",
    2: "rook",
    3: "night",
    4: "bishop",
    5: "king",
    6: "queen",
    7:  "pawn",
    8:  "rook",
    9:  "night",
    10: "bishop",
    11: "king",
    12: "queen"
};

export let squares = [
    "abcdefgh",
    "87654321"
];

const today = new Date();
export let localPath = `/Users/lorys/projects/DGTchessboard/games/${today.getDate()}-${today.getMonth()}-${today.getFullYear()}-${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}.pgn`;

export let playerUndo = false;
export let liveChessBoard = new Chess();
export let game = new Chess();

export let fromList = {
    w: [],
    b: []
};

export const to = {
    w: null,
    b: null
};

export let dump = '';

export const saveBoard = (msg) => {
    let boardPos = msg;
    let cursor = 0;
    if (msg === "08090a0c0b0a09080707070707070707000000000000000000000000000000000000000000000000000000000000000001010101010101010203040605040302") {
        // Standard starting position
        // nothing to do
        game = new Chess();
        fromList = {
            w: [],
            b: []
        };
        to.w = null;
        to.b = null;
        localPath = `/Users/lorys/projects/DGTchessboard/games/${today.getDate()}-${today.getMonth()}-${today.getFullYear()}-${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}.pgn`;
        // console.log("🗑️ 🗑️ 🗑️ 🗑️ RESET GAME");
    } else if (msg === "020304050604030201010101010101010000000000000000000000000000000000000000000000000000000000000000070707070707070708090a0b0c0a0908") {
        // Reversed starting position
        console.log("Reversed position");
        squares = ["hgfedcba", "12345678"];
        game = new Chess();
        localPath = `/Users/lorys/projects/DGTchessboard/games/${today.getDate()}-${today.getMonth()}-${today.getFullYear()}-${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}.pgn`;
        fromList = {
            w: [],
            b: []
        };
        to.w = null;
        to.b = null;
        // console.log("🗑️ 🗑️ 🗑️ 🗑️ RESET GAME");
    }
    liveChessBoard.clear();
    for (let a = 0; cursor < 64; a+=2) {
        const currentSquarePieceIndex = parseInt(boardPos.slice(0,2), 16);
        boardPos = boardPos.slice(2);
        if (currentSquarePieceIndex !== 0) {
            liveChessBoard.put({
                type: chessPieces[currentSquarePieceIndex > 6 ? currentSquarePieceIndex-6 : currentSquarePieceIndex].substring(0,1),
                color: currentSquarePieceIndex > 6 ? 'b' : 'w'
            }, `${squares[0][parseInt(cursor%8)]}${squares[1][cursor/8 << 0]}`);
        }
        cursor++;
    }
    const isReversedBoard = (liveChessBoard.get('d1').type === 'k' && liveChessBoard.get('a1').type === 'r' && liveChessBoard.get('a1').color == "b") ||
    (liveChessBoard.get('b1').type === 'k' && liveChessBoard.get('c1').type === 'r' && liveChessBoard.get('c1').color == "b");
    // console.log("black on white ?", isReversedBoard);
    // console.log("Board pos", `'${liveChessBoard.fen()}'`);
};

export const move = (msg) => {
    const pieceIndex = parseInt(msg.substring(8), 16);
    const square = `${squares[0][parseInt(msg.substring(6,8), 16)%8]}${squares[1][parseInt(msg.substring(6,8), 16)/8 << 0]}`;
    if (pieceIndex === 0) {
        const pickedUpPiece = game.get(square);
        if (fromList?.[pickedUpPiece.color]) {
            fromList[pickedUpPiece.color] = [ { square, piece: pieceIndex }, ...fromList[pickedUpPiece.color] ].slice(0,4);
            // console.log(`FROM ${square} with ${pickedUpPiece.color} ${pickedUpPiece.type}`);
        }
    } else {
        to[pieceIndex < 7 ? 'w' : 'b'] = { piece: pieceIndex, square };
        // console.log(`TO ${square} with ${pieceIndex < 7 ? 'w' : 'b'} ${chessPieces[pieceIndex]}`)
    }
};

export const findMove = () => {
        const testGame = new Chess();
        testGame.loadPgn(game.pgn());
        let testGameTurn = testGame.turn();
        if (!to[testGameTurn] || !to[testGameTurn]?.square) {
            return;
        }
        let validMove = false;
        for (let a = 0; fromList[testGameTurn][a]; a++) {
            const move = fromList[testGameTurn][a];
            try {
                testGame.move(`${move.square}-${to[testGameTurn].square}`);
                validMove = `${move.square}-${to[testGameTurn].square}`;
                break;
            } catch (e) {
                
            }
        }
        let mustUndo = false;
        if (!validMove && testGame.history()) {
            testGame.undo();
            testGameTurn = testGame.turn();
            for (let a = 0; fromList[testGameTurn][a]; a++) {
                const move = fromList[testGameTurn][a];
                try {
                    testGame.move(`${move.square}-${to[testGameTurn]?.square}`);
                    validMove = `${move.square}-${to[testGameTurn]?.square}`;
                    break;
                } catch (e) {
                }
            }
            if (validMove)
                mustUndo = true;
        }
        if (validMove) {
            // console.log(`✅ ${validMove}`);
            try {
                const history = game.history();
                const lastMove = history.length-1 >= 0 ? history[history.length-1] : null;
                if (["O-O", "O-O-O"].includes(lastMove) && ["e1-f1", "e8-f8", "a8-d8", "a1-d1"].includes(validMove)) {
                    fromList = {
                        w: [],
                        b: []
                    };
                    // console.log("💣❌🔥 ROQUE DETECTED 💣❌🔥");
                } else {
                    game.loadPgn(testGame.pgn());
                }
                const pgn = game.pgn();
                console.log(`PGN: `+pgn);
                fs.writeFileSync(localPath, pgn);
            } catch (e) {
                console.log("PGN is not valid", validMove, `testGame :`+testGame.pgn(), `real game: `+game.pgn(), e);
            }
        } else {
            
        }
};

export const clock = (msg) => {
    const clock1 = { // black
        minutes: parseInt(msg.substring(7, 10), 16),
        seconds: parseInt(msg.substring(10, 12))
    };
    const clock2 = { // white
        minutes: parseInt(msg.substring(13, 16), 16),
        seconds: parseInt(msg.substring(16, 18))
    };
    return [clock1, clock2];
};

let playing = false;
export const play = (port) => {
    if (!playing) {
        playing = true;
        const inter = setInterval(() => {
            findMove();
        }, 200);
    }
};