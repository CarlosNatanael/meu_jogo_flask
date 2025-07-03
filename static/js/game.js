// static/js/game.js (VERSÃO COMPLETA E CORRIGIDA)

// 1. CONFIGURAÇÃO INICIAL
const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const leaderboardList = document.getElementById('leaderboard-list');
const ctx = canvas.getContext('2d');

// Elementos do modal
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreModal = document.getElementById('final-score-modal');
const registerForm = document.getElementById('register-form');
const showRegisterFormButton = document.getElementById('show-register-form-button');
const playerNameInput = document.getElementById('player-name-input');
const submitScoreButton = document.getElementById('submit-score-button');
const playAgainButton = document.getElementById('play-again-button');

let score = 0;
let timeLeft = 10;
let timerId = null;
let isGameOver = true;

const target = { x: 0, y: 0, size: 40, character: '⭐' };

// 2. FUNÇÕES DE COMUNICAÇÃO COM O SERVIDOR
async function fetchLeaderboard() {
    try {
        const response = await fetch('/get-leaderboard');
        const leaderboardData = await response.json();
        updateLeaderboardUI(leaderboardData);
    } catch (error) {
        console.error('Erro ao buscar o placar:', error);
    }
}

function updateLeaderboardUI(leaderboard) {
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>Nenhum pistoleiro no placar ainda!</li>';
        return;
    }
    leaderboard.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${index + 1}. ${player.name} <span class="score">${player.score}$</span>`;
        leaderboardList.appendChild(li);
    });
}

async function submitScore(playerName, finalScore) {
    try {
        await fetch('/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, score: finalScore })
        });
    } catch (error) {
        console.error('Erro ao enviar a pontuação:', error);
    }
}

// 3. FUNÇÕES DO JOGO
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (isGameOver) {
        // Se o jogo acabou, não redesenha nada para não apagar a mensagem do modal
    } else {
        drawTarget();
    }
}

function drawTarget() {
    // A resolução é ajustada aqui para garantir que o desenho seja nítido
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    if (!isGameOver) {
        ctx.font = `${target.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.character, target.x, target.y);
    }
}

function moveTarget() {
    target.x = target.size / 2 + Math.random() * (canvas.width - target.size);
    target.y = target.size / 2 + Math.random() * (canvas.height - target.size);
}

function handleCanvasClick(event) {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const distance = Math.sqrt(Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2));
    if (distance < target.size / 2) {
        score++;
        scoreElement.textContent = score;
        moveTarget();
        drawTarget();
    }
}

function endGame() {
    clearInterval(timerId);
    isGameOver = true;
    startButton.disabled = false;
    finalScoreModal.textContent = score;
    registerForm.style.display = 'none';
    gameOverModal.style.display = 'flex';
}

function startGame() {
    isGameOver = false;
    score = 0;
    timeLeft = 10;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    startButton.disabled = true;

    clearInterval(timerId);
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            endGame();
        } else {
            timeLeft--;
            timerElement.textContent = timeLeft;
        }
    }, 1000);

    moveTarget();
    drawTarget();
}

// 4. INICIALIZAÇÃO E EVENTOS
startButton.addEventListener('click', startGame);
canvas.addEventListener('click', handleCanvasClick);

playAgainButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    startGame();
});

showRegisterFormButton.addEventListener('click', () => {
    registerForm.style.display = 'block';
});

submitScoreButton.addEventListener('click', async () => {
    const playerName = playerNameInput.value || 'Anônimo';
    await submitScore(playerName, score);
    await fetchLeaderboard();
    playerNameInput.value = '';
    gameOverModal.style.display = 'none';
});

window.addEventListener('resize', resizeCanvas);

fetchLeaderboard();
resizeCanvas();