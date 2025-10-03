#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import setup from './setup';

// __dirname and __filename work natively in CommonJS
const packageJson = fs.readJsonSync(path.join(__dirname, '../package.json'));

const program = new Command();

program
  .name('express-setup')
  .description('Interactive CLI for setting up Express projects with TypeScript/JavaScript')
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .action(async () => {
    console.log(chalk.bold.cyan('\nExpress Project Setup CLI\n'));
    console.log(chalk.gray(`Version ${packageJson.version}\n`));

    await setup();
  });

program.parse();
