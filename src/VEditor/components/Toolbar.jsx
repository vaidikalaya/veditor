import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Code, ListBullet, ListNumbered, Image, AlignLeft, AlignCenter, AlignRight, Bars3 } from './Icons';
import Dropdown from "./Dropdown"

export default function Toolbar({
    handleTypograph,
    handleFormat,
    handleViewHTML,
    toggleList,
    handleInsertImage,
    handleInsertModule,
    handleAlign,
    handleColor
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
                <button type='button' onClick={() => handleFormat('strong')}><Bold /></button>
                <button type='button' onClick={() => handleFormat('em')}><Italic /></button>
                <button type='button' onClick={() => handleFormat('u')}><Underline /></button>
                <button type='button' onClick={() => toggleList('ul')}><ListBullet /></button>
                <button type='button' onClick={() => toggleList('ol')}><ListNumbered /></button>
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
                <div className="color-pickers" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px' }}>Text</span>
                        <input
                            type="color"
                            onChange={(e) => handleColor('color', e.target.value)}
                            title="Text Color"
                        />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px' }}>BG</span>
                        <input
                            type="color"
                            onChange={(e) => handleColor('backgroundColor', e.target.value)}
                            title="Background Color"
                        />
                    </label>
                </div>
                <button type='button' onClick={triggerFileInput}><Image /></button>
                <Dropdown
                    label="Modules"
                    onSelect={(moduleType) => handleInsertModule(moduleType)}
                    sections={[
                        {
                            title: 'Custom Modules',
                            items: [
                                { label: 'Info Box', value: 'infoBox' },
                                { label: 'Warning Box', value: 'warningBox' },
                                { label: 'Success Box', value: 'successBox' },
                            ],
                        },
                    ]}
                />
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