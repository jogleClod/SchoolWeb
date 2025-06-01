document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:5501/api/news")
        .then(response => response.json())
        .then(data => {
            const newsContainer = document.querySelector(".news-container");
            newsContainer.innerHTML = ""; // Очистить старые (статические) новости

            data.forEach(news => {
                const article = document.createElement("article");
                article.className = "news-card";
                article.dataset.category = news.category;

                article.innerHTML = `
                    <div class="news-image">
                        <img src="${news.image}" alt="${news.title}">
                    </div>
                    <div class="news-content">
                        <span class="news-date">${news.date}</span>
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.description}</p>
                    </div>
                `;

                newsContainer.appendChild(article);
            });
        })
        .catch(error => {
            console.error("Жаңылыктарды жүктөөдө ката кетти:", error);
        });
});
