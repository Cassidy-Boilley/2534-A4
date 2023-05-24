// script.js
const pokemonEndpoint = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=810';

let pokemonData = [];
let clicks = 0;
let pairsLeft = 0;
let pairsMatched = 0;
let totalPairs = 0;
let gameStarted = false;
let timerInterval;
let selectedCards = [];
// Fetch Pokémon data from the API
async function fetchPokemonData() {
  try {
    const response = await fetch(pokemonEndpoint);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.log('Error:', error);
    return [];
  }
}

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize the game
function initializeGame(difficulty, numCards) {
  gameStarted = false;
  clicks = 0;
  pairsMatched = 0;
  selectedCard = null;
  clearInterval(timerInterval);
  document.getElementById('clicks').textContent = `Clicks: ${clicks}`;
  document.getElementById('pairs-left').textContent = `Pairs Left: ${pairsLeft}`;
  document.getElementById('pairs-matched').textContent = `Pairs Matched: ${pairsMatched}`;
  document.getElementById('total-pairs').textContent = `Total Pairs: ${totalPairs}`;
  document.getElementById('timer').textContent = `Time: 00:00`;
  document.getElementById('game').innerHTML = '';
  pokemonData.length = numCards;
  const maxCards = numCards
  const shuffledData = shuffleArray(pokemonData.slice(0, difficulty));
  const cards = shuffledData
    .slice(0, maxCards / 2)
    .flatMap((pokemon) => [
      { ...pokemon, id: pokemon.name + '1', flipped: false, matched: false },
      { ...pokemon, id: pokemon.name + '2', flipped: false, matched: false },
    ]);
  const gameElement = document.getElementById('game');
  cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.id = card.id;
    const cardInnerElement = document.createElement('div');
    cardInnerElement.classList.add('card-inner');
    cardInnerElement.addEventListener('click', handleCardClick);
    const cardFrontElement = document.createElement('div');
    cardFrontElement.classList.add('card-front');
    const cardBackElement = document.createElement('div');
    cardBackElement.classList.add('card-back');
    cardBackElement.style.backgroundImage = `url(${card.url})`;
    cardInnerElement.appendChild(cardFrontElement);
    cardInnerElement.appendChild(cardBackElement);
    cardElement.appendChild(cardInnerElement);
    gameElement.appendChild(cardElement);
  });
  pairsLeft = cards.length / 2;
  totalPairs = pairsLeft;
  document.getElementById('pairs-left').textContent = `Pairs Left: ${pairsLeft}`;
  document.getElementById('total-pairs').textContent = `Total Pairs: ${totalPairs}`;
}

function changeTheme(theme) {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(`theme-${theme}`);
}

function handleCardClick() {
  if (!gameStarted) {
    gameStarted = true;
    timerInterval = startTimer();
  }
  const card = this.parentElement;
  if (card.classList.contains('flipped') || card.dataset.matched) {
    return;
  }
  flipCard(card);
  selectedCards.push(card);
  if (selectedCards.length === 2) {
    const [card1, card2] = selectedCards;
    const isPair = checkMatch(card1, card2);
    if (!isPair) {
      setTimeout(() => {
        flipCard(card1);
        flipCard(card2);
      }, 1000);
    }
    selectedCards = [];
    clicks++;
    document.getElementById('clicks').textContent = `Clicks: ${clicks}`;
  }
}


// Flip a card
function flipCard(card) {
  card.classList.toggle('flipped');
  const id = card.dataset.id;
  const matchedCard = selectedCards.find((card) => card.dataset.id === id);
  if (matchedCard) {
    matchedCard.classList.toggle('flipped');
  }
}

// Check if the selected cards match
function checkMatch(card1, card2) {
  const id1 = card1.dataset.id;
  const id2 = card2.dataset.id;

  if (id1 === id2) {
    pairsMatched++;
    pairsLeft--;
    document.getElementById('pairs-left').textContent = `Pairs Left: ${pairsLeft}`;
    document.getElementById('pairs-matched').textContent = `Pairs Matched: ${pairsMatched}`;
    card1.dataset.matched = true;
    card2.dataset.matched = true;

    if (pairsMatched === totalPairs) {
      clearInterval(timerInterval);
      setTimeout(() => {
        alert('Congratulations! You won the game!');
      }, 500);
    }
    return true;
  }
  return false;
}

// Start the game timer
function startTimer() {
  let seconds = 0;
  let minutes = 0;
  return setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = `Time: ${formattedTime}`;
  }, 1000);
}

// Reset the game
function resetGame() {
  clearInterval(timerInterval);
  initializeGame(pokemonData.length, 6);
}

// Handle start button click event
document.getElementById('start-btn').addEventListener('click', () => {
  const difficulty = document.getElementById('difficulty').value;
  initializeGame(difficulty, 6);
});

// Handle reset button click event
document.getElementById('reset-btn').addEventListener('click', resetGame);

// Handle power-up button click event
document.getElementById('power-up').addEventListener('click', () => {
  const cards = document.getElementsByClassName('card');
  Array.from(cards).forEach((card) => {
    if (!card.dataset.matched) {
      flipCard(card);
      setTimeout(() => {
        flipCard(card);
      }, 3000);
    }
  });
});

fetchPokemonData()
  .then((data) => {
    pokemonData = data.map((pokemon) => ({
      id: pokemon.name,
      name: pokemon.name,
      url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`,
    }));
  })
  .catch((error) => {
    console.log('Error:', error);
  });
