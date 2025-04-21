```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const bird = document.getElementById("bird");
    const obstacles = document.getElementById("obstacles");
    const scoreElement = document.getElementById("score");
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const bossBtn = document.getElementById("boss-btn");
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    
    // Game variables
    let birdPosition = 50;
    let gravity = 1.2;
    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let highScore = localStorage.getItem('flappyHighScore') || 0;
    let obstacleInterval;
    let gameSpeed = 3;
    let bossMode = false;
    let passedObstacles = new Set();
    
    // Initialize game
    function initGame() {
        birdPosition = 50;
        score = 0;
        scoreElement.textContent = score;
        obstacles.innerHTML = "";
        passedObstacles.clear();
        bird.style.top = birdPosition + "%";
        bird.style.transform = "rotate(0deg)";
        gameSpeed = 3;
    }
    
    // Start game
    function startGame() {
        initGame();
        gameRunning = true;
        gamePaused = false;
        startScreen.style.display = "none";
        
        if (obstacleInterval) clearInterval(obstacleInterval);
        obstacleInterval = setInterval(createObstacle, 1500);
        
        gameLoop();
    }
    
    // Game loop
    function gameLoop() {
        if (!gameRunning || gamePaused) return;
        
        // Apply gravity
        birdPosition += gravity;
        bird.style.top = birdPosition + "%";
        
        // Rotate bird based on movement
        let rotation = Math.min(Math.max((gravity - 0.5) * 30, -30), 30);
        bird.style.transform = `rotate(${rotation}deg)`;
        
        // Check for collisions with ground/ceiling
        if (birdPosition <= 0 || birdPosition >= 95) {
            endGame();
        }
        
        // Check for collisions with obstacles
        const allObstacles = document.querySelectorAll(".obstacle");
        allObstacles.forEach(obstacle => {
            const obstacleLeft = parseInt(obstacle.style.left);
            const obstacleTop = parseInt(obstacle.style.top);
            const obstacleHeight = parseInt(obstacle.style.height);
            const obstacleId = obstacle.dataset.id;
            
            // Collision detection
            if (
                obstacleLeft < 25 && obstacleLeft + 80 > 15 &&
                (birdPosition < obstacleTop || birdPosition > obstacleTop + obstacleHeight)
            ) {
                endGame();
            }
            
            // Score increment (when bird passes an obstacle)
            if (obstacleLeft + 80 < 15 && !passedObstacles.has(obstacleId)) {
                passedObstacles.add(obstacleId);
                score++;
                scoreElement.textContent = score;
                
                // Increase speed slightly every 5 points
                if (score % 5 === 0) {
                    gameSpeed += 0.2;
                }
            }
        });
        
        requestAnimationFrame(gameLoop);
    }
    
    // Create obstacles
    function createObstacle() {
        if (!gameRunning || gamePaused) return;
        
        const gap = 25; // Gap between top and bottom obstacles (%)
        const obstacleHeight = Math.floor(Math.random() * 40) + 10; // 10-50%
        const obstacleId = Date.now(); // Unique ID for each obstacle pair
        
        // Top obstacle
        const topObstacle = document.createElement("div");
        topObstacle.className = "obstacle";
        topObstacle.style.height = obstacleHeight + "%";
        topObstacle.style.left = "100%";
        topObstacle.style.top = "0%";
        topObstacle.dataset.id = obstacleId + "-top";
        obstacles.appendChild(topObstacle);
        
        // Bottom obstacle
        const bottomObstacle = document.createElement("div");
        bottomObstacle.className = "obstacle";
        bottomObstacle.style.height = (100 - obstacleHeight - gap) + "%";
        bottomObstacle.style.left = "100%";
        bottomObstacle.style.top = (obstacleHeight + gap) + "%";
        bottomObstacle.dataset.id = obstacleId + "-bottom";
        obstacles.appendChild(bottomObstacle);
        
        // Move obstacles
        let obstacleLeft = 100;
        const moveObstacle = setInterval(() => {
            if (!gameRunning || gamePaused) return;
            
            if (obstacleLeft <= -10) {
                clearInterval(moveObstacle);
                topObstacle.remove();
                bottomObstacle.remove();
            }
            obstacleLeft -= gameSpeed;
            topObstacle.style.left = obstacleLeft + "%";
            bottomObstacle.style.left = obstacleLeft + "%";
        }, 20);
    }
    
    // Jump function
    function jump() {
        if (!gameRunning || gamePaused) return;
        
        birdPosition -= 20;
        bird.style.top = birdPosition + "%";
        bird.style.transform = "rotate(-30deg)";
        
        // Add jump animation
        bird.style.transition = "transform 0.1s";
        setTimeout(() => {
            bird.style.transition = "transform 0.3s";
        }, 100);
    }
    
    // End game
    function endGame() {
        gameRunning = false;
        clearInterval(obstacleInterval);
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyHighScore', highScore);
        }
        
        // Show game over screen
        startScreen.style.display = "flex";
        document.getElementById("game-title").innerHTML = `
            GAME OVER!<br>
            <span style="font-size: 24px;">Score: ${score}</span><br>
            <span style="font-size: 20px;">High Score: ${highScore}</span>
        `;
    }
    
    // Pause game
    function togglePause() {
        if (!gameRunning) return;
        
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
        
        if (!gamePaused) {
            gameLoop();
        }
    }
    
    // Toggle boss mode
    function toggleBossMode() {
        bossMode = !bossMode;
        bossBtn.textContent = bossMode ? "NORMAL MODE" : "BOSS MODE";
        gameContainer.classList.toggle("boss-mode", bossMode);
    }
    
    // Event listeners
    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", startGame);
    pauseBtn.addEventListener("click", togglePause);
    bossBtn.addEventListener("click", toggleBossMode);
    
    // Keyboard controls (for PC)
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if (!gameRunning && startScreen.style.display !== "none") {
                startGame();
            } else {
                jump();
            }
        } else if (e.code === "KeyP") {
            togglePause();
        } else if (e.code === "KeyB") {
            toggleBossMode();
        }
    });
    
    // Touch controls (for mobile)
    document.addEventListener("touchstart", function(e) {
        e.preventDefault();
        if (!gameRunning && startScreen.style.display !== "none") {
            startGame();
        } else {
            jump();
        }
    });
    
    // Prevent scrolling on mobile
    document.addEventListener('touchmove', function(e) {
        if (gameRunning) {
            e.preventDefault();
        }
    }, { passive: false });
});
```
