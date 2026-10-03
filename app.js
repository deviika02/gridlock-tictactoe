const HUMAN = 'X';
const AI = 'O';
const EMPTY = '';
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill(EMPTY);
let gameOver = false;
let aiThinking = false;
let round = 1;
let scores = { human: 0, ai: 0, draws: 0 };
let winningLine = [];
let aiTimer = null;

const cells = [...document.querySelectorAll('.cell')];
const statusText = document.querySelector('#status-text');
const statusDot = document.querySelector('#status-dot');
const humanScore = document.querySelector('#human-score');
const aiScore = document.querySelector('#ai-score');
const roundLabel = document.querySelector('#round-label');

function getWinner(state) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { player: state[a], line };
    }
  }
  if (state.every(Boolean)) return { player: 'draw', line: [] };
  return null;
}

function emptyIndexes(state) {
  return state.reduce((open, value, index) => value ? open : [...open, index], []);
}

// Minimax recursively scores every possible continuation from this position.
// Positive scores favor the AI; negative scores favor the human.
function minimax(state, isMaximizing, depth = 0) {
  const result = getWinner(state);
  if (result?.player === AI) return 10 - depth;
  if (result?.player === HUMAN) return depth - 10;
  if (result?.player === 'draw') return 0;

  const scores = emptyIndexes(state).map((index) => {
    state[index] = isMaximizing ? AI : HUMAN;
    const score = minimax(state, !isMaximizing, depth + 1);
    state[index] = EMPTY;
    return score;
  });

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

function getBestMove(state) {
  let bestScore = -Infinity;
  let move;
  for (const index of emptyIndexes(state)) {
    state[index] = AI;
    const score = minimax(state, false, 0);
    state[index] = EMPTY;
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  }
  return move;
}

function setStatus(message, mode = 'human') {
  statusText.textContent = message;
  statusDot.className = `status-dot ${mode === 'ai' ? 'ai-thinking' : mode === 'done' ? 'done' : ''}`;
}

function render() {
  cells.forEach((cell, index) => {
    const value = board[index];
    cell.textContent = value === HUMAN ? '×' : value === AI ? '○' : '';
    cell.className = `cell ${value === HUMAN ? 'x' : value === AI ? 'o' : ''} ${winningLine.includes(index) ? 'win' : ''}`;
    cell.disabled = Boolean(value) || gameOver || aiThinking;
    cell.setAttribute('aria-label', `${['Top', 'Middle', 'Bottom'][Math.floor(index / 3)]} ${['left', 'center', 'right'][index % 3]}, ${value ? value : 'empty'}`);
  });
  humanScore.textContent = String(scores.human).padStart(2, '0');
  aiScore.textContent = String(scores.ai).padStart(2, '0');
  roundLabel.textContent = `ROUND ${String(round).padStart(2, '0')}`;
}

function finishGame(result) {
  gameOver = true;
  winningLine = result.line;
  if (result.player === HUMAN) {
    scores.human += 1;
    setStatus('You found the line. Nice work.', 'done');
  } else if (result.player === AI) {
    scores.ai += 1;
    setStatus('The machine found a path.', 'done');
  } else {
    scores.draws += 1;
    setStatus('A perfect deadlock. Draw game.', 'done');
  }
  render();
}

function checkForEnd() {
  const result = getWinner(board);
  if (result) finishGame(result);
  return Boolean(result);
}

function playHuman(index) {
  if (gameOver || aiThinking || board[index]) return;
  board[index] = HUMAN;
  render();
  if (checkForEnd()) return;

  aiThinking = true;
  setStatus('AI is calculating…', 'ai');
  render();
  aiTimer = window.setTimeout(() => {
    aiTimer = null;
    const move = getBestMove(board);
    if (move !== undefined) board[move] = AI;
    aiThinking = false;
    render();
    if (!checkForEnd()) setStatus('Your turn — place an ×');
  }, 360);
}

function newRound() {
  if (aiTimer !== null) {
    window.clearTimeout(aiTimer);
    aiTimer = null;
  }
  board = Array(9).fill(EMPTY);
  gameOver = false;
  aiThinking = false;
  winningLine = [];
  round += 1;
  setStatus('Your turn — place an ×');
  render();
}

cells.forEach((cell) => cell.addEventListener('click', () => playHuman(Number(cell.dataset.index))));
document.querySelector('#new-game').addEventListener('click', newRound);
render();
