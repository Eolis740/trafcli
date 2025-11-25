import chalk from 'chalk';

export const logInfo = (message: string): void => {
  console.log(chalk.cyan(message));
};

export const logWarn = (message: string): void => {
  console.warn(chalk.yellow(message));
};

export const logError = (message: string): void => {
  console.error(chalk.red(message));
};
