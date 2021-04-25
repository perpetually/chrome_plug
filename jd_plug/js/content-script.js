var ACCOUNT = '';
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
	// // 进入拼多多页面
  let domain = location.href
//  https://www.jd.com/
  if(domain.indexOf('.jd.com') !== -1) {
    sendMessageToBackground({domain: document.domain});
	let naviBtn = document.querySelector('#content');
    if (naviBtn) {
//    全局的id="app",点击右上角账号密码登录login-form   login-tab login-tab-r
      $('#content').on('click', '.login-form', function () {
				addBtn().then(_ => {
					sendCookie()
				})
			})
		}
		//不向下执行
		return false;
	}
})

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
//插件名称，登录按钮上一级
	id = id || 'jdPlug'
//	login-btn
	var ele = $('.login-btn');
	var dom = $('<botton class="jd-btn" id="'+ id +'">向插件发送账号</botton>');
	if (document.querySelector('#' + id)) {
		return
	}
	ele.append(dom)
}

function sendCookie() {
//输入账号

	let account = document.querySelector('#loginname');
	if(account){
    // 点击是就去获取当前账号
    $('#content').on('click', '#jdPlug', function () {
			if(account.value){
				tip('发送成功')
				sendMessageToBackground({account:account.value});
				setTimeout(()=>{
					console.log(3333333);
					// 登录按钮点击
					document.querySelector('.loginsubmit').click();
				},100)
			}else{
				tip('未找到京东登录手机号')
			}
		})
	}
}
