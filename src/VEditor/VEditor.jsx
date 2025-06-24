import React, { useRef,useState,useEffect } from 'react';
import { Bold, Italic, Underline, Code } from './components/Icons';
import './editor.css'

export default function VEditor() {

    const editorRef = useRef(null);
    const [showCodeView, setShowCodeView] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
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
            <div className="border-b px-2 py-2 bg-gray-50 rounded-t-lg flex items-center">
                <div className='toolbar flex space-x-2'>
                    <button type='button' onClick={() => applyFormat('strong')}><Bold /></button>
                    <button type='button' onClick={() => applyFormat('em')}><Italic /></button>
                    <button type='button' onClick={() => applyFormat('u')}><Underline /></button>
                    <div className="relative inline-block text-left">
                        <button
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Heading
                            <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="origin-top-left absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                {['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                    applyFormat(tag);
                                    setShowDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {tag === 'p' ? 'Normal' : tag.toUpperCase()}
                                </button>
                                ))}
                            </div>
                            </div>
                        )}
                    </div>
                    <button type='button' onClick={handleViewHTML}><Code /></button>
                </div>
            </div>

            {/* Editor Area */}
            {
                !showCodeView &&
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="min-h-[200px] p-2 bg-gray-50 rounded-b-lg focus:outline-none text-gray-800 text-base"
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