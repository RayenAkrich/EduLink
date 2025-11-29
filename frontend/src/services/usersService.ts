import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getUsers = () => axios.get(API_URL, getAuthHeaders());
export const createUser = (data: any) => axios.post(API_URL, data, getAuthHeaders());
export const updateUser = (id: number, data: any) =>
  axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
export const deleteUser = (id: number) => axios.delete(`${API_URL}/${id}`, getAuthHeaders());