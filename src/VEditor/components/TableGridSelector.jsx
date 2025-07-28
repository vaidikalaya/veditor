import React, { useState } from 'react';
import { Table } from './Icons';

export default function TableGridSelector({ maxRows = 10, maxCols = 10, onSelect }) {
    const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
    const [open, setOpen] = useState(false);

    const handleMouseOver = (row, col) => {
        setHovered({ rows: row + 1, cols: col + 1 });
    };

    const handleClick = (row, col) => {
        setOpen(false);
        onSelect(row + 1, col + 1);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button type="button" onClick={() => setOpen((v) => !v)}><Table className='vh-24' /></button>
            {open && (
                <div
                    className="table-grid-selector"
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        padding: 8,
                        zIndex: 100,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        minWidth: 180,
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxCols}, 18px)`, gap: 2 }}>
                        {Array.from({ length: maxRows }).map((_, row) =>
                            Array.from({ length: maxCols }).map((_, col) => (
                                <div
                                    key={row + '-' + col}
                                    onMouseOver={() => handleMouseOver(row, col)}
                                    onClick={() => handleClick(row, col)}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        background:
                                            row < hovered.rows && col < hovered.cols
                                                ? '#bfdbfe'
                                                : '#f3f4f6',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                    }}
                                />
                            ))
                        )}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, color: '#374151', textAlign: 'center' }}>
                        {hovered.rows > 0 && hovered.cols > 0
                            ? `${hovered.rows} x ${hovered.cols}`
                            : 'Select size'}
                    </div>
                </div>
            )}
        </div>
    );
}
