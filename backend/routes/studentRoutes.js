const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth } = require('../middleware/auth');

// 获取所有学生
router.get('/', auth, studentController.getAllStudents);

// 获取单个学生
router.get('/:id', auth, studentController.getStudentById);

// 创建新学生
router.post('/', auth, studentController.createStudent);

// 更新学生信息
router.put('/:id', auth, studentController.updateStudent);

// 删除学生
router.delete('/:id', auth, studentController.deleteStudent);

// 搜索学生
router.get('/search/:query', auth, studentController.searchStudents);

module.exports = router;
    