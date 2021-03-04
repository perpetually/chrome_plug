const httpObj = {
    1: 'https://i.taobao.com/my_taobao.htm',
    2: 'https://www.taobao.com',
    3: 'https://cart.taobao.com/cart.htm',
    4: 'https://msg.taobao.com/message/list.htm',
    5: 'https://shoucang.taobao.com/item_collect.htm',
    6: 'https://shoucang.taobao.com/shop_collect_list.htm',
    7: 'https://inv.tmall.com/buyer/invoiceList.htm',
    8: 'https://member1.taobao.com/member/fresh/deliver_address.htm',
    9: 'https://vip.taobao.com/vip_growth.htm'
};
var ACCOUNT = '';
var ACCOUNTObj = [];
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function () {
    // // 进入淘宝页面点击微博登录
    if (location.host.indexOf('login.taobao.com') !== -1) {
        const {account, password, loginForm} = getCodeName()
        if (document.querySelector(loginForm)) {
            // 调用自己的按钮
            appendLogin();
            // 进页面先读一次缓存
            sendMessageToBackground({account: 111});
            // 点击是就去获取当前账号
            document.querySelector(loginForm).addEventListener('click', function () {
                sendMessageToBackground({
                    account: document.querySelector(account).value,
                    password: document.querySelector(password).value
                })
            })
            // 5分钟还在登录页面就发出提醒
            setTimeout(() => {
                sendMessageToBackground({sendStart: true, tbAccount: ''})
            }, 5 * 60 * 1000)
        }
        //不向下执行
        return false;
    }
    // 登录后进入淘宝页面
    if (location.host.indexOf('.taobao.com') !== -1 || location.host.indexOf('.tmall.com') !== -1) {
        setTimeout(() => {
        	let j_UserNick = document.querySelector('.site-nav-login-info-nick') || document.querySelector('.j_UserNick')
            let tbAccount = j_UserNick ? j_UserNick.innerText : '';
            if (document.querySelector('.login-info-nick')) {
                tbAccount = document.querySelector('.login-info-nick').innerText
            }
            console.log(tbAccount);
            // 告诉后台到指定页面了，可以与服务器交互了
            sendMessageToBackground({sendStart: true, tbAccount: tbAccount})
        }, timeFun());

        let t = setInterval(() => {
            window.location.reload()
        }, timeFun(1, 2))
    }

});
// 模拟输入
const SimulatedInputChange = (dom, val) => {
    if (!dom) return;
    let times = timeFun();
    return new Promise(resolve => {
        setTimeout(() => {
            dom.value = val;
            resolve({code: 1})
        }, times)
    })
}
// 模拟点击
const SimulatedClick = (dom) => {
    if (!dom) return;
    let times = timeFun();
    return new Promise(resolve => {
        setTimeout(() => {
            dom.click();
            resolve({code: 1})
        }, times)
    })
}

// 随机一到两秒
function timeFun(val, val1) {
    let minute = 60 * 1000;
    let second = 1000;
    val = val ? (val * Math.random() * 90) * minute : second;  // val有值 最小为 0 最大为 90 分钟
    val1 = val1 ? val1 * 10 * minute : 1000;// val1=2  最小值为10*2 = 20分钟
    // 随机一到两秒  有值则随机  20 + （0 ~ 90） =  min 20 max 110 里的随机任意时间
    return Math.random() * val + val1;
}

// 接收来自后台的消息
function appendLogin() {
    const {subBtnWrap, subBtn, top} = getCodeName()
    // 遮住原来的登录按钮
    let copyLogin = $('<div>')
        .addClass('copyLogin')
        .css({
            position: 'absolute',
            top: top,
            left: 0,
            width: '300px',
            height: '42px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            zIndex: 10,
            cursor: 'pointer'
        });
    // 如果有就不添加了,登录下的ul
    $(subBtnWrap).css('position', 'relative').append(copyLogin)
        .on('click', '.copyLogin', function () {
            // 是手机号就登录
            if (isPhone(ACCOUNT, ACCOUNTObj)) {
                document.querySelector(subBtn).click();
            } else {
                // 不是手机号就提醒
                sendMessageToBackground({break: true});
            }
        })
}

/**
 *@params
 *@desc 返回form 表单的相关元素
 *@returns obj: { account, password, loginForm, subBtn, subBtnWrap }
 *@date 2020/3/20 14:14
 */
function getCodeName() {
    let obj = {}
    // 老版本的账号信息
    obj.account = '#TPL_username_1'
    obj.password = '#TPL_password_1'
    obj.loginForm = '#J_LoginBox'
    obj.subBtn = '#J_SubmitStatic'
    obj.subBtnWrap = '#J_OtherLogin'
    obj.top = '-66px'
    // 新版本的账号信息
    let form = document.querySelector('#login-form')
    if (form) {
        obj.account = '#fm-login-id'
        obj.password = '#fm-login-password'
        obj.loginForm = '#login-form'
        obj.subBtn = '.password-login'
        obj.subBtnWrap = '.fm-btn'
        obj.top = 0
    }
    return obj
}

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行
function sendMessageToBackground(data) {
    chrome.runtime.sendMessage(data, function (res) {
        if (!res) {
            return;
        }
        // 返回是否是手机号
        let accountArr = res.split('+-');
        let account = accountArr[0];
        ACCOUNTObj = accountArr[2] ? JSON.parse(accountArr[2]) : []
        if (isPhone(account, ACCOUNTObj)) {
            ACCOUNT = accountArr[0];
            if (location.host.indexOf('login.taobao.com') !== -1) {
                const {account, password} = getCodeName()
                if (!document.querySelector(account).value) {
                    setTimeout(() => {
						            document.querySelector(account).value = ACCOUNT;
                    }, 1000)
                }
                if (!document.querySelector(password).value) {
                    setTimeout(() => {
						            document.querySelector(password).value = accountArr.length > 1 ? accountArr[1] : '';
                    }, 1000)
                }
            }
        } else {
            if (res.indexOf('+-') !== -1) {
                return
            }
            tip(res);
            if (res.indexOf('中,') !== -1) {
                let arr = res.split(',');
                let str = arr.length > 1 ? arr[1] : '';
                accountShow(str);
            }
        }
    });
}


var tipCount = 0;

// 简单的消息通知
function tip(info) {
    info = info || '';
    var ele = document.createElement('div');
    ele.className = 'chrome-plugin-simple-tip slideInLeft';
    ele.style.top = tipCount * 70 + 20 + 'px';
    ele.innerHTML = `<div>${info}</div>`;
    document.body.appendChild(ele);
    ele.classList.add('animated');
    tipCount++;
    setTimeout(() => {
        ele.style.top = '-100px';
        setTimeout(() => {
            ele.remove();
            tipCount--;
        }, 400);
    }, 3000);
}


function accountShow(str) {
    if (!str) {
        return;
    }
    if (document.querySelector('.accountShow')) {
        document.body.removeChild(document.querySelector('.accountShow'));
    }
    var ele = document.createElement('div');
    ele.className = 'accountShow';
    ele.innerHTML = `${str}`;
    document.body.appendChild(ele)
}
