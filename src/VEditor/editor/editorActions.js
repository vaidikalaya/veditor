export function handleTypograph(editorRef, handleInput, tag) {

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    let node = range.startContainer;

    // Traverse up to find a block-level parent
    while (node && node !== editorRef.current && node.nodeType === 3) {
        node = node.parentNode;
    }

    // Traverse until we find a block-level node
    while (
        node &&
        node !== editorRef.current &&
        !/^(P|DIV|H[1-6])$/i.test(node.nodeName)
    ) {
        node = node.parentNode;
    }

    // If no suitable block found, wrap selection in new heading
    if (!node || node === editorRef.current) {
        const wrapper = document.createElement(tag);
        const selectedText = selection.toString() || '\u200B';
        wrapper.textContent = selectedText;

        range.deleteContents();
        range.insertNode(wrapper);

        // Place cursor after inserted heading
        const newRange = document.createRange();
        newRange.setStartAfter(wrapper);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        handleInput();
        return;
    }

    // Create new block element
    const newBlock = document.createElement(tag);
    newBlock.innerHTML = node.innerHTML;

    node.replaceWith(newBlock);

    // Move cursor to end of new block
    const newRange = document.createRange();
    newRange.selectNodeContents(newBlock);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
};

export function handleFormat(editorRef, handleInput, tagName) {

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    //Check if selection is already inside the tag (same for start and end)
    const startTag = startContainer.nodeType === 3 ? startContainer.parentElement.closest(tagName) : startContainer.closest(tagName);
    const endTag = endContainer.nodeType === 3 ? endContainer.parentElement.closest(tagName) : endContainer.closest(tagName);

    if (startTag && endTag && startTag === endTag) {

        //Unwrap the tag
        const wrapper = startTag;
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) {
            fragment.appendChild(wrapper.firstChild);
        }
        wrapper.replaceWith(fragment);
        return;
    }

    const selectedText = range.extractContents();

    const wrapper = document.createElement(tagName);
    wrapper.appendChild(selectedText);
    range.insertNode(wrapper);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);
}

export function handleAlign(editorRef, handleInput, alignment) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    while (node && node !== editorRef.current && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }

    // Find the nearest block-level element
    while (
        node &&
        node !== editorRef.current &&
        !/^(P|DIV|H[1-6]|LI)$/i.test(node.nodeName)
    ) {
        node = node.parentNode;
    }

    if (node && node !== editorRef.current) {
        node.style.textAlign = alignment;
        handleInput();
    }
};

export function handleColor(editorRef, handleInput, styleProp, value) {

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (range.collapsed) {
        // No selection → apply to block
        let node = range.startContainer;
        while (node && node !== editorRef.current && node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        while (
            node &&
            node !== editorRef.current &&
            !/^(P|DIV|H[1-6]|LI|SPAN)$/i.test(node.nodeName)
        ) {
            node = node.parentNode;
        }

        if (node && node !== editorRef.current) {
            node.style[styleProp] = value;
            handleInput();
        }

        return;
    }

    // There is a selection → apply to selected text
    const commonAncestor = range.commonAncestorContainer;

    // Try to find a span that already wraps the selection
    let existingSpan = (commonAncestor.nodeType === 3 ? commonAncestor.parentNode : commonAncestor);
    if (existingSpan && existingSpan.nodeName === 'SPAN') {
        // Just update style
        existingSpan.style[styleProp] = value;
        handleInput();
        return;
    }

    // Otherwise wrap in a clean span
    const span = document.createElement('span');
    span.style[styleProp] = value;
    span.appendChild(range.extractContents());

    // Clean up nested spans with same style
    flattenSpan(span, styleProp, value);

    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
};

export function toggleList(editorRef, handleInput, listType) {

    if (listType) {

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);

        let startNode = range.startContainer;
        let endNode = range.endContainer;

        const getTopBlock = (node) => {
            let el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
            while (el && el !== editorRef.current &&
                !/^(P|DIV|H[1-6]|LI)$/i.test(el.nodeName)) {
                el = el.parentNode;
            }
            return el === editorRef.current ? null : el;
        };

        const startBlock = getTopBlock(startNode);
        const endBlock = getTopBlock(endNode);

        if (!startBlock || !endBlock) return;

        const commonList = closestList(range.commonAncestorContainer);
        if (commonList) {
            const isOrderedList = commonList.nodeName === 'OL';
            const isUnorderedList = commonList.nodeName === 'UL';
            const targetIsOrdered = listType === 'ol';

            if ((isUnorderedList && !targetIsOrdered) || (isOrderedList && targetIsOrdered)) {
                // Toggling off the same list type
                const listEl = commonList;
                // Determine the range of <li> to remove (all that fall within the selection)
                let firstLi = startBlock.closest('li') || startBlock;
                let lastLi = endBlock.closest('li') || endBlock;
                if (!firstLi || !lastLi) return;
                // Ensure firstLi comes before lastLi in DOM order
                if (firstLi.compareDocumentPosition(lastLi) & Node.DOCUMENT_POSITION_PRECEDING) {
                    [firstLi, lastLi] = [lastLi, firstLi];
                }
                // Gather all target li elements between firstLi and lastLi
                const liToRemove = [];
                for (let li = firstLi; li; li = li.nextSibling) {
                    liToRemove.push(li);
                    if (li === lastLi) break;
                }
                // Prepare new list for items after selection (to split the list if needed)
                let newList = null;
                if (lastLi.nextSibling) {
                    newList = listEl.cloneNode(false); // clone <ul> or <ol> without children
                    // Move remaining <li> after selection into newList
                    let afterNode = lastLi.nextSibling;
                    while (afterNode) {
                        const next = afterNode.nextSibling;
                        newList.appendChild(afterNode);
                        afterNode = next;
                    }
                }
                // Create paragraphs for each selected li and remove them from the list
                const parent = listEl.parentNode;
                const insertBeforeNode = newList ? newList : listEl.nextSibling;
                const paragraphs = [];
                liToRemove.forEach(li => {
                    const p = document.createElement('p');
                    // Move all child nodes of li into the paragraph
                    while (li.firstChild) {
                        p.appendChild(li.firstChild);
                    }
                    paragraphs.push(p);
                    // Remove the li from the list
                    li.remove();
                });
                // If the original list is now empty (or had no remaining <li> before selection), remove it
                if (!listEl.firstChild) {
                    listEl.remove();
                }
                // Insert the new paragraphs into the DOM at the correct position
                paragraphs.forEach(p => {
                    parent.insertBefore(p, insertBeforeNode || null);
                });
                // If we split off a new list with after-items, insert that after the paragraphs
                if (newList && newList.firstChild) {
                    parent.insertBefore(newList, insertBeforeNode || null);
                }
                // Restore cursor: if only one item was toggled off (collapsed selection), place caret in the new paragraph
                if (range.collapsed && paragraphs.length === 1) {
                    const para = paragraphs[0];
                    // Set caret at the same position (or end of paragraph content if original position not easily tracked)
                    const newRange = document.createRange();
                    if (para.firstChild) {
                        newRange.setStart(para.firstChild, 0);
                    } else {
                        newRange.setStart(para, 0);
                    }
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                handleInput();  // update state
            } else {
                // Converting a list to the other type (e.g., UL -> OL or vice versa)
                const newList = document.createElement(listType);
                const oldList = commonList;
                // Move all list items to the new list container
                while (oldList.firstChild) {
                    newList.appendChild(oldList.firstChild);
                }
                oldList.parentNode.replaceChild(newList, oldList);
                handleInput();
            }
            return;
        }
        const listEl = document.createElement(listType);
        const parent = startBlock.parentNode;
        let node = startBlock;
        const afterEndNode = endBlock.nextSibling;  // marker for end of selection
        while (node !== afterEndNode) {
            // Only wrap block elements (skip if node is already a list container itself)
            if (node.nodeName !== 'UL' && node.nodeName !== 'OL') {
                const li = document.createElement('li');
                // Move node’s children into the li (preserve inline formatting)
                while (node.firstChild) {
                    li.appendChild(node.firstChild);
                }
                listEl.appendChild(li);
            }
            const toRemove = node;
            node = node.nextSibling;
            // Remove the original block from DOM
            parent.removeChild(toRemove);
        }

        // Insert the new list at the position of the first removed block
        parent.insertBefore(listEl, afterEndNode || null);
        // Place cursor inside the first item if it was a collapsed cursor in a single block
        if (range.collapsed && listEl.firstChild) {
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStart(listEl.firstChild, 0);
            newRange.collapse(true);
            selection.addRange(newRange);
        }
        handleInput();
        console.log(startBlock, endBlock, commonList);
    }

}

export function handleHorizontalLine(editorRef, handleInput) {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    editorRef.current.focus();
    range.collapse(false);

    // Walk up to block-level element (e.g. <p>)
    let container = range.startContainer;
    while (container && container !== editorRef.current && container.nodeType !== Node.ELEMENT_NODE) {
        container = container.parentNode;
    }

    // If we're inside a <p>, insert after it
    const block = container.closest?.('p, div') || container;
    const hr = document.createElement('hr');
    const newP = document.createElement('p');
    newP.innerHTML = '\u200B'; // empty paragraph for cursor

    if (block && block !== editorRef.current) {
        const parent = block.parentNode;

        if (block.nextSibling) {
            parent.insertBefore(hr, block.nextSibling);
            parent.insertBefore(newP, hr.nextSibling);
        } else {
            parent.appendChild(hr);
            parent.appendChild(newP);
        }
    } else {
        // Fallback if not in a block
        editorRef.current.appendChild(hr);
        editorRef.current.appendChild(newP);
    }

    // Move cursor to the empty paragraph
    const newRange = document.createRange();
    newRange.setStart(newP, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
}

export function handleInsertLink(editorRef, handleInput) {

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let selectedText = range.toString().trim();

    const isLikelyURL = selectedText.startsWith('http://') || selectedText.startsWith('https://');
    const defaultURL = isLikelyURL ? selectedText : 'https://';

    const url = prompt('Enter the URL:', defaultURL);
    if (!url) return;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    if (selectedText) {
        anchor.textContent = selectedText;
        range.deleteContents();
    } else {
        anchor.textContent = url;
    }

    range.insertNode(anchor);

    // Move cursor after the anchor
    const newRange = document.createRange();
    newRange.setStartAfter(anchor);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
}

const flattenSpan = (span, styleProp, value) => {
    const innerSpans = span.querySelectorAll('span');
    innerSpans.forEach(inner => {
        if (inner.style[styleProp] === value) {
            // Move its children up and remove this span
            while (inner.firstChild) {
                inner.parentNode.insertBefore(inner.firstChild, inner);
            }
            inner.remove();
        }
    });
};

const closestList = (editorRef, node) => {
    while (node && node !== editorRef.current) {
        if (node.nodeName === 'UL' || node.nodeName === 'OL') return node;
        node = node.parentNode;
    }
    return null;
};