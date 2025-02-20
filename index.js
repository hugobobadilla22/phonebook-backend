const express = require('express');
const app = express();
const requestLogger = require('./middlewares/requestLogger');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');
const errorHandler = require('./middlewares/errorHandler');
const unknownEndpoint = require('./middlewares/unknownEndpoint');

app.use(express.static('dist'))
app.use(express.json());
app.use(cors());
// app.use(requestLogger);
// app.use(morgan('tiny'));
morgan.token('body',  req => {
    return JSON.stringify(req.body);
});

app.get('/info', (req, res) => {
    res.send(`
        Phone has info for ${persons.length} people
        <br>
        ${new Date()}
    `);
});

app.get('/api/persons', (req, res) => {
    Person.find({})
        .then(persons => {
            res.json(persons);
        })
});

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    
    Person.findById(id)
        .then(person => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error))
});

app.use(morgan(':method :url: :status :res[content-length] :response-time ms :body'));
app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        });
    }

    Person.findOne({name: body.name}).then(result => {
        if (result) {
            return res.status(400).json({ error: 'name already exists' });
        }

        const person = new Person({
            name: body.name,
            number: body.number
        });

        person.validate()
            .then(() => {
                person.save()
                    .then(savedPerson => {
                        res.json(savedPerson);
                    })
                    .catch(error => {
                        next(error);
                    })
            })
            .catch(error => {
                res.status(400).json({ error: error.message });
            })
    })
    .catch(error => {
        next(error)
    })
});

app.delete('/api/persons/:id', (req, res, next) => {
    const { id } = req.params;
    Person.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => {
            next(error);
        })
});

app.put('/api/persons/:id', (req, res, next) => {
    const { id } = req.params;
    const body = req.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(error => {
            next(error);
        })
});
  
app.use(unknownEndpoint)
app.use(errorHandler)

function generateId() {
    return Math.floor(Math.random() * 100000000);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});