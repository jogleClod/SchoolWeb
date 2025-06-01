const cardsPerPage = 3;
let currentPage = 1;

function showPage(page) {
    const allCards = Array.from(document.querySelectorAll('.news-card'));
    const filter = document.querySelector('.category-filter.active').dataset.filter;

    const filteredCards = allCards.filter(card => {
        const category = card.dataset.category;
        return filter === "Бардыгы" || filter === category;
    });

    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    currentPage = Math.max(1, Math.min(page, totalPages));

    filteredCards.forEach((card, index) => {
        card.style.display = (index >= (currentPage - 1) * cardsPerPage && index < currentPage * cardsPerPage) ? 'block' : 'none';
    });

    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const pagination = document.querySelector('.pagination ul.page-numbers');
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.textContent = i;
        a.className = (i === currentPage) ? 'active' : '';
        a.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(i);
        });
        li.appendChild(a);
        pagination.appendChild(li);
    }
}

document.querySelectorAll('.category-filter').forEach(link => {
    link.addEventListener('click', function () {
        showPage(1); // Показать с первой страницы при фильтрации
    });
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
});