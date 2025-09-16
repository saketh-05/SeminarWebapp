import express from "express";

const app = express();

app.get("/", (req, res) => res.send("This works! with Docker + AWS EKS 🚀"));

app.listen(3000, () => console.log("Server running on port 3000"));
