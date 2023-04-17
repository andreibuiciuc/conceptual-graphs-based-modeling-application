export function useConfetti() {

    // Composable responsible for creating the confetti animation

    const confettiColors = ["#1287b1", "#bbe6fb", "#ffcc00"];
    const confettiBurstConfig: confetti.Options = {
        particleCount: 350, 
        spread: 500, 
        startVelocity: 40, 
        colors: confettiColors 
    };

    const createConfetti = async (): Promise<void> => {
        let canvas = document.createElement('canvas');
        document.body.appendChild(canvas);

        let confettiBurst: confetti.CreateTypes = window.confetti.create(canvas, {
            resize: true,
            useWorker: true
        });

        if (confettiBurst) {
            await confettiBurst(confettiBurstConfig);
        }
       
        document.body.removeChild(canvas);
    }

    return {
        createConfetti
    };
}