// export const getPassword = (username) => {
//   return request ({
//     url: '/api/get-password',
//     method: 'get',
//     params: { username }

import { el } from "element-plus/es/locales.mjs";

//   });
// }
// export const updatePassword = (data) => {
//   return request({
//     url: '/api/update-password',
//     method: 'post',
//     data, 
//   });
// };
export const getPassword = (username) => {
  if(username == "xixi")
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: '获取密码成功',
                data: {
                    username: "xixi",
                    password: "123456"
                } // 模拟返回的密码
            });
        }, 800); // 模拟800ms的网络延迟   
    })
  else if(username == "admin")
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: '获取密码成功',
                data: {
                    username: "admin",
                    password: "admin123"
                } // 模拟返回的密码
            });
        }, 800); // 模拟800ms的网络延迟   
    })
    else
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: 'success',
                data: {
                    username: username,
                    password: "000000"
                } // 模拟返回的密码
            });
        }, 800); // 模拟800ms的网络延迟   
    })
  
} 
export const updatePassword = async (data) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
              code: 200,
              msg: '密码更新成功',
          });
      }, 800); // 模拟800ms的网络延迟   
  });
};