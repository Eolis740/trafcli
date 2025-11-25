import { Command } from 'commander';
import { CLIContext } from '../index';
export declare const runSettingMenu: (ctx: CLIContext) => Promise<void>;
export declare const registerSettingCommand: (program: Command, ctx: CLIContext) => void;
