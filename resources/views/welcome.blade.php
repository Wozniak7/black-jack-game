<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlackJack Premium</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>

<body>
    <!-- Partículas no Fundo (Background) -->
    <div id="particles-bg"></div>

    <!-- Container de Notificações / Toasts -->
    <div id="toast-container"></div>
    
    <!-- Tela de Auth (Login/Registro) -->
    <div id="auth-screen" class="screen active">
        <div class="lobby-content glass-panel" style="max-width: 400px; padding: 30px;">
            <h1 class="logo glow-text">♠️ Cassino ♥️</h1>
            <p class="subtitle">Identifique-se para entrar.</p>
            
            <div style="display:flex; flex-direction:column; gap:15px">
                <input type="text" id="auth-username" class="bet-input outline" style="width:100%" placeholder="Nome de Úsuario">
                <input type="password" id="auth-password" class="bet-input outline" style="width:100%" placeholder="Senha">
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button id="btn-login" class="btn btn-primary pulse-hover" style="flex:1">Entrar</button>
                    <button id="btn-register" class="btn btn-ghost" style="flex:1">Registrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Tela de Perfil Separada -->
    <div id="profile-screen" class="screen">
        <div class="top-hud">
            <button id="btn-close-profile" class="btn btn-ghost"><i class="fa-solid fa-chevron-left"></i> Voltar ao Cassino</button>
        </div>
        <div class="lobby-content glass-panel" style="max-width: 500px; padding: 40px;">
            <h1 class="logo glow-text"><i class="fa-solid fa-user-circle"></i> Conta</h1>
            <p class="subtitle">Estatísticas da conta e Preferências</p>
            
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: var(--gold); font-size: 1.2rem;">🏆 Fichas Totais: <strong id="profile-chips-display">0</strong></p>
            </div>

            <div style="display:flex; flex-direction:column; gap:15px; text-align:left;">
                <label style="color:var(--text-secondary); font-size:0.9rem;">Editar Nome de Usuário</label>
                <input type="text" id="profile-username" class="bet-input outline" style="width:100%" placeholder="Novo Nome">
                
                <label style="color:var(--text-secondary); font-size:0.9rem;">Editar Senha (Deixe vazio para manter)</label>
                <input type="password" id="profile-password" class="bet-input outline" style="width:100%" placeholder="Nova Senha">
                
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="btn-save-profile" class="btn btn-primary pulse-hover" style="flex:2">Salvar Configurações</button>
                    <button id="btn-logout" class="btn btn-danger" style="flex:1"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sair</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Tela Principal: Lobby -->
    <div id="lobby-screen" class="screen">
        <!-- User Top Bar -->
        <div class="top-hud">
            <div class="balance-badge glass-panel" style="font-size:1rem;">
                👤 <span id="lobby-username-display">Visitante</span>
            </div>
            <button id="btn-open-profile" class="btn btn-ghost"><i class="fa-solid fa-user-gear"></i> Meu Perfil</button>
        </div>

        <div class="lobby-content glass-panel" style="margin-top: 40px;">
            <h1 class="logo glow-text">♠️ BLACKJACK ♥️</h1>
            <p class="subtitle">Bem-vindo ao Cassino. Escolha sua mesa agradável.</p>

            <div class="modes-grid">
                <button class="mode-card mode-classic" data-mode="classic">
                    <i class="fa-solid fa-dice-d20"></i>
                    <h2>Clássico</h2>
                    <p>O jogo padrão com visual renovado e ritmo tranquilo.</p>
                </button>

                <button class="mode-card mode-vip" data-mode="vip">
                    <i class="fa-solid fa-crown"></i>
                    <h2>High Roller</h2>
                    <p>Mesa VIP. Apostas altas, prêmios grandiosos. (Aposta Mín. $500)</p>
                </button>

                <button class="mode-card mode-speed" data-mode="speed">
                    <i class="fa-solid fa-bolt"></i>
                    <h2>Speed Jack</h2>
                    <p>Cartas rasgando a mesa. Animações rápidas para veteranos.</p>
                </button>
                
                <button class="mode-card mode-joker" data-mode="joker">
                    <i class="fa-solid fa-hat-wizard" style="color:#d946ef;"></i>
                    <h2 style="color:#d946ef;">Joker's Poker</h2>
                    <p>Modo Balatro. Construa mãos de poker para bater a meta. Custa $100 Fichas.</p>
                </button>
            </div>
            
            <div class="lobby-bankroll">
                <p>Seu Saldo Total: <span id="lobby-bankroll-display" class="money-text">$1000</span></p>
                <button id="reset-bankroll-btn" class="btn btn-danger btn-sm"><i class="fa-solid fa-rotate-right"></i> Resetar Saldo</button>
            </div>
        </div>
    </div>

    <!-- Tela do Jogo -->
    <div id="game-screen" class="screen">
        <!-- Overlay HUD - Saldo e Retorno -->
        <div class="top-hud">
            <button id="return-lobby-btn" class="btn btn-ghost"><i class="fa-solid fa-chevron-left"></i> Voltar ao Lobby</button>
            <div class="balance-badge glass-panel">
                <i class="fa-solid fa-wallet"></i> <span id="game-bankroll-display" class="money-text">$1000</span>
            </div>
        </div>

        <div class="blackjack-table">
            <!-- Área do Dealer -->
            <div class="hand-section dealer-section">
                <div class="score-badge glass-panel">Dealer <span id="dealer-score">0</span></div>
                <div id="dealer-cards" class="cards-container"></div>
            </div>

            <!-- Área Central / Apostas -->
            <div id="betting-area" class="betting-area glass-panel">
                <h3>Faça sua Aposta</h3>
                <div class="chips-container">
                    <button class="chip-btn" data-val="10">$10</button>
                    <button class="chip-btn" data-val="50">$50</button>
                    <button class="chip-btn" data-val="100">$100</button>
                    <button class="chip-btn" data-val="500">$500</button>
                </div>
                <div class="bet-controls">
                    <input type="number" id="bet-input" class="bet-input outline" value="10" min="10">
                    <button id="place-bet-button" class="btn btn-primary pulse-hover"><i class="fa-solid fa-coins"></i> Apostar</button>
                </div>
            </div>

            <!-- Área do Jogador -->
            <!-- Criado como container unificado pensando na mecânica de Split (duas mãos) -->
            <div id="player-hands-wrapper" class="player-hands-wrapper">
                <div class="hand-section player-section" id="player-hand-1">
                    <div class="score-badge glass-panel">Você <span id="player-score" class="hand-score">0</span></div>
                    <div id="player-cards" class="cards-container"></div>
                    <div id="bet-display" class="current-bet-display hidden"><i class="fa-solid fa-coins"></i> $<span id="current-bet-amount">0</span></div>
                </div>
            </div>

            <!-- Controles do Jogo (Aparecem só depois de apostar) -->
            <div class="action-controls-container hidden" id="action-controls">
                <button id="hit-button" class="btn action-btn bg-hit"><i class="fa-solid fa-hand-pointer"></i> Pedir (Hit)</button>
                <button id="stand-button" class="btn action-btn bg-stand"><i class="fa-solid fa-hand-paper"></i> Parar (Stand)</button>
                <button id="double-button" class="btn action-btn bg-double"><i class="fa-solid fa-angle-double-up"></i> Dobrar (Double)</button>
                <button id="split-button" class="btn action-btn bg-split"><i class="fa-solid fa-arrows-split-up-and-left"></i> Dividir (Split)</button>
            </div>
            
            <div id="post-game-controls" class="post-game-controls hidden">
                <button id="new-round-button" class="btn btn-primary lg-btn">Nova Rodada</button>
            </div>
        </div>
    </div>

    <!-- Tela do Joker's Poker (Balatro Style) -->
    <div id="balatro-screen" class="screen balatro-moving-bg">
        <div class="top-hud">
            <button id="balatro-return-btn" class="btn btn-ghost"><i class="fa-solid fa-chevron-left"></i> Desistir</button>
            <div class="balance-badge glass-panel" style="border-color:#d946ef">
                <i class="fa-solid fa-hat-wizard"></i> <span id="balatro-joker-name">Nenhum Coringa</span>
            </div>
        </div>

        <div class="balatro-layout">
            <!-- HUD Esquerdo: Stats -->
            <div class="balatro-sidebar glass-panel">
                <h3 style="margin-top:0; color:#e9d5ff">Pontuação Alvo</h3>
                <div class="money-text" style="font-size:2rem; color:#f0abfc" id="balatro-target">1000</div>
                <hr style="border-color:rgba(255,255,255,0.1)">
                <h3 style="color:#e9d5ff">Sua Pontuação</h3>
                <div class="money-text" style="font-size:1.5rem; color:#fbbf24" id="balatro-score">0</div>
                
                <div style="margin-top:20px; display:flex; justify-content:space-between; color:#cbd5e1">
                    <span>Mãos (Hands):</span> <strong id="balatro-hands-left" style="color:#38bdf8">4</strong>
                </div>
                <div style="display:flex; justify-content:space-between; color:#cbd5e1">
                    <span>Descartes:</span> <strong id="balatro-discards-left" style="color:#f87171">3</strong>
                </div>

                <div id="balatro-hand-info" style="margin-top:20px; text-align:center; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px">
                    <div id="balatro-hand-name" style="color:#2dd4bf; font-weight:bold; font-size:1.2rem;">High Card</div>
                    <div style="color:#e2e8f0; font-size:1rem; margin-top:5px;">
                        <span id="balatro-chips-base" style="color:#38bdf8">10</span> <i class="fa-solid fa-xmark" style="font-size:0.8rem"></i> <span id="balatro-mult-base" style="color:#f87171">1</span>
                    </div>
                </div>
            </div>

            <!-- Area Principal do Jogo -->
            <div class="balatro-main">
                <!-- Played area fake just for layout alignment, or empty space -->
                <div class="balatro-event-area">
                    <h2 id="balatro-event-text" class="glow-text" style="color:#fcd34d; display:none; animation: pulseGlow 1s infinite">FLUSH! + 35 X 4</h2>
                </div>

                <!-- Deck/Hand Area -->
                <div class="glass-panel" style="width:100%; padding:20px; min-height: 180px; position:relative;" id="balatro-play-area">
                    <h3 style="margin:0 0 10px 0; color:#94a3b8; font-weight:400">Sua Mão (Selecione até 5 cartas)</h3>
                    <div id="balatro-cards" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; perspective: 1000px;">
                        <!-- Cartas geradas via JS -->
                    </div>
                </div>

                <!-- Controles -->
                <div style="display:flex; gap:15px">
                    <button id="balatro-play-btn" class="btn btn-primary lg-btn pulse-hover"><i class="fa-solid fa-play"></i> Jogar Mão</button>
                    <button id="balatro-discard-btn" class="btn btn-danger lg-btn"><i class="fa-solid fa-trash"></i> Descartar</button>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/script.js') }}"></script>
</body>

</html>