import axios from 'axios';

export async function handleAlertBox(editorRef, handleInput, moduleType) {

    let div = document.createElement('div');
    div.className = moduleType;
    div.textContent = 'Write here...';

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    let container = range.startContainer;
    while (container && container !== editorRef.current && container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
    }

    if (container && /^(P|DIV|H[1-6])$/i.test(container.nodeName)) {
        // Insert after the block element
        if (container.nextSibling) {
            container.parentNode.insertBefore(div, container.nextSibling);
        } else {
            container.parentNode.appendChild(div);
        }
    } else {
        // If no block found, just insert at cursor position
        range.collapse(false);
        range.insertNode(div);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(div);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
};