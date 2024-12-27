// content.js

console.log("[content.js] Loaded. This proves the content script ran!");

/**
 * Utility to inject a script into the actual web page context.
 */
function injectPageScript(fileName) {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(fileName);
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

/**
 * Inject all 4 scripts in a specific order:
 *   1) interceptor.js
 *   2) parser.js
 *   3) domInjector.js
 *   4) mainInject.js
 */
function injectAllScripts() {
    console.log("[content.js] Injecting all scripts now...");
    injectPageScript("interceptor.js");
    injectPageScript("parser.js");
    injectPageScript("domInjector.js");
    injectPageScript("mainInject.js");
}

/**
 * Patch history so we get a 'locationchange' event on client-side nav.
 * Also listen for popstate and dispatch the same event.
 */
(function patchHistory() {
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
    };

    // Listen for back/forward navigation with popstate
    window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
    });
})();

/**
 * Fallback: Timer-based location check, in case X doesn't reliably
 * use pushState/replaceState/popstate. Dispatches 'locationchange'
 * if the URL has changed since last check.
 */
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        window.dispatchEvent(new Event("locationchange"));
    }
}, 500); // ~2 times per second

/**
 * locationchange handler: If we're on a Birdwatch detail page
 * and the URL doesn't have ?forceRefresh=1, we add it and reload once.
 * If it does have forceRefresh=1, we inject scripts so X re-fetches data.
 */
window.addEventListener("locationchange", () => {
    const currentUrl = location.href;
    console.log("[content.js] location changed ->", currentUrl);

    // Example check: Are we on a Birdwatch or "communitynotes" page?
    if (currentUrl.includes("/i/birdwatch/t/") || currentUrl.includes("/i/communitynotes/t/")) {
        // If no ?forceRefresh=1 in the URL, add it once and reload
        if (!currentUrl.includes("forceRefresh=1")) {
            console.log("[content.js] Birdwatch page w/o forceRefresh param -> reloading with it...");
            const sep = currentUrl.includes("?") ? "&" : "?";
            const newUrl = currentUrl + sep + "forceRefresh=1";
            location.replace(newUrl);
            return; // stop
        }

        // If the URL DOES have forceRefresh=1, we inject scripts once
        console.log("[content.js] Birdwatch page with forceRefresh=1 -> injecting scripts...");
        injectAllScripts();
    }
});

// Also run once at the very start:
// If you happen to load a Birdwatch page directly with forceRefresh=1 in the URL
// or any other scenario, we can check that too.
(function initialCheck() {
    const currentUrl = location.href;
    console.log("[content.js] Initial check ->", currentUrl);

    // Are we already on Birdwatch with forceRefresh=1?
    if ((currentUrl.includes("/i/birdwatch/t/") || currentUrl.includes("i/communitynotes/t/")) && currentUrl.includes("forceRefresh=1")) {
        console.log("[content.js] Direct load with forceRefresh=1 -> injecting scripts...");
        injectAllScripts();
    }
})();
