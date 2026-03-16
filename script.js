function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

document.body.classList.add("js-ready");

const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach((element) => {
        const delay = Number.parseInt(element.dataset.revealDelay || "0", 10);
        if (!Number.isNaN(delay) && delay > 0) {
            element.style.transitionDelay = `${delay}ms`;
        }
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

const previewCanvas = document.getElementById("snake-demo-canvas");

if (previewCanvas) {
    const ctx = previewCanvas.getContext("2d");
    const gridCount = 16;
    const cellSize = previewCanvas.width / gridCount;
    const frameDelay = 120;

    let snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 },
    ];
    let direction = { x: 1, y: 0 };
    let food = { x: 12, y: 8 };
    let timerId = null;

    const isOppositeDirection = (nextDirection) =>
        nextDirection.x === -direction.x && nextDirection.y === -direction.y;

    const isBlocked = (point) => snake.some((segment) => segment.x === point.x && segment.y === point.y);

    const randomFood = () => {
        let candidate = { x: 0, y: 0 };
        do {
            candidate = {
                x: Math.floor(Math.random() * gridCount),
                y: Math.floor(Math.random() * gridCount),
            };
        } while (isBlocked(candidate));
        return candidate;
    };

    const pickDirection = () => {
        const head = snake[0];
        const candidates = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];

        const viable = candidates.filter((nextDirection) => {
            if (isOppositeDirection(nextDirection)) {
                return false;
            }

            const nextHead = {
                x: (head.x + nextDirection.x + gridCount) % gridCount,
                y: (head.y + nextDirection.y + gridCount) % gridCount,
            };

            return !isBlocked(nextHead);
        });

        if (!viable.length) {
            return direction;
        }

        viable.sort((a, b) => {
            const nextA = {
                x: (head.x + a.x + gridCount) % gridCount,
                y: (head.y + a.y + gridCount) % gridCount,
            };
            const nextB = {
                x: (head.x + b.x + gridCount) % gridCount,
                y: (head.y + b.y + gridCount) % gridCount,
            };
            const distanceA = Math.abs(nextA.x - food.x) + Math.abs(nextA.y - food.y);
            const distanceB = Math.abs(nextB.x - food.x) + Math.abs(nextB.y - food.y);
            return distanceA - distanceB;
        });

        return viable[0];
    };

    const resetPreview = () => {
        snake = [
            { x: 8, y: 8 },
            { x: 7, y: 8 },
            { x: 6, y: 8 },
        ];
        direction = { x: 1, y: 0 };
        food = randomFood();
    };

    const draw = () => {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
        for (let i = 0; i <= gridCount; i += 1) {
            const offset = i * cellSize;
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset, previewCanvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, offset);
            ctx.lineTo(previewCanvas.width, offset);
            ctx.stroke();
        }

        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            cellSize * 0.28,
            0,
            Math.PI * 2
        );
        ctx.fill();

        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? "#22d3ee" : "#2dd4bf";
            ctx.fillRect(
                segment.x * cellSize + 1.5,
                segment.y * cellSize + 1.5,
                cellSize - 3,
                cellSize - 3
            );
        });
    };

    const tick = () => {
        direction = pickDirection();
        const nextHead = {
            x: (snake[0].x + direction.x + gridCount) % gridCount,
            y: (snake[0].y + direction.y + gridCount) % gridCount,
        };

        if (isBlocked(nextHead)) {
            resetPreview();
            draw();
            return;
        }

        snake.unshift(nextHead);
        if (nextHead.x === food.x && nextHead.y === food.y) {
            food = randomFood();
        } else {
            snake.pop();
        }

        draw();
    };

    const startPreview = () => {
        if (timerId !== null) {
            return;
        }
        timerId = window.setInterval(tick, frameDelay);
    };

    const stopPreview = () => {
        if (timerId === null) {
            return;
        }
        window.clearInterval(timerId);
        timerId = null;
    };

    draw();

    if ("IntersectionObserver" in window) {
        const previewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startPreview();
                    } else {
                        stopPreview();
                    }
                });
            },
            { threshold: 0.35 }
        );
        previewObserver.observe(previewCanvas);
    } else {
        startPreview();
    }
}
