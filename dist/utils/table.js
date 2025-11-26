"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTable = void 0;
const cli_table3_1 = __importDefault(require("cli-table3"));
const renderTable = (columns, rows) => {
    const head = columns.map((col) => col.name);
    const table = new cli_table3_1.default({
        head,
        style: { head: ['cyan'], border: ['grey'] },
        colAligns: columns.map((col) => col.alignment ?? 'left'),
    });
    rows.forEach((row) => table.push(row));
    return table.toString();
};
exports.renderTable = renderTable;
//# sourceMappingURL=table.js.map