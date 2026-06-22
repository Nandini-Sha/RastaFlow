import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const predictPriority = (data: any) =>
  API.post("/predict", data);