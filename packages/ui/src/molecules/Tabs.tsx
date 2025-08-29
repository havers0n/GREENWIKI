import React, { createContext, useContext, useId, useMemo, useState } from 'react';

type TabsContextValue = {
  id: string;
  index: number;
  setIndex: (i: number) => void;
};

const TabsCtx = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: number;
  defaultValue?: number;
  onChange?: (i: number) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, defaultValue = 0, onChange, children, className = '' }) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = typeof value === 'number';
  const index = isControlled ? (value as number) : uncontrolled;
  const setIndex = (i: number) => {
    if (!isControlled) setUncontrolled(i);
    onChange?.(i);
  };
  const id = useId();
  const ctx = useMemo(() => ({ id, index, setIndex }), [id, index]);
  return (
    <TabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
};

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}
export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => (
  <div role="tablist" className={className}>
    {children}
  </div>
);

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
}
export const Tab: React.FC<TabProps> = ({ index, className = '', onClick, ...props }) => {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('Tab must be used within Tabs');
  const selected = ctx.index === index;
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    ctx.setIndex(index);
  };
  const base = 'px-3 py-2 rounded-t-md border-b-2';
  const state = selected ? 'border-majestic-pink text-majestic-dark' : 'border-transparent text-gray-500';
  return (
    <button
      role="tab"
      aria-selected={selected}
      aria-controls={`${ctx.id}-panel-${index}`}
      id={`${ctx.id}-tab-${index}`}
      tabIndex={selected ? 0 : -1}
      onClick={handleClick}
      className={`${base} ${state} ${className}`}
      {...props}
    />
  );
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}
export const TabPanel: React.FC<TabPanelProps> = ({ index, className = '', ...props }) => {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('TabPanel must be used within Tabs');
  const selected = ctx.index === index;
  return (
    <div
      role="tabpanel"
      id={`${ctx.id}-panel-${index}`}
      aria-labelledby={`${ctx.id}-tab-${index}`}
      hidden={!selected}
      className={className}
      {...props}
    />
  );
};
