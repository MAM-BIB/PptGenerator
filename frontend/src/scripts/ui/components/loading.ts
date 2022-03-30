/**
 * This function is used to start a loading animation, to give the User feedback that something is happening.
 */
export function startLoading() {
    const loading = document.createElement("div");
    loading.id = "loading-container";

    const circle = document.createElement("div");
    circle.id = "loading-circle";

    loading.append(circle);
    document.body.append(loading);

    circle.animate(
        [
            // keyframes
            { transform: "translate(-50%, -50%) rotate(0deg)" },
            { transform: "translate(-50%, -50%) rotate(360deg)" },
        ],
        {
            // timing options
            duration: 1000,
            iterations: Infinity,
        },
    );
}

/**
 * This function is used to stop the loading animation.
 */
export function stopLoading() {
    document.getElementById("loading-container")?.remove();
}
