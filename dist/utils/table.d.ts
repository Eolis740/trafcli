export interface TableColumn {
    name: string;
    alignment?: 'left' | 'right' | 'center';
}
export declare const renderTable: (columns: TableColumn[], rows: Array<Array<string | number>>) => string;
