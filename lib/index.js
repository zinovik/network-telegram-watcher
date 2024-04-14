#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { exec } = require('child_process');
const { promisify } = require('util');
const IP_MAP = {
    '192.168.0.1': 'router',
    '192.168.0.10': 'max pc',
    '192.168.0.73': 'lena phone',
    '192.168.0.164': 'max phone',
};
const TEXT_BEFORE_IP = 'Nmap scan report for ';
const INTERVAL = 10 * 1000;
const MAX_RESULTS = 60;
const getCurrentDevices = () => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout } = yield promisify(exec)(`nmap -sP 192.168.0.0/24 | grep '${TEXT_BEFORE_IP}'`, {
        maxBuffer: 1024 * 1024 * 4,
    });
    return stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
        const ip = line.replace(TEXT_BEFORE_IP, '');
        return IP_MAP[ip] || ip;
    });
});
const resultsWithoutDevices = Object.values(IP_MAP).reduce((acc, device) => (Object.assign(Object.assign({}, acc), { [device]: MAX_RESULTS + 1 })), {});
const checkChanges = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDevices = yield getCurrentDevices();
    const connectedDevices = [];
    const disconnectedDevices = [];
    Object.keys(resultsWithoutDevices).forEach((device) => {
        if (currentDevices.includes(device)) {
            if (resultsWithoutDevices[device] > MAX_RESULTS) {
                connectedDevices.push(device);
            }
            resultsWithoutDevices[device] = 0;
        }
        else {
            if (resultsWithoutDevices[device] === MAX_RESULTS) {
                disconnectedDevices.push(device);
            }
            if (resultsWithoutDevices[device] <= MAX_RESULTS) {
                resultsWithoutDevices[device] = resultsWithoutDevices[device] + 1;
            }
        }
    });
    if (connectedDevices.length > 0)
        console.log(new Date().toLocaleString(), 'connected', connectedDevices);
    if (disconnectedDevices.length > 0)
        console.log(new Date().toLocaleString(), 'disconnected', disconnectedDevices);
});
checkChanges();
setInterval(checkChanges, INTERVAL);
