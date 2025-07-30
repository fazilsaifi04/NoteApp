import axios from "axios";

const instance = axios.create({
  baseURL: "https://noteapp-fv2x.onrender.com/api/v1",
  withCredentials: true,
});

export default instance;
