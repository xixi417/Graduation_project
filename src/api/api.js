import request from '@/utils/request';
// 获取用户列表

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  });
}
export function fetchUserList(params) {
  return request({
    url: '/api/users',
    method: 'get',
    params: params
  });
}