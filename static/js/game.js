// static/js/game.js (ATUALIZADO)

// 1. CONFIGURAÇÃO INICIAL
const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const ctx = canvas.getContext('2d');

// Variáveis do jogo
let score = 0;
let timeLeft = 10;
let timerId = null;
let isGameOver = true;

// Nosso novo alvo temático!
const target = {
    x: 0,
    y: 0,
    size: 40, // Tamanho do alvo
    character: '⭐' // Uma estrela de xerife!
};

// 2. FUNÇÕES DO JOGO

/**
 * Desenha o alvo na tela
 */
function drawTarget() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isGameOver) {
        // Para desenhar texto (incluindo emojis), usamos estas propriedades
        ctx.font = `${target.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.character, target.x, target.y);
    }
}

/**
 * Mostra a mensagem de "Fim de Jogo" temática
 */
function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#8b4513'; // Cor marrom escuro
    ctx.textAlign = 'center';
    
    // Usando a mesma fonte do site
    ctx.font = `bold 30px Rye, cursive`;
    ctx.fillText('Duelo encerrado!', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = `bold 24px Rye, cursive`;
    ctx.fillText(`Recompensa: ${score}$`, canvas.width / 2, canvas.height / 2 + 20);
}

/**
 * Move o alvo para uma posição aleatória
 */
function moveTarget() {
    // Ajusta a posição para que o centro do emoji fique dentro do canvas
    target.x = target.size / 2 + Math.random() * (canvas.width - target.size);
    target.y = target.size / 2 + Math.random() * (canvas.height - target.size);
}

/**
 * Função chamada quando o jogador clica/toca no canvas
 */
function handleCanvasClick(event) {
    if (isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calcula a distância do clique ao centro do alvo
    const distance = Math.sqrt(
        Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
    );

    // Se a distância for menor que metade do tamanho do alvo, acertou!
    if (distance < target.size / 2) {
        score++;
        scoreElement.textContent = score;
        moveTarget();
        drawTarget();
    }
}

/**
 * Inicia um novo jogo
 */
function startGame() {
    isGameOver = false;
    score = 0;
    timeLeft = 10;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    startButton.textContent = 'Atire!';

    clearInterval(timerId);
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            isGameOver = true;
            startButton.textContent = 'Jogar Novamente';
            drawGameOver();
        } else {
            timeLeft--;
            timerElement.textContent = timeLeft;
        }
    }, 1000);

    moveTarget();
    drawTarget();
}

// 3. INICIALIZAÇÃO
startButton.addEventListener('click', startGame);
canvas.addEventListener('click', handleCanvasClick);