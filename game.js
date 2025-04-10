document.addEventListener('DOMContentLoaded', function() {
    // 游戏主要数据和状态
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let won = false;
    let keepPlaying = false;
    
    // DOM 元素
    const scoreContainer = document.querySelector('.score-container');
    const bestContainer = document.querySelector('.best-container');
    const tileContainer = document.querySelector('.tile-container');
    const gameOverMessage = document.querySelector('.game-over');
    const gameWonMessage = document.querySelector('.game-won');
    const restartButtons = document.querySelectorAll('.restart-button');
    const keepPlayingButton = document.querySelector('.keep-playing-button');
    
    // 初始化游戏
    initGame();
    
    // 添加事件监听
    document.addEventListener('keydown', handleKeyDown);
    restartButtons.forEach(button => button.addEventListener('click', restartGame));
    keepPlayingButton.addEventListener('click', keepPlayingGame);
    
    // 设置触摸事件监听
    setupTouchEvents();
    
    /**
     * 初始化游戏
     */
    function initGame() {
        grid = createEmptyGrid();
        score = 0;
        gameOver = false;
        won = false;
        keepPlaying = false;
        
        updateScore();
        updateBestScore();
        
        // 清空棋盘
        tileContainer.innerHTML = '';
        
        // 添加初始方块
        addRandomTile();
        addRandomTile();
    }
    
    /**
     * 创建一个空的 4x4 网格
     */
    function createEmptyGrid() {
        let newGrid = [];
        for (let i = 0; i < 4; i++) {
            newGrid[i] = [0, 0, 0, 0];
        }
        return newGrid;
    }
    
    /**
     * 随机向空位置添加一个新方块
     */
    function addRandomTile() {
        if (isFull()) return;
        
        let emptyCells = [];
        
        // 找出所有空位置
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        // 随机选择一个空位置
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const cell = emptyCells[randomIndex];
            const value = Math.random() < 0.9 ? 2 : 4; // 90%几率生成2，10%几率生成4
            
            // 更新网格数据
            grid[cell.row][cell.col] = value;
            
            // 创建和显示新方块
            addTile(cell.row, cell.col, value);
        }
    }
    
    /**
     * 创建并添加一个新的方块元素到界面
     */
    function addTile(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
        // 计算位置
        const posX = col * 97.5 + col * 15;
        const posY = row * 97.5 + row * 15;
        
        // 设置位置样式
        tile.style.left = `${posX}px`;
        tile.style.top = `${posY}px`;
        
        // 添加到容器
        tileContainer.appendChild(tile);
        
        // 动画效果
        setTimeout(() => {
            tile.style.transform = 'scale(1)';
        }, 100);
    }
    
    /**
     * 更新界面显示
     */
    function updateBoard() {
        // 清空当前显示
        tileContainer.innerHTML = '';
        
        // 重新根据 grid 数据创建所有方块
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    addTile(i, j, grid[i][j]);
                }
            }
        }
    }
    
    /**
     * 更新分数显示
     */
    function updateScore() {
        scoreContainer.textContent = score;
    }
    
    /**
     * 更新最高分显示
     */
    function updateBestScore() {
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        bestContainer.textContent = bestScore;
    }
    
    /**
     * 处理键盘按键事件
     */
    function handleKeyDown(event) {
        // 如果游戏结束且没选择继续玩，则不处理按键
        if (gameOver || (won && !keepPlaying)) return;
        
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                moved = moveUp();
                event.preventDefault();
                break;
            case 'ArrowDown':
                moved = moveDown();
                event.preventDefault();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                event.preventDefault();
                break;
            case 'ArrowRight':
                moved = moveRight();
                event.preventDefault();
                break;
            default:
                return; // 不处理其他按键
        }
        
        if (moved) {
            updateScore();
            updateBestScore();
            addRandomTile();
            
            // 检查游戏状态
            checkGameState();
        }
    }
    
    /**
     * 设置触摸事件监听
     */
    function setupTouchEvents() {
        const gameContainer = document.querySelector('.game-container');
        let startX, startY, endX, endY;
        
        gameContainer.addEventListener('touchstart', function(event) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        });
        
        gameContainer.addEventListener('touchend', function(event) {
            // 如果游戏结束且没选择继续玩，则不处理
            if (gameOver || (won && !keepPlaying)) return;
            
            endX = event.changedTouches[0].clientX;
            endY = event.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            let moved = false;
            
            // 判断是水平还是垂直滑动
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) { // 向右滑动
                    moved = moveRight();
                } else if (deltaX < -30) { // 向左滑动
                    moved = moveLeft();
                }
            } else {
                if (deltaY > 30) { // 向下滑动
                    moved = moveDown();
                } else if (deltaY < -30) { // 向上滑动
                    moved = moveUp();
                }
            }
            
            if (moved) {
                updateScore();
                updateBestScore();
                addRandomTile();
                
                // 检查游戏状态
                checkGameState();
                
                event.preventDefault();
            }
        });
    }
    
    /**
     * 向上移动
     */
    function moveUp() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            for (let row = 1; row < 4; row++) {
                if (grid[row][col] !== 0) {
                    let currentRow = row;
                    
                    // 移动到最远的位置
                    while (currentRow > 0 && grid[currentRow-1][col] === 0) {
                        grid[currentRow-1][col] = grid[currentRow][col];
                        grid[currentRow][col] = 0;
                        currentRow--;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentRow > 0 && grid[currentRow-1][col] === grid[currentRow][col]) {
                        grid[currentRow-1][col] *= 2;
                        grid[currentRow][col] = 0;
                        score += grid[currentRow-1][col];
                        moved = true;
                    }
                }
            }
        }
        
        if (moved) {
            updateBoard();
        }
        
        return moved;
    }
    
    /**
     * 向下移动
     */
    function moveDown() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            for (let row = 2; row >= 0; row--) {
                if (grid[row][col] !== 0) {
                    let currentRow = row;
                    
                    // 移动到最远的位置
                    while (currentRow < 3 && grid[currentRow+1][col] === 0) {
                        grid[currentRow+1][col] = grid[currentRow][col];
                        grid[currentRow][col] = 0;
                        currentRow++;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentRow < 3 && grid[currentRow+1][col] === grid[currentRow][col]) {
                        grid[currentRow+1][col] *= 2;
                        grid[currentRow][col] = 0;
                        score += grid[currentRow+1][col];
                        moved = true;
                    }
                }
            }
        }
        
        if (moved) {
            updateBoard();
        }
        
        return moved;
    }
    
    /**
     * 向左移动
     */
    function moveLeft() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 1; col < 4; col++) {
                if (grid[row][col] !== 0) {
                    let currentCol = col;
                    
                    // 移动到最远的位置
                    while (currentCol > 0 && grid[row][currentCol-1] === 0) {
                        grid[row][currentCol-1] = grid[row][currentCol];
                        grid[row][currentCol] = 0;
                        currentCol--;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentCol > 0 && grid[row][currentCol-1] === grid[row][currentCol]) {
                        grid[row][currentCol-1] *= 2;
                        grid[row][currentCol] = 0;
                        score += grid[row][currentCol-1];
                        moved = true;
                    }
                }
            }
        }
        
        if (moved) {
            updateBoard();
        }
        
        return moved;
    }
    
    /**
     * 向右移动
     */
    function moveRight() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 2; col >= 0; col--) {
                if (grid[row][col] !== 0) {
                    let currentCol = col;
                    
                    // 移动到最远的位置
                    while (currentCol < 3 && grid[row][currentCol+1] === 0) {
                        grid[row][currentCol+1] = grid[row][currentCol];
                        grid[row][currentCol] = 0;
                        currentCol++;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentCol < 3 && grid[row][currentCol+1] === grid[row][currentCol]) {
                        grid[row][currentCol+1] *= 2;
                        grid[row][currentCol] = 0;
                        score += grid[row][currentCol+1];
                        moved = true;
                    }
                }
            }
        }
        
        if (moved) {
            updateBoard();
        }
        
        return moved;
    }
    
    /**
     * 检查棋盘是否已满
     */
    function isFull() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * 检查是否还有可能移动
     */
    function canMove() {
        // 如果有空格，则可以移动
        if (!isFull()) return true;
        
        // 检查相邻的方块是否有相同的
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = grid[i][j];
                
                // 检查右边
                if (j < 3 && grid[i][j+1] === value) {
                    return true;
                }
                
                // 检查下边
                if (i < 3 && grid[i+1][j] === value) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 检查是否有方块达到2048
     */
    function hasWon() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * 检查游戏状态（胜利或结束）
     */
    function checkGameState() {
        // 检查是否获胜
        if (!won && hasWon()) {
            won = true;
            gameWonMessage.style.display = 'flex';
        }
        
        // 检查是否还能移动
        if (!gameOver && !canMove()) {
            gameOver = true;
            gameOverMessage.style.display = 'flex';
        }
    }
    
    /**
     * 重新开始游戏
     */
    function restartGame() {
        // 隐藏游戏结束和胜利消息
        gameOverMessage.style.display = 'none';
        gameWonMessage.style.display = 'none';
        
        // 重新初始化游戏
        initGame();
    }
    
    /**
     * 继续游戏（在获胜后）
     */
    function keepPlayingGame() {
        // 隐藏胜利消息
        gameWonMessage.style.display = 'none';
        
        // 设置继续游戏标志
        keepPlaying = true;
    }
});