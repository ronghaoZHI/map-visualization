import axios from "axios";

let config = {
  baseURL: "/",
  timeout: 15 * 1000, // Timeout
  // withCredentials: true // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    // if (store && store.state.token) {
    //   config.headers.common['Authorization'] = config.headers.token = store.state.token || ''
    // }
    config.headers["Content-Type"] = "application/json;charset=UTF-8";
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  (response) => {
    // Do something with response
    const code = response.data.code;
    if (code === 401) {
     
    } else if (code === 20026) {
      // 待完善...
    } else if (code !== 200 && code !== undefined) {
			console.log(response.data)
    }
    return response.data;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);
export default _axios;