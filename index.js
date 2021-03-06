require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
const errorHandlers = require("./middleware/errorHandlers")

const app = express()

// Middleware
morgan.token("body", (req, res) => JSON.stringify(req.body))

app.use(express.static("build"))
app.use(express.json())

// The morgan configuration was copy-pasted from my 2019 solution
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ")
  })
)
app.use(cors())

// Routes
app.get("/info", (req, res) => {
  Person.find({}).then((people) => {
    res.send(
      `<p>Phonebook has info for ${
        people.length
      } people</p><p> ${new Date()}</p>`
    )
  })
})

app.get("/api/people", (req, res) => {
  Person.find({}).then((people) => res.json(people))
})

app.get("/api/people/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((err) => {
      next(err)
    })
})

app.put("/api/people/:id", (req, res, next) => {
  Person.findByIdAndUpdate(
    req.params.id,
    { number: req.params.number },
    { new: true }
  )
    .then((updated) => {
      console.log("updated person", updated)
      res.json(updated)
    })
    .catch((err) => next(err))
})

app.post("/api/people", (req, res, next) => {
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
      // why in the example this is explicitly turned into JSON string?
      // It works as well without a call to toJSON
      // res.json(person.toJSON())
    })
    .catch((err) => next(err))
})

app.delete("/api/people/:id", (req, res, next) => {
  Person.findOneAndDelete(req.params.id)
    .then((result) => res.status(204).end())
    .catch((err) => next(err))
})

// Error handler middlwares must be called last
app.use(errorHandlers.errorHandler)
app.use(errorHandlers.unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
