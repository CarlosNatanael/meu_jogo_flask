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
    # Tabela para o placar do Modo Clássico
    conn.execute('''
        CREATE TABLE IF NOT EXISTS leaderboard_classic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # NOVA Tabela para o placar do Modo Sobrevivência
    conn.execute('''
        CREATE TABLE IF NOT EXISTS leaderboard_survival (
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

# Rota para submeter pontuação (agora lida com os dois modos)
@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    new_score = data.get('score')
    mode = data.get('mode') # 'classico' ou 'sobrevivencia'

    if not name or new_score is None or not mode:
        return jsonify({'status': 'error', 'message': 'Dados incompletos'}), 400

    # Define qual tabela usar com base no modo
    table_name = 'leaderboard_classic' if mode == 'classico' else 'leaderboard_survival'

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verifica se o jogador já existe na tabela correta
    cursor.execute(f"SELECT * FROM {table_name} WHERE name = ?", (name,))
    existing_player = cursor.fetchone()

    if existing_player is None:
        # Jogador novo, insere o placar
        cursor.execute(f"INSERT INTO {table_name} (name, score) VALUES (?, ?)", (name, new_score))
    else:
        # Jogador já existe, atualiza se a nova pontuação for maior
        if new_score > existing_player['score']:
            cursor.execute(f"UPDATE {table_name} SET score = ? WHERE name = ?", (new_score, name))

    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success', 'message': 'Operação concluída!'})


# Rota para buscar o placar do Modo Clássico
@app.route('/get-leaderboard-classic')
def get_leaderboard_classic():
    conn = get_db_connection()
    cursor = conn.execute('SELECT name, score FROM leaderboard_classic ORDER BY score DESC LIMIT 10')
    leaderboard = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(leaderboard)

# NOVA Rota para buscar o placar do Modo Sobrevivência
@app.route('/get-leaderboard-survival')
def get_leaderboard_survival():
    conn = get_db_connection()
    cursor = conn.execute('SELECT name, score FROM leaderboard_survival ORDER BY score DESC LIMIT 10')
    leaderboard = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(leaderboard)

# --- INICIALIZAÇÃO DO SERVIDOR ---

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)