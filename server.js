import express from "express";

const app = express();

app.get("/", (req, res) =>
  res.send(
    "This is DevOps Assignment 2 - Dockerizing a Node.js Application using Dockerfile"
  )
);

app.listen(3000, () => console.log("Server running on port 3000"));
