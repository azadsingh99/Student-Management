const validateStudent = (req, res, next) => {
    const { name, email, marks } = req.body;

    // Validate required fields
    if (!name || !email || !marks) {
        return res.status(400).json({
            message: 'Name, email, and marks are required'
        });
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({
            message: 'Name must be between 2 and 100 characters'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    // Validate marks
    if (!Array.isArray(marks) || marks.length === 0) {
        return res.status(400).json({
            message: 'Marks must be a non-empty array'
        });
    }

    for (const mark of marks) {
        if (!mark.subject || typeof mark.subject !== 'string') {
            return res.status(400).json({
                message: 'Each mark must have a subject name'
            });
        }

        if (typeof mark.score !== 'number' || mark.score < 0 || mark.score > 100) {
            return res.status(400).json({
                message: 'Score must be a number between 0 and 100'
            });
        }
    }

    next();
};

module.exports = {
    validateStudent
};