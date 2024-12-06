document.getElementById('goToGitHub').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/" });
});
