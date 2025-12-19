// export const getPassword = (account) => {
//   return request ({
//     url: '/api/get-password',
//     method: 'get',
//     params: { account }

//   });
// }
// export const updatePassword = (data) => {
//   return request({
//     url: '/api/update-password',
//     method: 'post',
//     data, 
//   });
// };
export const getPassword = (account) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: '获取密码成功',
                data: {
                    password: "123456"
                } // 模拟返回的密码
            });
        }, 800); // 模拟800ms的网络延迟   
})
}
export const updatePassword = async (data) => {
  try {
    const response = await axios.post('/api/change-password', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data; // 返回后端返回的数据
  } catch (error) {
    throw new Error('后端返回错误'); // 抛出错误，被 try...catch 捕获
  }
};