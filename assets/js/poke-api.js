// Cria um objeto vazio que vai armazenar as funções da PokéAPI
const pokeApi = {};

// Função que converte os dados vindos da PokéAPI
// para um objeto Pokemon usado na aplicação
function convertPokeApiDetailToPokemon(pokeDetail) {

    // Cria uma nova instância da classe Pokemon
    const pokemon = new Pokemon();

    // Atribui o número (ID) do Pokémon vindo da API
    pokemon.number = pokeDetail.id;

    // Atribui o nome do Pokémon
    pokemon.name = pokeDetail.name;

    // Percorre o array de tipos e extrai apenas o nome de cada tipo
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);

    // Pega apenas o primeiro tipo do array
    const [type] = types

    // Salva todos os tipos do Pokémon
    pokemon.types = types;

    // Salva o tipo principal (primeiro tipo)
    pokemon.type = type;

    // Salva a URL da imagem do Pokémon
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

    pokemon.height = pokeDetail.height
    pokemon.weight = pokeDetail.weight

    pokemon.abilities = pokeDetail.abilities.map(
        ab => ab.ability.name
    )

    pokemon.speciesUrl = pokeDetail.species.url

    pokemon.stats = {
        hp: pokeDetail.stats.find(s => s.stat.name === 'hp')?.base_stat,
        attack: pokeDetail.stats.find(s => s.stat.name === 'attack')?.base_stat,
        defense: pokeDetail.stats.find(s => s.stat.name === 'defense')?.base_stat,
        spAtk: pokeDetail.stats.find(s => s.stat.name === 'special-attack')?.base_stat,
        spDef: pokeDetail.stats.find(s => s.stat.name === 'special-defense')?.base_stat,
        speed: pokeDetail.stats.find(s => s.stat.name === 'speed')?.base_stat
    };

    pokemon.moves = pokeDetail.moves.map((m) => {
        const details = (m.version_group_details || []).map((d) => ({
            levelLearned: d.level_learned_at,
            method: d.move_learn_method?.name || 'unknown',
            versionGroup: d.version_group?.name || 'unknown'
        }));

        return {
            name: m.move.name,
            details
        };
    });

    // Retorna o objeto Pokemon já formatado
    return pokemon;
}

// Função que busca os detalhes de um Pokémon específico
pokeApi.getPokemonDetail = (pokemon) => {

    // Faz uma requisição HTTP para a URL do Pokémon
    return fetch(pokemon.url)

    // Converte a resposta da requisição para JSON
    .then((response) => response.json())

    // Converte o JSON da API para um objeto Pokemon
    .then(convertPokeApiDetailToPokemon)
}

// Função que busca uma lista de Pokémons
// offset define a partir de qual Pokémon começa
// limit define quantos Pokémons serão buscados
pokeApi.getPokemons = (offset = 0, limit = 8) => {

    // Monta a URL da API com paginação
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    // Faz a requisição para buscar a lista de Pokémons
    return fetch(url)

    // A linha de baixo é igual a .then(function(response) {})
    // Converte a resposta da requisição para JSON
    .then((response) => response.json())

    // Extrai apenas o array de resultados do JSON
    .then((jsonBody) => jsonBody.results)

    // Para cada Pokémon da lista, chama a função que busca seus detalhes
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))

    // Aguarda todas as requisições de detalhes serem resolvidas
    .then((detailRequests) => Promise.all(detailRequests))

    // Retorna o array final com os detalhes de todos os Pokémons
    .then((pokemonsDetails) => pokemonsDetails)

}

// Busca UM Pokémon pelo nome
pokeApi.getPokemonByName = (pokemonName) => {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then(response => response.json())
        .then(convertPokeApiDetailToPokemon)
}

