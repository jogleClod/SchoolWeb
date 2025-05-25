const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-show');
            entry.target.classList.remove('animate-hidden');
            observer.unobserve(entry.target); // Только один раз
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.animate-slide, .animate-fade').forEach(el => {
    el.classList.add('animate-hidden'); // Скрываем до появления
    observer.observe(el);               // Наблюдаем
});