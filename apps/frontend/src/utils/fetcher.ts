export const API_URI = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export const fetcher = (...args: Parameters<typeof fetch>) =>
   fetch(...args).then((res) => res.json());
