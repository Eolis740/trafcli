import fs from 'fs';
import path from 'path';
import os from 'os';
import { Config, Locale } from '../core/types';

const defaultConfig: Config = {
  lang: 'en',
};

export const getConfigPath = (): string => {
  const home = os.homedir();
  return path.join(home, '.trafcli', 'config.json');
};

export const readConfig = (): Config => {
  try {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      return { ...defaultConfig };
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch (error) {
    return { ...defaultConfig };
  }
};

export const writeConfig = (config: Config): void => {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
};

export const resetConfig = (): void => {
  writeConfig(defaultConfig);
};

export const setLanguage = (lang: Locale): Config => {
  const current = readConfig();
  const next: Config = { ...current, lang: 'en' as Locale };
  writeConfig(next);
  return next;
};

export const setDefaultFile = (filePath: string): Config => {
  const current = readConfig();
  const next = { ...current, defaultFile: filePath };
  writeConfig(next);
  return next;
};
