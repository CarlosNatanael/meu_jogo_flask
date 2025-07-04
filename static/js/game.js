document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    const mainMenu = document.getElementById('main-menu');
    const gameSection = document.getElementById('game-section');
    const gameInfo = document.getElementById('game-info');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Seletores dos Placares
    const leaderboardClassicSection = document.getElementById('leaderboard-classic-section');
    const leaderboardClassicList = document.getElementById('leaderboard-classic-list');
    const leaderboardSurvivalSection = document.getElementById('leaderboard-survival-section');
    const leaderboardSurvivalList = document.getElementById('leaderboard-survival-list');
    
    // Botões
    const startGameButton = document.getElementById('start-game-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    
    // Modal de Fim de Jogo
    const gameOverModal = document.getElementById('game-over-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const initialModalButtons = document.getElementById('initial-modal-buttons');
    const registerForm = document.getElementById('register-form');
    const showRegisterFormButton = document.getElementById('show-register-form-button');
    const playerNameInput = document.getElementById('player-name-input');
    const submitScoreButton = document.getElementById('submit-score-button');
    const playAgainButton = document.getElementById('play-again-button');
    const playAgainFromRegisterButton = document.getElementById('play-again-from-register-button');

    // Modal de Regras
    const rulesButton = document.getElementById('rules-button');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesButton = document.getElementById('close-rules-button');

    // --- ESTADO GLOBAL DO JOGO ---
    let gameState = {};
    let gameLoopId = null;
    let activeEntities = [];

    // --- LÓGICA DE UI (INTERFACE) ---
    function showMenu() {
        mainMenu.style.display = 'block';
        gameSection.style.display = 'none';
        
        // CORREÇÃO: Esconde os dois placares no menu principal
        leaderboardClassicSection.style.display = 'none';
        leaderboardSurvivalSection.style.display = 'none';

        if(gameState) gameState.isGameOver = true;
        cancelAnimationFrame(gameLoopId);
    }

    function updateGameInfo() {
        let infoHTML = `<span>Pontos: <span id="score">${gameState.score}</span></span>`;
        if (gameState.mode === 'classico') {
            infoHTML += `<span style="margin-left:20px;">Tempo: <span id="timer">${gameState.timeLeft}</span>s</span>`;
        } else if (gameState.mode === 'sobrevivencia') {
            infoHTML += `<span style="margin-left:20px;">Vidas: <span id="lives">${'❤️'.repeat(Math.max(0, gameState.lives))}</span></span>`;
        } else if (gameState.mode === 'precisao') {
            infoHTML += `<span style="margin-left:20px;">Balas: <span id="bullets">${gameState.bullets}</span></span>`;
        }
        if (gameState.scoreMultiplier > 1) {
            infoHTML += `<span style="margin-left:20px; color: gold;">Score ${gameState.scoreMultiplier}x!</span>`;
        }
        gameInfo.innerHTML = infoHTML;
    }

    // --- LÓGICA PRINCIPAL DO JOGO ---
    function setupGame(mode) {
        mainMenu.style.display = 'none';
        gameSection.style.display = 'flex';
        startGameButton.style.display = 'block';

        // Mostra o placar correspondente ao modo de jogo
        leaderboardClassicSection.style.display = (mode === 'classico' ? 'block' : 'none');
        leaderboardSurvivalSection.style.display = (mode === 'sobrevivencia' ? 'block' : 'none');

        gameState = {
            mode: mode, score: 0, isGameOver: true, timeLeft: 0, lives: 0, bullets: 0,
            scoreMultiplier: 1, multiplierTimeLeft: 0,
        };
        activeEntities = [];
        
        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (mode === 'classico') gameState.timeLeft = 10;
        else if (mode === 'sobrevivencia') gameState.lives = 3;
        else if (mode === 'precisao') gameState.bullets = 15;
        
        updateGameInfo();
    }

    function runGame() {
        if (!gameState.isGameOver) return;
        gameState.isGameOver = false;
        startGameButton.style.display = 'none';
        lastTime = performance.now();
        
        spawnEntity('target_normal'); 
        
        gameLoop();
    }
    
    let lastTime = 0;
    let secondCounter = 0;
    let randomSpawnCounter = 0;

    function gameLoop(timestamp) {
        if (gameState.isGameOver) return;
        gameLoopId = requestAnimationFrame(gameLoop);
        if (!timestamp) { lastTime = performance.now(); return; }
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        secondCounter += deltaTime;
        if (secondCounter >= 1) {
            secondCounter -= 1;
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

        let spawnInterval = 2.5;
        if (gameState.mode === 'sobrevivencia' && gameState.score > 100) {
            spawnInterval = 1.8; 
        }

        randomSpawnCounter += deltaTime;
        if (randomSpawnCounter >= spawnInterval) {
            randomSpawnCounter = 0;
            const rand = Math.random();
            if (gameState.mode === 'classico') {
                if (rand < 0.4) spawnEntity('powerup_clock');
                else if (rand < 0.7) spawnEntity('powerup_2x');
            } else if (gameState.mode === 'sobrevivencia') {
                if (gameState.score > 100) {
                    if (rand < 0.8) spawnSkullAndBomb();
                    else spawnEntity('powerup_2x');
                } else {
                    if (rand < 0.3) spawnEntity('powerup_bomb');
                    else if (rand < 0.6) spawnEntity('powerup_2x');
                    else spawnEntity('target_skull');
                }
            }
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = activeEntities.length - 1; i >= 0; i--) {
            const entity = activeEntities[i];
            
            entity.life -= deltaTime;
            if (entity.life <= 0) { 
                activeEntities.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = (entity.life < 0.5 && Math.floor(entity.life * 10) % 2 === 0) ? 0.5 : 1.0;

            ctx.font = `${entity.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(entity.character, entity.x, entity.y);
            ctx.globalAlpha = 1.0;
        }

        const targetCount = activeEntities.filter(e => e.type.includes('target') && e.type !== 'target_skull').length;
        if (targetCount === 0 && !gameState.isGameOver) {
            if (gameState.mode === 'precisao' && gameState.bullets > 0) {
                spawnEntity('target_normal');
            } else if (gameState.mode !== 'precisao') {
                spawnEntity('target_normal');
            }
        }
    }

    function endGame(reason) {
        if (gameState.isGameOver) return;
        gameState.isGameOver = true;
        cancelAnimationFrame(gameLoopId);
        
        modalTitle.textContent = "Duelo Encerrado!";
        modalText.innerHTML = `Sua recompensa final foi de <strong>${gameState.score}</strong>$.<br><em>(${reason})</em>`;
        
        initialModalButtons.style.display = 'flex';
        registerForm.style.display = 'none';

        // Permite registrar pontuação para os modos Clássico e Sobrevivência
        showRegisterFormButton.style.display = (gameState.mode === 'classico' || gameState.mode === 'sobrevivencia') ? 'inline-block' : 'none';
        
        gameOverModal.style.display = 'flex';
    }
    
    function spawnEntity(type) {
        if (activeEntities.length > 7) return;
        const entity = { type: type, x: 0, y: 0, size: 40, life: 3.0, character: '❓' };
        const configs = {
            'target_normal': { character: '⭐', life: 1.8 },
            'target_gold': { character: '🌟', size: 35, life: 1.2 },
            'target_skull': { character: '💀', life: 2.5 },
            'powerup_clock': { character: '⏱️', size: 35, life: 4.0 },
            'powerup_2x': { character: '💰', size: 35, life: 4.0 },
            'powerup_bomb': { character: '💣', size: 35, life: 4.0 },
        };
        Object.assign(entity, configs[type]);
        entity.x = entity.size / 2 + Math.random() * (canvas.width - entity.size);
        entity.y = entity.size / 2 + Math.random() * (canvas.height - entity.size);
        activeEntities.push(entity);
    }
    
    function spawnSkullAndBomb() {
        if (activeEntities.length > 6) return;

        const skull = { type: 'target_skull', x: 0, y: 0, size: 40, life: 2.5, character: '💀' };
        skull.x = skull.size / 2 + Math.random() * (canvas.width - skull.size);
        skull.y = skull.size / 2 + Math.random() * (canvas.height - skull.size);
        activeEntities.push(skull);

        const bomb = { type: 'powerup_bomb', x: 0, y: 0, size: 35, life: 4.0, character: '💣' };
        const angle = Math.random() * 2 * Math.PI;
        const distance = 60;
        bomb.x = skull.x + distance * Math.cos(angle);
        bomb.y = skull.y + distance * Math.sin(angle);

        bomb.x = Math.max(bomb.size / 2, Math.min(canvas.width - bomb.size / 2, bomb.x));
        bomb.y = Math.max(bomb.size / 2, Math.min(canvas.height - bomb.size / 2, bomb.y));
        activeEntities.push(bomb);
    }

    function handleCanvasClick(event) {
        if (gameState.isGameOver) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (gameState.mode === 'precisao') {
            if (gameState.bullets <= 0) return;
            gameState.bullets--;
        }

        for (let i = activeEntities.length - 1; i >= 0; i--) {
            const entity = activeEntities[i];
            const distance = Math.sqrt(Math.pow(clickX - entity.x, 2) + Math.pow(clickY - entity.y, 2));

            if (distance < entity.size / 2) {
                if (entity.type === 'powerup_bomb' && gameState.mode === 'sobrevivencia') {
                    activeEntities.splice(i, 1);

                    for (let j = activeEntities.length - 1; j >= 0; j--) {
                        const currentEntity = activeEntities[j];
                        if (currentEntity.type.includes('target')) {
                            if (currentEntity.type === 'target_skull') gameState.lives--;
                            else gameState.score++;
                            activeEntities.splice(j, 1);
                        }
                    }
                    
                    if (gameState.lives <= 0) endGame("A explosão da bomba te pegou!");
                    updateGameInfo();
                    return;
                }
                
                if (entity.type === 'target_skull') {
                    if (gameState.mode === 'sobrevivencia') {
                        gameState.lives--;
                        if (gameState.lives <= 0) endGame("Cuidado onde atira, pistoleiro!");
                    }
                } 
                else if (entity.type.includes('target')) {
                    const points = (entity.type === 'target_gold') ? 5 : 1;
                    gameState.score += points * gameState.scoreMultiplier;
                } 
                else if (entity.type.includes('powerup')) {
                    if (entity.type === 'powerup_clock' && gameState.mode === 'classico') gameState.timeLeft += 3;
                    else if (entity.type === 'powerup_2x') { 
                        gameState.scoreMultiplier = (gameState.scoreMultiplier === 1) ? 2 : gameState.scoreMultiplier * 2;
                        gameState.multiplierTimeLeft += 5;
                    } 
                }
                
                activeEntities.splice(i, 1);
                updateGameInfo();
                if (gameState.mode === 'precisao' && gameState.bullets <= 0) endGame("Você ficou sem balas!");
                return;
            }
        }
        updateGameInfo();
    }
    
    function resizeCanvas() { if (canvas) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; } }
    
    // --- LÓGICA DE PLACAR ATUALIZADA ---
    async function fetchLeaderboards() {
        try {
            const [classicRes, survivalRes] = await Promise.all([
                fetch('/get-leaderboard-classic'),
                fetch('/get-leaderboard-survival')
            ]);
            const classicData = await classicRes.json();
            const survivalData = await survivalRes.json();
            updateLeaderboardUI(classicData, 'classic');
            updateLeaderboardUI(survivalData, 'survival');
        } catch (e) {
            console.error('Erro ao buscar placares:', e);
        }
    }

    function updateLeaderboardUI(data, mode) {
        const list = (mode === 'classic') ? leaderboardClassicList : leaderboardSurvivalList;
        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<li>Nenhum registro ainda!</li>';
            return;
        }
        data.forEach((p, i) => {
            const li = document.createElement('li');
            li.innerHTML = `${i+1}. ${p.name} <span class="score">${p.score}$</span>`;
            list.appendChild(li);
        });
    }

    async function submitScore(name, score, mode) {
        try {
            await fetch('/submit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, score: score, mode: mode }) // Envia o modo
            });
        } catch (e) {
            console.error('Erro ao enviar pontuação:', e);
        }
    }

    // --- INICIALIZAÇÃO E EVENTOS ---
    showMenu();
    fetchLeaderboards(); // Busca os dois placares ao iniciar
    resizeCanvas();
    
    document.querySelectorAll('.mode-button[data-mode]').forEach(b => {
        b.addEventListener('click', () => setupGame(b.dataset.mode));
    });

    startGameButton.addEventListener('click', runGame);
    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', resizeCanvas);
    backToMenuButton.addEventListener('click', showMenu);
    
    rulesButton.addEventListener('click', () => { rulesModal.style.display = 'flex'; });
    closeRulesButton.addEventListener('click', () => { rulesModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target == rulesModal) rulesModal.style.display = 'none'; });
    
    playAgainButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        setupGame(gameState.mode);
    });
    
    playAgainFromRegisterButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        setupGame(gameState.mode);
    });
    showRegisterFormButton.addEventListener('click', () => {
        initialModalButtons.style.display = 'none';
        registerForm.style.display = 'block';
    });
    submitScoreButton.addEventListener('click', async () => {
        const name = playerNameInput.value || 'Anônimo';
        await submitScore(name, gameState.score, gameState.mode); // Envia o modo
        await fetchLeaderboards(); // Atualiza os dois placares
        playerNameInput.value = '';
        gameOverModal.style.display = 'none';
        showMenu();
    });
});