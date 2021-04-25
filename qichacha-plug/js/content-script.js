
var ACCOUNT = '';
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
	// 如果是老登陆页 return
	if (loginPage()) {
		return
	}
	// // 进入企查查页面
	let domain = location.href
	if(domain.indexOf('.qcc.com') !== -1 || domain.indexOf('.qichacha.com') !== -1)
    {
		sendMessageToBackground({domain: document.domain});
    	let naviBtn = document.querySelector('.navi-btn')
		if (naviBtn) {
			naviBtn.addEventListener('click', function () {
				addBtn().then(_ => {
					sendCookie()
				})
			})
		}
		//不向下执行
		return false;
    }
});
// 还原之前的登陆
function loginPage() {
	if(location.href.indexOf('www.qcc.com/user_login')!==-1)
	{
		if(document.querySelector('#nameNormal')){
			addBtn('qichacha1')
				.then(_ => {
					let account = document.querySelector('#nameNormal');
					// 点击是就去获取当前账号
					document.querySelector('#qichacha1').addEventListener('click',function(){
						if(isPhone(account.value)){
							tip('发送成功')
							sendMessageToBackground({account:account.value});
							setTimeout(()=>{
								document.querySelector('.m-t-md.login-btn').click();
							},100)
						}else{
							tip('未找到企查查登录手机号')
						}
					})
				})
		}
		//不向下执行
		return true
	}
	return false
}

// 模拟输入
const SimulatedInputChange = (dom,val) =>
{
	if(!dom) return;
    let times = timeFun();
	return new Promise(resolve => {
		setTimeout(()=>{
            dom.value = val;
            resolve({code:1})
		},times)
	})
}
// 模拟点击
const SimulatedClick = (dom) =>
{
    if(!dom) return;
    let times = timeFun();
    return new Promise(resolve => {
        setTimeout(()=>{
            dom.click();
            resolve({code:1})
        },times)
    })
}

// 随机一到两秒
function timeFun(val,val1)
{
	let minute = 60 * 1000;
	let second = 1000;
	val = val ? (val*Math.random()*30) * minute : second;
	val1 = val1 ? val1 * minute : 1000;
    // 随机一到两秒
	return Math.random() * val + val1;
}

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行
function sendMessageToBackground(data) {
	chrome.runtime.sendMessage(data, function(res) {
		if(!res){
			return;
		}
		// 返回是否是手机号
		if(isPhone(res)){
            ACCOUNT = res;
		}else{
            tip(res);
		}
	});
}
// 判断是否是手机好
function isPhone(val) {
    let reg = /^1[1-9]\d{9}$/;
    return reg.test(val)
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


async function addBtn(id) {
	id = id || 'qichacha'
	var ele = $('.login-btn');
	var dom = $('<botton class="btn btn-primary btn-block" id="'+ id +'">向插件发送账号</botton>');
	if (document.querySelector('#' + id)) {
		await null
		return
	}
	await ele.before(dom)
}

function sendCookie() {
	let account = document.querySelector('#nameNormal');
	if(account){
		// 点击是就去获取当前账号
		document.querySelector('#qichacha').addEventListener('click',function(){
			if(isPhone(account.value)){
				tip('发送成功')
				sendMessageToBackground({account:account.value});
				setTimeout(()=>{
					document.querySelector('.login-btn').click();
				},100)
			}else{
				tip('未找到企查查登录手机号')
			}
		})
	}
}
