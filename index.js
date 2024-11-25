import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import Person from "./models/person.js";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
morgan.token("req-body", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : "",
);
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body",
  ),
);

app.use(express.static("dist"));

app.get("/info", async (_, res, next) => {
  const date = new Date();
  try {
    const count = await Person.estimatedDocumentCount();

    res.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `);
  } catch (err) {
    next(err);
  }
});

app.get("/api/persons", async (_, res, next) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (err) {
    next(err);
  }
});

app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.sendStatus(404);
    }

    res.json(person);
  } catch (err) {
    next(err);
  }
});

app.post("/api/persons", async (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  try {
    if (await Person.exists({ name })) {
      return res.status(409).json({
        error: "name must be unique",
      });
    }

    const person = new Person({
      name,
      number,
    });

    const newPerson = await person.save();

    res.json(newPerson.toJSON());
  } catch (err) {
    next(err);
  }
});

app.put("/api/persons/:id", async (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: "query" },
    );

    if (!updatedPerson) {
      return res.sendStatus(404);
    }

    res.json(updatedPerson);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

const unknownEndpoint = (_, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// eslint-disable-next-line no-unused-vars -- error handlers must take 4 parameters
const errorHandler = (err, _req, res, _next) => {
  console.error(err.message);

  if (err.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  res.sendStatus(500);
};

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
