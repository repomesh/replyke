import axios from "axios";

export const BASE_URL = "https://api.replyke.com/v7";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
