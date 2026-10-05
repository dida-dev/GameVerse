/*
    GAMEVAULT V3
    24 HOUR BUILD TIMER

    Each game has its own timer.

    The timer is saved in localStorage,
    so refreshing the page will NOT reset it.
*/


const BUILD_TIME = 24 * 60 * 60 * 1000;


/*
    Get all construction cards.
*/

const games =
    document.querySelectorAll(
        ".game-card"
    );


games.forEach(game => {

    const gameId =
        game.dataset.game;


    /*
        Each game gets its own storage key.
    */

    const storageKey =
        "gamevault_build_" + gameId;


    /*
        Get existing start time.
        If none exists, start the 24h timer now.
    */

    let startTime =
        localStorage.getItem(
            storageKey
        );


    if (!startTime) {

        startTime =
            Date.now();

        localStorage.setItem(
            storageKey,
            startTime
        );

    }


    startTime =
        Number(startTime);


    /*
        Find elements.
    */

    const progressFill =
        game.querySelector(
            ".progress-fill"
        );

    const progressText =
        game.querySelector(
            ".progress-text"
        );

    const percentValue =
        game.querySelector(
            ".percent-value"
        );

    const countdown =
        game.querySelector(
            ".countdown"
        );


    /*
        Format time.
    */

    function formatTime(
        milliseconds
    ) {

        let totalSeconds =
            Math.max(
                0,
                Math.floor(
                    milliseconds / 1000
                )
            );


        const hours =
            Math.floor(
                totalSeconds / 3600
            );


        totalSeconds %= 3600;


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const seconds =
            totalSeconds % 60;


        return (
            String(hours).padStart(2, "0")
            + ":" +
            String(minutes).padStart(2, "0")
            + ":" +
            String(seconds).padStart(2, "0")
        );

    }


    /*
        Update the game.
    */

    function updateGame() {

        const now =
            Date.now();


        const elapsed =
            now - startTime;


        const remaining =
            BUILD_TIME - elapsed;


        let progress =
            (elapsed / BUILD_TIME) * 100;


        progress =
            Math.min(
                100,
                Math.max(
                    0,
                    progress
                )
            );


        /*
            Round percentage.
        */

        const roundedProgress =
            Math.floor(progress);


        /*
            Update progress bar.
        */

        progressFill.style.width =
            roundedProgress + "%";


        /*
            Update percentage.
        */

        progressText.textContent =
            roundedProgress + "%";


        percentValue.textContent =
            roundedProgress;


        /*
            Update countdown.
        */

        countdown.textContent =
            formatTime(
                remaining
            );


        /*
            Finished!
        */

        if (remaining <= 0) {

            progressFill.style.width =
                "100%";

            progressText.textContent =
                "100%";

            percentValue.textContent =
                "100";

            countdown.textContent =
                "GAME READY!";

            game.classList.add(
                "ready"
            );

            return true;

        }


        return false;

    }


    /*
        Initial update.
    */

    updateGame();


    /*
        Update every second.
    */

    const timer =
        setInterval(
            () => {

                const finished =
                    updateGame();


                if (finished) {

                    clearInterval(
                        timer
                    );

                }

            },
            1000
        );

});
