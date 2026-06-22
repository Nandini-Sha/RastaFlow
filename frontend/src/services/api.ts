import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8000",
// });
const API = axios.create({
  baseURL: "https://rastaflow-1.onrender.com",
});

export const predictPriority = (data: any) =>
  API.post("/predict", data);