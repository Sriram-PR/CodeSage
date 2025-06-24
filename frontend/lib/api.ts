import axios from "axios";

const API_URL = "http://localhost:8000";  // URL for your FastAPI backend

export const analyzeCode = async (code: string, language: string) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { code, language });
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.detail || "Unknown error" };
  }
};
