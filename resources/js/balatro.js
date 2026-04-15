// ============================================
// BALATRO-STYLE MINIGAME (JOKER'S POKER)
// ============================================

let balatroDeck = [];
let balatroHand = []; // Cartas atuais na tela do jogador (max 8)
let balatroSelected = []; // Indices selecionados
let balatroHandsLeft = 4;
let balatroDiscardsLeft = 3;
let balatroTarget = 1000;
let balatroCurrentScore = 0;
let balatroJoker = null;

const JOKERS = [
    { name: "Mago Vermelho", desc: "+10 Mult em Copas/Ouros", apply: (hand, baseChips, baseMult) => hand.every(c => c.suit==='♥️'||c.suit==='♦️') ? {c:0, m:10} : {c:0,m:0} },
    { name: "Rei Rico", desc: "+50 Fichas bases na Mão", apply: () => ({c:50, m:0}) },
    { name: "Coringa Risonho", desc: "+3 Mult Fixo", apply: () => ({c:0, m:3}) }
];

const balatroDOM = {
    screen: document.getElementById('balatro-screen'),
    cardsArea: document.getElementById('balatro-cards'),
    btnPlay: document.getElementById('balatro-play-btn'),
    btnDiscard: document.getElementById('balatro-discard-btn'),
    btnReturn: document.getElementById('balatro-return-btn'),
    handsLeft: document.getElementById('balatro-hands-left'),
    discardsLeft: document.getElementById('balatro-discards-left'),
    target: document.getElementById('balatro-target'),
    score: document.getElementById('balatro-score'),
    jokerName: document.getElementById('balatro-joker-name'),
    handName: document.getElementById('balatro-hand-name'),
    chipsBase: document.getElementById('balatro-chips-base'),
    multBase: document.getElementById('balatro-mult-base'),
    eventText: document.getElementById('balatro-event-text')
};

// Start 
window.initBalatro = function() {
    if(playerBankroll < 100) {
        showToast('Fichas insuficientes ($100).', 'error');
        return;
    }
    playerBankroll -= 100;
    updateBankrollDisplay();
    syncBankrollWithServer();

    screens.lobby.classList.remove('active');
    balatroDOM.screen.classList.add('active');

    // Reset stats
    balatroHandsLeft = 4;
    balatroDiscardsLeft = 3;
    balatroTarget = 1000;
    balatroCurrentScore = 0;

    // Pick Joker
    balatroJoker = JOKERS[Math.floor(Math.random() * JOKERS.length)];
    balatroDOM.jokerName.textContent = balatroJoker.name + " (" + balatroJoker.desc + ")";

    updateBalatroHUD();
    
    // Create deck
    balatroDeck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            balatroDeck.push({ rank, suit });
        }
    }
    // Shuffle
    for (let i = balatroDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balatroDeck[i], balatroDeck[j]] = [balatroDeck[j], balatroDeck[i]];
    }

    balatroHand = [];
    balatroSelected = [];
    drawBalatro(8);
};

function updateBalatroHUD() {
    balatroDOM.handsLeft.textContent = balatroHandsLeft;
    balatroDOM.discardsLeft.textContent = balatroDiscardsLeft;
    balatroDOM.target.textContent = balatroTarget;
    balatroDOM.score.textContent = balatroCurrentScore;

    balatroDOM.btnPlay.disabled = (balatroSelected.length === 0 || balatroHandsLeft <= 0);
    balatroDOM.btnDiscard.disabled = (balatroSelected.length === 0 || balatroDiscardsLeft <= 0);
    
    evaluateSelection();
}

function drawBalatro(num) {
    for(let i=0; i<num; i++){
        if(balatroDeck.length > 0 && balatroHand.length < 8) {
            balatroHand.push(balatroDeck.pop());
        }
    }
    renderBalatroCards();
}

function renderBalatroCards() {
    balatroDOM.cardsArea.innerHTML = '';
    balatroHand.forEach((card, index) => {
        const cDiv = document.createElement('div');
        cDiv.classList.add('card');
        
        const t = document.createElement('div'); t.className = 'rank-top'; t.innerText = card.rank;
        const c = document.createElement('div'); c.className = 'suit-center'; c.innerText = card.suit;
        const b = document.createElement('div'); b.className = 'rank-bottom'; b.innerText = card.rank;
        cDiv.append(t, c, b);
        if (['♥️', '♦️'].includes(card.suit)) cDiv.classList.add('red-suit');

        if(balatroSelected.includes(index)) {
            cDiv.style.transform = 'translateY(-20px)';
            cDiv.style.boxShadow = '0 0 15px #38bdf8';
            cDiv.style.borderColor = '#38bdf8';
        }

        cDiv.addEventListener('click', () => {
            if(balatroSelected.includes(index)) {
                balatroSelected = balatroSelected.filter(i => i !== index);
            } else {
                if(balatroSelected.length < 5) balatroSelected.push(index);
            }
            renderBalatroCards();
            updateBalatroHUD();
        });

        balatroDOM.cardsArea.appendChild(cDiv);
    });
}

function getBalatroCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    if (card.rank === 'A') return 11;
    return parseInt(card.rank);
}

// Hand Evaluator
function getPokerHand(cards) {
    if(cards.length === 0) return { name: "High Card", chips: 5, mult: 1 };
    
    const rankCounts = {};
    const suitsCount = {};
    let vals = [];

    cards.forEach(c => {
        rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
        suitsCount[c.suit] = (suitsCount[c.suit] || 0) + 1;
        
        let v = parseInt(c.rank);
        if(c.rank === 'A') v = 14;
        else if(c.rank === 'K') v = 13;
        else if(c.rank === 'Q') v = 12;
        else if(c.rank === 'J') v = 11;
        vals.push(v);
    });
    vals.sort((a,b) => b - a);

    const isFlush = Object.values(suitsCount).some(v => v === 5);
    let isStraight = false;
    if(vals.length === 5) {
        isStraight = true;
        for(let i=0; i<4; i++) {
            if(vals[i] - 1 !== vals[i+1]) isStraight = false;
        }
        // Special case A 2 3 4 5
        if(vals[0]===14 && vals[1]===5 && vals[2]===4 && vals[3]===3 && vals[4]===2) isStraight = true;
    }

    const counts = Object.values(rankCounts).sort((a,b) => b-a);

    if(isFlush && isStraight && vals[0]===14 && vals[4]===10) return {name: "Royal Flush", chips: 100, mult: 8};
    if(isFlush && isStraight) return {name: "Straight Flush", chips: 100, mult: 8};
    if(counts[0] === 4) return {name: "Four of a Kind", chips: 60, mult: 7};
    if(counts[0] === 3 && counts[1] === 2) return {name: "Full House", chips: 40, mult: 4};
    if(isFlush) return {name: "Flush", chips: 35, mult: 4};
    if(isStraight) return {name: "Straight", chips: 30, mult: 4};
    if(counts[0] === 3) return {name: "Three of a Kind", chips: 30, mult: 3};
    if(counts[0] === 2 && counts[1] === 2) return {name: "Two Pair", chips: 20, mult: 2};
    if(counts[0] === 2) return {name: "Pair", chips: 10, mult: 2};
    
    return {name: "High Card", chips: 5, mult: 1};
}

function evaluateSelection() {
    const selectedCards = balatroSelected.map(i => balatroHand[i]);
    const handResult = getPokerHand(selectedCards);
    
    balatroDOM.handName.textContent = handResult.name;
    balatroDOM.chipsBase.textContent = handResult.chips;
    balatroDOM.multBase.textContent = handResult.mult;
}

async function playBalatroHand() {
    if(balatroSelected.length === 0 || balatroHandsLeft <= 0) return;
    balatroHandsLeft--;

    const selectedCards = balatroSelected.map(i => balatroHand[i]);
    let handResult = getPokerHand(selectedCards);
    
    let totalCardChips = 0;
    selectedCards.forEach(c => totalCardChips += getBalatroCardValue(c));

    let finalChips = handResult.chips + totalCardChips;
    let finalMult = handResult.mult;

    // Apply Joker
    const jokerEffect = balatroJoker.apply(selectedCards, finalChips, finalMult);
    finalChips += jokerEffect.c;
    finalMult += jokerEffect.m;

    const roundScore = finalChips * finalMult;
    balatroCurrentScore += roundScore;

    // Remove selected from hand
    const sDesc = balatroSelected.sort((a,b)=>b-a);
    sDesc.forEach(idx => {
        balatroHand.splice(idx, 1);
    });
    balatroSelected = [];

    // Animation
    balatroDOM.eventText.style.display = 'block';
    balatroDOM.eventText.textContent = `${handResult.name}! +${roundScore}`;
    setTimeout(() => { balatroDOM.eventText.style.display = 'none'; }, 1500);

    drawBalatro(sDesc.length);
    updateBalatroHUD();

    checkWinLossBalatro();
}

function discardBalatroCards() {
    if(balatroSelected.length === 0 || balatroDiscardsLeft <= 0) return;
    balatroDiscardsLeft--;

    const sDesc = balatroSelected.sort((a,b)=>b-a);
    sDesc.forEach(idx => {
        balatroHand.splice(idx, 1);
    });
    balatroSelected = [];

    drawBalatro(sDesc.length);
    updateBalatroHUD();
}

function checkWinLossBalatro() {
    if(balatroCurrentScore >= balatroTarget) {
        showToast('Parabéns! Bateu a meta da rodada do Balatro. Ganhou $200!', 'success');
        playerBankroll += 200;
        updateBankrollDisplay();
        syncBankrollWithServer();
        setTimeout(exitBalatro, 2000);
    } else if (balatroHandsLeft <= 0) {
        showToast('As mãos acabaram! Você perdeu seus $100.', 'error');
        setTimeout(exitBalatro, 2000);
    }
}

function exitBalatro() {
    balatroDOM.screen.classList.remove('active');
    screens.lobby.classList.add('active');
}

// Balatro Binds
balatroDOM.btnPlay.addEventListener('click', playBalatroHand);
balatroDOM.btnDiscard.addEventListener('click', discardBalatroCards);
balatroDOM.btnReturn.addEventListener('click', exitBalatro);
