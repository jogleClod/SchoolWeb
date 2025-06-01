        const filterLinks = document.querySelectorAll('.category-filter');
        const newsCards = document.querySelectorAll('.news-card');
    
        filterLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
    
                // Удалить класс active у всех
                filterLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
    
                const filter = this.dataset.filter;
    
                newsCards.forEach(card => {
                    const category = card.dataset.category;
    
                    if (filter === "Бардыгы" || filter === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });