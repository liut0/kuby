#!/usr/bin/env node
import chalk from 'chalk';
import { readFileSync } from 'fs-extra';
import { EOL } from 'os';
import yargonaut = require('yargonaut');
import {
  alias,
  command,
  completion,
  config as yargsConfig,
  epilog,
  help,
  option,
  parse,
  scriptName,
  showHelp,
  strict,
  terminalWidth,
  version,
  wrap,
} from 'yargs';

import { commands } from './commands';

yargonaut.style('blue').errorsStyle('red.bold');

const findUp = require('find-up');

scriptName('k8s');
version(false);

strict();

for (const cmd of commands) {
  command(cmd);
}

completion();

option('ci', {
  description: 'CI Mode (non-interactive and biased)',
  boolean: true,
  default: false,
  global: true,
});
option('context', {
  description: 'The context to run the given subcommand in',
  alias: 'c',
  string: true,
  global: true,
});
option('namespace', {
  description: 'The namespace to run the given subcommand in',
  alias: 'n',
  string: true,
  global: true,
});

try {
  const configPath = findUp.sync(['.k8src', '.k8src.json']);
  const config = configPath ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
  yargsConfig(config);
} catch {
  console.warn(
    chalk.yellow('The given config (.k8src / .k8src.json) could not be read.'),
  );
  console.warn(chalk.yellow('Please ensure, it is a valid json file.'));
}

alias('h', 'help');
help('help');
wrap(terminalWidth());

epilog(
  chalk.dim(
    `This tool intends to help with everyday kubernetes administration.${EOL}` +
      'Made with the cool cli tool "yargs".',
  ),
);

const args = parse();
if (args._.length === 0 && !args.getYargsCompletions) {
  showHelp('log');
}
