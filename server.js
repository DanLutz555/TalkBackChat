require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));
//User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isConnected: { type: Boolean, default: false },
});
//Message Schema
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Message = mongoose.model("Message", MessageSchema);

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  res.status(201).send("User registered");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }
  user.isConnected = true;
  await user.save();
  const token = jwt.sign(
    { id: user._id, email: user.email },
    "your_jwt_secret",
    {
      expiresIn: "1h",
    }
  );
  io.emit("userStatusUpdate", { email: user.email, isConnected: true }); // עדכון הסטטוס שמשתמש מחובר
  io.emit("systemMessage", { message: `${user.email} connected` });
  res.json({ token ,email: user.email});
});

app.post("/logout", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.isConnected = false;
    await user.save();
    io.emit("userDisconnected", {email});
    io.emit('systemMessage',{message:`${user.email} disconnected`})
  }
  res.status(200).send("User logged out");
});

app.use(express.static(path.join(__dirname, "../client")));

app.get("/sign-in", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "sign-in.html"));
});

app.get("/users", async (req, res) => {
  const users = await User.find({}, "email isConnected"); //{isConnected: true}
  res.json(users);
});
// Get chat messages
app.get("/messages", async (req, res) => {
  const messages = await Message.find()
    .populate("sender", "email")
    .sort("timestamp");
  res.json(messages);
});

io.on("connection", (socket) => {
  console.log("New client connected");
  //handle incoming chat messages
  socket.on("chatMessage", async (data) => {
    const { content, token } = data;
    try{
      const decoded=jwt.verify(token,"your_jwt_secret")
        const sender=await User.findById(decoded.id)
    
      if (sender) {
        const message = new Message({ sender: sender._id, content });
        await message.save();
        io.emit("chatMessage", { content, sender: sender.email });
      }
      }catch(err){
        console.error('Invalid token',err)
      }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
    socket.on("userDisconnected", async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        user.isConnected = false;
        await user.save();
        io.emit("userStatusUpdate", { email, isConnected: false });
      }
    });
});
server.listen(3000, () => console.log("Server running on port 3000"));
