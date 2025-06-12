const dealerCardsDiv = document.getElementById('dealer-cards');
const playerCardsDiv = document.getElementById('player-cards');
const dealerScoreSpan = document.getElementById('dealer-score');
const playerScoreSpan = document.getElementById('player-score');
const gameMessageP = document.getElementById('game-message');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const newGameButton = document.getElementById('new-game-button');
const bankrollDisplay = document.getElementById('bankroll-display');
const betInput = document.getElementById('bet-input');
const placeBetButton = document.getElementById('place-bet-button');

// --- Variáveis Globais do Jogo ---
let deck = [];
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0
let isGameOver = false;
let playerBankroll = 0; 
let currentBet = 0;
let hasPlacedBet = false;

// --- Constantes para o Baralho ---
const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// --- Funções de Lógica do Jogo ---

/**
 * Cria um novo baralho padrão de 52 cartas.
 * Cada carta é um objeto { rank: string, suit: string }.
 */
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ rank, suit });
        }
    }
}

/**
 * Embaralha o baralho usando o algoritmo Fisher-Yates
 */
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

/**
 * Obtém o valor numérico de uma carta.
 * J, Q, K valem 10. Ás é 11 por padrão.
 */
function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank)) {
        return 10;
    }
    if (card.rank === 'A') {
        return 11;
    }
    return parseInt(card.rank);
}

/**
 * Calcula a pontuação total de uma mão, ajustando o valor dos Ases.
 * @param {Array} hand 
 * @returns {number}
 */
function calculateHandScore(hand) {
    let score = 0;
    let aceCount = 0;

    for (let card of hand) {
        score += getCardValue(card);
        if (card.rank === 'A') {
            aceCount++;
        }
    }

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

/**
 * Cria e renderiza um elemento de carta no DOM com detalhes de rank/naipe.
 * @param {Object} card 
 * @param {boolean} isHidden 
 * @returns {HTMLElement} 
 */
function createCardElement(card, isHidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    if (isHidden) {
        cardDiv.classList.add('hidden-card');
        cardDiv.innerHTML = '<i class="fas fa-question"></i>'; 
    } else {
        const rankTop = document.createElement('div');
        rankTop.classList.add('rank-top');
        rankTop.textContent = card.rank;

        const suitCenter = document.createElement('div');
        suitCenter.classList.add('suit-center');
        suitCenter.textContent = card.suit;

        const rankBottom = document.createElement('div'); 
        rankBottom.classList.add('rank-bottom');
        rankBottom.textContent = card.rank;

        cardDiv.appendChild(rankTop);
        cardDiv.appendChild(suitCenter);
        cardDiv.appendChild(rankBottom); 

        if (card.suit === '♥️' || card.suit === '♦️') {
            cardDiv.classList.add('red-suit');
        }
    }
    return cardDiv;
}


/**
 * Renderiza as cartas de uma mão no contêiner HTML.
 * @param {Array} hand 
 * @param {HTMLElement} container 
 * @param {boolean} hideFirstCard 
 */
function renderCards(hand, container, hideFirstCard = false) {
    container.innerHTML = ''; 
    hand.forEach((card, index) => {
        const isHidden = hideFirstCard && index === 0; 
        const cardElement = createCardElement(card, isHidden);
        container.appendChild(cardElement);
    });
}

/**
 * Atualiza o placar no HTML.
 */
function updateScores() {
    playerScoreSpan.textContent = playerScore;
    dealerScoreSpan.textContent = (isGameOver || !hasPlacedBet) ? dealerScore : '??';
}

/**
 * Atualiza o display do saldo do jogador e salva no localStorage.
 */
function updateBankrollDisplay() {
    bankrollDisplay.textContent = `$${playerBankroll}`;
    localStorage.setItem('blackjackBankroll', playerBankroll);

    if (playerBankroll <= 0) {
        displayMessage('Você ficou sem dinheiro! Jogo encerrado.', 'error');
        toggleGamePlayButtons(false);
        toggleBettingControls(false);
        newGameButton.classList.remove('hidden');
        newGameButton.textContent = 'Recomeçar Jogo (Resetar Saldo)';
    } else if (playerBankroll < parseInt(betInput.value) && playerBankroll > 0) {
        betInput.value = playerBankroll; 
        betInput.min = 1;
        betInput.max = playerBankroll;
    } else {
        betInput.min = 1; 
        betInput.max = playerBankroll; 
        if (parseInt(betInput.value) > playerBankroll) {
            betInput.value = playerBankroll;
        }
    }
}

/**
 * Exibe uma mensagem no jogo.
 * @param {string} message 
 * @param {string} type 
 */
function displayMessage(message, type = 'info') {
    gameMessageP.textContent = message;
    gameMessageP.className = 'game-message'; 
    gameMessageP.classList.add(`message-${type}`);
}

/**
 * Habilita/Desabilita os botões de Pedir Carta e Parar.
 * @param {boolean} enabled 
 */
function toggleGamePlayButtons(enabled) {
    hitButton.disabled = !enabled;
    standButton.disabled = !enabled;
}

/**
 * Habilita/Desabilita os controles de aposta.
 * @param {boolean} enabled 
 */
function toggleBettingControls(enabled) {
    betInput.disabled = !enabled;
    placeBetButton.disabled = !enabled;
}

/**
 * Inicia a fase de aposta de um novo jogo.
 */
function startBettingPhase() {
    isGameOver = false;
    hasPlacedBet = false;
    currentBet = 0;

    playerCards = [];
    dealerCards = [];
    playerScore = 0;
    dealerScore = 0;
    renderCards([], playerCardsDiv);
    renderCards([], dealerCardsDiv);
    updateScores(); 

    displayMessage('Faça sua aposta!', 'info');
    toggleGamePlayButtons(false); 
    toggleBettingControls(true); 
    newGameButton.classList.add('hidden'); 
    updateBankrollDisplay();

    if (playerBankroll <= 0) {
        displayMessage('Você ficou sem dinheiro! Clique em "Recomeçar Jogo" para resetar seu saldo.', 'error');
        newGameButton.classList.remove('hidden');
        newGameButton.textContent = 'Recomeçar Jogo (Resetar Saldo)';
        toggleBettingControls(false); 
    } else {
        newGameButton.textContent = 'Novo Jogo'; 
    }
}

/**
 * Coloca a aposta do jogador e inicia a rodada.
 */
function placeBet() {
    let betAmount = parseInt(betInput.value);

    if (isNaN(betAmount) || betAmount <= 0) {
        displayMessage('Por favor, insira uma aposta válida.', 'error');
        return;
    }
    if (betAmount > playerBankroll) {
        displayMessage('Aposta maior que seu saldo!', 'error');
        return;
    }

    currentBet = betAmount;
    playerBankroll -= currentBet; 
    hasPlacedBet = true;

    updateBankrollDisplay();
    displayMessage('Aposta feita! Distribuindo cartas...', 'info');
    toggleBettingControls(false); 
    toggleGamePlayButtons(true);

    createDeck();
    shuffleDeck();
    dealInitialCards();
    updateScores(); 

    if (playerScore === 21) {
        endGame('BlackJack! Você ganhou!', 'success');
        playerBankroll += currentBet * 2.5;
        updateBankrollDisplay();
    }
}

/**
 * Distribui as duas cartas iniciais para o jogador e o dealer.
 */
function dealInitialCards() {
    playerCards = [];
    dealerCards = [];

    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());
    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());

    renderCards(playerCards, playerCardsDiv);
    renderCards(dealerCards, dealerCardsDiv, true); 

    playerScore = calculateHandScore(playerCards);
    playerScoreSpan.textContent = playerScore;
}

/**
 * Lógica para o jogador pedir uma carta.
 */
function hit() {
    if (isGameOver || !hasPlacedBet) return;

    playerCards.push(deck.pop());
    playerScore = calculateHandScore(playerCards); 
    renderCards(playerCards, playerCardsDiv);
    playerScoreSpan.textContent = playerScore;

    if (playerScore > 21) {
        endGame('Você estourou! Dealer venceu.', 'error');
    }
}

/**
 * Lógica para o jogador parar de pedir cartas.
 */
function stand() {
    if (isGameOver || !hasPlacedBet) return;

    toggleGamePlayButtons(false);
    dealerTurn();
}

/**
 * Lógica da jogada do dealer.
 */
function dealerTurn() {
    renderCards(dealerCards, dealerCardsDiv, false);
    dealerScore = calculateHandScore(dealerCards);
    dealerScoreSpan.textContent = dealerScore; 

    while (dealerScore < 17 && playerScore <= 21) { 
        dealerCards.push(deck.pop());
        dealerScore = calculateHandScore(dealerCards);
        renderCards(dealerCards, dealerCardsDiv);
        dealerScoreSpan.textContent = dealerScore;
    }

    determineWinner();
}

/**
 * Determina o vencedor do jogo e paga as apostas.
 */
function determineWinner() {
    if (isGameOver) return;

    let winMessage = '';
    let messageType = 'info';

    if (playerScore > 21) {
        winMessage = 'Você estourou! Dealer venceu.';
        messageType = 'error';
        // A aposta já foi subtraída no início, não há retorno
    } else if (dealerScore > 21) {
        winMessage = 'Dealer estourou! Você venceu!';
        messageType = 'success';
        playerBankroll += currentBet * 2; // Paga a aposta (aposta original + ganho igual)
    } else if (playerScore > dealerScore) {
        winMessage = 'Você venceu!';
        messageType = 'success';
        playerBankroll += currentBet * 2; // Paga a aposta
    } else if (dealerScore > playerScore) {
        winMessage = 'Dealer venceu!';
        messageType = 'error';
        // A aposta já foi subtraída
    } else { // Empate (Push)
        winMessage = 'Empate!';
        messageType = 'info';
        playerBankroll += currentBet; // Devolve a aposta
    }

    endGame(winMessage, messageType);
    updateBankrollDisplay();
}

/**
 * Finaliza o jogo e exibe a mensagem final.
 * @param {string} message 
 * @param {string} type 
 */
function endGame(message, type) {
    isGameOver = true;
    displayMessage(message, type);
    toggleGamePlayButtons(false); 
    newGameButton.classList.remove('hidden'); 
    dealerScoreSpan.textContent = calculateHandScore(dealerCards);
}

placeBetButton.addEventListener('click', placeBet);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
newGameButton.addEventListener('click', () => {
    if (playerBankroll <= 0) {
        playerBankroll = 1000; 
        localStorage.setItem('blackjackBankroll', playerBankroll); 
        betInput.value = 10; 
        displayMessage('Saldo resetado! Faça sua aposta.', 'info');
    }
    startBettingPhase();
});


// --- Iniciar o Jogo ao Carregar a Página ---

function loadBankroll() {
    const savedBankroll = localStorage.getItem('blackjackBankroll');
    if (savedBankroll !== null && !isNaN(parseInt(savedBankroll))) {
        playerBankroll = parseInt(savedBankroll);
    } else {
        playerBankroll = 1000; 
    }
}

loadBankroll();
startBettingPhase();
updateBankrollDisplay(); 
