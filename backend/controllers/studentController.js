const { v4: uuidv4 } = require('uuid');

// 获取所有学生
exports.getAllStudents = (req, res) => {
    const db = req.db;
    const className = req.query.class || 'all';
    
    let query = 'SELECT * FROM students ORDER BY name ASC';
    const params = [];
    
    if (className !== 'all') {
        query = 'SELECT * FROM students WHERE className = ? ORDER BY name ASC';
        params.push(className);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
};

// 获取单个学生
exports.getStudentById = (req, res) => {
    const db = req.db;
    const id = req.params.id;
    
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: '学生不存在' });
        }
        res.json(row);
    });
};

// 创建新学生
exports.createStudent = (req, res) => {
    const db = req.db;
    const { idNumber, name, className, gender, phone, email, address } = req.body;
    
    // 检查学号是否已存在
    db.get('SELECT * FROM students WHERE idNumber = ?', [idNumber], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        
        if (row) {
            return res.status(400).json({ message: '该学号已存在' });
        }
        
        const student = {
            id: uuidv4(),
            idNumber,
            name,
            className,
            gender,
            phone,
            email: email || '',
            address: address || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const sql = `INSERT INTO students (
            id, idNumber, name, className, gender, phone, email, address, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
            student.id, student.idNumber, student.name, student.className, student.gender,
            student.phone, student.email, student.address, student.createdAt, student.updatedAt
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ 
                message: '学生添加成功',
                id: student.id
            });
        });
    });
};

// 更新学生信息
exports.updateStudent = (req, res) => {
    const db = req.db;
    const id = req.params.id;
    const { idNumber, name, className, gender, phone, email, address } = req.body;
    
    // 检查学生是否存在
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ message: '学生不存在' });
        }
        
        // 如果学号改变了，检查新学号是否已存在
        if (idNumber !== row.idNumber) {
            db.get('SELECT * FROM students WHERE idNumber = ? AND id != ?', [idNumber, id], (err, existing) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                
                if (existing) {
                    return res.status(400).json({ message: '该学号已存在' });
                }
                
                performUpdate();
            });
        } else {
            performUpdate();
        }
        
        function performUpdate() {
            const updatedAt = new Date().toISOString();
            
            const sql = `UPDATE students SET 
                idNumber = ?, 
                name = ?, 
                className = ?, 
                gender = ?, 
                phone = ?, 
                email = ?, 
                address = ?, 
                updatedAt = ? 
                WHERE id = ?`;
            
            const params = [
                idNumber, name, className, gender, phone, 
                email || '', address || '', updatedAt, id
            ];
            
            db.run(sql, params, function(err) {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                res.json({ message: '学生信息已更新' });
            });
        }
    });
};

// 删除学生
exports.deleteStudent = (req, res) => {
    const db = req.db;
    const id = req.params.id;
    
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ message: '学生不存在' });
        }
        
        db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.json({ message: '学生已删除' });
        });
    });
};

// 搜索学生
exports.searchStudents = (req, res) => {
    const db = req.db;
    const query = req.params.query.toLowerCase();
    
    db.all(
        "SELECT * FROM students WHERE LOWER(idNumber) LIKE ? OR LOWER(name) LIKE ? ORDER BY name ASC",
        [`%${query}%`, `%${query}%`],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.json(rows);
        }
    );
};
    