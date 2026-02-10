import request from '@/utils/request';
// 获取用户列表

// export function register(data) {
//   return request({
//     url: '/api/register/register',
//     method: 'post',
//     data
//   });
// }
// export const sendCode = async (data) => {
//   return request({
//     url: '/api/register/sendCode',
//     method: 'get',
//     data
//   });
// }

export const register = async (data) => {

  
   
  return new Promise((resolve) => {
    setTimeout(() => {
       
      resolve({
        code: 200,
        message: '注册成功',
        data:{
          userId: `11111`,
        }
      })
      
    
      // resolve({
      //   success: false,
      //   message: '用户名已存在'
      // })
    }, 1000)
  })
}
  export const sendCode = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            code: '123456' 
          },
          message: '验证码发送成功'
        })
      }, 1000)
    
    })
  }
