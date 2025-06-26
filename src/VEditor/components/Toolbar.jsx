import { Bold, Italic, Underline, Code } from './Icons';
import Dropdown from "./Dropdown"

export default function Toolbar({handleTypograph,applyFormat,handleViewHTML}) {
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
                <button type='button' onClick={() => applyFormat('strong')}><Bold /></button>
                <button type='button' onClick={() => applyFormat('em')}><Italic /></button>
                <button type='button' onClick={() => applyFormat('u')}><Underline /></button>
                <button type='button' onClick={handleViewHTML}><Code /></button>
            </div>
        </div>
    </>)
}