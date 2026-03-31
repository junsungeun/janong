import { useState, useMemo } from 'react';
import quizData from '../../data/quiz.json';

const ALL_QUESTIONS = quizData.flatMap((exam) =>
  exam.qs.map((q) => ({ ...q, examId: exam.id, examLabel: `${exam.year} ${exam.label}` }))
);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 시작 화면 ──────────────────────────────────────────
function StartScreen({ onStart }) {
  const [mode, setMode] = useState('random');
  const [selectedExam, setSelectedExam] = useState(quizData[0].id);
  const [count, setCount] = useState(20);

  const handleStart = () => {
    let questions;
    if (mode === 'random') {
      questions = shuffle(ALL_QUESTIONS).slice(0, count);
    } else {
      const exam = quizData.find((e) => e.id === selectedExam);
      questions = exam ? exam.qs.map((q) => ({ ...q, examId: exam.id, examLabel: `${exam.year} ${exam.label}` })) : [];
    }
    onStart(questions);
  };

  return (
    <div className="quiz-start">
      <div className="quiz-start-icon">🌿</div>
      <h2 className="quiz-start-title">유기농업기능사</h2>
      <p className="quiz-start-sub">기출문제 풀기</p>

      <div className="quiz-mode-tabs">
        <button className={`quiz-mode-tab ${mode === 'random' ? 'active' : ''}`} onClick={() => setMode('random')}>랜덤</button>
        <button className={`quiz-mode-tab ${mode === 'exam' ? 'active' : ''}`} onClick={() => setMode('exam')}>회차별</button>
      </div>

      {mode === 'random' ? (
        <div className="quiz-count-wrap">
          <p className="quiz-count-label">문제 수</p>
          <div className="quiz-count-chips">
            {[10, 20, 30, 60].map((n) => (
              <button
                key={n}
                className={`quiz-count-chip ${count === n ? 'active' : ''}`}
                onClick={() => setCount(n)}
              >
                {n}문제
              </button>
            ))}
          </div>
          <p className="quiz-count-total">전체 {ALL_QUESTIONS.length}문제</p>
        </div>
      ) : (
        <div className="quiz-exam-select-wrap">
          <select
            className="quiz-exam-select"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            {quizData.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.year}년 {exam.label} ({exam.qs.length}문제)
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="quiz-start-btn" onClick={handleStart}>시작하기</button>
    </div>
  );
}

// ── 문제 풀기 화면 ──────────────────────────────────────
function QuizScreen({ questions, onDone }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);

  const q = questions[idx];
  const answered = selected !== null;
  const isCorrect = answered && selected === q.a;

  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i);
  };

  const handleNext = () => {
    const newResults = [...results, { question: q, selected, correct: selected === q.a }];
    if (idx + 1 >= questions.length) {
      onDone(newResults);
    } else {
      setResults(newResults);
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const progress = ((idx) / questions.length) * 100;

  return (
    <div className="quiz-screen">
      {/* 진행률 */}
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-progress-text">
        <span>{idx + 1} / {questions.length}</span>
        <span className="quiz-exam-label">{q.examLabel}</span>
      </div>

      {/* 문제 */}
      <div className="quiz-question-card">
        <p className="quiz-question-num">문제 {q.n}</p>
        <p className="quiz-question-text">{q.q}</p>
      </div>

      {/* 보기 */}
      <div className="quiz-choices">
        {q.c.map((choice, i) => {
          let cls = 'quiz-choice';
          if (answered) {
            if (i === q.a) cls += ' correct';
            else if (i === selected) cls += ' wrong';
            else cls += ' dimmed';
          } else if (selected === i) {
            cls += ' selected';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)}>
              <span className="quiz-choice-num">{i + 1}</span>
              <span className="quiz-choice-text">{choice}</span>
            </button>
          );
        })}
      </div>

      {/* 피드백 */}
      {answered && (
        <div className={`quiz-feedback ${isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
          {isCorrect ? '✅ 정답!' : `❌ 오답 · 정답은 ${q.a + 1}번`}
        </div>
      )}

      {answered && (
        <button className="quiz-next-btn" onClick={handleNext}>
          {idx + 1 >= questions.length ? '결과 보기' : '다음 문제 →'}
        </button>
      )}
    </div>
  );
}

// ── 결과 화면 ──────────────────────────────────────────
function ResultScreen({ results, onRetry, onWrong, onHome }) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="quiz-result">
      <div className="quiz-result-score-wrap">
        <div className="quiz-result-circle">
          <span className="quiz-result-pct">{pct}점</span>
          <span className="quiz-result-sub">{correct}/{total} 정답</span>
        </div>
      </div>

      <p className="quiz-result-msg">
        {pct >= 60 ? '🎉 합격선 통과!' : '📚 조금 더 공부해요!'}
      </p>

      <div className="quiz-result-btns">
        {total - correct > 0 && (
          <button className="quiz-result-btn quiz-result-btn--primary" onClick={onWrong}>
            오답 {total - correct}문제 다시 풀기
          </button>
        )}
        <button className="quiz-result-btn quiz-result-btn--secondary" onClick={onRetry}>
          같은 세트 다시 풀기
        </button>
        <button className="quiz-result-btn quiz-result-btn--ghost" onClick={onHome}>
          처음으로
        </button>
      </div>

      {/* 오답 목록 */}
      {total - correct > 0 && (
        <div className="quiz-wrong-list">
          <p className="quiz-wrong-title">오답 목록</p>
          {results
            .filter((r) => !r.correct)
            .map((r, i) => (
              <div key={i} className="quiz-wrong-item">
                <p className="quiz-wrong-q">{r.question.q}</p>
                <p className="quiz-wrong-ans">
                  <span className="quiz-wrong-my">내 답: {r.question.c[r.selected]}</span>
                  <span className="quiz-wrong-correct">정답: {r.question.c[r.question.a]}</span>
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── 메인 탭 ──────────────────────────────────────────
export default function QuizTab() {
  const [phase, setPhase] = useState('start'); // start | quiz | result
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);

  const handleStart = (qs) => {
    setQuestions(qs);
    setPhase('quiz');
  };

  const handleDone = (res) => {
    setResults(res);
    setPhase('result');
  };

  const handleRetry = () => {
    setPhase('quiz');
    setResults([]);
  };

  const handleWrong = () => {
    const wrongQs = results.filter((r) => !r.correct).map((r) => r.question);
    setQuestions(shuffle(wrongQs));
    setResults([]);
    setPhase('quiz');
  };

  const handleHome = () => {
    setPhase('start');
    setQuestions([]);
    setResults([]);
  };

  if (phase === 'start') return <StartScreen onStart={handleStart} />;
  if (phase === 'quiz') return <QuizScreen questions={questions} onDone={handleDone} />;
  if (phase === 'result') return (
    <ResultScreen
      results={results}
      onRetry={handleRetry}
      onWrong={handleWrong}
      onHome={handleHome}
    />
  );
  return null;
}
