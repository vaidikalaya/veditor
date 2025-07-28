import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Code, ListBullet, ListNumbered, Image, AlignLeft, AlignCenter, AlignRight, Bars3, Minus, Link } from './Icons';
import Dropdown from "./Dropdown"
import TableGridSelector from "./TableGridSelector";

export default function Toolbar({
    handleTypograph,
    handleFormat,
    handleViewHTML,
    toggleList,
    handleInsertImage,
    handleAlertBox,
    handleAlign,
    handleColor,
    handleHorizontalLine,
    handleInsertTable,
    handleInsertLink
}) {

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
                <button type='button' onClick={() => handleFormat('strong')}><Bold className="vh-24" /></button>
                <button type='button' onClick={() => handleFormat('em')}><Italic className="vh-24" /></button>
                <button type='button' onClick={() => handleFormat('u')}><Underline className="vh-24" /></button>
                <button type='button' onClick={() => toggleList('ul')}><ListBullet className="vh-24" /></button>
                <button type='button' onClick={() => toggleList('ol')}><ListNumbered className="vh-24" /></button>
                <button type='button' onClick={() => handleInsertLink()}><Link className="vh-24" /></button>
                <TableGridSelector
                    maxRows={10}
                    maxCols={10}
                    onSelect={(rows, cols) => handleInsertTable(rows, cols)}
                />
                <button type='button' onClick={handleHorizontalLine}><Minus className="vh-24" /></button>
                <button type='button' onClick={triggerFileInput}><Image className="vh-24" /></button>
                <Dropdown
                    label="Align"
                    onSelect={(alignment) => handleAlign(alignment)}
                    sections={[
                        {
                            title: 'Text Alignment',
                            items: [
                                { label: <AlignLeft />, value: 'left' },
                                { label: <AlignCenter />, value: 'center' },
                                { label: <AlignRight />, value: 'right' },
                                { label: <Bars3 />, value: 'justify' },
                            ],
                        },
                    ]}
                />
                <div className="color-pickers">
                    <label>
                        <span>Text</span>
                        <input
                            type="color"
                            onChange={(e) => handleColor('color', e.target.value)}
                            title="Text Color"
                        />
                    </label>

                    <label>
                        <span>BG</span>
                        <input
                            type="color"
                            onChange={(e) => handleColor('backgroundColor', e.target.value)}
                            title="Background Color"
                        />
                    </label>
                </div>
                <Dropdown
                    label="Alerts"
                    onSelect={(moduleType) => handleAlertBox(moduleType)}
                    sections={[
                        {
                            title: 'Custom Modules',
                            items: [
                                { label: 'Info', value: 'alert-info' },
                                { label: 'Warning', value: 'alert-warning' },
                                { label: 'Success', value: 'alert-success' },
                                { label: 'Blue', value: 'alert-blue' },
                                { label: 'Pink', value: 'alert-pink' },
                                { label: 'Orange', value: 'alert-orange' },
                                { label: 'Green', value: 'alert-green' },
                            ],
                        },
                    ]}
                />
                <button type='button' onClick={handleViewHTML}><Code className="vh-24" /></button>

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