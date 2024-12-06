(function () {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener('load', function () {
            if (this._url.includes('BirdwatchFetchNotes')) {
                console.log('Intercepted Birdwatch');
                try {
                    const data = JSON.parse(this.responseText);

                    const result = data?.data?.tweet_result_by_rest_id?.result || {};
                    const notMisleadingNotes = result.not_misleading_birdwatch_notes?.notes || [];
                    const misleadingNotes = result.misleading_birdwatch_notes?.notes || [];
                    const allNotes = [...notMisleadingNotes, ...misleadingNotes];

                    const extractedData = allNotes.map(note => {
                        return {
                            alias: note.birdwatch_profile.alias,
                            successfulRatings: {
                                helpful: note.birdwatch_profile.ratings_count.successful.helpful_count,
                                notHelpful: note.birdwatch_profile.ratings_count.successful.not_helpful_count,
                                total: note.birdwatch_profile.ratings_count.successful.total
                            },
                            unsuccessfulRatings: {
                                helpful: note.birdwatch_profile.ratings_count.unsuccessful.helpful_count,
                                notHelpful: note.birdwatch_profile.ratings_count.unsuccessful.not_helpful_count,
                                total: note.birdwatch_profile.ratings_count.unsuccessful.total
                            },
                            writingRatings: {
                                helpful: note.birdwatch_profile.notes_count.currently_rated_helpful,
                                notHelpful: note.birdwatch_profile.notes_count.currently_rated_not_helpful
                            },
                            text: note.data_v1?.summary?.text || ""
                        };
                    });

                    console.log('Extracted Notes data for Community Notes Stats extension:', extractedData);

                    // Attempt to place stats near the matched text
                    setTimeout(() => {
                        function getHueFromPercent(percent) {
                            const interpolatedPercent = Math.min(100, Math.max(0, (percent - 70) * 100 / 40));
                            // Interpolate hue between 0 (red) and 120 (green)
                            const hue = 120 * (interpolatedPercent / 100); // Scale percent to 0-120 range
                            // logging all the calculations
                            console.log('percent:', percent);
                            console.log('interpolatedPercent:', interpolatedPercent);
                            console.log('hue:', hue);
                            // Return HSL color with full saturation and lightness at 50%
                            return hue;
                        }


                        extractedData.forEach(note => {
                            const searchText = note.text.slice(0, 30);
                            const candidateEls = document.querySelectorAll('div[dir="ltr"].css-146c3p1');

                            for (const el of candidateEls) {
                                const span = el.querySelector('span.css-1jxf684');
                                if (span && span.innerText.includes(searchText)) {
                                    const statsDiv = document.createElement('div');
                                    statsDiv.id = 'birdwatch-stats';

                                    const name = note.alias.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                    const totalPositive = note.successfulRatings.helpful + note.successfulRatings.notHelpful;
                                    const Negative = note.unsuccessfulRatings.helpful + (note.unsuccessfulRatings.notHelpful * 2);

                                    const aliasDiv = document.createElement('div');
                                    aliasDiv.classList.add('aliasDiv', 'css-1jxf684');
                                    aliasDiv.textContent = `${name}`;

                                    const scoreDiv = document.createElement('div');
                                    scoreDiv.classList.add('scoreDiv');

                                    const ratingText = document.createElement('div');
                                    ratingText.classList.add('text', "commonSpan", "leftRound");
                                    ratingText.textContent = 'Rating';

                                    const ratingPercent = document.createElement('div');
                                    ratingPercent.classList.add('ratingPercent', "commonSpan", "rightRound");
                                    const totalRatingRatings = totalPositive + Negative;
                                    const ratingPercentCalc = totalRatingRatings > 0 ? ((totalPositive / totalRatingRatings) * 100).toFixed(0) : 0;
                                    ratingPercent.textContent = `${ratingPercentCalc}%`;
                                    const ratingPercentHue = getHueFromPercent(ratingPercentCalc);
                                    ratingPercent.style.backgroundColor = `hsl(${ratingPercentHue}, 100%, 10%)`;
                                    ratingPercent.style.color = `hsl(${ratingPercentHue}, 100%, 50%)`;
                                    // changes the color depending on the percentage in a smooth way

                                    const ratingPos = document.createElement('div');
                                    ratingPos.classList.add('positiveScore', "commonSpan", "leftRound");
                                    ratingPos.textContent = `${totalPositive}`;

                                    const ratingNeg = document.createElement('div');
                                    ratingNeg.classList.add('negativeScore', "commonSpan", "rightRound");
                                    ratingNeg.textContent = `${Negative}`;

                                    scoreDiv.appendChild(ratingText);
                                    scoreDiv.appendChild(ratingPercent);
                                    scoreDiv.appendChild(ratingPos);
                                    scoreDiv.appendChild(ratingNeg);


                                    const writingText = document.createElement('div');
                                    writingText.classList.add('text', "commonSpan", "leftRound");
                                    writingText.textContent = 'Writing';

                                    const writingPercent = document.createElement('div');
                                    writingPercent.classList.add('writingPercent', "commonSpan", "rightRound");
                                    const totalWritingRatings = note.writingRatings.helpful + note.writingRatings.notHelpful;
                                    const writingPercentCalc = totalWritingRatings > 0 ? ((note.writingRatings.helpful / totalWritingRatings) * 100).toFixed(0) : 0;
                                    writingPercent.textContent = `${writingPercentCalc}%`;
                                    const writingPercentHue = getHueFromPercent(writingPercentCalc);
                                    writingPercent.style.backgroundColor = `hsl(${writingPercentHue}, 100%, 10%)`;
                                    writingPercent.style.color = `hsl(${writingPercentHue}, 100%, 50%)`;

                                    const writingPos = document.createElement('div');
                                    writingPos.classList.add('positiveScore', "commonSpan", "leftRound");
                                    writingPos.textContent = `${note.writingRatings.helpful}`;

                                    const writingNeg = document.createElement('div');
                                    writingNeg.classList.add('negativeScore', "commonSpan", "rightRound");
                                    writingNeg.textContent = `${note.writingRatings.notHelpful}`;

                                    scoreDiv.appendChild(writingText);
                                    scoreDiv.appendChild(writingPercent);
                                    scoreDiv.appendChild(writingPos);
                                    scoreDiv.appendChild(writingNeg);

                                    statsDiv.appendChild(aliasDiv);
                                    statsDiv.appendChild(scoreDiv);

                                    // Insert right before the span
                                    span.insertAdjacentElement('beforebegin', statsDiv);

                                    break;
                                }
                            }
                        });
                    }, 2000);

                } catch (e) {
                    console.log('Response not JSON or failed to parse', e);
                }
            }
        });
        return originalSend.apply(this, [body]);
    };

    console.log('XHR interceptor initialized in page context.');
})();
