const pool = require('../db/config');

const createStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, email, marks } = req.body;
        
        const studentResult = await client.query(
            'INSERT INTO students (name, email) VALUES ($1, $2) RETURNING id',
            [name, email]
        );
        
        const studentId = studentResult.rows[0].id;
        
        for (const mark of marks) {
            await client.query(
                'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
                [studentId, mark.subject, mark.score]
            );
        }
        
        await client.query('COMMIT');
        res.status(201).json({ message: 'Student created successfully', id: studentId });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

const getStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const totalResult = await pool.query('SELECT COUNT(*) FROM students');
        const total = parseInt(totalResult.rows[0].count);

        const result = await pool.query(
            'SELECT s.*, json_agg(json_build_object(\'subject\', m.subject, \'score\', m.score)) as marks ' +
            'FROM students s ' +
            'LEFT JOIN marks m ON s.id = m.student_id ' +
            'GROUP BY s.id ' +
            'ORDER BY s.id ' +
            'LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            students: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT s.*, json_agg(json_build_object(\'subject\', m.subject, \'score\', m.score)) as marks ' +
            'FROM students s ' +
            'LEFT JOIN marks m ON s.id = m.student_id ' +
            'WHERE s.id = $1 ' +
            'GROUP BY s.id',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { name, email, marks } = req.body;
        
        const updateResult = await client.query(
            'UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Student not found' });
        }
        
        await client.query('DELETE FROM marks WHERE student_id = $1', [id]);
        
        for (const mark of marks) {
            await client.query(
                'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
                [id, mark.subject, mark.score]
            );
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

const deleteStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        
        const result = await client.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Student not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};