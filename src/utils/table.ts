import Table, { HorizontalTableRow } from 'cli-table3';

export interface TableColumn {
  name: string;
  alignment?: 'left' | 'right' | 'center';
}

export const renderTable = (
  columns: TableColumn[],
  rows: Array<Array<string | number>>,
): string => {
  const head: string[] = columns.map((col) => col.name);
  const table = new Table({
    head,
    style: { head: ['cyan'], border: ['grey'] },
    colAligns: columns.map((col) => col.alignment ?? 'left'),
  });
  rows.forEach((row) => table.push(row as HorizontalTableRow));
  return table.toString();
};
