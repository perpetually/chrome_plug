$(function() {

	// 加载设置
	var defaultConfig = {color: 'white'}; // 默认配置
	chrome.storage.sync.get(defaultConfig, function(items) {
		document.body.style.backgroundColor = items.color;
	});

	// 初始化国际化
	$('#test_i18n').html(chrome.i18n.getMessage("helloWorld"));


});

// 打开后台页
$('#open_background').click(e => {
	window.open(chrome.extension.getURL('background.html'));
});
// 调用后台JS
$('#invoke_background_js').click(e => {
	getTbAccount(1);
});
// 获取手机号
getTbAccount();
// 获取后台页标题
$('#get_background_title').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	alert(bg.document.title);
});

// 设置后台页标题
$('#set_background_title').click(e => {
	var title = prompt('请输入background的新标题：', '这是新标题');
	var bg = chrome.extension.getBackgroundPage();
	bg.document.title = title;
	alert('修改成功！');
});

// 清除后台缓存
// 设置后台页标题
$('#clear_btn').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	bg.localStorage.setItem('account', '')
	bg.localStorage.setItem('password', '')
	bg.localStorage.setItem('tbAccount', '')
	tip('清除成功')
});

// 自定义窗体大小
$('#custom_window_size').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		var startLeft = 10;
		chrome.windows.update(currentWindow.id,
		{
			left: startLeft * 10,
			top: 100,
			width: 800,
			height: 600
		});
		var inteval = setInterval(() => {
			if(startLeft >= 40) clearInterval(inteval);
			chrome.windows.update(currentWindow.id, {left: (++startLeft) * 10});
		}, 50);
	});
});

// 最大化窗口
$('#max_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen'
		chrome.windows.update(currentWindow.id, {state: 'maximized'});
	});
});
// 新增用户名
$('#add_btn').click(function () {
	// 输入的用户名
	const Val = $("#add_text").val()
	const Name = $(this).text()
	// 与background通信
  const bg = chrome.extension.getBackgroundPage()
	// 现在保存的用户名
	const accountArr = bg.accountObj
	if (!Val) {
    tip('请输入淘宝用户名')
		return
	}
	if (accountArr.includes(Val)) {
    tip('用户名已存在')
		return
	}

	var data = JSON.stringify({ 'taoBaoAccount': Val })

	$(this).attr('disabled', true).text('添加中...')
	let _this = this
  $.post('http://tbcookie.chanka666.com/putCustomAccount', data, function (params) {
    $('#add_text').val('')

    bg.queryName()
			.then(_ => {
				tip('新增成功')
				// 还原
        reductionBtn(_this, Name)
				// 重置ul
        const Name1 = $('#query_btn').text()
        const account_ul = $('#account_ul')
        const accountArr = bg.accountObj
        account_ul.html('')
        if (Name1 === '收起') {
          accountArr.forEach(item => {
            account_ul.append(`<li>${item}</li>`)
          })
        }
			})
			.catch(err => {
        // 还原
        reductionBtn(_this, Name)
        tip(JSON.stringify(err))
			})
  }).error(function () {
    // 还原
    reductionBtn(_this, Name)
		tip('新增失败')
	})
});

function reductionBtn (_this, Name) {
	// 延迟还原
	setTimeout(() => {
    $(_this).removeAttr('disabled').text(Name)
	}, 500)
}

// 查看
$('#query_btn').click(function () {
	const Name = $(this).text()
	const account_ul = $('#account_ul')
  const bg = chrome.extension.getBackgroundPage()
  // 现在保存的用户名
  const accountArr = bg.accountObj
  account_ul.html('')
	if (Name === '查看') {
    accountArr.forEach(item => {
      account_ul.append(`<li>${item}</li>`)
    })
    $(this).text('收起')
	} else {
    $(this).text('查看')
	}
})

// 最小化窗口
$('#min_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen'
		chrome.windows.update(currentWindow.id, {state: 'minimized'});
	});
});

// 打开新窗口
$('#open_new_window').click(() => {
	chrome.windows.create({state: 'maximized'});
});

// 关闭全部
$('#close_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		chrome.windows.remove(currentWindow.id);
	});
});

// 新标签打开网页
$('#open_url_new_tab').click(() => {
	chrome.tabs.create({url: 'https://www.baidu.com'});
});

// 当前标签打开网页
$('#open_url_current_tab').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: 'https://login.taobao.com'});
	});
});
// 淘宝首页
$('#open_url_current_tab1').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: 'https://www.taobao.com'});
	});
});
// 我的淘宝
$('#open_url_current_tab2').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: 'https://i.taobao.com'});
	});
});
// 已买到的宝贝
$('#open_url_current_tab3').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: 'https://trade.taobao.com/trade/itemlist/list_bought_items.htm'});
	});
});

// 获取当前标签ID
$('#get_current_tab_id').click(() => {
	getCurrentTab(tab => {
		chrome.tabs.update(tab.id, {url: tab.url});
	});
});

// 高亮tab
$('#highlight_tab').click(() => {
	chrome.tabs.highlight({tabs: 0});
});

// popup主动发消息给content-script
$('#send_message_to_content_script').click(() => {
	sendMessageToContentScript('你好，我是popup！', (response) => {
		if(response) alert('收到来自content-script的回复：'+response);
	});
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	sendResponse('');
});

// popup与content-script建立长连接
$('#connect_to_content_script').click(() => {
	getCurrentTabId((tabId) => {
		var port = chrome.tabs.connect(tabId, {name: 'test-connect'});
		port.postMessage({question: '你是谁啊？'});
		port.onMessage.addListener(function(msg) {
			alert('收到长连接消息：'+msg.answer);
			if(msg.answer && msg.answer.startsWith('我是'))
			{
				port.postMessage({question: '哦，原来是你啊！'});
			}
		});
	});
});

// 复制
function copyUrl2() {
	var Url2 = document.getElementById("phone");
	Url2.select(); // 选择对象
	document.execCommand("Copy"); // 执行浏览器复制命令
	tip('复制成功')
}

// 获得淘宝手机号
function getTbAccount(copy) {
	var bg = chrome.extension.getBackgroundPage();
	let obj = bg.testBackground();
	$('#phone').val(obj.phone||'未登录或登录异常');
	$('#taoBaoAccount').text(obj.taoBaoAccount);
	if(copy){
		if(!obj.phone){
			tip('请用手机号登录淘宝');
			return false
		}
		copyUrl2(obj.phone)
	}
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}
// 获取当前选项卡
function getCurrentTab(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0]: null);
	});
}

// 这2个获取当前选项卡id的方法大部分时候效果都一致，只有少部分时候会不一样
function getCurrentTabId2()
{
	chrome.windows.getCurrent(function(currentWindow)
	{
		chrome.tabs.query({active: true, windowId: currentWindow.id}, function(tabs)
		{
			if(callback) callback(tabs.length ? tabs[0].id: null);
		});
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}

// 向content-script注入JS片段
function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
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

// 演示2种方式操作DOM

// 修改背景色
$('#update_bg_color').click(() => {
	executeScriptToCurrentTab('document.body.style.backgroundColor="red";')
});

// 修改字体大小
$('#update_font_size').click(() => {
	sendMessageToContentScript({cmd:'update_font_size', size: 42}, function(response){});
});

// 显示badge
$('#show_badge').click(() => {
	chrome.browserAction.setBadgeText({text: 'New'});
	chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
});

// 隐藏badge
$('#hide_badge').click(() => {
	chrome.browserAction.setBadgeText({text: ''});
	chrome.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
});

// 显示桌面通知
$('#show_notification').click(e => {
	chrome.notifications.getAll(function (object,notifications) {
		for(variable in object){
			chrome.notifications.clear(variable)
		}
	})
});

$('#check_media').click(e => {
	alert('即将打开一个有视频的网站，届时将自动检测是否存在视频！');
	chrome.tabs.create({url: 'http://www.w3school.com.cn/tiy/t.asp?f=html5_video'});
});
