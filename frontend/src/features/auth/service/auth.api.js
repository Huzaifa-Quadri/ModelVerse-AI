import axios from "axios";

const api = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
})

export const registerUser = async ({username, email, password}) => {
    const response = await api.post("/register", {username, email, password});
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