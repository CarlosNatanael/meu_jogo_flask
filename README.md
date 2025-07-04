# Duelo no Velho Oeste

Bem-vindo ao "Duelo no Velho Oeste", um jogo de arcade e reação para navegador onde sua velocidade e estratégia são postas à prova! Desafie seus reflexos em diferentes modos de jogo, suba nos placares online e torne-se o pistoleiro mais rápido do oeste.

![imagem do jogo](https://github.com/user-attachments/assets/3446e46a-32ae-44dd-9f96-87ff95beaa37)


---

## 🚀 Como Jogar

Para rodar o jogo em sua máquina local, siga estes passos:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/CarlosNatanael/meu_jogo_flask.git
    cd meu_jogo_flask
    ```

2.  **Instale as dependências:**
    O jogo utiliza Flask para o backend. Certifique-se de ter o Python instalado e execute:
    ```bash
    pip install Flask
    ```

3.  **Execute o servidor:**
    ```bash
    python app.py
    ```

4.  **Abra no navegador:**
    Acesse `http://127.0.0.1:5000` no seu navegador preferido e comece a jogar!

---

## 🛠️ Tecnologia Utilizada

* **Backend:** **Python** com o micro-framework **Flask**, responsável por servir a aplicação e gerenciar a API do placar.
* **Banco de Dados:** **SQLite** para armazenar de forma persistente os placares dos jogadores.
* **Frontend:** **HTML**, **CSS** e **JavaScript** puro, garantindo uma experiência de jogo rápida, responsiva e sem a necessidade de frameworks complexos.

---

## 🤠 Modos de Jogo

O jogo oferece três modos distintos, cada um com um desafio único:

### Modo Clássico
* **Objetivo:** Marcar a maior pontuação possível em **10 segundos**.
* **Recursos:** Conta com power-ups de tempo (⏱️) e multiplicadores de pontos (💰).
* **Competitivo:** Apenas neste modo sua pontuação é salva no placar "Top Pistoleiros".

### Modo Sobrevivência
* **Objetivo:** Sobreviver o máximo possível e alcançar a maior pontuação.
* **Recursos:** Você começa com **3 vidas** (❤️❤️❤️). O jogo termina quando suas vidas acabam.
* **Desafio Extra:** Após atingir **100 pontos**, a dificuldade aumenta! Caveiras (💀) e Bombas (💣) aparecem com mais frequência e quase sempre juntas.

### Modo Precisão
* **Objetivo:** Maximizar a pontuação com um número limitado de cliques.
* **Recursos:** Você tem apenas **15 "balas"**. Cada clique conta! Pense bem antes de atirar.

---

## 🎯 Itens e Power-Ups

* ⭐ **Estrela Normal:** O alvo padrão, vale **1 ponto**.
* 🌟 **Estrela Dourada:** Um alvo raro e rápido que vale **5 pontos**.
* 💀 **Caveira:** Um perigo! No Modo Sobrevivência, clicar nela custa **uma vida**.
* 💣 **Bomba:** Exclusiva do Modo Sobrevivência. Ao ser clicada, destrói todos os alvos na tela. **CUIDADO:** se houver uma caveira, a explosão também a ativará e você perderá uma vida!
* ⏱️ **Relógio:** Power-up do Modo Clássico que adiciona **3 segundos** ao tempo.
* 💰 **Multiplicador de Pontos:** Dobra o valor dos pontos ganhos temporariamente. É cumulativo (2x, 4x, 8x...).

---

## ✨ Recursos Principais

* **Placares Separados:** O jogo conta com dois placares online: "Top Pistoleiros" para o Modo Clássico e "Top Sobreviventes" para o Modo Sobrevivência.
* **Design Responsivo:** A interface se adapta para uma ótima experiência tanto em telas grandes de computador quanto em celulares.
* **Menu de Regras:** Uma seção dedicada no menu principal explica todas as mecânicas, itens e modos de jogo.
* **Fluxo Completo:** Menu principal, tela de jogo adaptável e um modal de fim de partida bem estruturado com opções para jogar novamente ou registrar a pontuação.

---
