import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { INITIAL_RESOURCE_USER_GROUPS } from '../../data/resourcesMock';
import { Checkbox } from '../ui/checkbox';
import { inputClass } from '../resources/resourceShared';
import { cn } from '../ui/utils';

interface ReportUserGroupSelectProps {
  selected: string[];
  onChange: (groups: string[]) => void;
  helperText?: string;
  /** Open menu above the trigger — use in modals near the bottom */
  placement?: 'above' | 'below';
}

export function ReportUserGroupSelect({
  selected,
  onChange,
  helperText = 'Only selected groups can see this report once published. Leave empty to make it visible to everyone with report access.',
  placement = 'below',
}: ReportUserGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const groups = INITIAL_RESOURCE_USER_GROUPS;

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((g) => g !== name)
        : [...selected, name],
    );
  };

  const remove = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((g) => g !== name));
  };

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 240;
    const gap = 4;

    if (placement === 'above') {
      setMenuStyle({
        top: rect.top - menuHeight - gap,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setMenuStyle({
        top: rect.bottom + gap,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);
    return () => cancelAnimationFrame(frame);
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1500] bg-card border border-border rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
          >
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => toggle(group.name)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-left"
              >
                <Checkbox
                  checked={selected.includes(group.name)}
                  className="pointer-events-none"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{group.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.members.length} member
                    {group.members.length === 1 ? '' : 's'}
                  </p>
                </div>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div>
      <p className="label-caps mb-2">User group access</p>
      <p className="text-sm text-muted-foreground mb-2">
        {selected.length === 0
          ? 'Visible to everyone with report access.'
          : `${selected.length} group${selected.length === 1 ? '' : 's'} selected`}
      </p>
      <div className="relative">
        <div
          ref={triggerRef}
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
          className={cn(
            inputClass,
            'cursor-pointer text-left flex flex-wrap items-center gap-1.5 min-h-[42px]',
            open && 'border-primary ring-2 ring-ring/10',
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {selected.length > 0 ? (
            selected.map((name) => (
              <span
                key={name}
                className="inline-flex max-w-full items-center gap-0.5 rounded-xs bg-sidebar-accent px-2 py-0.5 text-xs font-medium text-primary-text"
              >
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => remove(name, e)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${name}`}
                  title="Remove group"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-text-subtle">+ Add user group...</span>
          )}
          <ChevronDown
            size={16}
            className={cn('ml-auto shrink-0 transition-transform', open && 'rotate-180')}
          />
        </div>
        {menu}
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground mt-2">{helperText}</p>
      )}
    </div>
  );
}
