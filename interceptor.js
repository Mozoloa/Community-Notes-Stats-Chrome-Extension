// interceptor.js
(function () {
    // Prevent multiple patches
    if (window.__birdwatchInterceptorPatched) {
        console.log("[Interceptor] XHR already patched, skipping re-patch.");
        return;
    }
    window.__birdwatchInterceptorPatched = true;

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
            if (this._url && this._url.includes("BirdwatchFetchNotes")) {
                console.log("[Interceptor] Intercepted Birdwatch request:", this._url);

                try {
                    const data = JSON.parse(this.responseText);

                    // Parse the result using parser
                    const extractedData = window.BirdwatchParser.parseData(data);
                    console.log("[Interceptor] extractedData:", extractedData);

                    // Dispatch a custom event with the extracted data
                    const event = new CustomEvent('BirdwatchDataReady', { detail: extractedData });
                    window.dispatchEvent(event);

                } catch (err) {
                    console.log("[Interceptor] Response not JSON or parse error:", err);
                }
            }
        });

        return originalSend.apply(this, [body]);
    };

    console.log("[Interceptor] XHR override initialized in page context.");
})();
