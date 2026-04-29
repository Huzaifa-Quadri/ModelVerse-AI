import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"}/api/auth`,
    withCredentials: true,
})

export const registerUser = async ({ name, email, password }) => {
    const response = await api.post("/register", { name, email, password });
    return response.data;
}

export const loginUser = async ({email, password}) => {
    const response = await api.post("/login", {email, password});
    return response.data;
}

export const logoutUser = async () => {
    const response = await api.post("/logout");
    return response.data;
}

export const getMe = async () => {
    const response = await api.get("/get-me");
    return response.data;
}