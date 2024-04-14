#!/usr/bin/env node
declare const exec: any;
declare const promisify: any;
declare const IP_MAP: Record<string, string>;
declare const TEXT_BEFORE_IP = "Nmap scan report for ";
declare const INTERVAL: number;
declare const MAX_RESULTS = 60;
declare const getCurrentDevices: () => Promise<any>;
declare const resultsWithoutDevices: Record<string, number>;
declare const checkChanges: () => Promise<void>;
