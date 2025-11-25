"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByTimeDesc = exports.secondKey = exports.toDate = void 0;
const toDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
exports.toDate = toDate;
const secondKey = (date) => {
    const iso = date.toISOString();
    return iso.substring(0, 19) + 'Z';
};
exports.secondKey = secondKey;
const sortByTimeDesc = (entries) => {
    return [...entries].sort((a, b) => {
        const da = (0, exports.toDate)(a.timestamp)?.getTime() ?? 0;
        const db = (0, exports.toDate)(b.timestamp)?.getTime() ?? 0;
        return db - da;
    });
};
exports.sortByTimeDesc = sortByTimeDesc;
//# sourceMappingURL=time.js.map