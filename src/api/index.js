import axios from './axios';

// export const getUser = params => axios.get('/api/user', params);

// 查询有数据的地级市列表
export const getCityList = params => axios.get('/api/datacapsule/statistics/overview/cityList', { params });

// 查询地级市总的数量/有数据的地级市数量
export const getCityCount = params => axios.get('/api/datacapsule/statistics/overview/cityCount',{ params });