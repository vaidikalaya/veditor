import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Code } from './components/Icons';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import { handleTypograph, handleFormat, handleAlign, handleColor, toggleList, handleHorizontalLine, handleInsertTable } from './editor/editorActions';
import { uploadAndInsertImage } from './editor/imageUploader';
import { handleAlertBox } from './editor/modules';
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
    const [prettyHtml, setPrettyHtml] = useState('');

    // const prettyHtml = prettier.format(html, {
    //     parser: 'html',
    //     plugins: [parserHtml]
    // });

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

    /* This is for console view toggle*/
    useEffect(() => {
        if (consoleView && consoleRef.current) {
            // consoleRef.current.innerText = html;
            setPrettyHtml(
                prettier.format(html, {
                    parser: 'html',
                    plugins: [parserHtml]
                })
            );
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
    }, [consoleView,html]);

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

    useEffect(() => {
        if (editorRef.current && value !== html) {
            editorRef.current.innerHTML = value;
            setHtml(value);
            const range = document.createRange();
            const sel = window.getSelection();
            if (editorRef.current.lastChild) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, [value]);

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
                handleAlertBox={(file) => handleAlertBox(editorRef, handleInput, file)}
                handleViewHTML={handleViewHTML}
                handleHorizontal={() => handleHorizontalLine(editorRef, handleInput)}
                handleInsertTable={(rows, cols) => handleInsertTable(editorRef, handleInput, rows, cols)}
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
                <CodeMirror
                    value={prettyHtml}
                    height="400px"
                    theme={dracula}
                    extensions={[]}
                    onChange={(value) => {
                        setHtml(value);
                        onChange?.(value);
                    }}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                    }}
                />
            }

            {/* {
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
            } */}

            <ImageResizePopup
                targetImage={targetImage}
                onResize={handleResize}
                onClose={handleCloseResizePopup}
            />
        </div>
    </>)
}