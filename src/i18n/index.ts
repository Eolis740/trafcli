import en, { Messages } from './en';
import { Locale } from '../core/types';

export const getMessages = (_lang?: Locale): Messages => {
  // Force English only.
  return en;
};

export const formatWith = (template: string, vars: Record<string, string | number>): string => {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template,
  );
};
