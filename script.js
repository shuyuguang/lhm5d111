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

// --- Dock栏应用点击功能，实现展开动画 (保持不变) ---
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
        const startScale = iconRect.width / screenRect.width;
        const startX = (iconRect.left + iconRect.width / 2) - (screenRect.left + screenRect.width / 2);
        const startY = (iconRect.top + iconRect.height / 2) - (screenRect.top + screenRect.height / 2);

        // 4. 将计算出的值通过CSS变量应用到目标页面
        targetPage.style.setProperty('--start-scale', startScale);
        targetPage.style.setProperty('--start-x', `${startX}px`);
        targetPage.style.setProperty('--start-y', `${startY}px`);
        
        // 5. 激活页面，触发CSS动画
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 10);

        targetPage.dataset.originApp = `[data-target="${targetPageId}"]`;
    });
});

// --- 为所有返回按钮添加点击监听，实现收起动画 (保持不变) ---
document.querySelectorAll('.back-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const currentPage = event.target.closest('.page');
        if (currentPage) {
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
            
            currentPage.classList.remove('active');
        }
    });
});


// --- 【新增功能】页面头部视图切换图标循环 ---

// 1. 定义一个包含所有图标类名的数组，按循环顺序列出
//    注意：这里要包含 'fa-solid'，因为我们会替换整个 className
const viewIconClasses = [
    'fa-solid fa-list-ul',        // 状态 0
    'fa-solid fa-table-cells-large', // 状态 1
    'fa-solid fa-grip'              // 状态 2
];

// 2. 选中所有页面中需要切换的图标
//    '.page-header-actions' 里的第一个 '.action-item' 里的 'i' 标签
const viewToggleIcons = document.querySelectorAll('.page-header-actions .action-item:first-child i');

// 3. 为每个图标添加点击事件
viewToggleIcons.forEach(icon => {
    // 为每个图标初始化一个自定义数据属性 'data-view-index' 来追踪当前状态
    // 初始状态为 0，对应数组中的 'fa-solid fa-list-ul'
    icon.dataset.viewIndex = 0; 

    icon.addEventListener('click', () => {
        // a. 从 data 属性获取当前状态索引，并转为数字
        let currentIndex = parseInt(icon.dataset.viewIndex, 10);

        // b. 计算下一个状态的索引。
        //    (currentIndex + 1) % 3 的结果会是 1, 2, 0, 1, 2... 完美实现循环
        let nextIndex = (currentIndex + 1) % viewIconClasses.length;

        // c. 从数组中获取新的类名，并更新到图标的 className 属性上
        icon.className = viewIconClasses[nextIndex];

        // d. 将新的索引存回 data 属性，为下一次点击做准备
        icon.dataset.viewIndex = nextIndex;
    });
});