class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.gamePaused = false;
        this.gameStarted = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // Snake properties
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.baseSpeed = 150;
        this.speed = this.baseSpeed;
        this.nextDirection = {dx: 0, dy: 0};
        
        // Food properties
        this.food = this.generateFood();
        
        // Audio elements
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.moveSound = document.getElementById('moveSound');
        this.foodSound = document.getElementById('foodSound');
        this.gameOverSound = document.getElementById('gameOverSound');
        this.musicEnabled = true;
        
        // Set audio volume to lower levels
        this.backgroundMusic.volume = 0.3;
        this.moveSound.volume = 0.2;
        this.foodSound.volume = 0.4;
        this.gameOverSound.volume = 0.5;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.snakeLengthElement = document.getElementById('snakeLength');
        this.currentSpeedElement = document.getElementById('currentSpeed');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValueElement = document.getElementById('speedValue');
        this.musicToggle = document.getElementById('musicToggle');
        this.musicTogglePause = document.getElementById('musicTogglePause');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.restartPauseBtn = document.getElementById('restartPauseBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.gameOverScreen = document.getElementById('gameOver');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLengthElement = document.getElementById('finalLength');
        this.finalHighScoreElement = document.getElementById('finalHighScore');
        
        // Mobile controls
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.pauseBtnMobile = document.getElementById('pauseBtnMobile');
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Set initial high score
        this.highScoreElement.textContent = this.highScore;
        this.updateSpeedDisplay();
        this.updateMusicButtons();
        
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.restartPauseBtn.addEventListener('click', () => this.restartFromPause());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.musicToggle.addEventListener('click', () => this.toggleMusic());
        this.musicTogglePause.addEventListener('click', () => this.toggleMusic());
        this.speedSlider.addEventListener('input', () => this.updateSpeed());
        
        // Mobile touch controls with proper event handling
        this.upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileInput('up');
        });
        this.downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileInput('down');
        });
        this.leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileInput('left');
        });
        this.rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMobileInput('right');
        });
        this.pauseBtnMobile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.togglePause();
        });
        
        // Also add click events for desktop testing
        this.upBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleMobileInput('up');
        });
        this.downBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleMobileInput('down');
        });
        this.leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleMobileInput('left');
        });
        this.rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleMobileInput('right');
        });
        this.pauseBtnMobile.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePause();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Draw initial state
        this.draw();
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        this.gamePaused = false;
        this.gameStarted = false;
        this.score = 0;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.nextDirection = {dx: 0, dy: 0};
        this.food = this.generateFood();
        this.speed = this.baseSpeed;
        
        this.updateUI();
        
        this.startBtn.textContent = '▶️ Game Running...';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = '⏸️ Pause';
        
        // Start background music
        if (this.musicEnabled) {
            this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        }
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.pauseBtn.textContent = '▶️ Resume';
            this.pauseScreen.classList.remove('hidden');
            // Stop background music immediately
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        } else {
            this.pauseBtn.textContent = '⏸️ Pause';
            this.pauseScreen.classList.add('hidden');
            if (this.musicEnabled) {
                this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }
    
    resumeGame() {
        this.togglePause();
    }
    
    restartFromPause() {
        this.pauseScreen.classList.add('hidden');
        this.gamePaused = false;
        this.startGame();
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }
    
    newGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startBtn.disabled = false;
        this.startBtn.textContent = '▶️ Start Game';
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '⏸️ Pause';
        this.gameRunning = false;
        this.gameOver = false;
        this.gamePaused = false;
        this.gameStarted = false;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.food = this.generateFood();
        this.updateUI();
        this.draw();
    }
    
    handleMobileInput(direction) {
        if (!this.gameRunning || this.gameOver || this.gamePaused) return;
        
        // Set initial direction if game hasn't started moving yet
        if (!this.gameStarted) {
            switch(direction) {
                case 'up':
                    this.dx = 0;
                    this.dy = -1;
                    break;
                case 'down':
                    this.dx = 0;
                    this.dy = 1;
                    break;
                case 'left':
                    this.dx = -1;
                    this.dy = 0;
                    break;
                case 'right':
                    this.dx = 1;
                    this.dy = 0;
                    break;
            }
            this.gameStarted = true;
            return;
        }
        
        // Prevent opposite direction movement
        switch(direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.nextDirection = {dx: 0, dy: -1};
                    this.playMoveSound();
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.nextDirection = {dx: 0, dy: 1};
                    this.playMoveSound();
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.nextDirection = {dx: -1, dy: 0};
                    this.playMoveSound();
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.nextDirection = {dx: 1, dy: 0};
                    this.playMoveSound();
                }
                break;
        }
    }
    
    updateSpeed() {
        const speedValue = parseInt(this.speedSlider.value);
        this.baseSpeed = 350 - speedValue; // Invert so higher slider = faster
        this.speed = this.baseSpeed;
        this.updateSpeedDisplay();
    }
    
    updateSpeedDisplay() {
        const speedValue = parseInt(this.speedSlider.value);
        let speedText = '';
        
        if (speedValue <= 100) speedText = 'Very Slow';
        else if (speedValue <= 150) speedText = 'Slow';
        else if (speedValue <= 200) speedText = 'Normal';
        else if (speedValue <= 250) speedText = 'Fast';
        else speedText = 'Very Fast';
        
        this.speedValueElement.textContent = speedText;
        this.currentSpeedElement.textContent = speedText;
    }
    
    updateMusicButtons() {
        const musicText = this.musicEnabled ? '🔊 Music ON' : '🔇 Music OFF';
        this.musicToggle.textContent = musicText;
        this.musicTogglePause.textContent = musicText;
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        this.updateMusicButtons();
        
        if (this.musicEnabled) {
            if (this.gameRunning && !this.gamePaused) {
                this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
            }
        } else {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        // Pause/Resume with spacebar
        if (key === ' ' && this.gameRunning && !this.gameOver) {
            e.preventDefault();
            this.togglePause();
            return;
        }
        
        if (!this.gameRunning || this.gameOver || this.gamePaused) return;
        
        // Set initial direction if game hasn't started moving yet
        if (!this.gameStarted) {
            if (key === 'arrowup' || key === 'w') {
                this.dx = 0;
                this.dy = -1;
                this.gameStarted = true;
            } else if (key === 'arrowdown' || key === 's') {
                this.dx = 0;
                this.dy = 1;
                this.gameStarted = true;
            } else if (key === 'arrowleft' || key === 'a') {
                this.dx = -1;
                this.dy = 0;
                this.gameStarted = true;
            } else if (key === 'arrowright' || key === 'd') {
                this.dx = 1;
                this.dy = 0;
                this.gameStarted = true;
            }
            return;
        }
        
        // Prevent opposite direction movement
        if ((key === 'arrowup' || key === 'w') && this.dy !== 1) {
            this.nextDirection = {dx: 0, dy: -1};
            this.playMoveSound();
        } else if ((key === 'arrowdown' || key === 's') && this.dy !== -1) {
            this.nextDirection = {dx: 0, dy: 1};
            this.playMoveSound();
        } else if ((key === 'arrowleft' || key === 'a') && this.dx !== 1) {
            this.nextDirection = {dx: -1, dy: 0};
            this.playMoveSound();
        } else if ((key === 'arrowright' || key === 'd') && this.dx !== -1) {
            this.nextDirection = {dx: 1, dy: 0};
            this.playMoveSound();
        }
    }
    
    playMoveSound() {
        if (this.musicEnabled) {
            this.moveSound.currentTime = 0;
            this.moveSound.play().catch(e => console.log('Move sound failed:', e));
        }
    }
    
    playFoodSound() {
        if (this.musicEnabled) {
            this.foodSound.currentTime = 0;
            this.foodSound.play().catch(e => console.log('Food sound failed:', e));
        }
    }
    
    playGameOverSound() {
        if (this.musicEnabled) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play().catch(e => console.log('Game over sound failed:', e));
        }
    }
    
    generateFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) && attempts < maxAttempts);
        
        return newFood;
    }
    
    update() {
        if (!this.gameRunning || this.gameOver || this.gamePaused) return;
        
        // Apply next direction
        if (this.nextDirection.dx !== 0 || this.nextDirection.dy !== 0) {
            this.dx = this.nextDirection.dx;
            this.dy = this.nextDirection.dy;
            this.nextDirection = {dx: 0, dy: 0};
        }
        
        // Don't move if no direction is set
        if (this.dx === 0 && this.dy === 0) return;
        
        // Move snake
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision (skip head)
        if (this.snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.playFoodSound();
            
            // Increase speed slightly
            this.speed = Math.max(50, this.speed - 1);
        } else {
            this.snake.pop();
        }
        
        this.updateUI();
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.snakeLengthElement.textContent = this.snake.length;
        this.updateSpeedDisplay();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
                
                // Eyes
                this.ctx.fillStyle = '#2d3748';
                this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 4, 3, 3);
                this.ctx.fillRect(segment.x * this.gridSize + 13, segment.y * this.gridSize + 4, 3, 3);
            } else {
                // Body
                this.ctx.fillStyle = '#44a08d';
                this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
            }
            
            // Border
            this.ctx.strokeStyle = '#2d3748';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
        });
        
        // Draw food
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Food border
        this.ctx.strokeStyle = '#e53e3e';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw start message if game hasn't started
        if (this.gameRunning && !this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Segoe UI';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Arrow Keys or WASD to Start', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Segoe UI';
            this.ctx.fillText('Press SPACE to pause/resume', this.canvas.width / 2, this.canvas.height / 2 + 35);
            this.ctx.fillText('Or use touch controls on mobile', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => this.gameLoop(), this.speed);
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Stop background music immediately
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        
        // Play game over sound
        this.playGameOverSound();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        
        // Show game over screen
        this.finalScoreElement.textContent = this.score;
        this.finalLengthElement.textContent = this.snake.length;
        this.finalHighScoreElement.textContent = this.highScore;
        this.gameOverScreen.classList.remove('hidden');
        
        // Reset buttons
        this.startBtn.textContent = '▶️ Start Game';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '⏸️ Pause';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
