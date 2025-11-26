import { Config } from '../core/types';
export declare const getConfigPath: () => string;
export declare const readConfig: () => Config;
export declare const writeConfig: (config: Config) => void;
export declare const resetConfig: () => void;
export declare const setLanguage: () => Config;
export declare const setDefaultFile: (filePath: string) => Config;
