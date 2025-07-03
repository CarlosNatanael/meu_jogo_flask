# app.py (ATUALIZADO COM LÓGICA DE UPDATE)

import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# --- ROTAS DA APLICAÇÃO ---

@app.route('/')
def index():
    return render_template('index.html')

# --- ESTA É A ROTA QUE MUDOU ---
@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    new_score = data.get('score')

    if not name or new_score is None:
        return jsonify({'status': 'error', 'message': 'Nome ou pontuação faltando'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. VERIFICA SE O JOGADOR JÁ EXISTE
    cursor.execute("SELECT * FROM leaderboard WHERE name = ?", (name,))
    existing_player = cursor.fetchone()

    # 2. DECIDE SE INSERE UM NOVO JOGADOR OU ATUALIZA O PLACAR
    if existing_player is None:
        # Jogador é novo, insere o placar normalmente
        print(f"\nJogador novo '{name}' encontrado. Inserindo pontuação: {new_score}\n")
        cursor.execute("INSERT INTO leaderboard (name, score) VALUES (?, ?)", (name, new_score))
    else:
        # Jogador já existe, compara a pontuação
        existing_score = existing_player['score']
        print(f"\nJogador '{name}' já existe com pontuação {existing_score}. Nova pontuação: {new_score}")
        
        if new_score > existing_score:
            # Nova pontuação é maior, atualiza o placar
            print(f"Nova pontuação é MAIOR. Atualizando o placar de '{name}'.\n")
            cursor.execute("UPDATE leaderboard SET score = ? WHERE name = ?", (new_score, name))
        else:
            # Nova pontuação não é maior, não faz nada
            print(f"Nova pontuação NÃO é maior. Nenhuma alteração necessária.\n")

    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success', 'message': 'Operação concluída com sucesso!'})


@app.route('/get-leaderboard')
def get_leaderboard():
    # Esta rota continua igual
    conn = get_db_connection()
    cursor = conn.execute('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10')
    leaderboard = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(leaderboard)

# --- INICIALIZAÇÃO DO SERVIDOR ---

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)