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
                    <td>${item.image ? `<img src="${item.image}" style="width:60px;height:40px;object-fit:cover;">` : 'Нет фото'}</td>
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

  // Загрузка преподавателей (исправленная версия)
async function loadTeachers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/teachers`);
        if (!response.ok) throw new Error('Ошибка загрузки преподавателей');
        
        const teachers = await response.json();
        const tbody = document.getElementById('teachersTableBody');
        
        tbody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>${teacher._id}</td>
                <td>
                    ${teacher.photo  `<img src="${teacher.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">`}
                </td>
                <td>${teacher.name}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.experience}</td>
                <td>
                    <button class="btn teacher-edit" data-id="${teacher._id}">
                        <i class="fas fa-edit"></i> Түзөтүү
                    </button>
                    <button class="btn teacher-delete" data-id="${teacher._id}">
                        <i class="fas fa-trash"></i> Өчүрүү
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Навешиваем обработчики с уникальными классами
        document.querySelectorAll('.teacher-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTeacher(btn.dataset.id);
            });
        });
        
        document.querySelectorAll('.teacher-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTeacher(btn.dataset.id);
            });
        });
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке преподавателей');
    }
}

// Сохранение преподавателя (исправленная версия)
async function saveTeacher() {
    const name = document.getElementById('teacherName').value;
    const subject = document.getElementById('teacherSubject').value;
    
    if (!name || !subject) {
        alert('Пожалуйста, заполните обязательные поля (Имя и Предмет)');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('subject', subject);
    formData.append('experience', document.getElementById('teacherExperience').value);
    formData.append('education', document.getElementById('teacherEducation').value);
    formData.append('bio', document.getElementById('teacherBio').value);
    
    const photoFile = document.getElementById('teacherPhoto').files[0];
    if (photoFile) {
        if (!photoFile.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            return;
        }
        formData.append('photo', photoFile);
    }

    try {
        const url = currentTeacherId 
            ? `${API_BASE_URL}/api/teachers/${currentTeacherId}`
            : `${API_BASE_URL}/api/teachers`;
        
        const method = currentTeacherId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Ошибка сохранения');
        }
        
        document.getElementById('teacherModal').style.display = 'none';
        loadTeachers();
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert(`Ошибка: ${error.message}`);
    }
}

async function editNews(id) {
    try {
      // 1. Проверка ID
      if (!id) throw new Error('ID новости не указан');
  
      console.log('Пытаемся загрузить новость с ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
  
      if (response.status === 404) {
        throw new Error('Новость не найдена на сервере');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ошибка ${response.status}: ${errorText}`);
      }
  
      const newsItem = await response.json();
      if (!newsItem || !newsItem._id) {
        throw new Error('Сервер вернул пустые данные');
      }
  
      document.getElementById('newsTitle').value = newsItem.title || '';
      document.getElementById('newsCategory').value = newsItem.category || '';
      
      const newsDate = newsItem.date ? new Date(newsItem.date) : new Date();
      document.getElementById('newsDate').value = newsDate.toISOString().split('T')[0];
      
      document.getElementById('newsContent').value = newsItem.content || '';
      currentNewsId = id;
  
      document.getElementById('newsModalTitle').textContent = 'Жаңылыкты түзөтүү';
      document.getElementById('newsModal').style.display = 'flex';
  
    } catch (error) {
      console.error('Полная ошибка:', {
        message: error.message,
        stack: error.stack,
        id: id
      });
      alert(`Ошибка при открытии новости: ${error.message}`);
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
        // 1. Валидация обязательных полей
        const title = document.getElementById('newsTitle').value;
        const content = document.getElementById('newsContent').value;
        
        if (!title || !content) {
          alert('Заполните обязательные поля: заголовок и содержание');
          return;
        }
      
        // 2. Подготовка FormData
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', document.getElementById('newsCategory').value);
        formData.append('date', document.getElementById('newsDate').value || new Date());
      
        // 3. Добавление изображения если есть
        const imageInput = document.getElementById('newsImage');
        if (imageInput.files[0]) {
          formData.append('image', imageInput.files[0]);
        }
      
        try {
          // 4. Определение URL и метода
          const url = currentNewsId 
            ? `${API_BASE_URL}/api/news/${currentNewsId}`
            : `${API_BASE_URL}/api/news`;
          
          const method = currentNewsId ? 'PUT' : 'POST';
      
          // 5. Отправка запроса
          const response = await fetch(url, {
            method,
            body: formData,
            // headers НЕ нужны для FormData - браузер установит автоматически
          });
      
          // 6. Обработка ответа
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
          }
      
          // 7. Успешное сохранение
          const result = await response.json();
          console.log('Успешно сохранено:', result);
          
          document.getElementById('newsModal').style.display = 'none';
          loadNews(); // Обновляем список новостей
          
        } catch (error) {
          console.error('Полная ошибка сохранения:', {
            error: error.message,
            stack: error.stack,
            currentNewsId,
            formData: [...formData.entries()] // Логируем данные формы
          });
          alert(`Ошибка сохранения: ${error.message}`);
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