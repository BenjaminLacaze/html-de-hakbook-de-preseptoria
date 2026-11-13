import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CaretDown, Check, Student, User } from '@phosphor-icons/react';

export const ChildSelector: React.FC = () => {
  const { childrenList, selectedChild, selectedChildId, setSelectedChildId } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (childrenList.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)]">
        <Student className="w-4 h-4" />
        <span>Sin alumnos vinculados</span>
      </div>
    );
  }

  // Si solo tiene un hijo a cargo
  if (childrenList.length === 1) {
    const child = childrenList[0];
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-xs shadow-xs">
        <div className="w-6 h-6 rounded-full bg-[var(--brand-navy)] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
          {child.firstName[0]}
        </div>
        <div className="leading-tight text-left">
          <span className="font-bold text-[var(--text)] block truncate max-w-[130px] sm:max-w-[180px]">
            {child.firstName} {child.lastName}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] block truncate max-w-[130px] sm:max-w-[180px]">
            {child.year} · {child.shift}
          </span>
        </div>
      </div>
    );
  }

  // Si tiene varios hijos: selector interactivo desplegable
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--brand-gold)] bg-[var(--surface-card)] text-xs text-[var(--text)] shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Seleccionar hijo o estudiante a cargo"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--brand-navy)] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
          {selectedChild ? selectedChild.firstName[0] : <User className="w-3 h-3" />}
        </div>
        <div className="leading-tight text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[var(--text)] truncate max-w-[120px] sm:max-w-[160px]">
              {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : 'Seleccionar hijo/a'}
            </span>
            <span className="text-[10px] bg-[var(--brand-gold)]/15 text-[var(--text)] font-semibold px-1 rounded">
              {childrenList.length} hijos
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block truncate max-w-[120px] sm:max-w-[160px]">
            {selectedChild?.year} · {selectedChild?.shift}
          </span>
        </div>
        <CaretDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          weight="bold"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xl z-50 py-1 divide-y divide-[var(--border)] animate-in fade-in">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-subtle)]">
            Estudiantes a cargo
          </div>
          <div className="py-1">
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors hover:bg-[var(--surface-subtle)] cursor-pointer ${
                    isSelected ? 'bg-[var(--surface-subtle)] font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--brand-navy)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {child.firstName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text)]">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {child.courseName} ({child.year}) · {child.shift}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--brand-gold)] shrink-0" weight="bold" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
