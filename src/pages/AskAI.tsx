import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnswerCard } from '../components/AnswerCard';
import { Composer } from '../components/Composer';
import { SemanticDrawer } from '../components/SemanticDrawer';
import { Shell, useCommonMenu } from '../components/Shell';
import { ANSWERS, answerFor, type DatasetName } from '../data';
import { useStore } from '../store';

export function AskAI() {
  const { dataset, setDataset, turns, setTurns, flash, questionStyle, setQuestionStyle, answerActions, setAnswerActions } = useStore();
  const [q, setQ] = useState('');
  const [model, setModel] = useState(false);
  const nav = useNavigate();
  const chat = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const common = useCommonMenu();
  const prevCount = useRef(turns.length);

  // Opening /ask directly starts with the first sample question.
  useEffect(() => {
    if (!turns.length) {
      const first = ANSWERS.find((a) => a.dataset === dataset) ?? ANSWERS[0];
      setDataset(first.dataset);
      setTurns([{ key: 'first', answerId: first.id, question: first.question, followUp: false, at: Date.now() }]);
    }
  }, []);

  // Scroll a newly asked question into view.
  useEffect(() => {
    if (turns.length > prevCount.current) {
      const el = chat.current?.querySelector<HTMLElement>(`[data-turn="${turns[turns.length - 1].key}"]`);
      if (el && chat.current) chat.current.scrollTo({ top: el.offsetTop - chat.current.offsetTop - 12, behavior: 'smooth' });
    }
    prevCount.current = turns.length;
  }, [turns]);

  const ask = (question: string, ds: DatasetName = dataset ?? 'sales_data') => {
    if (ds !== dataset) setDataset(ds);
    const a = answerFor(question, ds);
    setTurns((t) => [...t, { key: Date.now().toString(36), answerId: a.id, question, followUp: t.length > 0, at: Date.now() }]);
    setQ('');
  };

  const menu = [
    { label: 'New conversation', sub: 'Clear this chat and start again', onClick: () => { setTurns([]); nav('/'); } },
    {
      label: questionStyle === 'avatar' ? 'Question style: icon chip' : 'Question style: avatar',
      sub: 'Switch between the two question designs',
      onClick: () => setQuestionStyle(questionStyle === 'avatar' ? 'icon' : 'avatar'),
    },
    {
      label: answerActions === 'buttons' ? 'Answer actions: ⋯ menu' : 'Answer actions: buttons',
      sub: 'Refresh and Export as buttons or in one menu',
      onClick: () => setAnswerActions(answerActions === 'buttons' ? 'menu' : 'buttons'),
    },
    ...common,
  ];

  return (
    <Shell crumb="Ask AI" view="ask" menu={menu} fill>
      <div className="ask-top">
        <Composer
          dataset={dataset}
          onDataset={(d) => { setDataset(d); flash(`Now asking about ${d}.`); }}
          value={q}
          onChange={setQ}
          onAsk={ask}
          onModel={() => setModel(!model)}
          modelOpen={model}
          inputRef={input}
        />
      </div>
      <div className="chat" ref={chat} tabIndex={-1} role="region" aria-label="Conversation">
        {turns.map((t, i) => {
          const base = ANSWERS.find((a) => a.id === t.answerId) ?? ANSWERS[0];
          return (
            <div key={t.key} data-turn={t.key}>
              <AnswerCard
                answer={{ ...base, question: t.question }}
                live={Date.now() - t.at < 8000}
                followUp={t.followUp}
                latest={i === turns.length - 1}
                onAsk={ask}
                onOpenModel={() => setModel(true)}
              />
            </div>
          );
        })}
      </div>
      {model && dataset && (
        <SemanticDrawer
          dataset={dataset}
          onClose={() => setModel(false)}
          onPick={(text, label) => {
            setQ((cur) => (cur.trim() ? cur.trim() + ' ' + text : text));
            flash(`Added “${label}” to your question`);
          }}
        />
      )}
    </Shell>
  );
}
