import React, { useRef,useState,useEffect } from 'react';
import axios from 'axios';
import { Bold, Italic, Underline, Code } from './components/Icons';
import Toolbar from './components/Toolbar';
import './editor.css'

function ImageResizePopup({ targetImage, onResize, onClose }) {
    if (!targetImage) return null;

    const sizes = [25, 50, 75, 100];

    return (
        <div 
            className="image-resize-popup"
            style={{
                position: 'absolute',
                top: targetImage.getBoundingClientRect().bottom + window.scrollY + 5,
                left: targetImage.getBoundingClientRect().left + window.scrollX,
                background: '#fff',
                border: '1px solid #ccc',
                padding: '5px 10px',
                borderRadius: '4px',
                zIndex: 9999
            }}
        >
            {sizes.map(size => (
                <button
                    key={size}
                    onClick={() => onResize(size)}
                    style={{ margin: '0 2px' }}
                >
                    {size}%
                </button>
            ))}
            <button onClick={onClose} style={{ marginLeft: '5px', color: 'red' }}>✕</button>
        </div>
    );
}

export default function VEditor({onChange,onChangeImage='',value}) {

    const editorRef = useRef(null);
    const consoleRef = useRef(null);
    const [consoleView, setConsoleView] = useState(false);
    const [html, setHtml] = useState('');
    const [targetImage, setTargetImage] = useState(null);

    const handleInput = () => {
        if (!consoleView && editorRef.current) {
            const newHtml = editorRef.current.innerHTML;
            setHtml(newHtml);
            onChange?.(newHtml);
        } else if (consoleView && consoleRef.current) {
            const newHtml = consoleRef.current.innerText;
            setHtml(newHtml);
            onChange?.(newHtml);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);

            let node = range.startContainer;
            
            // Find the current block element
            while (node && node !== editorRef.current && node.nodeType === 3) {
                node = node.parentNode;
            }
            
            // If we're in a list item, handle list behavior
            const listItem = node.closest ? node.closest('li') : null;
            if (listItem) {
                const list = listItem.parentNode;

                if (listItem.textContent.trim() === '' || listItem.textContent === '\u200B') 
                {
                    // If current list item is empty, break out of the list
                    const parent = list.parentNode;
                    const newP = document.createElement('p');
                    newP.textContent = '\u200B';  // empty paragraph placeholder
                    // Insert the new paragraph after the list
                    if (list.nextSibling) {
                      parent.insertBefore(newP, list.nextSibling);
                    } else {
                      parent.appendChild(newP);
                    }
                    // Remove the empty list item
                    listItem.remove();
                    // If the list becomes empty, remove the list as well
                    if (!list.firstChild) {
                      list.remove();
                    }
                    // Place cursor in the new paragraph
                    const newRange = document.createRange();
                    newRange.setStart(newP, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    handleInput();
                    return;
                }

                const newLi = document.createElement('li');
                newLi.textContent = '\u200B';
                
                // Insert new list item after current one
                if (listItem.nextSibling) {
                    list.insertBefore(newLi, listItem.nextSibling);
                } else {
                    list.appendChild(newLi);
                }
                
                // If current list item is empty, remove it
                if (listItem.textContent.trim() === '' || listItem.textContent === '\u200B') {
                    listItem.remove();
                }
                
                // Set cursor in new list item
                const newRange = document.createRange();
                newRange.setStart(newLi, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                
                handleInput();
                return;
            }
            
            // Create new paragraph
            const newP = document.createElement('p');
            newP.textContent = '\u200B';
            
            // If we're in a block element, insert after it
            if (node && node !== editorRef.current && /^(P|DIV|H[1-6])$/i.test(node.nodeName)) {
                node.after(newP);
            } else {
                // Insert at cursor position
                range.deleteContents();
                range.insertNode(newP);
            }
            
            // Set cursor in new paragraph
            const newRange = document.createRange();
            newRange.setStart(newP, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            handleInput();
        }
    };

    const handleViewHTML = () => {
        if (editorRef.current) {
            const rawHTML = editorRef.current.innerHTML;
            setHtml(rawHTML);
        }
        setConsoleView(!consoleView);
    }

    const handleTypograph = (tag) => {
        
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

    const handleFormat = (tagName) => {

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

    const closestList = (node) => {
        while (node && node !== editorRef.current) {
            if (node.nodeName === 'UL' || node.nodeName === 'OL') return node;
            node = node.parentNode;
        }
        return null;
    };

    const toggleList = (listType) => {

        if(listType){
        
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
            console.log(startBlock,endBlock,commonList);
        }

    }

    const handleInsertImage = (file) => {
        console.log(file);
        uploadAndInsertImage(file);
    };

    const uploadAndInsertImage = async (file) => {
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:1100/api/save-veditor-image',formData);
            if (res.data.status=='success') {
                insertImageAtCursor(res.data.data.url);
                handleInput();
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    const insertImageAtCursor = (url) => {

        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Inserted image';
        img.style.maxWidth = '100%';

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);

            range.setStartAfter(img);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            editorRef.current?.appendChild(img);
        }
    };

    const handleImageClick = (e) => {
        if (e.target.tagName === 'IMG') {
            setTargetImage(e.target);
        } else {
            setTargetImage(null);
        }
    };
    
    const handleResize = (percentage) => {
        if (targetImage) {
            targetImage.style.width = `${percentage}%`;
        }
        setTargetImage(null);
    };
    
    const handleCloseResizePopup = () => {
        setTargetImage(null);
    };

    /* This is for console view toggle*/
    useEffect(() => {
        if (consoleView && consoleRef.current) {
            consoleRef.current.innerText = html;
        }
        if (!consoleView && editorRef.current) {
            editorRef.current.innerHTML = html;
            const range = document.createRange();
            const sel = window.getSelection();
            if (editorRef.current.lastChild) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, [consoleView]);

    /*This if for inserting default P tag at the first time rendering (without html data)*/
    useEffect(() => {
        if (editorRef.current) {
            // Clean up any existing content
            editorRef.current.innerHTML = '';
            
            // Create a clean paragraph element
            const p = document.createElement('p');
            p.textContent = '\u200B'; // Zero-width space for clean initialization
            editorRef.current.appendChild(p);
            
            // Set cursor position
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(p, 0); 
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editorRef.current.focus();
        }
    }, []);

    return (<>
        <div className="vcontainer">

            {/* Toolbar */}
            <Toolbar 
                handleTypograph={handleTypograph} 
                handleFormat={handleFormat} 
                handleViewHTML={handleViewHTML}
                toggleList={toggleList}
                handleInsertImage={handleInsertImage}
            />

            {/* Editor Area */}
            {
                !consoleView &&
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onClick={handleImageClick}
                    className="veditor-area"
                    style={{ outline: 'none' }}
                >
                </div>
            }

            {
                consoleView && 
                <pre 
                    ref={consoleRef}
                    contentEditable
                    suppressContentEditableWarning={true} 
                    onInput={handleInput}
                    className="log-console"
                    style={{ whiteSpace: 'pre-wrap' }}
                >
                </pre>
            }

            <ImageResizePopup 
                targetImage={targetImage} 
                onResize={handleResize} 
                onClose={handleCloseResizePopup}
            />
        </div>
    </>)
}