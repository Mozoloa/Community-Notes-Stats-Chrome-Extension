// parser.js
(function () {
    window.BirdwatchParser = {
        parseData(rawJson) {
            const result = rawJson?.data?.tweet_result_by_rest_id?.result || {};
            const notMisleading = result.not_misleading_birdwatch_notes?.notes || [];
            const misleading = result.misleading_birdwatch_notes?.notes || [];
            const allNotes = [...notMisleading, ...misleading];

            return allNotes.map((note) => ({
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
            }));
        },
    };
    console.log("[Parser] BirdwatchParser ready.");
})();
