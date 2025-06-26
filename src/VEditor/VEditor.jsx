import React, { useRef,useState,useEffect } from 'react';
import { Bold, Italic, Underline, Code } from './components/Icons';
import Toolbar from './components/Toolbar';
import './editor.css'

export default function VEditor({onChange,value}) {

    const editorRef = useRef(null);
    const [consoleView, setConsoleView] = useState(false);
    const [html, setHtml] = useState('');

    const handleInput = () => {
        const newHtml = editorRef.current.innerHTML;
        setHtml(newHtml);
        onChange?.(newHtml);
    };

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

        console.log('Replacing block', node, 'with', newBlock);

        node.replaceWith(newBlock);

        // Move cursor to end of new block
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);

        handleInput();
    };

    const applyFormat = (tagName) => {

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

    const escapeHTML = (html) => {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const handleViewHTML = () => {
        if (editorRef.current) {
            const rawHTML = editorRef.current.innerHTML;
            setHtml(rawHTML);
        }
        setConsoleView(!consoleView);
    }

    /* This is for console view toggle*/
    useEffect(() => {
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
        if (editorRef.current && !editorRef.current.innerHTML.trim()) {
            const p = document.createElement('p');
            p.innerHTML = '\u200B';
            editorRef.current.appendChild(p);
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(p.firstChild, 1); 
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            editorRef.current.focus();
        }
    }, []);

    return (<>
        <div className="vcontainer">

            {/* Toolbar */}
            <Toolbar applyFormat={applyFormat} handleViewHTML={handleViewHTML} />

            {/* Editor Area */}
            {
                !consoleView &&
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    className="veditor-area"
                    style={{ outline: 'none' }}
                >
                </div>
            }

            {
                consoleView && 
                <pre className="log-console">
                    {html}
                </pre>
            }
        </div>
    </>)
}