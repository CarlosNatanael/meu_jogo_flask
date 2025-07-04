document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    const mainMenu = document.getElementById('main-menu');
    const gameSection = document.getElementById('game-section');
    const gameInfo = document.getElementById('game-info');
    const canvas = document.getElementById('gameCanvas');
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardList = document.getElementById('leaderboard-list');
    const ctx = canvas.getContext('2d');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalScoreModal = document.getElementById('final-score-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const registerForm = document.getElementById('register-form');
    const showRegisterFormButton = document.getElementById('show-register-form-button');
    const playerNameInput = document.getElementById('player-name-input');
    const submitScoreButton = document.getElementById('submit-score-button');
    const playAgainButton = document.getElementById('play-again-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');

    // --- ESTADO GLOBAL DO JOGO ---
    let gameState = {
        mode: null,
        score: 0,
        isGameOver: true,
        timeLeft: 0,
        lives: 0,
        bullets: 0,
        scoreMultiplier: 1,
        multiplierTimeLeft: 0,
    };

    let gameLoopId = null;
    const sprites = {};
    let activeEntities = []; // Guarda todos os alvos, power-ups e animações

    // --- CARREGAMENTO DE SPRITES ---
    function loadSprites(sources, callback) {
        let loaded = 0;
        const numImages = Object.keys(sources).length;
        for (const name in sources) {
            sprites[name] = new Image();
            sprites[name].onload = () => { if (++loaded >= numImages) callback(); };
            sprites[name].src = sources[name];
        }
    }

    // --- LÓGICA DE UI (INTERFACE DO USUÁRIO) ---
    function showMenu() {
        mainMenu.style.display = 'block';
        gameSection.style.display = 'none';
        leaderboardSection.style.display = 'none';
        gameState.isGameOver = true;
        cancelAnimationFrame(gameLoopId);
    }

    function updateGameInfo() {
        let infoHTML = `<span>Pontos: <span id="score">${gameState.score}</span></span>`;
        if (gameState.mode === 'classico') {
            infoHTML += `<span>Tempo: <span id="timer">${gameState.timeLeft}</span>s</span>`;
        } else if (gameState.mode === 'sobrevivencia') {
            infoHTML += `<span>Vidas: <span id="lives">${'❤️'.repeat(gameState.lives)}</span></span>`;
        } else if (gameState.mode === 'precisao') {
            infoHTML += `<span>Balas: <span id="bullets">${gameState.bullets}</span></span>`;
        }
        if (gameState.scoreMultiplier > 1) {
            infoHTML += `<span>Score: 2x!</span>`;
        }
        gameInfo.innerHTML = infoHTML;
    }

    // --- LÓGICA PRINCIPAL DO JOGO ---
    function startGame(mode) {
        mainMenu.style.display = 'none';
        gameSection.style.display = 'flex';
        gameState.isGameOver = false;
        gameState.mode = mode;
        gameState.score = 0;
        gameState.scoreMultiplier = 1;
        activeEntities = [];

        if (mode === 'classico') {
            gameState.timeLeft = 10;
            leaderboardSection.style.display = 'block';
        } else if (mode === 'sobrevivencia') {
            gameState.lives = 3;
            leaderboardSection.style.display = 'none';
        } else if (mode === 'precisao') {
            gameState.bullets = 15;
            leaderboardSection.style.display = 'none';
        }
        
        updateGameInfo();
        gameLoop(); // Inicia o loop de jogo
    }

    let lastTime = 0;
    let spawnCounter = 0;
    let secondCounter = 0;

    function gameLoop(timestamp) {
        if (gameState.isGameOver) return;

        const deltaTime = (timestamp - lastTime) / 1000; // Tempo em segundos desde o último frame
        lastTime = timestamp;

        // --- ATUALIZAÇÃO DE 1 SEGUNDO ---
        secondCounter += deltaTime;
        if (secondCounter >= 1) {
            secondCounter -= 1;
            
            // Lógica que acontece a cada segundo
            if (gameState.mode === 'classico') {
                gameState.timeLeft--;
                if (gameState.timeLeft <= 0) endGame("O tempo acabou!");
            }
            if (gameState.scoreMultiplier > 1) {
                gameState.multiplierTimeLeft--;
                if (gameState.multiplierTimeLeft <= 0) gameState.scoreMultiplier = 1;
            }
            updateGameInfo();
        }

        // --- LÓGICA DE SPAWN ---
        spawnCounter += deltaTime;
        if (spawnCounter >= 1.2) { // Tenta criar algo a cada 1.2 segundos
            spawnCounter = 0;
            if (gameState.mode === 'classico') {
                if (Math.random() < 0.7) spawnEntity('target_normal');
                if (Math.random() < 0.15) spawnEntity('powerup_clock');
                if (Math.random() < 0.1) spawnEntity('powerup_2x');
            } else if (gameState.mode === 'sobrevivencia') {
                const rand = Math.random();
                if (rand < 0.6) spawnEntity('target_mobile');
                else if (rand < 0.7) spawnEntity('target_gold');
                else if (rand < 0.8) spawnEntity('target_skull');
                else if (rand < 0.85) spawnEntity('powerup_bomb');
                else if (rand < 0.9) spawnEntity('powerup_2x');
            } else if (gameState.mode === 'precisao') {
                spawnEntity('target_normal');
            }
        }
        
        // --- ATUALIZAÇÃO DE ENTIDADES ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = activeEntities.length - 1; i >= 0; i--) {
            const entity = activeEntities[i];
            
            // Atualiza a posição (para alvos móveis)
            if (entity.vx) entity.x += entity.vx * deltaTime;
            if (entity.vy) entity.y += entity.vy * deltaTime;

            // Remove entidades que saem da tela
            if (entity.x < -entity.width || entity.x > canvas.width || entity.y < -entity.height || entity.y > canvas.height) {
                if (gameState.mode === 'sobrevivencia' && entity.type.includes('target')) {
                    gameState.lives--;
                    updateGameInfo();
                    if (gameState.lives <= 0) endGame("Você ficou sem vidas!");
                }
                activeEntities.splice(i, 1);
                continue;
            }

            // Animação de "fade out"
            if (entity.life > 0) {
                entity.life -= deltaTime;
                ctx.globalAlpha = entity.life / entity.initialLife;
            } else if(entity.type.includes('effect')) {
                activeEntities.splice(i, 1); // Remove animação quando acaba
            }
            
            ctx.drawImage(entity.img, entity.x, entity.y, entity.width, entity.height);
            ctx.globalAlpha = 1.0; // Reseta a transparência
        }
        
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function endGame(reason) {
        if (gameState.isGameOver) return;
        gameState.isGameOver = true;
        cancelAnimationFrame(gameLoopId);

        modalTitle.textContent = "Duelo Encerrado!";
        modalText.innerHTML = `Sua recompensa final foi de <strong>${gameState.score}</strong>$.<br><em>(${reason})</em>`;
        finalScoreModal.textContent = gameState.score;
        registerForm.style.display = 'none';
        showRegisterFormButton.style.display = gameState.mode === 'classico' ? 'inline-block' : 'none';
        gameOverModal.style.display = 'flex';
    }
    
    // --- LÓGICA DE ENTIDADES E CLIQUE ---
    function spawnEntity(type) {
        const entity = { type: type, x: 0, y: 0, width: 50, height: 50, life: 10, initialLife: 10 };
        
        // Propriedades por tipo
        if (type === 'target_normal') { entity.img = sprites.target_normal; }
        else if (type === 'target_gold') { entity.img = sprites.target_gold; entity.width = 40; entity.height = 40; entity.life = 2; entity.initialLife = 2; }
        else if (type === 'target_skull') { entity.img = sprites.target_skull; }
        else if (type === 'target_mobile') { 
            entity.img = sprites.target_normal;
            entity.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
            entity.y = Math.random() * canvas.height;
            entity.vx = entity.x < 0 ? 50 + Math.random() * 50 : -50 - Math.random() * 50; // Velocidade em pixels/seg
            entity.vy = Math.random() * 60 - 30;
        }
        else if (type === 'powerup_clock') { entity.img = sprites.powerup_clock; entity.width = 40; entity.height = 40; }
        else if (type === 'powerup_2x') { entity.img = sprites.powerup_2x; entity.width = 40; entity.height = 40; }
        else if (type === 'powerup_bomb') { entity.img = sprites.powerup_bomb; entity.width = 40; entity.height = 40; }
        else if (type === 'effect_hit') { 
            entity.img = sprites.hit_effect; 
            entity.width = 60; entity.height = 60; 
            entity.life = 0.3; entity.initialLife = 0.3; // Animação curta
        }

        if (type !== 'target_mobile' && type !== 'effect_hit') {
            entity.x = Math.random() * (canvas.width - entity.width);
            entity.y = Math.random() * (canvas.height - entity.height);
        }

        activeEntities.push(entity);
    }

    function handleCanvasClick(event) {
        if (gameState.isGameOver) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        let hit = false;
        if(gameState.mode === 'precisao') {
            gameState.bullets--;
            if(gameState.bullets < 0) {
                endGame("Você ficou sem balas!");
                return;
            }
        }
        
        for (let i = activeEntities.length - 1; i >= 0; i--) {
            const entity = activeEntities[i];
            if (entity.type.includes('effect')) continue;

            if (clickX >= entity.x && clickX <= entity.x + entity.width && clickY >= entity.y && clickY <= entity.y + entity.height) {
                hit = true;
                const hitX = entity.x; const hitY = entity.y;
                
                // Lógica de acerto por tipo
                if (entity.type === 'target_normal' || entity.type === 'target_mobile') gameState.score += 1 * gameState.scoreMultiplier;
                else if (entity.type === 'target_gold') gameState.score += 5 * gameState.scoreMultiplier;
                else if (entity.type === 'target_skull') {
                    if(gameState.mode === 'sobrevivencia') gameState.lives--;
                    if(gameState.lives <= 0) endGame("Cuidado onde atira, pistoleiro!");
                }
                else if (entity.type === 'powerup_clock') gameState.timeLeft += 3;
                else if (entity.type === 'powerup_2x') { gameState.scoreMultiplier = 2; gameState.multiplierTimeLeft = 5; }
                else if (entity.type === 'powerup_bomb') {
                    for(let j = activeEntities.length - 1; j >= 0; j--) {
                        if(activeEntities[j].type.includes('target')) {
                            gameState.score += 1 * gameState.scoreMultiplier;
                            activeEntities.splice(j, 1);
                        }
                    }
                }
                
                if(!entity.type.includes('powerup')) {
                    const hitEffect = {type: 'effect_hit', img: sprites.hit_effect, x: hitX, y: hitY, width: 60, height: 60, life: 0.3, initialLife: 0.3};
                    activeEntities.push(hitEffect);
                }
                activeEntities.splice(i, 1);
                break; // Registra apenas um acerto por clique
            }
        }

        if(!hit && gameState.mode === 'sobrevivencia') {
            gameState.lives--;
            if(gameState.lives <= 0) endGame("Mira melhor da próxima vez!");
        }
        
        updateGameInfo();
    }
    
    function resizeCanvas() { if (canvas) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; } }

async function fetchLeaderboard() {
    try {
        const response = await fetch('/get-leaderboard');
        const data = await response.json();
        updateLeaderboardUI(data);
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

    const sources = {
        target_normal: '/static/img/target_normal.png',
        target_gold: '/static/img/target_gold.png',
        target_skull: '/static/img/target_skull.png',
        powerup_clock: '/static/img/powerup_clock.png',
        powerup_2x: '/static/img/powerup_2x.png',
        powerup_bomb: '/static/img/powerup_bomb.png',
        hit_effect: '/static/img/hit_effect.png'
    };
    
    loadSprites(sources, () => {
        showMenu();
        fetchLeaderboard();
        resizeCanvas();

        document.querySelectorAll('.mode-button').forEach(button => {
            button.addEventListener('click', () => startGame(button.dataset.mode));
        });

        canvas.addEventListener('click', handleCanvasClick);
        window.addEventListener('resize', resizeCanvas);
        backToMenuButton.addEventListener('click', showMenu);
        playAgainButton.addEventListener('click', () => {
            gameOverModal.style.display = 'none';
            startGame(gameState.mode);
        });
        showRegisterFormButton.addEventListener('click', () => {
            registerForm.style.display = 'block';
        });
        submitScoreButton.addEventListener('click', async () => {
            const playerName = playerNameInput.value || 'Anônimo';
            await submitScore(playerName, gameState.score);
            await fetchLeaderboard();
            playerNameInput.value = '';
            gameOverModal.style.display = 'none';
            showMenu();
        });
    });
});