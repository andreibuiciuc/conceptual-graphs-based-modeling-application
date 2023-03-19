export function useConfetti() {
    const confettiColors = ["#1287b1", "#bbe6fb", "#ffcc00"];

    const createConfetti = () => {
        let canvas = document.createElement('canvas');
        document.body.appendChild(canvas);

        let confettiBurst = window.confetti.create(canvas, {
            resize: true,
            useWorker: true
        });

         confettiBurst({
            particleCount: 350,
            spread: 500,
            startVelocity: 40,
            colors: confettiColors
        })
            .then(() => {
                document.body.removeChild(canvas);
            });
       
    }

    return {
        createConfetti
    };
}