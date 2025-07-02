import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Bold, Italic, Underline, Code } from './components/Icons';
import { handleTypograph, handleFormat, handleAlign, handleColor, toggleList } from './editor/editorActions';
import { uploadAndInsertImage } from './editor/imageUploader';
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

export default function VEditor({ onChange, onChangeImage = '', value }) {

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

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);

        if (e.key === 'Enter' && e.shiftKey) {

            e.preventDefault();

            // Insert <br> at cursor
            const br = document.createElement('br');
            range.insertNode(br);

            // Move cursor after <br>
            range.setStartAfter(br);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);

            handleInput();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            let node = range.startContainer;

            // Find the current block element
            while (node && node !== editorRef.current && node.nodeType === 3) {
                node = node.parentNode;
            }

            // If we're in a list item, handle list behavior
            const listItem = node.closest ? node.closest('li') : null;
            if (listItem) {
                const list = listItem.parentNode;

                if (listItem.textContent.trim() === '' || listItem.textContent === '\u200B') {
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

    const handleInsertModule = (moduleType) => {
        let div = document.createElement('div');
        div.style.padding = '10px';
        div.style.margin = '10px 0';
        div.style.borderRadius = '4px';

        switch (moduleType) {
            case 'infoBox':
                div.style.background = '#e7f3fe';
                div.style.border = '1px solid #b3d7ff';
                div.textContent = 'Info Box';
                break;
            case 'warningBox':
                div.style.background = '#fff3cd';
                div.style.border = '1px solid #ffeeba';
                div.textContent = 'Warning Box';
                break;
            case 'successBox':
                div.style.background = '#d4edda';
                div.style.border = '1px solid #c3e6cb';
                div.textContent = 'Success Box';
                break;
            default:
                div.textContent = 'Custom Box';
        }

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
                handleTypograph={(tag) => handleTypograph(editorRef, handleInput, tag)}
                handleFormat={(tag) => handleFormat(editorRef, handleInput, tag)}
                handleAlign={(alignment) => handleAlign(editorRef, handleInput, alignment)}
                handleColor={(prop, val) => handleColor(editorRef, handleInput, prop, val)}
                toggleList={(listType) => toggleList(editorRef, handleInput, listType)}
                handleInsertImage={(file) => uploadAndInsertImage(editorRef, handleInput, file)}
                handleViewHTML={handleViewHTML}
                handleInsertModule={handleInsertModule}
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