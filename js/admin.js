document.addEventListener("DOMContentLoaded", function() {
    const API_BASE_URL = 'https://n-saidiev.onrender.com';
    let currentNewsId = null;
    let currentTeacherId = null;

    // Инициализация приложения
    initApp();

    function initApp() {
        initMenuNavigation();
        initModals();
        loadNews(); // Загружаем новости по умолчанию
    }

    function initMenuNavigation() {
        const menuLinks = document.querySelectorAll('.admin-menu .menu-link');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Обновляем активный пункт меню
                menuLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
                
                // Получаем название секции
                const section = this.dataset.section;
                
                // Переключаем секции
                switchSection(section);
            });
        });
    }

    function switchSection(section) {
        // Скрываем все секции
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Показываем нужную секцию
        const activeSection = document.getElementById(`${section}-section`);
        activeSection.classList.add('active');
        
        // Загружаем данные при необходимости
        if (section === 'news' && !activeSection.dataset.loaded) {
            loadNews();
        } else if (section === 'teachers' && !activeSection.dataset.loaded) {
            loadTeachers();
        }
    }

    function initModals() {
        // Инициализация модального окна новостей
        const newsModal = document.getElementById('newsModal');
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            document.getElementById('newsModalTitle').textContent = 'Жаңы жаңылык кошуу';
            currentNewsId = null;
            document.getElementById('newsForm').reset();
            newsModal.style.display = 'flex';
        });

        // Инициализация модального окна преподавателей
        const teacherModal = document.getElementById('teacherModal');
        document.getElementById('addTeacherBtn').addEventListener('click', () => {
            document.getElementById('teacherModalTitle').textContent = 'Мугалим кошуу';
            currentTeacherId = null;
            document.getElementById('teacherForm').reset();
            teacherModal.style.display = 'flex';
        });

        // Закрытие модальных окон
        document.querySelectorAll('.close-modal, #cancelNewsBtn, #cancelTeacherBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                newsModal.style.display = 'none';
                teacherModal.style.display = 'none';
            });
        });

        // Закрытие при клике вне окна
        window.addEventListener('click', (e) => {
            if (e.target === newsModal) newsModal.style.display = 'none';
            if (e.target === teacherModal) teacherModal.style.display = 'none';
        });

        // Обработчики сохранения
        document.getElementById('saveNewsBtn').addEventListener('click', saveNews);
        document.getElementById('saveTeacherBtn').addEventListener('click', saveTeacher);
    }

    async function loadNews() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/news`);
            if (!response.ok) throw new Error('Ошибка загрузки новостей');
            
            const news = await response.json();
            const tbody = document.getElementById('newsTableBody');
            
            tbody.innerHTML = news.map(item => `
                <tr>
                    <td>${item._id}</td>
                    <td>${item.image ? `<img src="${API_BASE_URL}/uploads/${item.image}" style="width:60px;height:40px;object-fit:cover;">` : 'Нет фото'}</td>
                    <td>${item.title}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.category}</td>
                    <td>
                        <button class="btn btn-edit" data-id="${item._id}"><i class="fas fa-edit"></i> Түзөтүү</button>
                        <button class="btn btn-delete" data-id="${item._id}"><i class="fas fa-trash"></i> Өчүрүү</button>
                    </td>
                </tr>
            `).join('');
            
            // Помечаем секцию как загруженную
            document.getElementById('news-section').dataset.loaded = 'true';
            
            // Навешиваем обработчики
            document.querySelectorAll('.news-table .btn-edit').forEach(btn => {
                btn.addEventListener('click', () => editNews(btn.dataset.id));
            });
            
            document.querySelectorAll('.news-table .btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteNews(btn.dataset.id));
            });
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при загрузке новостей');
        }
    }

    async function loadTeachers() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/teachers`);
            if (!response.ok) throw new Error('Ошибка загрузки преподавателей');
            
            const teachers = await response.json();
            const tbody = document.getElementById('teachersTableBody');
            
            tbody.innerHTML = teachers.map(teacher => `
                <tr>
                    <td>${teacher._id}</td>
                    <td>${teacher.photo ? `<img src="${API_BASE_URL}/uploads/${teacher.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">` : 'Нет фото'}</td>
                    <td>${teacher.name}</td>
                    <td>${teacher.subject}</td>
                    <td>${teacher.experience}</td>
                    <td>
                        <button class="btn btn-edit" data-id="${teacher._id}"><i class="fas fa-edit"></i> Түзөтүү</button>
                        <button class="btn btn-delete" data-id="${teacher._id}"><i class="fas fa-trash"></i> Өчүрүү</button>
                    </td>
                </tr>
            `).join('');
            
            // Помечаем секцию как загруженную
            document.getElementById('teachers-section').dataset.loaded = 'true';
            
            // Навешиваем обработчики
            document.querySelectorAll('.teachers-table .btn-edit').forEach(btn => {
                btn.addEventListener('click', () => editTeacher(btn.dataset.id));
            });
            
            document.querySelectorAll('.teachers-table .btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteTeacher(btn.dataset.id));
            });
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при загрузке преподавателей');
        }
    }

    async function editNews(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/news/${id}`);
            if (!response.ok) throw new Error('Ошибка загрузки новости');
            
            const newsItem = await response.json();
            
            // Заполняем форму
            document.getElementById('newsTitle').value = newsItem.title;
            document.getElementById('newsCategory').value = newsItem.category;
            document.getElementById('newsDate').value = newsItem.date.split('T')[0];
            document.getElementById('newsContent').value = newsItem.content;
            currentNewsId = id;
            
            // Показываем модальное окно
            document.getElementById('newsModalTitle').textContent = 'Жаңылыкты түзөтүү';
            document.getElementById('newsModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при редактировании новости');
        }
    }

    async function editTeacher(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`);
            if (!response.ok) throw new Error('Ошибка загрузки преподавателя');
            
            const teacher = await response.json();
            
            // Заполняем форму
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherSubject').value = teacher.subject;
            document.getElementById('teacherExperience').value = teacher.experience;
            document.getElementById('teacherEducation').value = teacher.education;
            document.getElementById('teacherBio').value = teacher.bio;
            currentTeacherId = id;
            
            // Показываем модальное окно
            document.getElementById('teacherModalTitle').textContent = 'Мугалимди түзөтүү';
            document.getElementById('teacherModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при редактировании преподавателя');
        }
    }

    async function saveNews() {
        const formData = new FormData();
        formData.append('title', document.getElementById('newsTitle').value);
        formData.append('category', document.getElementById('newsCategory').value);
        formData.append('date', document.getElementById('newsDate').value);
        formData.append('content', document.getElementById('newsContent').value);
        
        const imageFile = document.getElementById('newsImage').files[0];
        if (imageFile) formData.append('image', imageFile);
        
        try {
            const url = currentNewsId 
                ? `${API_BASE_URL}/api/news/${currentNewsId}`
                : `${API_BASE_URL}/api/news`;
            
            const method = currentNewsId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                body: formData
            });
            
            if (!response.ok) throw new Error('Ошибка сохранения');
            
            document.getElementById('newsModal').style.display = 'none';
            loadNews();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении новости');
        }
    }

    async function saveTeacher() {
        const formData = new FormData();
        formData.append('name', document.getElementById('teacherName').value);
        formData.append('subject', document.getElementById('teacherSubject').value);
        formData.append('experience', document.getElementById('teacherExperience').value);
        formData.append('education', document.getElementById('teacherEducation').value);
        formData.append('bio', document.getElementById('teacherBio').value);
        
        const photoFile = document.getElementById('teacherPhoto').files[0];
        if (photoFile) formData.append('photo', photoFile);
        
        try {
            const url = currentTeacherId 
                ? `${API_BASE_URL}/api/teachers/${currentTeacherId}`
                : `${API_BASE_URL}/api/teachers`;
            
            const method = currentTeacherId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                body: formData
            });
            
            if (!response.ok) throw new Error('Ошибка сохранения');
            
            document.getElementById('teacherModal').style.display = 'none';
            loadTeachers();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении преподавателя');
        }
    }

    async function deleteNews(id) {
        if (!confirm('Бул жаңылыкты чын эле өчүрүүнү каалайсызбы?')) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Ошибка удаления');
            
            loadNews();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при удалении новости');
        }
    }

    async function deleteTeacher(id) {
        if (!confirm('Бул мугалимди чынымен өчүрүүнү каалайсызбы?')) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Ошибка удаления');
            
            loadTeachers();
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при удалении преподавателя');
        }
    }
});