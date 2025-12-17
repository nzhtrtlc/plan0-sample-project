export const initTheme = () =>
  document.documentElement.classList.toggle(
    "dark",
    localStorage.getItem("theme") === "dark"
  );
