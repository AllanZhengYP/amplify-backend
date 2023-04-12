#!/usr/bin/env node
import 'reflect-metadata';
import { getCommand as linkCommand } from './commands/link';
import { getCommand as pushCommand } from './commands/push';
import { getCommand as statusCommand } from './commands/status';
import { getCommand as synthCommand } from './commands/synth';
import { getCommand as watchCommand } from './commands/watch';
import { getCommand as paramCommand } from './commands/param';
import { Command } from '@commander-js/extra-typings';
import { StrictCommand } from './commands/shared-components';

/**
 * This is the "new CLI" entry point
 *
 * It has a registry of different commands and delegates to the appropriate one based on the command line args
 */
const main = async () => {
  const rootCommand = new StrictCommand('vnext').description('CLI utility for working with Amplify projects').version('0.1.0');

  const subCommandRegistry: Command<any[], any>[] = [linkCommand(), pushCommand(), watchCommand(), statusCommand(), synthCommand(), paramCommand()];

  subCommandRegistry.forEach((command) => rootCommand.addCommand(command));
  await rootCommand.parseAsync();
};

main().catch(console.error);
