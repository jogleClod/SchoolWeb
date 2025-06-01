const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const cors = require('cors');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'cloudinary_3d_fe727e39-11b8-4374-a7c6-640033ca057b',     // замени на свое
  api_key: '188289595742432',           // замени на свое
  api_secret: 'abTsWlbv-pxuJaQqhg_pyKKhQQk'      // замени на свое
});
// Логируем каждый запрос
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('  Body:', req.body);
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
      console.log('  (Ожидается файл)');
    }
  }
  next();
});

// Настройки CORS для разработки
app.use(cors({
    origin: ['https://n-saidiev-xd5k.onrender.com'], // Разрешаем оба варианта
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));

  app.get('/ping', (req, res) => {
    res.send('pong');
  });
  
// Подключение MongoDB
mongoose.connect('mongodb+srv://bigenemy24:mqQLZXM0Tpa0RZGB@cluster0.7z0okmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Модель новости
const News = mongoose.model('News', {
  title: String,
  content: String,
  category: String,
  date: Date,
  image: String
});
// Модель преподавателя
const Teacher = mongoose.model('Teacher', {
  name: String,
  subject: String,
  bio: String,
  photo: String,
  experience: String,   
  education: String    
});

const Students = mongoose.model('Students', {
  name: String,
  class: String,
  achievements: String,
  description: String,
  badges: [String],
  image: String
});
app.get('/api/students', async (req, res) => {
  try {
    const students = await Students.find();
    res.json(students);
  } catch (err) {
    console.error('Ошибка при загрузке студентов:', err);
    res.status(500).json({ error: 'Ошибка сервера при загрузке студентов' });
  }
});



// Настройка загрузки файлов
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'school_uploads',
    format: 'jpg',
    public_id: `${Date.now()}-${file.originalname}`
  })
});
const upload = multer({ storage: storage });


// API Endpoints
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    const news = new News({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      date: req.body.date || new Date(),
      image: req.file?.path
    });
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Обновление преподавателя
// ОБНОВЛЕНИЕ ПРЕПОДАВАТЕЛЯ
app.put('/api/teachers/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      subject: req.body.subject,
      bio: req.body.bio,
      experience: req.body.experience,
      education: req.body.education,
    };

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }

    res.json(updatedTeacher);
  } catch (err) {
    console.error('Ошибка при обновлении преподавателя:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении' });
  }
});

// Получение всех студентов




app.delete('/api/news/:id', async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение всех преподавателей
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Получение одного преподавателя по ID
app.get('/api/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Преподаватель не найден' });

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Добавление преподавателя
app.post('/api/teachers', upload.single('photo'), async (req, res) => {
  console.log('📥 POST /api/teachers');
  console.log('➡️ req.body:', req.body);
  console.log('🖼 req.file:', req.file); // вот здесь будет вся информация от Cloudinary
  
  try {
    const teacher = new Teacher({
      name: req.body.name,
      subject: req.body.subject,
      bio: req.body.bio,
      experience: req.body.experience,
      education: req.body.education,
      photo: req.file?.path 
    });
    
    await teacher.save();
    res.status(201).json({ success: true, teacher });
  }  catch (err) {
    console.error('Ошибка при добавлении преподавателя:', err);
    res.status(400).json({ 
      success: false, 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});


// Удаление преподавателя
app.delete('/api/teachers/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Получение одного студента по ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Students.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Студент не найден' });
    }
    res.json(student);
  } catch (err) {
    console.error('Ошибка при получении студента:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/students', upload.single('image'), async (req, res) => {
  console.log('📥 POST /api/students');
  console.log('➡️ req.body:', req.body);
  console.log('🖼 req.file:', req.file); // вот здесь будет вся информация от Cloudinary
  try {
    const newStudent = new Students({
      name: req.body.name,
      class: req.body.class,
      achievements: req.body.achievements,
      description: req.body.description,
      badges: req.body.badges ? req.body.badges.split(',').map(b => b.trim()) : [],
      image: req.file?.path
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Ошибка при добавлении студента:', err);
    res.status(500).json({ error: 'Ошибка сервера при добавлении' });
  }
});
// Удаление студента
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Students.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/students/:id', upload.single('image'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Неверный ID студента' });
    }

    const updateData = {
      name: req.body.name,
      class: req.body.class,
      achievements: req.body.achievements,
      description: req.body.description,
      badges: req.body.badges ? req.body.badges.split(',').map(b => b.trim()) : [],
    };

    if (req.file) {
      updateData.image = req.file.path; // Используем path от Cloudinary
    }

    const updatedStudent = await Students.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Студент не найден' });
    }

    res.json(updatedStudent);
  } catch (err) {
    console.error('Ошибка обновления:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
});

// Статические файлы
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5501;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
