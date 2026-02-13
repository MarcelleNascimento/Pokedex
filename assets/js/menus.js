
  const items = document.querySelectorAll('#movesList li');
  const infoBox = document.getElementById('moveInfo');

  items.forEach(function(li) {
    li.addEventListener('click', function() {
      items.forEach(function(item) {
        item.classList.remove('active');
      });

      li.classList.add('active');

      infoBox.innerHTML =
        "<h3>" + li.textContent + "</h3>" +
        "<p>" + li.dataset.info + "</p>";
    })
  });
  
function setupMenu() {
    const buttons = cardContainer.querySelectorAll('.menu-btn');
    const pages = cardContainer.querySelectorAll('.page');

    buttons.forEach(button => {
        button.addEventListener('click', () => {

            // 1️⃣ Remove active de todos os botões
            buttons.forEach(btn => btn.classList.remove('active'));

            // 2️⃣ Esconde todas as páginas
            pages.forEach(page => page.classList.add('hidden'));

            // 3️⃣ Ativa botão clicado
            button.classList.add('active');

            // 4️⃣ Mostra a página correspondente
            const tabName = button.dataset.tab;
            const targetPage = cardContainer.querySelector(`.${tabName}`);

            if (targetPage) {
                targetPage.classList.remove('hidden');
            }
        });
    });
}


