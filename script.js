// --- 状态栏功能 ---
const timeElement = document.getElementById('status-bar-time');
const batteryLiquid = document.getElementById('battery-capsule-liquid');
const batteryLevelText = document.getElementById('battery-capsule-level');
const batteryCapsule = document.getElementById('battery-capsule');

function updateClock() {
    if (!timeElement) return;
    const beijingTime = new Date().toLocaleString('en-GB', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    timeElement.textContent = beijingTime;
}

function setupBattery() {
    // 检查浏览器是否支持电池API
    if ('getBattery' in navigator) {
        // --- 支持API的设备（如安卓）走这里 ---
        navigator.getBattery().then(battery => {
            const updateBatteryStatus = () => {
                if (!batteryLevelText || !batteryLiquid) return;
                const level = Math.round(battery.level * 100);
                batteryLevelText.textContent = level;
                batteryLiquid.style.width = `${100 - level}%`;
            };
            updateBatteryStatus();
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
        }).catch(e => {
            // 如果获取失败，也提供降级方案
            showStaticFullBattery();
        });
    } else {
        // --- 不支持API的设备（如iOS）走这里 ---
        showStaticFullBattery();
    }
}

// 【修改点】优化了iOS上的显示逻辑
function showStaticFullBattery() {
    if (batteryCapsule) {
        // 在iOS上，只显示满电图标，不显示具体的数字'100'，避免误解
        if (batteryLevelText) batteryLevelText.textContent = ''; // 将数字清空
        
        // 将遮罩层宽度设为0，这样看起来就是满电
        if (batteryLiquid) batteryLiquid.style.width = '0%';
    }
}


// 初始化状态栏
updateClock();
setInterval(updateClock, 30000);
setupBattery();

// --- 保留你原有的应用点击功能 ---
document.querySelectorAll('.app').forEach(app => {
    app.addEventListener('click', (event) => {
        event.preventDefault();
        const appName = app.querySelector('.app-name').textContent;
        alert('你点击了：' + appName);
    });
});