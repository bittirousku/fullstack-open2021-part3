const express = require("express")
const { v4: uuidv4 } = require("uuid")
const morgan = require("morgan")
const cors = require("cors")

const app = express()

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

let people = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
]

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${people.length} people</p><p> ${new Date()}</p>`
  )
})

app.get("/api/people", (req, res) => {
  res.json(people)
})

app.get("/api/people/:id", (req, res) => {
  let id = Number(req.params.id)
  let person = people.find((person) => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.post("/api/people", (req, res) => {
  let person = req.body
  if (!person || !person.name || !person.number) {
    return res.status(404).send({ error: "data missing" })
  }
  if (people.some((pers) => pers.name === person.name)) {
    return res.status(404).send({ error: "name must be unique" })
  }
  // person.id = uuidv4()
  person.id = generateId()
  people.push(person)
  console.log(person)
  res.json(person)
})

app.delete("/api/people/:id", (req, res) => {
  let id = Number(req.params.id)
  console.log(id)
  people = people.filter((person) => person.id !== id)
  console.log(people)
  res.status(204).end()
  // TODO: better message for failed deletion
})

const generateId = () => {
  const maxId = people.length > 0 ? Math.max(...people.map((n) => n.id)) : 0
  return maxId + 1
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
