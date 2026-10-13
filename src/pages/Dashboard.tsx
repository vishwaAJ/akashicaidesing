import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CartesianChart, DataTable, Donut, HBars, Treemap } from '../components/Charts';
import { AppliedFilters, FilterButton, type Filters } from '../components/FilterPanel';
import { ChevronDown, ChevronLeft, ChevronRight, Expand, Kebab, Plus, Sync, Trash } from '../components/Icons';
import { MoreMenu, Shell, useCommonMenu } from '../components/Shell';
import { CheckMark, Modal, useDismiss } from '../components/ui';
import { ALL_PINS_FILTERS, BOARD_FILTERS, COUNTRY_COLORS, DEAL_COLORS, LIGHT_TILES, applyFilters, type Row } from '../data';
import { compact, full, pct } from '../format';
import { boardSlug, useStore, type PinItem, type PinViz } from '../store';

const TAG: Record<string, string> = { 'Testing AI Sales': 'blue', 'Yash Pins': 'amber', 'Sales Overview': 'green' };
const DIM_KEY: Record<string, string> = { 'Product line': 'product_line', Country: 'country', Year: 'year', 'Deal size': 'deal_size', Quarter: 'quarter' };
const CTYPE: Record<PinViz, string> = { line: 'Line', area: 'Area', column: 'Column', bar: 'Bar', hbars: 'Bar', table: 'Table', treemap: 'Column', donut: 'Column' };

/** The donut groups the long tail of countries into "Others (9)". */
function donutRows(rows: Row[]): Row[] {
  if (rows.length <= 6) return rows;
  const head = rows.filter((r) => !['Sweden', 'Canada', 'Others'].includes(r.label));
  const tail = rows.filter((r) => ['Sweden', 'Canada', 'Others'].includes(r.label)).reduce((a, r) => a + r.value, 0);
  return [...head, { label: 'Others (9)', value: tail }];
}

function PinVisual({ pin, rows, big }: { pin: PinItem; rows: Row[]; big: boolean }) {
  const viz = big ? pin.boardViz ?? pin.viz : pin.viz;
  if (!rows.length) return <div className="empty" style={{ border: 0 }}>No rows match these filters.</div>;
  if (viz === 'column' || viz === 'area' || viz === 'line') {
    return (
      <>
        {big && (
          <div className="chart-legend" style={{ marginBottom: 6 }}>
            <i style={{ background: pin.color ?? '#3B82F6' }} />{pin.yLabel ?? pin.fields[pin.fields.length - 1]}
          </div>
        )}
        <CartesianChart
          rows={rows}
          kind={viz}
          size={big ? 'board' : 'mini'}
          color={pin.color ?? (big ? '#3B82F6' : '#2563EB')}
          labels={big ? undefined : pin.shortLabels}
          yLabel={pin.yLabel}
          xLabel={pin.xLabel}
          ariaLabel={pin.title}
        />
      </>
    );
  }
  if (viz === 'treemap') {
    return (
      <>
        {big && <div className="chart-legend" style={{ marginBottom: 12 }}><i style={{ background: '#137FA3' }} />Total Sales</div>}
        <Treemap rows={rows} colors={COUNTRY_COLORS} light={LIGHT_TILES} height={big ? 300 : 206} aspect={big ? 2 : 1.87} />
      </>
    );
  }
  if (viz === 'donut') {
    const dr = donutRows(rows);
    const total = dr.reduce((a, r) => a + r.value, 0);
    const colors = dr.length > 3 ? dr.map((r) => COUNTRY_COLORS[r.label] ?? '#CBD5E1') : DEAL_COLORS;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: big ? 32 : 24, flexWrap: 'wrap', justifyContent: big ? 'center' : 'flex-start' }}>
        <Donut rows={dr} colors={colors} size={big ? 232 : 168} thickness={big ? 50 : 34} centerTitle={big ? 'Total sales' : 'Total'} />
        <div className="legend" style={{ flex: '1 1 160px', fontSize: big ? 13.5 : 13.5, gap: big ? 5 : 10 }}>
          {dr.map((r, i) => (
            <div key={r.label} className="legend-row">
              <span className="legend-dot" style={{ background: colors[i] }} />
              <span>{r.label}</span>
              <span className="legend-num">{big ? full(r.value) : compact(r.value)}</span>
              <span className="legend-pct">{pct(r.value, total)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (viz === 'hbars' || viz === 'bar') return <HBars rows={rows.slice(0, big ? 10 : 5)} compactLayout={!big} />;
  return <DataTable rows={rows} dim={pin.fields[0]} measure={pin.fields[pin.fields.length - 1]} />;
}

function PinCard({ pin, big, filters, onExpand }: { pin: PinItem; big: boolean; filters: Filters; onExpand: () => void }) {
  const { boards, unpin, copyPin, flash, createBoard } = useStore();
  const [menu, setMenu] = useState(false);
  const [sub, setSub] = useState(false);
  const [narr, setNarr] = useState(false);
  const [newBoard, setNewBoard] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, menu, () => { setMenu(false); setSub(false); });
  const dimKey = DIM_KEY[pin.fields[0]] ?? '';
  const rows = useMemo(() => (pin.dataset === 'sales_data' ? applyFilters(pin.rows, filters, dimKey) : pin.rows), [pin, filters, dimKey]);

  return (
    <article className={'pin-card' + (big ? ' big' : '')} aria-label={pin.title}>
      <div className="pin-head" ref={ref}>
        <h3 className="pin-title">{pin.title}</h3>
        <button type="button" className="narr-pill" aria-pressed={narr} onClick={() => setNarr(!narr)}>Narrative</button>
        <button type="button" className="icon-btn" aria-label="Expand chart" title="Expand chart" onClick={onExpand}><Expand /></button>
        <button type="button" className="icon-btn" aria-label="Chart actions" aria-haspopup="menu" aria-expanded={menu} onClick={() => { setMenu(!menu); setSub(false); }}><Kebab /></button>
        {menu && (
          <div className="pop menu" role="menu" aria-label="Chart actions" style={{ top: 60, right: 22, width: 216 }}>
            <button type="button" role="menuitem" className="menu-item" onClick={() => { unpin(pin.id); flash('Chart unpinned from dashboard.'); }}>
              <Trash size={18} style={{ marginTop: 2, color: 'var(--slate-700)' }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="mi-title">Discard</span><span className="mi-sub">Unpin Response</span></span>
            </button>
            <div className="menu-sep" />
            <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={sub} className={'menu-item' + (sub ? ' hl' : '')} onClick={() => setSub(!sub)}>
              <Plus size={18} style={{ marginTop: 2, color: 'var(--slate-700)' }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}><span className="mi-title">Copy to board</span><span className="mi-sub">{pin.board}</span></span>
              <ChevronRight size={16} style={{ alignSelf: 'center', color: 'var(--slate-500)' }} />
            </button>
            {sub && (
              <div className="pop menu" role="menu" aria-label="Copy to board" style={{ top: 58, left: 'calc(100% + 4px)', width: 200 }}>
                {boards.filter((b) => b !== pin.board).map((b) => (
                  <button key={b} type="button" role="menuitem" className="menu-item" style={{ minHeight: 40, alignItems: 'center', fontSize: 15 }}
                    onClick={() => { copyPin(pin.id, b); setMenu(false); setSub(false); flash('Chart copied to ' + b + '.'); }}>
                    {b}
                  </button>
                ))}
                <div className="menu-sep" />
                <button type="button" role="menuitem" className="menu-item" style={{ minHeight: 40, alignItems: 'center', fontSize: 15, fontWeight: 600, color: 'var(--blue-600)' }}
                  onClick={() => { setMenu(false); setSub(false); setNewBoard(true); }}>
                  Add to a new board
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="pin-chart">
        <PinVisual pin={pin} rows={rows} big={big} />
      </div>
      {narr && (
        <p className="pin-narr">{pin.narrative || `${pin.title}: ${rows.length} rows from ${pin.dataset}. The largest value is ${compact(Math.max(...rows.map((r) => r.value)))}.`}</p>
      )}
      <div className="pin-foot">
        <span className="k">DATA</span>
        <span className="ds">{pin.dataset}</span>
        <span className="bar" aria-hidden="true" />
        <span>{pin.fields.join('  ')}</span>
        {pin.filterTag && <span className="filter-tag">{pin.filterTag}</span>}
        {!big && <span className={'board-tag ' + (TAG[pin.board] ?? 'slate')}>{pin.board}</span>}
      </div>
      {newBoard && (
        <NewBoardModal
          onClose={() => setNewBoard(false)}
          onCreate={(name) => { const n = createBoard(name); copyPin(pin.id, n); setNewBoard(false); flash('New board created with this chart.'); }}
        />
      )}
    </article>
  );
}

function NewBoardModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <Modal
      title="Create board"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn primary" disabled={!name.trim()} onClick={() => onCreate(name)}>Create board</button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onCreate(name); }}>
        <label className="field">
          Board name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quarterly review" />
        </label>
      </form>
    </Modal>
  );
}

function SelectMenu({ label, value, options, onPick }: { label: string; value: string; options: string[]; onPick: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="select-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label}: {value}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="pop menu" role="listbox" style={{ top: 'calc(100% + 6px)', right: 0, minWidth: '100%', width: 'max-content' }}>
          {['All', ...options].map((o) => (
            <button key={o} type="button" role="option" aria-selected={o === value} className="menu-item" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 24 }}
              onClick={() => { onPick(o); setOpen(false); }}>
              {o}
              {o === value && <CheckMark />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { slug } = useParams();
  const { pins, boards, flash, createBoard } = useStore();
  const nav = useNavigate();
  const common = useCommonMenu();
  const board = slug ? boards.find((b) => boardSlug(b) === slug) : undefined;
  const isAll = !slug;
  const [allFilters, setAllFilters] = useState<Filters>({});
  const [boardFilters, setBoardFilters] = useState<Record<string, Filters>>({});
  const [srcSel, setSrcSel] = useState('All');
  const [boardSel, setBoardSel] = useState('All');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<PinItem | null>(null);
  const [nonce, setNonce] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);

  const bf = board ? boardFilters[board] ?? {} : {};
  const setBf = (f: Filters) => board && setBoardFilters({ ...boardFilters, [board]: f });

  const visible = useMemo(() => {
    if (board) return pins.filter((p) => p.board === board);
    return pins.filter((p) => {
      if (p.boardOnly) return false;
      if (srcSel !== 'All' && p.dataset !== srcSel) return false;
      if (boardSel !== 'All' && p.board !== boardSel) return false;
      const f = allFilters;
      if (f.dataset && p.dataset !== f.dataset) return false;
      if (f.board && p.board !== f.board) return false;
      if (f.owner && p.owner !== f.owner) return false;
      if (f.ctype && CTYPE[p.viz] !== f.ctype) return false;
      if (f.created) {
        const order = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];
        if (order.indexOf(p.created) > order.indexOf(f.created)) return false;
      }
      return true;
    });
  }, [pins, board, srcSel, boardSel, allFilters]);

  useEffect(() => {
    tabs.current?.querySelector<HTMLElement>('.board-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [slug]);

  if (slug && !board) {
    return (
      <Shell crumb="Dashboard" view="dashboard" menu={common}>
        <div className="dash"><div className="empty"><h3>Board not found</h3><Link to="/dashboard">Back to All Pins</Link></div></div>
      </Shell>
    );
  }

  const scrollTabs = (d: number) => tabs.current?.scrollBy({ left: d * 240, behavior: 'smooth' });

  return (
    <Shell crumb="Dashboard" view="dashboard" menu={common}>
      <div className="boardbar">
        <button type="button" className="icon-btn" aria-label="Scroll boards left" onClick={() => scrollTabs(-1)}><ChevronLeft /></button>
        <div className="board-tabs" ref={tabs} role="tablist" aria-label="Boards">
          <Link to="/dashboard" role="tab" aria-selected={isAll} className={'board-tab' + (isAll ? ' active' : '')}>All Pins</Link>
          {boards.map((b) => (
            <Link key={b} to={'/dashboard/' + boardSlug(b)} role="tab" aria-selected={b === board} className={'board-tab' + (b === board ? ' active' : '')}>{b}</Link>
          ))}
        </div>
        <button type="button" className="icon-btn" aria-label="Scroll boards right" onClick={() => scrollTabs(1)}><ChevronRight /></button>
        <button type="button" className="btn primary lg" style={{ fontSize: 17, padding: '0 16px' }} onClick={() => setCreating(true)}>
          Create Board <Plus size={20} />
        </button>
        {isAll ? (
          <FilterButton
            defs={ALL_PINS_FILTERS}
            value={allFilters}
            size={44}
            title="Filter all pins"
            subtitle="Generic filters that work across every dataset"
            popStyle={{ top: 'calc(100% + 8px)', right: -60 }}
            onApply={(f) => { setAllFilters(f); flash(Object.keys(f).length ? 'Filters applied to All Pins.' : 'Filters cleared.'); }}
          />
        ) : (
          <FilterButton
            defs={BOARD_FILTERS}
            value={bf}
            size={44}
            title="Filter this board"
            subtitle="Applies to every chart on this board"
            popStyle={{ top: 'calc(100% + 8px)', right: -60 }}
            onApply={(f) => { setBf(f); flash(Object.keys(f).length ? 'Filters applied to every chart on this board.' : 'Filters cleared.'); }}
          />
        )}
        <button type="button" className="icon-btn bordered" style={{ width: 44, height: 44, color: 'var(--slate-700)' }} aria-label="Refresh charts" title="Refresh charts"
          onClick={() => { setNonce(nonce + 1); flash('Charts refreshed with the latest data.'); }}>
          <Sync size={20} />
        </button>
        <MoreMenu
          label="Board options"
          items={[
            { label: 'Share board', sub: 'Copy a link to this board', onClick: () => flash('Board link copied.') },
            { label: 'Download as PDF', sub: 'Every chart on one page', onClick: () => flash('Preparing PDF…') },
            { label: 'Ask a new question', sub: 'Go to Ask AI', onClick: () => nav('/') },
          ]}
        />
      </div>

      <div className="dash">
        {isAll && (
          <div className="dash-head">
            <div>
              <h1>All Pins</h1>
              <p>Every chart pinned from Ask AI, across all your boards</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <SelectMenu label="Data source" value={srcSel} options={['sales_data', 'video_game_sales', 'world_health_bank_data']} onPick={setSrcSel} />
              <SelectMenu label="Board" value={boardSel} options={[...boards, 'Uncategorized']} onPick={setBoardSel} />
            </div>
          </div>
        )}
        {isAll && (
          <AppliedFilters defs={ALL_PINS_FILTERS} value={allFilters}
            onRemove={(k) => { const n = { ...allFilters }; delete n[k]; setAllFilters(n); flash('Filter removed.'); }}
            onClear={() => { setAllFilters({}); flash('Filters cleared.'); }} />
        )}
        {board && (
          <AppliedFilters defs={BOARD_FILTERS} value={bf}
            onRemove={(k) => { const n = { ...bf }; delete n[k]; setBf(n); flash('Filter removed.'); }}
            onClear={() => { setBf({}); flash('Filters cleared.'); }} />
        )}

        {visible.length ? (
          <div key={nonce} className={'pin-grid' + (board ? ' two' : '')}>
            {visible.map((p) => (
              <PinCard key={p.id} pin={p} big={!!board} filters={bf} onExpand={() => setExpanded(p)} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>{board ? 'This board is empty' : 'No pinned charts match'}</h3>
            {board ? 'Pin an answer in Ask AI, then use “Copy to board” to add it here.' : 'Try clearing a filter.'}
            <div style={{ marginTop: 14 }}><Link to="/" className="btn primary">Ask a question</Link></div>
          </div>
        )}
      </div>

      {creating && (
        <NewBoardModal
          onClose={() => setCreating(false)}
          onCreate={(name) => { const n = createBoard(name); setCreating(false); flash(`Board “${n}” created.`); nav('/dashboard/' + boardSlug(n)); }}
        />
      )}
      {expanded && (
        <Modal title={expanded.title} onClose={() => setExpanded(null)} wide>
          <div className="pin-card big" style={{ border: 0, padding: 0 }}>
            <PinVisual pin={expanded} rows={expanded.dataset === 'sales_data' ? applyFilters(expanded.rows, bf, DIM_KEY[expanded.fields[0]] ?? '') : expanded.rows} big />
          </div>
        </Modal>
      )}
    </Shell>
  );
}
