#!/usr/bin/env node

// Mock Kilo CLI for testing Kilo-Nod
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const scenarios = [
  {
    prompt: 'Allow Kilo to edit [src/config.js]?',
    credits: 0.5
  },
  {
    prompt: 'Allow Kilo to run [npm install axios]?',
    credits: 1.2
  },
  {
    prompt: 'Allow Kilo to delete [.env.backup]?',
    credits: 0.3
  },
  {
    prompt: 'Allow Kilo to create database/migrations/001_users.sql?',
    credits: 0.8
  },
  {
    prompt: 'Allow Kilo to modify package.json?',
    credits: 0.4
  }
];

let totalCredits = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runScenario(scenario) {
  console.log(`\n[KILO] Processing request...`);
  await sleep(1000);
  
  console.log(scenario.prompt);
  
  return new Promise((resolve) => {
    rl.question('', (answer) => {
      const approved = answer.toLowerCase().startsWith('y');
      totalCredits += scenario.credits;
      
      if (approved) {
        console.log(`[KILO] ✓ Action approved. Used ${scenario.credits} credits.`);
      } else {
        console.log(`[KILO] ✗ Action rejected.`);
      }
      
      console.log(`[KILO] Total credits used: ${totalCredits.toFixed(2)}`);
      resolve(approved);
    });
  });
}

async function main() {
  console.log('[KILO] Mock Kilo Cloud Agent starting...');
  console.log('[KILO] This is a demo script for testing Kilo-Nod\n');
  
  for (const scenario of scenarios) {
    await runScenario(scenario);
    await sleep(2000);
  }
  
  console.log('\n[KILO] All tasks completed!');
  console.log(`[KILO] Final credit usage: ${totalCredits.toFixed(2)} credits`);
  rl.close();
}

main();
