const express = require("express")

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

module.exports = {
  errorHandler,
  unknownEndpoint,
}
