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
  cloud_name: 'dwt6otwdm',  
  api_key: '188289595742432',       
  api_secret: 'abTsWlbv-pxuJaQqhg_pyKKhQQk'     
});
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

app.use(cors({
  origin: ['https://n-saidiev-xd5k.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

  app.get('/ping', (req, res) => {
    res.send('pong');
  });
  
mongoose.connect('mongodb+srv://bigenemy24:mqQLZXM0Tpa0RZGB@cluster0.7z0okmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const News = mongoose.model('News', {
  title: String,
  content: String,
  category: String,
  date: Date,
  image: String
});
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



const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'school_uploads',
    format: 'jpg',
    public_id: `${Date.now()}-${file.originalname}`
  })
});
const upload = multer({ storage: storage });


app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Серверный код (app.js)
app.get('/api/news/:id', async (req, res) => {
  try {
    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Неверный ID новости' });
    }

    const newsItem = await News.findById(req.params.id);
    
    if (!newsItem) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json(newsItem);
  } catch (err) {
    console.error('Ошибка при получении новости:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/api/news', upload.single('image'), async (req, res) => {
  try {
    const news = new News({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      date: req.body.date || new Date(),
      image: req.file?.secure_url  
    });
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put('/api/news/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      date: req.body.date || new Date()
    };

    if (req.file) {
      updateData.image = req.file.secure_url; // Для Cloudinary
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json(updatedNews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
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
      updateData.photo = req.file.secure_url; // ✅ Используем secure_url
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


app.post('/api/teachers', upload.single('photo'), async (req, res) => {
  console.log('📥 POST /api/teachers');
  console.log('➡️ req.body:', req.body);
  console.log('🖼 req.file:', req.file); // Проверьте, что здесь есть secure_url

  try {
    const teacher = new Teacher({
      name: req.body.name,
      subject: req.body.subject,
      bio: req.body.bio,
      experience: req.body.experience,
      education: req.body.education,
      photo: req.file?.secure_url 
    });
    
    await teacher.save();
    res.status(201).json(teacher); 
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(400).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});


// Удаление преподавателя
app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }
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
