#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const IP_MAP: Record<string, string> = {
    '192.168.0.1': 'router',
    '192.168.0.10': 'max pc',
    '192.168.0.73': 'lena phone',
    '192.168.0.164': 'max phone',
};

const TEXT_BEFORE_IP = 'Nmap scan report for ';

const INTERVAL = 10 * 1000;
const MAX_RESULTS = 60;

const getCurrentDevices = async () => {
    const { stdout } = await promisify(exec)(`nmap -sP 192.168.0.0/24 | grep '${TEXT_BEFORE_IP}'`, {
        maxBuffer: 1024 * 1024 * 4,
    });

    return stdout
        .split('\n')
        .filter(Boolean)
        .map((line: string) => {
            const ip = line.replace(TEXT_BEFORE_IP, '');
            return IP_MAP[ip] || ip;
        });
};

const resultsWithoutDevices: Record<string, number> = Object.values(IP_MAP).reduce(
    (acc, device) => ({ ...acc, [device]: MAX_RESULTS + 1 }),
    {},
);

const checkChanges = async () => {
    const currentDevices = await getCurrentDevices();

    const connectedDevices: string[] = [];
    const disconnectedDevices: string[] = [];

    Object.keys(resultsWithoutDevices).forEach((device) => {
        if (currentDevices.includes(device)) {
            if (resultsWithoutDevices[device] > MAX_RESULTS) {
                connectedDevices.push(device);
            }
            resultsWithoutDevices[device] = 0;
        } else {
            if (resultsWithoutDevices[device] === MAX_RESULTS) {
                disconnectedDevices.push(device);
            }
            if (resultsWithoutDevices[device] <= MAX_RESULTS) {
                resultsWithoutDevices[device] = resultsWithoutDevices[device] + 1;
            }
        }
    });

    if (connectedDevices.length > 0) console.log(new Date().toLocaleString(), 'connected', connectedDevices);
    if (disconnectedDevices.length > 0) console.log(new Date().toLocaleString(), 'disconnected', disconnectedDevices);
};

checkChanges();
setInterval(checkChanges, INTERVAL);
