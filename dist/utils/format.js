"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampNumber = exports.formatMs = exports.formatNumber = exports.formatPercent = void 0;
const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;
exports.formatPercent = formatPercent;
const formatNumber = (value) => value.toLocaleString();
exports.formatNumber = formatNumber;
const formatMs = (value) => `${value.toFixed(2)}`;
exports.formatMs = formatMs;
const clampNumber = (value) => (Number.isFinite(value) ? value : 0);
exports.clampNumber = clampNumber;
//# sourceMappingURL=format.js.map