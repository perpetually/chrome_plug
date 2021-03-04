// // 非手机号账号配置 目前账号
// const accountObj = {
//   '527646974@qq.com': true,
//   '小草莓们7': true,
//   'mcning0000': true,
//   'cbu-jhkd3619759': true,
//   'cbu-huasheng1': true,
//   'wu382409329': true,
//   'cbu-shyboy121': true,
//   'wydiy258273': true,
//   '竹翁一箭穿心': true,
//   'zy_maya82': true,
//   '心晴yuluo': true,
//   '尼玛天子':true
// }

// 判断是否是手机好
function isPhone(val, accountObj) {
    if (accountObj && accountObj.indexOf(val) !== -1) {
        return true
    }
    let reg = /^1[1-9]\d{9}$/;
    return reg.test(val)
}
