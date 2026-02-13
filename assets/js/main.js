const pokemonList = document.getElementById('pokemonList');
const cardContainer = document.getElementById('pokemonCardContainer');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const pages = document.getElementById('pages');

const maxRecords = 151;
const limit = 8;
let offset = 0;

let paginaAtual = 1;
const totalPaginas = Math.ceil(maxRecords / limit);

function loadPokemonPage(pagina) {
    const offset = (pagina - 1) * limit

    const qtdRestante = maxRecords - offset
    const limitAtual = qtdRestante < limit ? qtdRestante : limit

    pokeApi.getPokemons(offset, limitAtual).then((pokemons = []) => {
        const newHtml = pokemons.map((pokemon) => `
            <li class="pokemon ${pokemon.type}">
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) =>
                            `<li class="type ${type}">${type}</li>`
                        ).join('')}
                    </ol>

                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                </div>
            </li>
        `).join('')

        pokemonList.innerHTML = newHtml

        // Seleciona todos os pokémons que acabaram de ser renderizados
        const pokemonsRendered = pokemonList.querySelectorAll('.pokemon');

        // Para cada Pokémon da lista
        pokemonsRendered.forEach((pokemonLi) => {

            pokemonLi.addEventListener('click', () => {

                // Pega o nome do Pokémon clicado
                const pokemonName =
                    pokemonLi.querySelector('.name').textContent;

                // Chama a função que cria o card
                loadPokemonCard(pokemonName.toLowerCase());

            });

        });


    })
}

function renderPages() {
    pages.innerHTML = ''

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li')
        li.className = 'page'

        if (i === paginaAtual) {
            li.classList.add('active')
        }

        li.addEventListener('click', () => {
            paginaAtual = i
            atualizar()
        })

        pages.appendChild(li)
    }
}

prev.addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--
        atualizar()
    }
})

next.addEventListener('click', () => {
    if (paginaAtual < totalPaginas) {
        paginaAtual++
        atualizar()
    }
})

function updateButtons() {

    if (paginaAtual === 1) {
        prev.style.visibility = 'hidden'
    } else {
        prev.style.visibility = 'visible'
    }

    if (paginaAtual === totalPaginas) {
        next.style.visibility = 'hidden'
    } else {
        next.style.visibility = 'visible'
    }

}

function atualizar() {
    loadPokemonPage(paginaAtual)
    renderPages()
    updateButtons()
}

function loadPokemonCard(pokemonName) {

    // Busca o Pokémon (rota /pokemon)
    pokeApi.getPokemonByName(pokemonName).then((pokemon) => {

        // Agora busca a espécie do Pokémon
        fetch(pokemon.speciesUrl)
            .then(response => response.json())
            .then(species => {

                renderPokemonCard(pokemon, species);

            });
    });
}

function formatMoveName(name) {
    return name
        .split('-')              // separa por hífen
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )                        // capitaliza cada palavra
        .join(' ');              // junta com espaço
}

function createStatRow(label, value) {
    return `
        <tr>
            <td>${label}</td>
            <td>${value}</td>
            <td>
                <div class="stat-bar">
                    <div 
                        class="stat-fill ${value < 50 ? 'low' : 'high'}"
                        style="width: ${value}%;">
                    </div>
                </div>
            </td>
        </tr>
    `;
}

function setupMovesInfo(pokemon) {
    const items = cardContainer.querySelectorAll('#movesList .move-item');

    const hint = cardContainer.querySelector('#moveInfo .moveHint');
    const title = cardContainer.querySelector('#moveInfo .moveTitle');
    const table = cardContainer.querySelector('#moveInfo .moveTable');
    const tbody = cardContainer.querySelector('#moveDetailsBody');

    // ✅ proteção
    if (!pokemon || !pokemon.moves) return;
    if (!items.length || !hint || !title || !table || !tbody) return;

    items.forEach((li) => {
        li.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('active'));
            li.classList.add('active');

            const index = Number(li.dataset.index);
            const moveObj = pokemon.moves[index];

            // ✅ proteção
            if (!moveObj || !moveObj.details) return;

            // 1) some o "Selecione um movimento"
            hint.classList.add('hidden');

            // 2) aparece o título
            title.textContent = formatMoveName(moveObj.name);
            title.classList.remove('hidden');

            // 3) pega TODOS os detalhes do Pokémon (não do move global)
            const detailsSorted = [...moveObj.details].sort((a, b) => {
                if (a.versionGroup < b.versionGroup) return -1;
                if (a.versionGroup > b.versionGroup) return 1;
                return a.levelLearned - b.levelLearned;
            });

            // ✅ remove duplicatas (caso venha repetido)
            const seen = new Set();
            const unique = [];

            for (const d of detailsSorted) {
                const key = `${d.levelLearned}|${d.method}|${d.versionGroup}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(d);
                }
            }

            tbody.innerHTML = unique.map((d) => `
                <tr>
                    <td>${d.levelLearned}</td>
                    <td>${formatMoveName(d.method)}</td>
                    <td>${formatMoveName(d.versionGroup)}</td>
                </tr>
            `).join('');

            // 4) mostra a tabela
            table.classList.remove('hidden');
        });
    });
}


function renderPokemonCard(pokemon, species) {

    // Converte altura e peso (API usa decímetros e hectogramas)
    const height = pokemon.height / 10 + ' m';
    const weight = pokemon.weight / 10 + ' kg';

    // Abilities (já vem pronto da classe)
    const abilities = pokemon.abilities?.join(', ') || 'Unknown';

    // Specie (genus em inglês)
    const specie = species.genera.find(
        g => g.language.name === 'en'
    )?.genus || 'Unknown';

    // Egg Groups
    const eggGroups = species.egg_groups
        .map(group => group.name)
        .join(', ');

    // Egg Cycle
    const eggCycle = species.hatch_counter;

    // HTML da card
    cardContainer.innerHTML = `
        <div class="card ${pokemon.type}">
            <div class="cardTopo">
                <span class="cardName">${pokemon.name}</span>
                <span class="cardNumber">#${pokemon.number}</span>

                <div class="cardDetail">
                    <ol class="cardTypes">
                        ${pokemon.types.map(type =>
                            `<li class="cardType ${type}">${type}</li>`
                        ).join('')}
                    </ol>
                </div>

                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>

            <div class="infosContent">
                <div class="menu">
                    <button class="menu-btn active" data-tab="aboutPage" type="button">About</button>
                    <button class="menu-btn" data-tab="basicStatsPage" type="button">Basic Stats</button>
                    <button class="menu-btn" data-tab="movesPage" type="button">Moves</button>
                </div>

                <!-- ABOUT -->
                <div class="aboutPage page">
                    <div class="infos">
                        <table class="basic">
                            <tr><td>Specie</td><td>${specie}</td></tr>
                            <tr><td>Height</td><td>${height}</td></tr>
                            <tr><td>Weight</td><td>${weight}</td></tr>
                            <tr><td>Abilities</td><td>${abilities}</td></tr>
                        </table>

                        <span>Breeding</span>

                        <table class="breeding">
                            <tr><td>Egg Groups</td><td>${eggGroups}</td></tr>
                            <tr><td>Egg Cycle</td><td>${eggCycle}</td></tr>
                        </table>
                    </div>
                </div>

                <!-- BASIC STATS -->
                <div class="basicStatsPage page hidden">
                    <table>
                        ${createStatRow('HP', pokemon.stats.hp)}
                        ${createStatRow('Defense', pokemon.stats.defense)}
                        ${createStatRow('Attack', pokemon.stats.attack)}
                        ${createStatRow('Sp. Atk', pokemon.stats.spAtk)}
                        ${createStatRow('Sp. Def', pokemon.stats.spDef)}
                        ${createStatRow('Speed', pokemon.stats.speed)}
                    </table>
                </div>

                <!-- MOVES -->
                <div class="movesPage page hidden">
                    <ol id="movesList">
                        ${pokemon.moves.map((move, index) =>
                            `<li class="move-item" data-index="${index}">
                                ${formatMoveName(move.name)}
                            </li>`
                        ).join('')}
                    </ol>

                    <div class="moveInfo" id="moveInfo">
                        <p class="moveHint">Selecione um movimento</p>

                        <h1 class="moveTitle hidden"></h1>

                        <table class="moveTable hidden">
                            <thead>
                                <tr>
                                    <th>Level Learned</th>
                                    <th>Método</th>
                                    <th>Versão</th>
                                </tr>
                            </thead>
                            <tbody id="moveDetailsBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    cardContainer.style.display = 'block';

    setupMenu();
    setupMovesInfo(pokemon);

}

atualizar();


