document.getElementById('goToGitHub').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/Mozoloa/Community-Notes-Stats-Chrome-Extension" });
});
