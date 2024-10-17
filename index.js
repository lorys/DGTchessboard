import { SerialPort } from 'serialport';
import express from 'express';
import { game, move, play, saveBoard } from './utils.js';

const app = express();

export const DGT_SEND_RESET = 0x40;
export const DGT_SEND_BRD = 0x42;
export const DGT_SEND_UPDATE_BRD = 0x44;
export const DGT_SEND_UPDATE_NICE = 0x4b;
export const DGT_RETURN_SERIALNR = 0x45;
export const DGT_RETURN_LONG_SERIALNR = 0x55;
export const DGT_SEND_BATTERY_STATUS = 0x4C;
export const DGT_SEND_VERSION = 0x4D;
export const DGT_FONE = 0x00;
export const DGT_BOARD_DUMP = 0x06;
export const DGT_BWTIME = 0x0D;
export const DGT_FIELD_UPDATE = 0x0E;
export const DGT_EE_MOVES = 0x0F;
export const DGT_BUSADRES = 0x10;
export const DGT_SERIALNR = 0x11;
export const DGT_TRADEMARK = 0x12;
export const DGT_VERSION = 0x13;
export const DGT_BOARD_DUMP_50B = 0x14;
export const DGT_BOARD_DUMP_50W = 0x15;
export const DGT_BATTERY_STATUS = 0x20;
export const DGT_LONG_SERIALNR = 0x22;
export const MESSAGE_BIT = 0x80;
export const DGT_CLOCK_MESSAGE = 0x2b;
export const DGT_CLOCK_START_MESSAGE = 0x03;
export const DGT_CLOCK_END_MESSAGE = 0x00;
export const DGT_CLOCK_DISPLAY = 0x01;
export const DGT_CLOCK_END = 0x03;
export const DGT_CLOCK_SETNRUN = 0x0a;
export const DGT_CLOCK_BEEP = 0x0b;
export const DGT_CLOCK_ASCII = 0x0c;
export const DGT_CLOCK_SEND_VERSION = 0x09;

const serialPortPath = '/dev/tty.usbserial-FTE4GW8P';
const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });

port.on('open', a => {
    console.log("Connected", a);
    let test = 0;
    port.write([DGT_RETURN_SERIALNR]);
    port.write([DGT_SEND_UPDATE_NICE]);
    setTimeout(() => port.write([DGT_SEND_BRD]), 2000);
});

let msg = "";
let tmp = "";
port.on('data', a => {
    tmp += a.toString('hex');
    if (tmp?.indexOf('8e') === -1 && tmp?.indexOf('8d') === -1 && tmp?.indexOf('860043') === -1 && tmp?.length > 11) {
        console.log("🤷‍♂️😕 Unknown command", tmp);
        tmp = "";
    } else if (tmp?.indexOf('8e') > 0 || tmp?.indexOf('8d') > 0 || tmp?.indexOf('860043') > 0) {
        if (tmp?.indexOf('8e') > -1) {
            tmp = tmp?.substring(tmp?.indexOf('8e'));
        } else if (tmp?.indexOf('8d') > -1) {
            tmp = tmp?.substring(tmp?.indexOf('8d'));
        } else if (tmp?.indexOf('860043') > -1) {
            tmp = tmp?.substring(tmp?.indexOf('860043'));
        }
        console.log("🫡 Dump part of tmp / unknown command", tmp);
    } else if (tmp?.indexOf('8d') === 0 && tmp.length >= 20) { // Clock
        console.log(`⏳🕰️⏰ Clock`);
        msg = tmp.substring(0,19);
        clock(msg);
        tmp = tmp.substring(20);
    } else if (tmp?.indexOf('8e') === 0 && tmp.length >= 10) { // Move
        console.log(`♟️🎮 Move`);
        msg = tmp.substring(0,10);
        move(msg);
        tmp = tmp.substring(11);
    } else if (tmp?.indexOf('860043') === 0 && tmp.length >= 140) {
        console.log(`🏄‍♂️🎹 Chessboard`);
        msg = tmp.substring(6,134);
        saveBoard(msg);
        tmp = tmp.substring(141);
    }
});

port.on('error', err => {
  console.error('Serial port error:', err.message);
});

setTimeout(() => play(port), 1000);

app.get('/', (req, res) => {
    res.send(`${game.pgn()}<script>setTimeout(() => window.location.href='/', 1000);</script>`);
});

app.listen(3000);