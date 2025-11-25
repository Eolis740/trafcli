import { Messages } from './en';
import { Locale } from '../core/types';
export declare const getMessages: (_lang?: Locale) => Messages;
export declare const formatWith: (template: string, vars: Record<string, string | number>) => string;
