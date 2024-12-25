// domInjector.js
(function () {
  window.DomInjector = {
    injectStats(extractedData) {
      console.log("[DomInjector] injectStats called with:", extractedData);

      function getHueFromPercent(percent) {
        // Same logic as before
        const interpolatedPercent = Math.min(
          100,
          Math.max(0, ((percent - 70) * 100) / 40)
        );
        return 120 * (interpolatedPercent / 100);
      }

      extractedData.forEach((note) => {
        const searchText = note.text.slice(0, 30);
        const candidateEls = document.querySelectorAll('div[dir="ltr"].css-146c3p1');

        for (const el of candidateEls) {
          const span = el.querySelector("span.css-1jxf684");
          if (span && span.innerText.includes(searchText)) {
            // Prevent injecting multiple stats for the same note
            if (span.parentElement.querySelector("#birdwatch-stats")) {
              console.log("[DomInjector] Stats already injected for this note.");
              break;
            }

            const statsDiv = document.createElement("div");
            statsDiv.id = "birdwatch-stats";

            const name = note.alias
              .split("-")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            const totalPositive =
              note.successfulRatings.helpful + note.successfulRatings.notHelpful;
            const Negative =
              note.unsuccessfulRatings.helpful +
              note.unsuccessfulRatings.notHelpful * 2;

            // Alias line
            const aliasDiv = document.createElement("div");
            aliasDiv.classList.add("aliasDiv", "css-1jxf684");
            aliasDiv.textContent = name;

            const scoreDiv = document.createElement("div");
            scoreDiv.classList.add("scoreDiv");

            // RATING
            const ratingText = document.createElement("div");
            ratingText.classList.add("text", "commonSpan", "leftRound");
            ratingText.textContent = "Rating";

            const ratingPercent = document.createElement("div");
            ratingPercent.classList.add("ratingPercent", "commonSpan", "rightRound");
            const totalRatingRatings = totalPositive + Negative;
            const ratingPercentCalc =
              totalRatingRatings > 0
                ? ((totalPositive / totalRatingRatings) * 100).toFixed(0)
                : 0;
            ratingPercent.textContent = `${ratingPercentCalc}%`;
            const ratingPercentHue = getHueFromPercent(ratingPercentCalc);
            ratingPercent.style.backgroundColor = `hsl(${ratingPercentHue}, 100%, 10%)`;
            ratingPercent.style.color = `hsl(${ratingPercentHue}, 100%, 50%)`;

            const ratingPos = document.createElement("div");
            ratingPos.classList.add("positiveScore", "commonSpan", "leftRound");
            ratingPos.textContent = `${totalPositive}`;

            const ratingNeg = document.createElement("div");
            ratingNeg.classList.add("negativeScore", "commonSpan", "rightRound");
            ratingNeg.textContent = `${Negative}`;

            scoreDiv.appendChild(ratingText);
            scoreDiv.appendChild(ratingPercent);
            scoreDiv.appendChild(ratingPos);
            scoreDiv.appendChild(ratingNeg);

            // WRITING
            const writingText = document.createElement("div");
            writingText.classList.add("text", "commonSpan", "leftRound");
            writingText.textContent = "Writing";

            const writingPercent = document.createElement("div");
            writingPercent.classList.add("writingPercent", "commonSpan", "rightRound");
            const totalWritingRatings =
              note.writingRatings.helpful + note.writingRatings.notHelpful;
            const writingPercentCalc =
              totalWritingRatings > 0
                ? ((note.writingRatings.helpful / totalWritingRatings) * 100).toFixed(0)
                : 0;
            writingPercent.textContent = `${writingPercentCalc}%`;
            const writingPercentHue = getHueFromPercent(writingPercentCalc);
            writingPercent.style.backgroundColor = `hsl(${writingPercentHue}, 100%, 10%)`;
            writingPercent.style.color = `hsl(${writingPercentHue}, 100%, 50%)`;

            const writingPos = document.createElement("div");
            writingPos.classList.add("positiveScore", "commonSpan", "leftRound");
            writingPos.textContent = `${note.writingRatings.helpful}`;

            const writingNeg = document.createElement("div");
            writingNeg.classList.add("negativeScore", "commonSpan", "rightRound");
            writingNeg.textContent = `${note.writingRatings.notHelpful}`;

            scoreDiv.appendChild(writingText);
            scoreDiv.appendChild(writingPercent);
            scoreDiv.appendChild(writingPos);
            scoreDiv.appendChild(writingNeg);

            statsDiv.appendChild(aliasDiv);
            statsDiv.appendChild(scoreDiv);

            // Insert right before the span
            span.insertAdjacentElement("beforebegin", statsDiv);

            console.log("[DomInjector] Stats injected successfully.");
            break; // Found a match, break out of loop
          }
        }
      });
    },
  };

  console.log("[DomInjector] domInjector.js loaded.");

  /**
   * Listen for the custom 'BirdwatchDataReady' event
   * and use MutationObserver to inject stats when DOM is ready.
   */
  window.addEventListener('BirdwatchDataReady', (event) => {
    const extractedData = event.detail;
    console.log("[DomInjector] Received BirdwatchDataReady event with data:", extractedData);

    /**
     * Function to check if target elements are present
     * and inject stats if they are.
     */
    function checkAndInject() {
      const targetElements = document.querySelectorAll('div[dir="ltr"].css-146c3p1');
      if (targetElements.length > 0) {
        window.DomInjector.injectStats(extractedData);
        return true; // Injection done
      }
      return false; // Still waiting
    }

    // Attempt immediate injection in case elements are already present
    if (checkAndInject()) {
      return;
    }

    // Set up a Mutation Observer to watch for changes in the DOM
    const observer = new MutationObserver((mutations, obs) => {
      if (checkAndInject()) {
        obs.disconnect(); // Stop observing once injection is done
      }
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("[DomInjector] MutationObserver set up to watch for target elements.");
  });
})();
