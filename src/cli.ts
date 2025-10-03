#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import setup from './setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('express-setup')
  .description('Interactive CLI for setting up Express projects with TypeScript/JavaScript')
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🚀 Express Project Setup CLI\n'));
    console.log(chalk.gray(`Version ${packageJson.version}\n`));

    await setup();
  });

program.parse();
