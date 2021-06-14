// * Listen to tab change
chrome.tabs.onActivated.addListener(() => handleTabChange());

function queueCheck(isMoving) {
    if (isMoving) chrome.alarms.create('re-check', { when: Date.now() + 100 });
}

// * Listen to alarm (alternative of setTimeout)
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 're-check') queueCheck(handleTabChange());
});

// * Listen to new tabs created
chrome.tabs.onCreated.addListener(() => handleTabChange());

// * Handle new tab / tab change.
function handleTabChange() {
    chrome.windows.getAll({ populate: true }, function (windows) {
        var window = windows.filter(function (x) {
            return x.type === 'normal' && x.focused && x.tabs && x.tabs.length;
        })[0];

        if (window === undefined) return;
        var tab = window.tabs.find(tab => tab.active);
        if (!['https://stackoverflow.com', 'chrome://'].includes(tab.url)) {
            // * Uncomment the line below to close any new tabs created that aren't stackoverflow or chrome://.
            // chrome.tabs.remove(tab.id);
        }
        chrome.tabs.move(tab.id, { index: tab.index }, () => {
            queueCheck(chrome.runtime.lastError !== undefined && chrome.runtime.lastError.message.indexOf('dragging') !== -1);
        });
    });
}
