document.addEventListener("DOMContentLoaded", function() {
    const API_BASE_URL = 'https://n-saidiev.onrender.com';
    let currentNewsId = null;
    let currentTeacherId = null;

    initApp();

    function initApp() {
        initMenuNavigation();
        initModals();
        loadNews();
    }

    function initMenuNavigation() {
        const menuLinks = document.querySelectorAll('.admin-menu .menu-link');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
 
                menuLinks.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
                
                const section = this.dataset.section;
                
                switchSection(section);
            });
        });
    }

    function switchSection(section) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(`${section}-section`);
        activeSection.classList.add('active');
        
        if (section === 'news' && !activeSection.dataset.loaded) {
            loadNews();
        } else if (section === 'teachers' && !activeSection.dataset.loaded) {
            loadTeachers();
        }
    }

    function initModals() {
        const newsModal = document.getElementById('newsModal');
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            document.getElementById('newsModalTitle').textContent = 'Жаңы жаңылык кошуу';
            currentNewsId = null;
            document.getElementById('newsForm').reset();
            newsModal.style.display = 'flex';
        });

        const teacherModal = document.getElementById('teacherModal');
        document.getElementById('addTeacherBtn').addEventListener('click', () => {
            document.getElementById('teacherModalTitle').textContent = 'Мугалим кошуу';
            currentTeacherId = null;
            document.getElementById('teacherForm').reset();
            teacherModal.style.display = 'flex';
        });

        document.querySelectorAll('.close-modal, #cancelNewsBtn, #cancelTeacherBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                newsModal.style.display = 'none';
                teacherModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === newsModal) newsModal.style.display = 'none';
            if (e.target === teacherModal) teacherModal.style.display = 'none';
        });

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
            
            document.getElementById('news-section').dataset.loaded = 'true';
            
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
                <td>
                <img src="${teacher.photo || ''}" 
                         style="width:60px;height:60px;border-radius:50%;object-fit:cover;"
                         onerror="this.src=''">

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
            
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherSubject').value = teacher.subject;
            document.getElementById('teacherExperience').value = teacher.experience;
            document.getElementById('teacherEducation').value = teacher.education;
            document.getElementById('teacherBio').value = teacher.bio;
            currentTeacherId = id;
            
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
        formData.append('content', document.getElementById('newsContent').value);
        formData.append('category', document.getElementById('newsCategory').value);
        formData.append('date', document.getElementById('newsDate').value || new Date());
      
        // 2. Добавляем файл если есть
        const imageFile = document.getElementById('newsImage').files[0];
        if (imageFile) {
          // Проверяем тип файла
          if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
            alert('Разрешены только JPG/PNG изображения');
            return;
          }
          formData.append('image', imageFile);
        }
      
        try {
          // 3. Определяем URL и метод
          const url = currentNewsId 
            ? `${API_BASE_URL}/api/news/${currentNewsId}`
            : `${API_BASE_URL}/api/news`;
          
          // 4. Отправляем запрос
          const response = await fetch(url, {
            method: currentNewsId ? 'PUT' : 'POST',
            body: formData,
            // Не устанавливаем Content-Type вручную!
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка сервера');
          }
      
          document.getElementById('newsModal').style.display = 'none';
          loadNews(); 
      
        } catch (error) {
          console.error('Ошибка сохранения:', {
            error: error.message,
            stack: error.stack
          });
          alert(`Ошибка: ${error.message}`);
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