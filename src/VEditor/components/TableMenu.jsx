import React from 'react';

export default function TableMenu({
    position,
    cell,
    onInsertRow,
    onDeleteRow,
    onInsertColumn,
    onDeleteColumn,
    onDeleteTable,
    onClose
}) {
    if (!position || !cell) return null;

    return (
        <div
            className="table-popup-menu"
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '5px',
                borderRadius: '4px',
                zIndex: 9999
            }}
        >
            <button onClick={() => onInsertRow(cell, true)}>Insert Row Above</button>
            <button onClick={() => onInsertRow(cell, false)}>Insert Row Below</button>
            <button onClick={() => onDeleteRow(cell)}>Delete Row</button>
            <button onClick={() => onInsertColumn(cell, true)}>Insert Col Left</button>
            <button onClick={() => onInsertColumn(cell, false)}>Insert Col Right</button>
            <button onClick={() => onDeleteColumn(cell)}>Delete Col</button>
            <button onClick={() => onDeleteTable(cell)} style={{ color: 'red' }}>Delete Table</button>
            <button onClick={onClose}>✕</button>
        </div>
    );
}
