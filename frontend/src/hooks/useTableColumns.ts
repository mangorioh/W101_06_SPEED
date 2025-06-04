import { useState, useEffect } from 'react';

interface DefaultColumns {
    [key: string]: boolean;
}

export const useTableColumns = (defaultVisibleColumns: DefaultColumns) => {
    const [visibleColumns, setVisibleColumns] = useState<DefaultColumns>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('columnVisibility');
            return saved ? JSON.parse(saved) : defaultVisibleColumns;
        }
        return defaultVisibleColumns;
    });

    const toggleColumnVisibility = (column: string) => {
        setVisibleColumns((prev) => {
            const newVisibility = { ...prev, [column]: !prev[column] };
            localStorage.setItem('columnVisibility', JSON.stringify(newVisibility));
            return newVisibility;
        });
    };

    return { visibleColumns, toggleColumnVisibility };
};
