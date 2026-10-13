import { useCallback, useEffect, useRef, useState } from 'react';
import type { TraceDef } from '../data';
import { Close, Replay, Sparkle, StepDone, StepPending, StepRunning } from './Icons';

export interface TraceState {
  step: number;
  elapsed: number;
  done: boolean;
  total: number;
  status: string;
  replay: () => void;
}

const sec = (ms: number) => (ms / 1000).toFixed(1) + 's';

/** Plays the agent steps on a timer, like a streamed response. */
export function useTrace(steps: TraceDef[], live: boolean): TraceState {
  const total = steps.reduce((a, s) => a + s.ms, 0);
  const [step, setStep] = useState(live ? 0 : steps.length);
  const [elapsed, setElapsed] = useState(live ? 0 : total);
  const timers = useRef<number[]>([]);

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
  };

  const run = useCallback(() => {
    stop();
    setStep(0);
    setElapsed(0);
    const t0 = Date.now();
    let acc = 0;
    steps.forEach((s, i) => {
      acc += s.ms;
      timers.current.push(window.setTimeout(() => setStep(i + 1), acc));
    });
    const iv = window.setInterval(() => {
      const el = Date.now() - t0;
      if (el >= total) {
        window.clearInterval(iv);
        setElapsed(total);
      } else setElapsed(el);
    }, 100);
    timers.current.push(iv);
  }, [steps, total]);

  useEffect(() => {
    if (live) run();
    return stop;
  }, [live, run]);

  const done = step >= steps.length;
  return {
    step, elapsed: done ? total : elapsed, done, total,
    status: done ? `Completed ${steps.length} steps` : `${steps[step].title}…  (step ${step + 1} of ${steps.length})`,
    replay: run,
  };
}

export function AgentTrace({ id, steps, trace, onClose, showReplay }: { id: string; steps: TraceDef[]; trace: TraceState; onClose: () => void; showReplay?: boolean }) {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    // Follow the running step; once finished, return to the first step.
    list.current?.scrollTo({ top: trace.done ? 0 : list.current.scrollHeight, behavior: 'smooth' });
  }, [trace.step, trace.done]);

  let start = 0;
  const progress = Math.round((Math.min(trace.step, steps.length) / steps.length) * 100);
  return (
    <section id={id} className="trace" aria-label="Agent trace">
      <div className="trace-head">
        <h4 className="trace-title">
          {showReplay && <Sparkle size={18} style={{ color: 'var(--blue-600)' }} />}
          Agent trace
          {!trace.done && <span className="live">Live</span>}
        </h4>
        <button type="button" className="icon-btn" aria-label="Close agent trace" onClick={onClose} style={{ width: 32, height: 32 }}>
          <Close size={16} />
        </button>
      </div>
      <div className="trace-status">
        <div className="trace-status-row">
          <span role="status" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {trace.done ? <StepDone size={16} /> : <StepRunning size={16} />}
            {trace.status}
          </span>
          <b>{sec(trace.elapsed)}</b>
        </div>
        <div className="trace-bar" aria-hidden="true">
          <div style={{ width: progress + '%', background: trace.done ? 'var(--green-500)' : 'var(--blue-600)' }} />
        </div>
      </div>
      <ol ref={list} className="trace-list" tabIndex={0} aria-label="Agent steps">
        {steps.map((s, i) => {
          const isDone = i < trace.step;
          const isRun = i === trace.step && !trace.done;
          const isPend = i > trace.step;
          const t = isDone ? sec(s.ms) : isRun ? sec(Math.max(0, trace.elapsed - start)) : '';
          start += s.ms;
          return (
            <li key={s.title} className="step">
              <div className="step-rail">
                {isDone ? <StepDone /> : isRun ? <StepRunning /> : <StepPending />}
                {i < steps.length - 1 && <span className={'step-line' + (isDone ? ' done' : '')} aria-hidden="true" />}
              </div>
              <div className="step-body">
                <div className="step-top">
                  <span className={'step-title' + (isRun ? ' run' : isPend ? ' pend' : '')}>{s.title}</span>
                  <span className="step-time">{t}</span>
                </div>
                {!isPend && <p className="step-detail">{s.detail}</p>}
                {!isPend && s.code && <pre className="step-code">{s.code}</pre>}
              </div>
            </li>
          );
        })}
      </ol>
      {showReplay && trace.done && (
        <div className="trace-foot">
          <button type="button" className="btn" onClick={trace.replay}><Replay size={16} />Replay trace</button>
        </div>
      )}
    </section>
  );
}
