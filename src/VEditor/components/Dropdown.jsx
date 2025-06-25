// components/Dropdown.js
import React, { useEffect, useRef, useState } from 'react';

export default function Dropdown({ label = 'Dropdown', sections = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button type="button" onClick={() => setOpen(!open)} className="dropdown-btn">
        {label}
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu">
          <div className="vpy-1">
            {sections.map((section, idx) => (
              <div key={idx} className="vpx-1 vpy-1">
                {section.title && (
                  <div className="label-muted">{section.title}</div>
                )}
                {section.items.map((item) => (
                  <button key={item.value} onClick={() => {onSelect(item.value);setOpen(false);}} className="dropdown-item">
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
