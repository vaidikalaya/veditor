export function handleInsertTable(editorRef, handleInput, rows, cols) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);

    // If the editor is empty, insert a paragraph first
    if (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<p>\u200B</p>') {
        editorRef.current.innerHTML = '';
        const p = document.createElement('p');
        p.appendChild(document.createTextNode('\u200B'));
        editorRef.current.appendChild(p);
        range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Remove selection content if any (for correct placement)
    if (!range.collapsed) {
        range.deleteContents();
    }

    // If inside a text node, split it and move range after split
    if (range.startContainer.nodeType === 3) {
        const textNode = range.startContainer;
        const offset = range.startOffset;
        let afterNode = textNode;
        if (offset < textNode.length) {
            afterNode = textNode.splitText(offset);
        }
        // Move range after the split text node
        range = document.createRange();
        range.setStartAfter(afterNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'etable';
    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.innerHTML = '&nbsp;';
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    // Insert table at the current cursor position
    range.insertNode(table);

    // Insert a paragraph after the table for easier editing
    const afterP = document.createElement('p');
    afterP.appendChild(document.createTextNode('\u200B'));
    if (table.nextSibling) {
        table.parentNode.insertBefore(afterP, table.nextSibling);
    } else {
        table.parentNode.appendChild(afterP);
    }

    // Move cursor to first cell
    setTimeout(() => {
        const firstCell = table.querySelector('td');
        if (firstCell) {
            const newRange = document.createRange();
            newRange.selectNodeContents(firstCell);
            newRange.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
        handleInput();
    }, 0);
};

export function insertRow(cell, above, handleInput) {
    const row = cell.parentElement;
    const table = row.parentElement;
    const newRow = row.cloneNode(true);
    newRow.querySelectorAll('td').forEach(td => td.innerHTML = '&nbsp;');

    if (above) {
        table.insertBefore(newRow, row);
    } else {
        table.insertBefore(newRow, row.nextSibling);
    }

    handleInput();
};

export function insertColumn(cell, left, handleInput) {
    const colIndex = Array.from(cell.parentElement.children).indexOf(cell);
    const table = cell.closest('table');

    table.querySelectorAll('tr').forEach(row => {
        const newCell = document.createElement('td');
        newCell.innerHTML = '&nbsp;';
        const refCell = row.children[colIndex];
        if (left) {
            row.insertBefore(newCell, refCell);
        } else {
            row.insertBefore(newCell, refCell.nextSibling);
        }
    });

    handleInput();
};

export function deleteRow(cell, handleInput) {
    const row = cell.parentElement;
    if (row && row.parentNode) {
        row.parentNode.removeChild(row);
    }
    handleInput();
};

export function deleteColumn(cell) {
    const colIndex = Array.from(cell.parentElement.children).indexOf(cell);
    const table = cell.closest('table');

    table.querySelectorAll('tr').forEach(row => {
        if (row.children[colIndex]) {
            row.removeChild(row.children[colIndex]);
        }
    });
};

export function deleteEntireTable(cell) {
    const table = cell.closest('table');
    if (table) {
        table.remove();
    }
};