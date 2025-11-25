"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultFile = exports.setLanguage = exports.resetConfig = exports.writeConfig = exports.readConfig = exports.getConfigPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const defaultConfig = {
    lang: 'en'
};
const getConfigPath = () => {
    const home = os_1.default.homedir();
    return path_1.default.join(home, '.trafcli', 'config.json');
};
exports.getConfigPath = getConfigPath;
const readConfig = () => {
    try {
        const configPath = (0, exports.getConfigPath)();
        if (!fs_1.default.existsSync(configPath)) {
            return { ...defaultConfig };
        }
        const raw = fs_1.default.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultConfig, ...parsed };
    }
    catch (error) {
        return { ...defaultConfig };
    }
};
exports.readConfig = readConfig;
const writeConfig = (config) => {
    const configPath = (0, exports.getConfigPath)();
    const dir = path_1.default.dirname(configPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
};
exports.writeConfig = writeConfig;
const resetConfig = () => {
    (0, exports.writeConfig)(defaultConfig);
};
exports.resetConfig = resetConfig;
const setLanguage = (lang) => {
    const current = (0, exports.readConfig)();
    const next = { ...current, lang: 'en' };
    (0, exports.writeConfig)(next);
    return next;
};
exports.setLanguage = setLanguage;
const setDefaultFile = (filePath) => {
    const current = (0, exports.readConfig)();
    const next = { ...current, defaultFile: filePath };
    (0, exports.writeConfig)(next);
    return next;
};
exports.setDefaultFile = setDefaultFile;
//# sourceMappingURL=file.js.map