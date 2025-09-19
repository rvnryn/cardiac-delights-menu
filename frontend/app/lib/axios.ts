import axios from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
     timeout: 0,
     headers: {
          'Content-Type': 'application/json',
     },
});
export default axiosInstance;
