const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://danluts:ABR7749@cluster0.cbmh7bs.mongodb.net/chat-games?retryWrites=true&w=majority&appName=user",
    {
  
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

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
  const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
    expiresIn: "1h",
  });
  res.json({ token });
});

// הגדרת הנתיב לתיקיית CLIENT
app.use(express.static(path.join(__dirname, "../client")));

// הפניית כל הבקשות שאינן ל-API לעמוד ה-Sign In
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client","sign-in.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
