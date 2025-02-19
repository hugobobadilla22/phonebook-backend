const express = require('express');
const app = express();
const requestLogger = require('./middlewares/requestLogger');
const morgan = require('morgan');
const cors = require('cors');

app.use(express.json());
app.use(cors())
// app.use(requestLogger);
// app.use(morgan('tiny'));
morgan.token('body',  req => {
    return JSON.stringify(req.body);
});

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get('/info', (req, res) => {
    res.send(`
        Phone has info for ${persons.length} people
        <br>
        ${new Date()}
    `);
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const person = persons.find(person => person.id === id);

    if (!person) {
        res.status(404).end();
    }
    res.json(person);
});

app.use(morgan(':method :url: :status :res[content-length] :response-time ms :body'));
app.post('/api/persons', (req, res) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number issing'
        });
    }

    const personAlreadyExists = persons.find(person => person.name === body.name);

    if (personAlreadyExists) {
        return res.status(400).json({
            error: 'name must be unique'
        });
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    };

    persons = persons.concat(person);
    res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
    const { id } = req.params;
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

function generateId() {
    return Math.floor(Math.random() * 100000000);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});