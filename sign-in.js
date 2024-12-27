document.getElementById("button").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    alert("Logged in successfully!");
    // שמור את הטוקן לשימוש עתידי
    localStorage.setItem("token", data.token);
    // הפנה את המשתמש לעמוד הצ'אט לייב
    window.location.href = "chat.html";
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    alert("Login failed! Please check your credentials.");
  }
});
