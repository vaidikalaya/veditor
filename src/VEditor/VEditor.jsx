import React, { useRef,useState,useEffect } from 'react';
import { Bold, Italic, Underline, Code } from './components/Icons';
import Toolbar from './components/Toolbar';
import './editor.css'

export default function VEditor() {

    const editorRef = useRef(null);
    const [showCodeView, setShowCodeView] = useState(false);
    const [html, setHtml] = useState('');

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
        setShowCodeView(!showCodeView);
    }

    return (<>
        <div className="max-w-2xl mx-auto border rounded-lg shadow-lg pt-2 bg-white mt-8">

            {/* Toolbar */}
            <Toolbar applyFormat={applyFormat} handleViewHTML={handleViewHTML} />

            {/* Editor Area */}
            {
                !showCodeView &&
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="prose min-h-[200px] p-2 bg-gray-50 rounded-b-lg focus:outline-none text-gray-800 text-base"
                    style={{ outline: 'none' }}
                >
                </div>
            }

            {
                showCodeView && 
                <pre className="min-h-[200px] bg-black text-green-400 text-sm p-4 rounded-b-lg overflow-auto">
                    {html}
                </pre>
            }
        </div>
    </>)
}