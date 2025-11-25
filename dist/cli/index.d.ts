import { Command } from 'commander';
import { Config } from '../core/types';
import { Messages } from '../i18n/en';
export interface CLIContext {
    config: Config;
    messages: Messages;
}
export declare const buildProgram: () => Command;
export declare const run: () => Promise<void>;
