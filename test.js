const AcmClient = require('./index')

const acmClient = new AcmClient({
  endpoint: 'acm.aliyun.com',
  namespace: '56d00178-1d0b-488a-9bc6-1432c626ae42',
  accessKey: 'xxx',
  secretKey: 'xxx',
  requestTimeout: 6000,
  // json: false // default `true`
})

// 去acm控制台创建一条测试配置：
// group: myGroup
// dataId: myDataId
// {
//   "obj1": {
//     "obj2": {
//       "key": 0
//     }
//   }
// }

// 去acm控制台修改这个myGroup+myDataId的配置，如修改obj1.obj2.key=1
setInterval(() => {
  console.log(acmClient.get('myGroup.myDataId.obj1.obj2.key'))
}, 1000)
