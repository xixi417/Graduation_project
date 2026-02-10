import request from '@/utils/request';
// 获取用户列表

// export function login(data) {
//   return request({
//     url: '/api/register/login',
//     method: 'post',
//     data
//   });
//}
export const login = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '登录成功',
        data: {
          userId: `111111`,
        }
      })
    
    
      // resolve({
      //   success: false,
      //   message: '用户名已存在'
      // })
    }, 1000)
  })
}