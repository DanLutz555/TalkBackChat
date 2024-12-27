document.getElementById("button").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.text();
    alert("Registered successfully!");
    // הפנה את המשתמש לעמוד הכניסה אחרי ההרשמה
    window.location.href = "sign-in.html";
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
  }
});

document.getElementById("backButton").addEventListener("click", () => {
  // הפנה את המשתמש לעמוד הכניסה
  window.location.href = "sign-in.html";
});
