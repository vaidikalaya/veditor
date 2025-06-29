import React, { useRef,useState,useEffect } from 'react';
import { Bold, Italic, Underline, Code, ListBullet, ListNumbered,Image } from './Icons';
import Dropdown from "./Dropdown"

export default function Toolbar({handleTypograph,handleFormat,handleViewHTML,toggleList,handleInsertImage}) {

    const fileInputRef = React.useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleInsertImage(file);
        }
        e.target.value = '';
    };

    return (<>
        <div className="toolbar-container">
            <div className='toolbar'>
                <Dropdown
                    label="Heading"
                    onSelect={(tag) => handleTypograph(tag)}
                    sections={[
                        {
                        title: 'Heading Styles',
                        items: [
                            { label: 'Normal', value: 'p' },
                            { label: 'H1', value: 'h1' },
                            { label: 'H2', value: 'h2' },
                            { label: 'H3', value: 'h3' },
                            { label: 'H4', value: 'h4' },
                            { label: 'H5', value: 'h5' },
                            { label: 'H6', value: 'h6' },
                        ],
                        },
                    ]}
                />
                <button type='button' onClick={() => handleFormat('strong')}><Bold /></button>
                <button type='button' onClick={() => handleFormat('em')}><Italic /></button>
                <button type='button' onClick={() => handleFormat('u')}><Underline /></button>
                <button type='button' onClick={() =>toggleList('ul')}><ListBullet /></button>
                <button type='button' onClick={() =>toggleList('ol')}><ListNumbered /></button>
                <button type='button' onClick={triggerFileInput}><Image /></button>
                <button type='button' onClick={handleViewHTML}><Code /></button>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                />
            </div>
        </div>
    </>)
}