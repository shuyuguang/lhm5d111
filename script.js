/* script.js (已实现从图标展开的动画效果) */

// --- 状态栏功能 (保持不变) ---
const timeElement = document.getElementById('status-bar-time');
const batteryLiquid = document.getElementById('battery-capsule-liquid');
const batteryLevelText = document.getElementById('battery-capsule-level');
const batteryCapsule = document.getElementById('battery-capsule');
function updateClock() { if (!timeElement) return; const beijingTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false }); timeElement.textContent = beijingTime; }
function setupBattery() { if ('getBattery' in navigator) { navigator.getBattery().then(battery => { const updateBatteryStatus = () => { if (!batteryLevelText || !batteryLiquid) return; const level = Math.round(battery.level * 100); batteryLevelText.textContent = level; batteryLiquid.style.width = `${100 - level}%`; }; updateBatteryStatus(); battery.addEventListener('levelchange', updateBatteryStatus); battery.addEventListener('chargingchange', updateBatteryStatus); }).catch(e => { showStaticFullBattery(); }); } else { showStaticFullBattery(); } }
function showStaticFullBattery() { if (batteryCapsule) { if (batteryLevelText) batteryLevelText.textContent = ''; if (batteryLiquid) batteryLiquid.style.width = '0%'; } }
updateClock(); setInterval(updateClock, 30000); setupBattery();


// --- 主屏幕应用点击功能 (保持不变) ---
document.querySelectorAll('.app-grid .app').forEach(app => {
    app.addEventListener('click', (event) => {
        event.preventDefault();
        const appName = app.querySelector('.app-name').textContent;
        alert('你点击了：' + appName);
    });
});

// --- 【重写】Dock栏应用点击功能，实现展开动画 ---
const screenElement = document.querySelector('.screen');

document.querySelectorAll('.dock .app').forEach(app => {
    app.addEventListener('click', (event) => {
        event.preventDefault();
        
        // 1. 获取目标页面ID和元素
        const targetPageId = app.dataset.target;
        if (!targetPageId) return;
        const targetPage = document.getElementById(targetPageId);
        if (!targetPage) return;

        // 2. 获取屏幕和被点击图标的尺寸和位置信息
        const screenRect = screenElement.getBoundingClientRect();
        const iconRect = app.getBoundingClientRect();

        // 3. 计算动画需要的初始值
        //    - 初始缩放比例 (图标宽度 / 屏幕宽度)
        const startScale = iconRect.width / screenRect.width;
        //    - 初始X轴位移 (图标中心点X - 屏幕中心点X)
        const startX = (iconRect.left + iconRect.width / 2) - (screenRect.left + screenRect.width / 2);
        //    - 初始Y轴位移 (图标中心点Y - 屏幕中心点Y)
        const startY = (iconRect.top + iconRect.height / 2) - (screenRect.top + screenRect.height / 2);

        // 4. 将计算出的值通过CSS变量应用到目标页面
        targetPage.style.setProperty('--start-scale', startScale);
        targetPage.style.setProperty('--start-x', `${startX}px`);
        targetPage.style.setProperty('--start-y', `${startY}px`);
        
        // 5. 激活页面，触发CSS动画
        //    使用一个极短的延时，确保浏览器先应用上面的style属性，再添加class，从而保证动画能正确触发
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 10);

        // 【新增】将点击的图标元素存到页面上，以便返回时使用
        targetPage.dataset.originApp = `[data-target="${targetPageId}"]`;
    });
});

// --- 【修改】为所有返回按钮添加点击监听，实现收起动画 ---
document.querySelectorAll('.back-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const currentPage = event.target.closest('.page');
        if (currentPage) {
            // 如果页面记录了它是由哪个图标打开的，我们就重新计算返回位置
            // 这样即使调整了浏览器窗口大小，返回动画也能定位到正确的位置
            if (currentPage.dataset.originApp) {
                const originApp = document.querySelector(currentPage.dataset.originApp);
                if (originApp) {
                    const screenRect = screenElement.getBoundingClientRect();
                    const iconRect = originApp.getBoundingClientRect();
                    const startScale = iconRect.width / screenRect.width;
                    const startX = (iconRect.left + iconRect.width / 2) - (screenRect.left + screenRect.width / 2);
                    const startY = (iconRect.top + iconRect.height / 2) - (screenRect.top + screenRect.height / 2);
                    
                    currentPage.style.setProperty('--start-scale', startScale);
                    currentPage.style.setProperty('--start-x', `${startX}px`);
                    currentPage.style.setProperty('--start-y', `${startY}px`);
                }
            }
            
            // 移除 .active 类，页面会根据CSS transition自动收回到我们设定的初始位置
            currentPage.classList.remove('active');
        }
    });
});