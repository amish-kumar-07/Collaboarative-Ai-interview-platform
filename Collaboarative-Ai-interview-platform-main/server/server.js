const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socketHandler");
const { codexecution, checkStatus } = require("./services/codeexectution");

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const port = 3001;
server.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

