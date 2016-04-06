/* globals chrome, window */

chrome.browserAction.onClicked.addListener(function() { 
    
    chrome.tabs.captureVisibleTab(function(dataUrl) {

        var tabUrl = chrome.extension.getURL("screenshot.html?id=" + Date.now());
        
        chrome.tabs.onUpdated.addListener(function updateListener(tabId, changeInfo) {
            
            if (changeInfo.status !== "complete") {
                return;   
            }
            
            chrome.tabs.onUpdated.removeListener(updateListener);

            var views = chrome.extension.getViews();
            for (var i = 0; i < views.length; i++) {
                var view = views[i];
                if (view.location.href === tabUrl) {
                    view.setImage(dataUrl);  
                    break;
                }
            }
        });
        
        chrome.tabs.create({url: tabUrl});
    });
});

