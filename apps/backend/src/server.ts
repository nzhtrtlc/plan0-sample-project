import app from "./app";

const __PORT__ = 3000;

app.listen(__PORT__, () => {
  console.log(`Backend running on http://localhost:${__PORT__}`);
});
