const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { codexecution, checkStatus } = require("./services/codeexectution");

const app = express();


app.use(cors());
app.use(bodyParser.json());


app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"]
}));


app.post("/submit", async (req, res) => {
  const { code, language_id, questionid } = req.body;

  try {
    
    const token = await codexecution(code, language_id, questionid);

    t
    const judgeResult = await checkStatus(token);

    res.json({
      judgeResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
