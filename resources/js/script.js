/**
 * Blackjack Premium Edition
 * Features: Classic, VIP (High Roller), Speed Game Modes.
 * Mechanics: Double Down, Split.
 */

// --- DOM ELEMENTS ---
const screens = {
    auth: document.getElementById('auth-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

const toastContainer = document.getElementById('toast-container');
const particlesBg = document.getElementById('particles-bg');
const lobbyBankroll = document.getElementById('lobby-bankroll-display');
const gameBankroll = document.getElementById('game-bankroll-display');

const bettingArea = document.getElementById('betting-area');
const actionControls = document.getElementById('action-controls');
const postGameControls = document.getElementById('post-game-controls');

const dealerCardsDiv = document.getElementById('dealer-cards');
const dealerScoreSpan = document.getElementById('dealer-score');
const playerHandsWrapper = document.getElementById('player-hands-wrapper');

const betInput = document.getElementById('bet-input');

// Auth elements
const authUser = document.getElementById('auth-username');
const authPass = document.getElementById('auth-password');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

// Buttons
const btnPlaceBet = document.getElementById('place-bet-button');
const btnHit = document.getElementById('hit-button');
const btnStand = document.getElementById('stand-button');
const btnDouble = document.getElementById('double-button');
const btnSplit = document.getElementById('split-button');
const btnNewRound = document.getElementById('new-round-button');
const btnReturnLobby = document.getElementById('return-lobby-btn');
const btnResetBankroll = document.getElementById('reset-bankroll-btn');
const modeCards = document.querySelectorAll('.mode-card');
const chipBtns = document.querySelectorAll('.chip-btn');

// --- GAME VARIABLES ---
const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let dealerCards = [];
let playerHands = []; // Array de { cards: [], bet: number, isFinished: boolean, isBusted: boolean, score: number, elementId: string }
let activeHandIndex = 0;
let isGameOver = false;
let dealerRevealed = false;

let playerBankroll = 0; // Starts from 0, populated by server

// Configurações do Modo
let currentMode = 'classic';
let animSpeedDisplay = 0.5; // Segundos p/ CSS
let animDelayLogic = 600; // ms para JS timeouts
let minBetAmount = 10;

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// --- INITIALIZATION ---
async function init() {
    bindEvents();
    // Check if user is already logged in (Server Side Session check)
    const resp = await fetch('/api/status');
    const data = await resp.json();
    if(data.user) {
        playerBankroll = data.user.chips;
        loginSuccess();
    }
}

function updateBankrollDisplay() {
    lobbyBankroll.textContent = `$${playerBankroll}`;
    gameBankroll.textContent = `$${playerBankroll}`;
}

async function syncBankrollWithServer() {
    try {
        await fetch('/api/update-chips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ chips: playerBankroll })
        });
    } catch(e) {}
}

function loginSuccess() {
    screens.auth.classList.remove('active');
    screens.lobby.classList.add('active');
    updateBankrollDisplay();
    showToast('Logado com sucesso!', 'success');
}

async function handleAuth(action) {
    const name = authUser.value;
    const password = authPass.value;
    if(!name || !password) return showToast('Preencha os dados', 'warning');

    try {
        const resp = await fetch(`/api/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ name, password })
        });
        const data = await resp.json();
        
        if(!resp.ok) {
            showToast(data.error || 'Erro na autenticação', 'error');
        } else {
            playerBankroll = data.user.chips;
            loginSuccess();
        }
    } catch(e) {
        showToast('Erro de rede', 'error');
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if(type === 'success') icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-times-circle';
    if(type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// --- EVENT BINDING ---
function bindEvents() {
    btnLogin.addEventListener('click', () => handleAuth('login'));
    btnRegister.addEventListener('click', () => handleAuth('register'));

    // Lobby
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            currentMode = card.getAttribute('data-mode');
            enterGameScreen();
        });
    });

    btnResetBankroll.addEventListener('click', async () => {
        playerBankroll = 1000;
        updateBankrollDisplay();
        await syncBankrollWithServer();
        showToast('Saldo resetado para $1000 e salvo.', 'success');
    });

    btnReturnLobby.addEventListener('click', () => {
        if(playerHands.length > 0 && !isGameOver && playerHands[0].cards.length > 0) {
            showToast('Conclua a rodada antes de sair.', 'error');
            return;
        }
        screens.game.classList.remove('active');
        screens.lobby.classList.add('active');
    });

    // Chips & Bet
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.getAttribute('data-val'));
            let current = parseInt(betInput.value) || 0;
            betInput.value = current + val;
        });
    });

    btnPlaceBet.addEventListener('click', startGameRound);

    // Actions
    btnHit.addEventListener('click', () => playerAction('hit'));
    btnStand.addEventListener('click', () => playerAction('stand'));
    btnDouble.addEventListener('click', () => playerAction('double'));
    btnSplit.addEventListener('click', () => playerAction('split'));
    btnNewRound.addEventListener('click', resetTableForBetting);
}

// --- LOBBY & THEMES ---
function enterGameScreen() {
    // Configurar layout com base no modo
    if (currentMode === 'vip') {
        document.body.setAttribute('data-theme', 'vip');
        minBetAmount = 500;
        animSpeedDisplay = 0.5;
        animDelayLogic = 600;
        betInput.value = minBetAmount;
        showToast('Modo VIP: Apostas altas!', 'warning');
    } else if (currentMode === 'speed') {
        document.body.setAttribute('data-theme', 'classic');
        minBetAmount = 10;
        animSpeedDisplay = 0.1; // Muito veloz
        animDelayLogic = 150;
        betInput.value = 10;
        showToast('Modo Speed ativado.', 'info');
    } else { // classic
        document.body.setAttribute('data-theme', 'classic');
        minBetAmount = 10;
        animSpeedDisplay = 0.5;
        animDelayLogic = 600;
        betInput.value = 10;
    }

    document.documentElement.style.setProperty('--anim-speed', `${animSpeedDisplay}s`);

    screens.lobby.classList.remove('active');
    screens.game.classList.add('active');
    resetTableForBetting();
}

// --- ENGINE DO JOGO ---

function createDeck() {
    deck = [];
    for (let c = 0; c < 6; c++) { // 6 baralhos misturados (Standard Casino)
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ rank, suit });
            }
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    if (card.rank === 'A') return 11;
    return parseInt(card.rank);
}

function calcScore(cards) {
    let score = 0;
    let aces = 0;
    cards.forEach(c => {
        score += getCardValue(c);
        if (c.rank === 'A') aces++;
    });
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

// --- FLUXO DA RODADA ---

function resetTableForBetting() {
    isGameOver = true;
    dealerRevealed = false;
    dealerCards = [];
    playerHands = [];
    activeHandIndex = 0;

    dealerCardsDiv.innerHTML = '';
    dealerScoreSpan.textContent = '0';
    playerHandsWrapper.innerHTML = ''; // Limpa mãos do jogador

    actionControls.classList.add('hidden');
    postGameControls.classList.add('hidden');
    bettingArea.classList.remove('hidden');

    if (playerBankroll < minBetAmount) {
        showToast('Saldo insuficiente para aposta mínima. Retorne ao lobby e resete o saldo.', 'error');
    } else {
        if(parseInt(betInput.value) < minBetAmount) betInput.value = minBetAmount;
        if(parseInt(betInput.value) > playerBankroll) betInput.value = playerBankroll;
    }
}

function createPlayerHandDiv(index) {
    const handDiv = document.createElement('div');
    handDiv.className = `hand-section player-section ${index === 0 ? 'active-hand' : ''}`;
    handDiv.id = `player-hand-${index}`;
    handDiv.innerHTML = `
        <div class="score-badge glass-panel">Você <span id="score-${index}" class="hand-score">0</span></div>
        <div id="cards-${index}" class="cards-container"></div>
        <div class="current-bet-display"><i class="fa-solid fa-coins"></i> $<span id="bet-${index}">0</span></div>
    `;
    playerHandsWrapper.appendChild(handDiv);
    return handDiv;
}

function renderHand(cardsArr, containerId, isDealer = false, hideFirst = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    cardsArr.forEach((card, idx) => {
        const cDiv = document.createElement('div');
        cDiv.classList.add('card');
        
        // Define o delay da animação para cartas sequenciais na leitura inicial
        // Mas se for só um append (hit), não precisa delay grande
        cDiv.style.animationDelay = `${idx * (animSpeedDisplay * 0.2)}s`;

        if (isDealer && hideFirst && idx === 0) {
            cDiv.classList.add('hidden-card');
            cDiv.innerHTML = '♠️'; // Textura fake pro CSS
        } else {
            const t = document.createElement('div'); t.className = 'rank-top'; t.innerText = card.rank;
            const c = document.createElement('div'); c.className = 'suit-center'; c.innerText = card.suit;
            const b = document.createElement('div'); b.className = 'rank-bottom'; b.innerText = card.rank;
            cDiv.append(t, c, b);
            if (['♥️', '♦️'].includes(card.suit)) cDiv.classList.add('red-suit');
        }
        
        container.appendChild(cDiv);
    });
}

function updateUI() {
    // Dealer
    dealerScoreSpan.textContent = dealerRevealed ? calcScore(dealerCards) : '??';
    renderHand(dealerCards, 'dealer-cards', true, !dealerRevealed);

    // Player
    playerHands.forEach((hand, idx) => {
        const scoreSpan = document.getElementById(`score-${idx}`);
        const betSpan = document.getElementById(`bet-${idx}`);
        if(scoreSpan) scoreSpan.textContent = calcScore(hand.cards);
        if(betSpan) betSpan.textContent = hand.bet;
        renderHand(hand.cards, `cards-${idx}`);

        // Destaque mão ativa
        const handDiv = document.getElementById(`player-hand-${idx}`);
        if(handDiv) {
            if(idx === activeHandIndex && !isGameOver) {
                handDiv.classList.add('active-hand');
            } else {
                handDiv.classList.remove('active-hand');
            }
        }
    });

    updateBankrollDisplay();
    updateActionButtons();
}

function updateActionButtons() {
    if(isGameOver) {
        actionControls.classList.add('hidden');
        postGameControls.classList.remove('hidden');
        return;
    }
    
    const h = playerHands[activeHandIndex];
    if(!h || h.isFinished) return;

    const cardsLen = h.cards.length;
    btnHit.disabled = false;
    btnStand.disabled = false;
    
    // Double Down permitida se tiver 2 cartas originais daquela mão e saldo
    if(cardsLen === 2 && playerBankroll >= h.bet) {
        btnDouble.disabled = false;
    } else {
        btnDouble.disabled = true;
    }

    // Split permitido se tiver 2 cartas de mesmo rank e ser a mão inicial, e tiver saldo
    if(cardsLen === 2 && getCardValue(h.cards[0]) === getCardValue(h.cards[1]) && playerHands.length === 1 && playerBankroll >= h.bet) {
        btnSplit.disabled = false;
    } else {
        btnSplit.disabled = true;
    }
}

async function startGameRound() {
    let bet = parseInt(betInput.value);
    if(isNaN(bet) || bet < minBetAmount) {
        showToast(`Aposta mínima é $${minBetAmount}.`, 'warning');
        return;
    }
    if(bet > playerBankroll) {
        showToast('Saldo insuficiente.', 'error');
        return;
    }

    playerBankroll -= bet;
    bettingArea.classList.add('hidden');
    actionControls.classList.remove('hidden');
    isGameOver = false;

    // Criar mão inicial
    playerHands.push({ cards: [], bet: bet, isFinished: false, isBusted: false, score: 0 });
    createPlayerHandDiv(0);

    createDeck(); // Para evitar contar cartas (simulando embaralhador continuo)
    
    updateUI();

    // Distribuir as 4 primeiras cartas (2 player, 2 dealer)
    await delay(animDelayLogic * 0.5);
    playerHands[0].cards.push(deck.pop());
    updateUI();
    await delay(animDelayLogic * 0.5);
    dealerCards.push(deck.pop());
    updateUI();
    await delay(animDelayLogic * 0.5);
    playerHands[0].cards.push(deck.pop());
    updateUI();
    await delay(animDelayLogic * 0.5);
    dealerCards.push(deck.pop());
    updateUI();

    checkBlackjackNatural();
}

function checkBlackjackNatural() {
    const pScore = calcScore(playerHands[0].cards);
    if (pScore === 21) {
        playerHands[0].isFinished = true;
        isGameOver = true;
        dealerRevealed = true;
        updateUI();

        const dScore = calcScore(dealerCards);
        if(dScore === 21) {
            showToast('Empate Mútuo! Blackjack natural.', 'warning');
            playerBankroll += playerHands[0].bet; // push
        } else {
            showToast('BLACKJACK NATURAL! 🌟 Ganhou 2.5x', 'success');
            playerBankroll += playerHands[0].bet * 2.5; 
        }
        updateUI();
    }
}

async function playerAction(action) {
    if(isGameOver) return;
    const hand = playerHands[activeHandIndex];

    if(action === 'hit') {
        hand.cards.push(deck.pop());
        updateUI();
        if(calcScore(hand.cards) > 21) {
            hand.isBusted = true;
            hand.isFinished = true;
            document.getElementById(`player-hand-${activeHandIndex}`).classList.add('shake');
            showToast(`Você estourou na mão ${activeHandIndex+1}!`, 'error');
            await moveToNextHand();
        }
    } 
    else if(action === 'stand') {
        hand.isFinished = true;
        await moveToNextHand();
    }
    else if(action === 'double') {
        playerBankroll -= hand.bet;
        hand.bet *= 2;
        hand.cards.push(deck.pop());
        updateUI();
        
        if(calcScore(hand.cards) > 21) {
            hand.isBusted = true;
            document.getElementById(`player-hand-${activeHandIndex}`).classList.add('shake');
            showToast(`Dobrou e estourou!`, 'error');
        } else {
            showToast('Dobrou a aposta!', 'info');
        }
        hand.isFinished = true;
        await delay(animDelayLogic);
        await moveToNextHand();
    }
    else if(action === 'split') {
        // Deduz saldo extra
        playerBankroll -= hand.bet;
        
        // Separa carta 2
        const cardToMove = hand.cards.pop();
        
        // Cria mão 2
        const hand2 = { cards: [cardToMove], bet: hand.bet, isFinished: false, isBusted: false, score: 0 };
        playerHands.push(hand2);
        createPlayerHandDiv(1);
        
        // Dá mais 1 carta para mão 1
        hand.cards.push(deck.pop());
        updateUI();
        showToast('Cartas Divididas!', 'info');
        // Agora o player continua jogando a mão ativa (0) normalmente até acabar, depois vai pra 1.
    }
}

async function moveToNextHand() {
    activeHandIndex++;
    if(activeHandIndex >= playerHands.length) {
        // Todas mãos jogadas, verificar se o dealer precisa jogar
        isGameOver = true;
        
        // Se TODAS as mãos estouraram, não precisa dealer agir
        const allBusted = playerHands.every(h => h.isBusted);
        
        if(allBusted) {
            dealerRevealed = true;
            updateUI();
            concludeRound();
        } else {
            await doDealerTurn();
        }
    } else {
        // Há próxima mão de Split. Dar mais uma carta pra ela pra ter 2 minimas.
        playerHands[activeHandIndex].cards.push(deck.pop());
        updateUI();
    }
}

async function doDealerTurn() {
    dealerRevealed = true;
    updateUI();
    
    // Parar temporariamente os botões p/ ninguém clicar enquanto dealer joga
    btnHit.disabled = true; btnStand.disabled = true; btnDouble.disabled=true; btnSplit.disabled=true;

    await delay(animDelayLogic);

    while(calcScore(dealerCards) < 17) {
        dealerCards.push(deck.pop());
        updateUI();
        await delay(animDelayLogic);
    }
    
    concludeRound();
}

function concludeRound() {
    const dScore = calcScore(dealerCards);
    const dBusted = dScore > 21;
    
    let totalWon = 0;
    
    playerHands.forEach((h, idx) => {
        h.score = calcScore(h.cards);
        let msg = `Mão ${idx+1}: `;
        
        if(h.isBusted) {
            msg += 'Perdeu (Estourou).';
            // Nada
        } else if(dBusted) {
            msg += 'Ganhou! Dealer estourou.';
            totalWon += h.bet * 2;
        } else if(h.score > dScore) {
            msg += 'Ganhou do Dealer!';
            totalWon += h.bet * 2;
        } else if(h.score < dScore) {
            msg += 'Perdeu para o Dealer.';
        } else {
            msg += 'Empate! (Push)';
            totalWon += h.bet;
        }
        // Exibir resultados graduais se houver splits
        setTimeout(() => showToast(msg, (h.score > dScore || dBusted && !h.isBusted) ? 'success' : (h.score===dScore && !h.isBusted ? 'info' : 'error')), idx * 600);
    });

    playerBankroll += totalWon;
    updateUI();
    syncBankrollWithServer();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Iniciar a aplicação
init();
