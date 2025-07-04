# Resumo do Jogo: Duelo no Velho Oeste

"Duelo no Velho Oeste" é um jogo de arcade e reação totalmente funcional, projetado para rodar em navegadores de desktop e celular. O objetivo principal é testar os reflexos e a estratégia do jogador ao clicar em alvos que aparecem na tela, com regras e desafios que mudam drasticamente dependendo do modo de jogo escolhido.

## Tecnologia e Arquitetura

O jogo foi construído com uma stack de desenvolvimento web completa:

- **Back-end:** Utiliza Python com o micro-framework Flask para gerenciar o servidor e as requisições.
- **Banco de Dados:** Emprega SQLite para armazenar de forma persistente o placar global dos "Top Pistoleiros".
- **Front-end:** A interface e toda a interatividade são construídas com HTML, CSS e JavaScript puro, garantindo uma experiência rápida e responsiva.

## Modos de Jogo

Você projetou três modos de jogo distintos, cada um com um desafio único:

### Modo Clássico

- **Objetivo:** Marcar a maior pontuação possível em 10 segundos.
- **Recursos:** Conta com power-ups como o Relógio (⏱️) para adicionar tempo extra e o Multiplicador (💰) para dobrar os pontos.
- **Competitivo:** Este é o único modo onde a pontuação pode ser salva no placar global online, incentivando a competição.

### Modo Sobrevivência

- **Objetivo:** Sobreviver o máximo possível e alcançar a maior pontuação.
- **Recursos:** O jogador começa com 3 vidas (❤️❤️❤️). O jogo só termina quando as vidas acabam.
- **Desafios:** A tela fica cheia de alvos e perigos. Clicar em uma Caveira (💀) resulta na perda de uma vida, exigindo precisão e cuidado.

### Modo Precisão

- **Objetivo:** Maximizar a pontuação com um número limitado de cliques.
- **Recursos:** O jogador tem apenas 15 "balas".
- **Estratégia:** Cada clique conta. O jogador precisa decidir se vale a pena gastar uma bala em um alvo de baixa pontuação ou esperar por um melhor.

## Alvos e Power-Ups (Entidades do Jogo)

A jogabilidade é enriquecida por uma variedade de itens que aparecem na tela:

- **Estrela Normal (⭐):** O alvo padrão, vale 1 ponto. Aparece um de cada vez para focar a ação.
- **Estrela Dourada (🌟):** Um alvo mais raro e rápido que vale 5 pontos.
- **Caveira (💀):** Um perigo! No Modo Sobrevivência, clicar nela custa uma vida.
- **Relógio (⏱️):** Power-up do Modo Clássico que adiciona 3 segundos ao tempo.
- **Multiplicador de Pontos (💰):** Power-up que dobra o valor dos pontos ganhos. É cumulativo, podendo chegar a 4x, 8x, etc., adicionando uma camada de alta recompensa.
- **Bomba (💣):** Power-up do Modo Sobrevivência que, ao ser clicado, destrói todos os alvos e caveiras na tela, exigindo um clique estratégico.

## Recursos e Experiência do Usuário

- **Placar Global:** O sistema de "Top Pistoleiros" é totalmente funcional, com o servidor salvando e atualizando a melhor pontuação de cada jogador.
- **Design Responsivo:** A interface se adapta para uma boa experiência tanto em telas grandes de computador quanto em celulares.
- **Fluxo de Jogo Completo:** Possui um menu principal claro para seleção de modo, uma tela de jogo que se adapta a cada modo, e um modal de fim de partida bem estruturado, com opções para jogar novamente ou registrar a pontuação.