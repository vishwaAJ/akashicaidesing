import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Back, Chat, ChevronRight, DatabaseStack, Grid, Kebab, Logo, ModuleIcon, SideCollapse, SideExpand, Settings, Support } from './Icons';
import { Toast, useDismiss } from './ui';

export type View = 'ask' | 'dashboard' | 'model' | null;

export function Shell({ crumb, view, right, children, menu, fill }: {
  crumb?: string;
  /** Fit the page to the viewport so an inner region (the chat) scrolls. */
  fill?: boolean;
  view: View;
  right?: ReactNode;
  children: ReactNode;
  menu?: { label: string; sub?: string; onClick: () => void }[];
}) {
  const { sideOpen, setSideOpen, flash } = useStore();
  return (
    <div className={'app' + (fill ? ' fill' : '')}>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Akashic home">
          <Logo />
          <span className="brand-word">AKASHiC</span>
        </Link>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} style={{ color: 'var(--slate-400)' }} />
          {crumb ? <Link to="/">Akashic Insights</Link> : <span aria-current="page">Akashic Insights</span>}
          {crumb && (
            <>
              <ChevronRight size={14} style={{ color: 'var(--slate-400)' }} />
              <span aria-current="page">{crumb}</span>
            </>
          )}
        </nav>
        <div className="user">
          <span className="user-name">Vishwanandan K</span>
          <span className="avatar-lg" aria-hidden="true">VK</span>
        </div>
      </header>
      <div className="body">
        {sideOpen ? (
          <aside className="side" aria-label="Sidebar">
            <div className="side-head">
              <Link to="/" className="side-link" style={{ paddingLeft: 4 }}>
                <Back size={20} />
                Modules Menu
              </Link>
              <button type="button" className="icon-btn" aria-label="Collapse sidebar" aria-expanded="true" onClick={() => setSideOpen(false)}>
                <SideCollapse size={24} />
              </button>
            </div>
            <nav aria-label="Modules" style={{ paddingTop: 12, flex: '1 1 auto' }}>
              <Link to="/" className="side-module" aria-current="page">
                <ModuleIcon />
                Akashic Insights (AI)
              </Link>
            </nav>
            <div className="side-foot">
              <button type="button" className="side-link" onClick={() => flash('Support opens in a new window.')}><Support size={26} />Support</button>
              <button type="button" className="side-link" onClick={() => flash('Settings are outside this prototype.')}><Settings size={26} />Settings</button>
              <p className="side-version">Version 1.02.09</p>
            </div>
          </aside>
        ) : (
          <aside className="rail" aria-label="Sidebar, collapsed">
            <button type="button" className="rail-btn" aria-label="Expand sidebar" aria-expanded="false" title="Expand sidebar" onClick={() => setSideOpen(true)}>
              <SideExpand size={24} />
            </button>
            <span className="rail-sep" aria-hidden="true" />
            <Link to="/" className="rail-btn rail-module" aria-label="Akashic Insights (AI)" title="Akashic Insights (AI)" style={{ color: '#fff' }}>
              <ModuleIcon />
            </Link>
            <span className="rail-spacer" />
            <span className="rail-sep" aria-hidden="true" />
            <button type="button" className="rail-btn" aria-label="Support" title="Support" onClick={() => flash('Support opens in a new window.')}><Support size={26} /></button>
            <button type="button" className="rail-btn" aria-label="Settings" title="Settings" onClick={() => flash('Settings are outside this prototype.')}><Settings size={26} /></button>
          </aside>
        )}
        <main className="main">
          <div className="viewbar">
            <nav className="views" aria-label="Insights views">
              <ViewTab to="/" match={view === 'ask'} icon={<Chat size={22} />} label="Ask AI" />
              <ViewTab to="/dashboard" match={view === 'dashboard'} icon={<Grid size={22} />} label="Dashboard" />
              <ViewTab to="/data-model" match={view === 'model'} icon={<DatabaseStack size={22} />} label="Data model" />
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {right}
              {menu && <MoreMenu items={menu} />}
            </div>
          </div>
          {children}
        </main>
      </div>
      <Toast />
    </div>
  );
}

function ViewTab({ to, match, icon, label }: { to: string; match: boolean; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className={'view-tab' + (match ? ' active' : '')} aria-current={match ? 'page' : undefined}>
      {icon}
      {label}
    </Link>
  );
}

export function MoreMenu({ items, label = 'More options' }: { items: { label: string; sub?: string; onClick: () => void }[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="icon-btn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Kebab size={20} />
      </button>
      {open && (
        <div className="pop menu" role="menu" style={{ top: 'calc(100% + 6px)', right: 0, width: 260 }}>
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" className="menu-item" onClick={() => { setOpen(false); it.onClick(); }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="mi-title" style={{ fontSize: 14 }}>{it.label}</span>
                {it.sub && <span className="mi-sub">{it.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Shared ⋯ menu entries for every view. */
export function useCommonMenu() {
  const nav = useNavigate();
  return [
    { label: 'Data model', sub: 'Browse tables, metrics and glossary', onClick: () => nav('/data-model') },
    { label: 'Narrative container', sub: 'Every content shape an answer can take', onClick: () => nav('/narrative') },
    { label: 'All screens', sub: 'Index of every screen in this design', onClick: () => nav('/screens') },
  ];
}
