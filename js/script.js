const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const searchInput = document.getElementById('pokemonSearch');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

// Cores para os tipos de Pokémon
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

// Event Listeners
searchButton.addEventListener('click', searchPokemon);
searchInput.addEventListener('keypress', e => e.key === 'Enter' && searchPokemon());

async function searchPokemon() {
    const searchTerm = searchInput.value.trim();
    resultsContainer.innerHTML = '';

    if (!searchTerm) {
        showError('Por favor, digite um nome ou número de Pokémon');
        return;
    }

    try {
        showLoading();
        const pokemonData = await fetchPokemonData(searchTerm);
        const evolutionChain = await fetchEvolutionChain(pokemonData.id);
        displayPokemonInfo(pokemonData, evolutionChain);
    } catch (error) {
        showError('Pokémon não encontrado! Tente outro nome ou número.');
    }
}

async function fetchPokemonData(searchTerm) {
    const response = await fetch(`${POKEAPI_URL}/pokemon/${searchTerm.toLowerCase()}`);
    if (!response.ok) throw new Error('Não encontrado');
    return await response.json();
}

async function fetchEvolutionChain(id) {
    const speciesResponse = await fetch(`${POKEAPI_URL}/pokemon-species/${id}`);
    const speciesData = await speciesResponse.json();
    
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    
    return parseEvolutionChain(evolutionData.chain);
}

function parseEvolutionChain(chain) {
    const evolutions = [];
    
    function traverse(currentChain) {
        evolutions.push({
            name: currentChain.species.name,
            id: currentChain.species.url.split('/')[6]
        });
        
        currentChain.evolves_to.forEach(next => traverse(next));
    }
    
    traverse(chain);
    return evolutions;
}

function displayPokemonInfo(pokemon, evolutions) {
    const typesHTML = pokemon.types.map(type => `
        <span class="type-badge" style="background: ${typeColors[type.type.name]}">
            ${type.type.name}
        </span>
    `).join('');

    const statsHTML = pokemon.stats.map(stat => `
        <div class="stat-item">
            <div class="stat-info">
                <span>${stat.stat.name}:</span>
                <span>${stat.base_stat}</span>
            </div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%"></div>
            </div>
        </div>
    `).join('');

    const evolutionsHTML = evolutions.map(p => `
        <div class="evolution-stage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" 
                 alt="${p.name}">
            <p>#${p.id} ${p.name}</p>
        </div>
    `).join('');

    resultsContainer.innerHTML = `
        <div class="pokemon-card">
            <div class="image-section">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
                     alt="${pokemon.name}" 
                     class="pokemon-image">
            </div>
            <div class="details-section">
                <h2>#${pokemon.id} ${pokemon.name}</h2>
                <div class="types">${typesHTML}</div>
                <div class="stats-container">${statsHTML}</div>
                
                ${evolutions.length > 1 ? `
                    <h3>Cadeia Evolutiva</h3>
                    <div class="evolution-chain">${evolutionsHTML}</div>
                ` : ''}
            </div>
        </div>
    `;
}

function showLoading() {
    resultsContainer.innerHTML = '<div class="loading">Carregando...</div>';
}

function showError(message) {
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}