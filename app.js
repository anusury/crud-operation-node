const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { check, ValidationResult, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// mysql connection part done here

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'abhartech',
});

connection.connect();

//validation part i had used  express-validator

const validateEmployeeInput = [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').notEmpty().isEmail().withMessage('Enter valid email').normalizeEmail(),
    check('department').notEmpty().withMessage('Department is required'),
    check('age').notEmpty().isNumeric().withMessage('Give a Valid Age'),
    check('salary').notEmpty().isNumeric().withMessage('Enter a salary in Numeric value'),
    check('position').notEmpty().withMessage('Position is Required')
]

// post method 

app.post('/api/employees', validateEmployeeInput, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, age, position, salary, email, department } = req.body;
    console.log(req.body, 'yyyyyyyyyyyy');
    connection.query('SELECT * FROM employees WHERE email =?', [email], (error, result) => {
        if (error) throw error;
        if (result.length > 0) {
            return res.status(400).json({ message: 'email is already in use' });
        }
    })
    const sql = 'INSERT INTO employees(name,age,position,salary,email,department) VALUES(?,?,?,?,?,?)';
    connection.query(sql, [name, age, position, salary, email, department], (error, results) => {
        if (error) throw error;
        res.json({ id: results.insertId, ...req.body });
    })
})

//get method

app.get('/api/employees', (req, res) => {
    connection.query('SELECT * FROM employees', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//get method with id 

app.get('/api/employees/:id', (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
    const employeeId = res.params.id;
    console.log(employeeId, 'iddddddddddddd');
    connection.query('SELECT * FROM employees WHERE id = ?', [employeeId], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' })
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(result[0]);

    })
})

//put method with id 

app.put('/api/employees/:id', validateEmployeeInput, (res, req) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const employeeId = res.params.id;
    console.log(employeeId, 'putby id');
    const { name, age, position, salary, email, department } = req.body;
    connection.query('SELECT * FROM employees WHERE email = ? AND id <> ?', [email, employeeId], (error, result) => {
        if (error) {
            console.error(error, 'putmethod error');
            return res.status(500).json({ message: 'internal server issue' })
        }
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' })
        }
    })
    const sql = 'UPDATE employees SET name=?, age=?, position=?, salary=?, email=?, department=? where id=?';
    connection.query(sql, [name, age, position, salary, email, department, employeeId], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' })
        }
        res.json({ id: employeeId, ...req.body });
        console.log(req.body, 'vvvvvvvvvvvv')
    });
});

//delete method 

app.delete('/api/employees/:id', (res, req) => {
    const employeeId = res.params.id;
    connection.query('DELETE FROM employees WHERE id=?', [employeeId], (error) => {
        if (error) throw error;
        res.json({ message: 'Employeee record sucussfully deleted' });
    })
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
