// Seleciona a lista de movimentos
const movesList = document.getElementById('movesList');

// Seleciona a área de detalhes
const moveInfo = document.getElementById('moveInfo');

// Função GLOBAL (vai ser usada pelo main.js)
function loadPokemonMoves(pokemonName) {

    // Limpa lista e detalhes antes de carregar outro Pokémon
    movesList.innerHTML = '';
    moveInfo.innerHTML = '<p>Carregando movimentos...</p>';

    // Busca movimentos pela API
    pokeApi.getPokemonMoves(pokemonName).then((moves = []) => {

        // Cria os <li> dinamicamente
        const newHtml = moves.map((move) => `
            <li class="move ${move.type}">
                ${move.name.replaceAll('-', ' ')}
            </li>
        `).join('');

        movesList.innerHTML = newHtml;

        // Adiciona clique em cada movimento
        const lis = movesList.querySelectorAll('li');

        lis.forEach((li, index) => {
            li.addEventListener('click', () => {

                const move = moves[index];

                moveInfo.innerHTML = `
                    <h3>${move.name.replaceAll('-', ' ')}</h3>
                    <p><strong>Tipo:</strong> ${move.type}</p>
                    <p><strong>Poder:</strong> ${move.power ?? '—'}</p>
                    <p><strong>Precisão:</strong> ${move.accuracy ?? '—'}</p>
                    <p><strong>PP:</strong> ${move.pp}</p>
                    <p>${move.description}</p>
                `;
            });
        });
    });
}
