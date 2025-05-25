      const waitForHeader = setInterval(() => {
        const menuToggle = document.getElementById('menu-toggle');
        const nav = document.querySelector('nav');
    
        if (menuToggle && nav) {
          clearInterval(waitForHeader);
    
          menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
          });
        }
      }, 100);