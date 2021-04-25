let Domain = ''
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	// console.log('收到来自content-script的消息：');
	// console.log(request, sender, sendResponse);
    if (request.domain) {
        Domain = request.domain
    }
    let str = '';
    if(request.account&&isPhone(request.account)){
       str = request.account;
        window.localStorage.setItem('account',request.account)
    }
    if(request.sendStart){
        str = '插件正常运行中';
    }
    if(request.break){
        str = '插件：请输入手机号登录，或重试';
    }

    sendResponse(str);
});

function GetCookie(){
    return new Promise(resolve => {
        chrome.cookies.getAll({},function(cookie){
            let arr = [];
            cookie.forEach(item => {
                if(Domain.indexOf(item.domain) !== -1){
                    let str = item.name+'='+item.value;
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
        $.get('http://qcccookie.chanka666.com/QiChaChaCookieInterface', data, function (params) {
            resolve(params);
        }).error(function (err) {
            reject(err)
        })
    })
}
// post
function postRequest(data) {
    return new Promise((resolve, reject) => {
        $.post('http://qcccookie.chanka666.com/QiChaChaCookieInterface',JSON.stringify(data),function (params) {
            resolve(params);
        }).error(function (err) {
            reject(err)
        })
    })
}

function _showDataOnPage(data){
    let close_time = 3000;
    //显示一个桌面通知
    if(window.webkitNotifications){
        var notification = window.webkitNotifications.createNotification(
            'img/icon.png',  // icon url - can be relative
            '企查查请求cookie返回',  // notification title
            data,  // notification body text
            'requireInteraction' //手动关闭
        );
        notification.show();
        // 设置3秒后，将桌面通知dismiss
        setTimeout(function(){notification.cancel();}, close_time);

    }else if(chrome.notifications){
        var opt = {
            type: 'basic',
            title: '企查查请求cookie返回',
            message: data,
            iconUrl: 'img/icon.png',
            // buttons: [{title:'点击此按钮直接去登录'}],
            requireInteraction: true //手动关闭
        }
        chrome.notifications.create('', opt, function(id){
            setTimeout(function(){
                chrome.notifications.clear(id, function(){});
            }, close_time);
        });

        // chrome.notifications.onButtonClicked.addListener((notificationId,index)=>{
        //
        //     console.log(notificationId,index); //当前通知的ID和当前点击按钮的index
        // });
    }else{
        alert(data);
    }

}
// 判断是否是手机好
function isPhone(val) {
    if(val){
        let reg = /^1[1-9]\d{9}$/;
        return reg.test(val)
    }
    return  val
}


// 后台popup
function testBackground() {
    let obj = {};
    obj.phone = window.localStorage.getItem('account');
    console.log(obj);
    return obj;
}
const PhoneObj = {
    '16526214642': 'vip',
    '16526214762': 'vip',
    '16526214639': 'vip',
    '16526214631': 'vip',
    '16526214709': 'vip',
    '16526214670': 'vip',
    '16526214692': 'vip',
    '16526214594': 'vip',
    '16526215145': 'vip',
    '16526214650': 'vip',
    '16506101724': 'vip',
    '16506100782': 'vip',
    '16506103052': 'vip',
    '16506102620': 'vip',
    '16506103082': 'vip',
    '16506101359': 'vip',
    '16506105462': 'vip',
    '16506103114': 'vip',
    '16506104693': 'vip',
    '16506105458': 'vip',
    '16506106941': 'vip',
    '16511868525': 'vip',
    '17171774308': 'vip',
    '15892465274': 'vip',
    '15181004478': 'vip',
    '16602806879': 'vip',
    '13959315162': 'vip',
    '19805934858': 'vip',
    '18367420833': 'vip',

    '17129174370': 'ordinary',
    '17121173919': 'ordinary',
    '18368301810': 'ordinary',
    '17132247929': 'ordinary',
    '17129174373': 'ordinary',
    '17121173917': 'ordinary',
    '17121173918': 'ordinary',
    '17121173920': 'ordinary',
    '17121170863': 'ordinary',
    '17135098441': 'ordinary',
    '17135098442': 'ordinary',
    '17135098443': 'ordinary',
    '17135098445': 'ordinary',

    '17070774998': 'ordinary',
    '17070775014': 'ordinary',
    '17070775024': 'ordinary',
    '17070775034': 'ordinary',
    '17070775094': 'ordinary',
    '17070775142': 'ordinary',
    '17070775145': 'ordinary',
    '17070775164': 'ordinary',
    '17070775174': 'ordinary',
    '17070775184': 'ordinary',
    '17070775194': 'ordinary',
    '17070775247': 'ordinary',
    '17070775249': 'ordinary',
    '17070775274': 'ordinary',
    '17070775284': 'ordinary',
    '17070775314': 'ordinary',
    '17070775348': 'ordinary',
    '17070775364': 'ordinary',
    '17070775374': 'ordinary',
    '17070775418': 'ordinary'

}
// 发送请求
function sendRequest() {
    GetCookie()
        .then(res=>{
            // 获取淘宝账号
            // 请服务器发送淘宝账号和淘宝cookie
            let formData = {
                qccAccount:'',
                qccCookie: res,
                qccAccountType: ''
            };
            // 获取获取到是淘宝页面之后再发送请求
            formData.qccAccount = window.localStorage.getItem('account');
            formData.qccAccountType = PhoneObj[formData.qccAccount];
            console.log(formData);
            console.log(new Date());
            if(!formData.qccAccountType){
                _showDataOnPage('获取异常');
                return false;
            }
            postRequest(formData)
                .then(res=>{
                    console.log(res);
                    _showDataOnPage(res)
                })
                .catch(err=>{
                    console.log(err);
                })
        })
}
