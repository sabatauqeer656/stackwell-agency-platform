import { useId, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';

// tabs: [{ id, label, content }]. Follows the WAI-ARIA "tabs" pattern:
// arrow keys move between tabs, Home/End jump to the ends, only the active tab is in the Tab order.
export default function Tabs({ tabs, defaultTab, onChange, className }) {
  const baseId = useId();
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const tabRefs = useRef({});

  const select = (id) => {
    setActive(id);
    onChange?.(id);
  };

  const handleKeyDown = (e, index) => {
    let next;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault(); // stop the page from scrolling on Home/End
    select(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-600 hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className="pt-6"
        >
          {tab.id === active && tab.content}
        </div>
      ))}
    </div>
  );
}
