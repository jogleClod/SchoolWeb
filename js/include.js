function getRootRelativePath(path) {
  const depth = window.location.pathname.split('/').length - 2;
  return '../'.repeat(depth) + path;
}

document.addEventListener("DOMContentLoaded", () => {
  // Загружаем header
  fetch(getRootRelativePath("header.html"))
      .then(res => res.text())
      .then(data => {
          const headerContainer = document.querySelector("#include-header");
          headerContainer.innerHTML = data;
          
          // После загрузки header инициализируем стили
          initHeroStyles();
      });
  
  // Загружаем footer
  fetch(getRootRelativePath("footer.html"))
      .then(res => res.text())
      .then(data => {
          document.querySelector("#include-footer").innerHTML = data;
      });
});

function initHeroStyles() {
  // Явно устанавливаем стили для hero
  const hero = document.querySelector('.hero');
  if (hero) {
      hero.style.cssText = `
          background: white;
          color: #2c3e50;
          padding: 8rem 2rem;
          text-align: center;
          position: relative;
      `;
      
      // Для текста внутри hero
      const heroTexts = hero.querySelectorAll('h1, p');
      heroTexts.forEach(el => {
          el.style.color = '#2c3e50';
          el.style.position = 'relative';
          el.style.zIndex = '2';
      });
  }
}