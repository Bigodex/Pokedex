const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');
const pokemonAbilities = document.querySelector('.pokemon__abilities');
const preEvolution = document.querySelector('.pre-evolution');
const evolution = document.querySelector('.evolution');
const statHp = document.querySelector('.stat-hp');
const statAttack = document.querySelector('.stat-attack');
const statDefense = document.querySelector('.stat-defense');
const statSpeed = document.querySelector('.stat-speed');
const preEvolutionImg = document.querySelector('.pre-evolution-img');
const evolutionImg = document.querySelector('.evolution-img');
const pokemonType = document.querySelector('.pokemon__type');
const pokemonWeight = document.querySelector('.pokemon__weight');
const pokemonHeight = document.querySelector('.pokemon__height');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const buttonPesquisar = document.querySelector('#pesquisar-btn');

let searchPokemon = 1;

const typeIcons = {
  fire: '🔥',
  water: '💧',
  grass: '🌱',
  electric: '⚡',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🌍',
  flying: '🕊️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
  normal: '⭐',
};

const fetchPokemon = async (pokemon) => {
  const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    return data;
  }
};

const fetchPokemonInPortuguese = async (pokemon) => {
  const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
  
  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    const portugueseName = data.names.find(name => name.language.name === 'pt');
    return portugueseName ? portugueseName.name : null;
  }
  return null;
};

const fetchPokemonEvolutions = async (speciesUrl) => {
  const APIResponse = await fetch(speciesUrl);
  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    const evolutionChainUrl = data.evolution_chain.url;
    const evolutionResponse = await fetch(evolutionChainUrl);
    if (evolutionResponse.status === 200) {
      return await evolutionResponse.json();
    }
  }
  return null;
};

const formatName = (name) => name.charAt(0).toUpperCase() + name.slice(1);

const renderStatBar = (value, max = 255) => {
  const percentage = Math.round((value / max) * 100);
  return `
    <div class="stat-bar-container">
      <div class="stat-bar__fill" style="width: ${percentage}%; background-color: #ffcc00;"></div>
    </div>
    <span>${percentage}%</span>
  `;
};

const renderPokemon = async (pokemon) => {
  pokemonName.innerHTML = 'Loading...';
  pokemonNumber.innerHTML = '';

  const data = await fetchPokemon(pokemon);

  if (data) {
    const portugueseName = await fetchPokemonInPortuguese(data.id);
    pokemonImage.style.display = 'block';
    pokemonName.innerHTML = portugueseName
      ? formatName(portugueseName)
      : formatName(data.name);
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
    input.value = '';
    searchPokemon = data.id;

    // Render type, weight, and height
    pokemonType.innerHTML = data.types
      .map(type => `<li>${typeIcons[type.type.name] || ''} ${formatName(type.type.name)}</li>`)
      .join('');
    pokemonWeight.innerHTML = `${(data.weight / 10).toFixed(1)} kg`;
    pokemonHeight.innerHTML = `${(data.height / 10).toFixed(1)} m`;

    // Render abilities
    pokemonAbilities.innerHTML = data.abilities
      .map(ability => `<li>✨ ${formatName(ability.ability.name)}</li>`)
      .join('');

    // Render stats with bars
    statHp.innerHTML = `
      ${data.stats.find(stat => stat.stat.name === 'hp').base_stat}
      ${renderStatBar(data.stats.find(stat => stat.stat.name === 'hp').base_stat)}
    `;
    statAttack.innerHTML = `
      ${data.stats.find(stat => stat.stat.name === 'attack').base_stat}
      ${renderStatBar(data.stats.find(stat => stat.stat.name === 'attack').base_stat)}
    `;
    statDefense.innerHTML = `
      ${data.stats.find(stat => stat.stat.name === 'defense').base_stat}
      ${renderStatBar(data.stats.find(stat => stat.stat.name === 'defense').base_stat)}
    `;
    statSpeed.innerHTML = `
      ${data.stats.find(stat => stat.stat.name === 'speed').base_stat}
      ${renderStatBar(data.stats.find(stat => stat.stat.name === 'speed').base_stat)}
    `;

    // Fetch and render evolutions
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);
    const speciesData = await speciesResponse.json();
    const evolutionData = await fetchPokemonEvolutions(speciesResponse.url);

    if (evolutionData) {
      const chain = evolutionData.chain;

      let evolutions = [];
      let current = chain;

      while (current) {
        evolutions.push(current.species.name);
        current = current.evolves_to[0];
      }

      const currentIndex = evolutions.indexOf(data.name);

      // Pré-evolução (1 estágio antes)
      if (currentIndex > 0) {
        const prevName = evolutions[currentIndex - 1];
        preEvolution.innerHTML = formatName(prevName);
        const prevData = await fetchPokemon(prevName);
        preEvolutionImg.src = prevData.sprites.versions['generation-v']['black-white'].animated.front_default;
        preEvolutionImg.style.display = 'block';
      } else {
        preEvolution.innerHTML = 'Nenhuma';
        preEvolutionImg.src = '';
        preEvolutionImg.style.display = 'none';
      }

      // Próxima evolução (1 estágio depois)
      if (currentIndex < evolutions.length - 1) {
        const nextName = evolutions[currentIndex + 1];
        evolution.innerHTML = formatName(nextName);
        const nextData = await fetchPokemon(nextName);
        evolutionImg.src = nextData.sprites.versions['generation-v']['black-white'].animated.front_default;
        evolutionImg.style.display = 'block';
      } else {
        evolution.innerHTML = 'Nenhuma';
        evolutionImg.src = '';
        evolutionImg.style.display = 'none';
      }
    }
  } else {
    pokemonImage.style.display = 'none';
    pokemonName.innerHTML = 'Not found :c';
    pokemonNumber.innerHTML = '';
    pokemonAbilities.innerHTML = '<li>Habilidade 1</li><li>Habilidade 2</li>';
    preEvolution.innerHTML = 'Nenhuma';
    evolution.innerHTML = 'Nenhuma';
    preEvolutionImg.src = '';
    evolutionImg.src = '';
    statHp.innerHTML = '0' + renderStatBar(0);
    statAttack.innerHTML = '0' + renderStatBar(0);
    statDefense.innerHTML = '0' + renderStatBar(0);
    statSpeed.innerHTML = '0' + renderStatBar(0);
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
  }
});

buttonNext.addEventListener('click', () => {
  searchPokemon += 1;
  renderPokemon(searchPokemon);
});

buttonPesquisar.addEventListener('click', () => {
  renderPokemon(input.value.toLowerCase());
});

renderPokemon(searchPokemon);
