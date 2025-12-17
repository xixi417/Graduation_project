import axios from "axios";

//创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});

//请求拦截器
request.interceptors.response.use(
    (config) => {
        const res = response.data;
        if(res.code !== 200){
            return Promise.reject(new Error(res.message || 'Error'));
        }
        else
            return res;
    },
    (error) => {
        console.error('服务器出错：', error);
        return Promise.reject(error);
    }
)
export default request;