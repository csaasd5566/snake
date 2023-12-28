const gameBoard = document.getElementById('game-board');
const GRID_SIZE = 20;

let snake;
let direction;
let food;
let isGameRunning;
let score;
let updateInterval;
let speedUpEvery = 5;
let obstacles = [];
let poisonFood = null;
let isSpeedBoostActive = false;
let speedBoostTimer = null;
const gameBoardWidth = Math.floor(gameBoard.clientWidth / GRID_SIZE) * GRID_SIZE;
function initializeGame() {
    isGameRunning = false;
    gameBoard.innerHTML = '';
    const adjustedWidth = Math.floor(gameBoard.clientWidth / GRID_SIZE) * GRID_SIZE;
    gameBoard.style.width = adjustedWidth + "px";
    const adjustedHeight = Math.floor(gameBoard.clientHeight / GRID_SIZE) * GRID_SIZE;
    gameBoard.style.height = adjustedHeight + "px";
    // Start from the top left corner
    snake = [{ x: 0, y: 0 }];
    
    direction = 'right'; // Starting direction is right
    food = generateFoodCoordinates();
    score = 0;
    updateInterval = 100;
    drawFood();
    createSnake();  // Now, you can call createSnake here
}


function generateFoodCoordinates() {
    const maxGridsX = gameBoard.offsetWidth / GRID_SIZE-1;
    const maxGridsY = gameBoard.offsetHeight / GRID_SIZE-1;
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * maxGridsX) * GRID_SIZE;
        foodY = Math.floor(Math.random() * maxGridsY) * GRID_SIZE;
    } while (isPositionTakenBySnake(foodX, foodY));
    console.log(foodX,foodY)
    return { x: foodX, y: foodY };
}
function generateObstacleCoordinates() {
  let obstacleX, obstacleY;
  do {
      obstacleX = Math.floor(Math.random() * (gameBoard.offsetWidth / GRID_SIZE)) * GRID_SIZE;
      obstacleY = Math.floor(Math.random() * (gameBoard.offsetHeight / GRID_SIZE)) * GRID_SIZE;
  } while (isPositionOccupied(obstacleX, obstacleY));

  return { x: obstacleX, y: obstacleY };
}
function generatePoisonFoodCoordinates() {
  const maxGridsX = gameBoard.offsetWidth / GRID_SIZE - 1;
  const maxGridsY = gameBoard.offsetHeight / GRID_SIZE - 1;
  let foodX, foodY;
  do {
      foodX = Math.floor(Math.random() * maxGridsX) * GRID_SIZE;
      foodY = Math.floor(Math.random() * maxGridsY) * GRID_SIZE;
  } while (isPositionOccupied(foodX, foodY));

  return { x: foodX, y: foodY };
}

function isPositionTakenBySnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}
function isPositionOccupied(x, y) {
  return isPositionTakenBySnake(x, y) || 
         isPositionTakenByObstacle(x, y) || 
         (food && x === food.x && y === food.y);
}

function isPositionTakenByObstacle(x, y) {
  return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
}

function startGame() {
      if (!isGameRunning) {
        isGameRunning = true;
        poisonFood = generatePoisonFoodCoordinates();
        drawPoisonFood(poisonFood);
        
        updateGame(); 
    }
}

function createSnake() {
    snake.forEach((segment, index) => {
        const snakeSegment = document.createElement('div');
        snakeSegment.className = 'snake';
        snakeSegment.id = 'snake-segment-' + index;
        snakeSegment.style.left = segment.x + 'px';
        snakeSegment.style.top = segment.y + 'px';
        gameBoard.appendChild(snakeSegment);
    });
}

function updateFood() {
    const foodElement = document.querySelector('.food');
    food = generateFoodCoordinates();
    foodElement.style.left = food.x + 'px';
    foodElement.style.top = food.y + 'px';
}
function drawFood() {
    // Remove old food first
    const oldFood = document.querySelector('.food');
    if (oldFood) oldFood.remove();

    let foodElement = document.createElement('div');
    foodElement.className = 'food';
    foodElement.id = 'food-element'; // Add this line
    gameBoard.appendChild(foodElement);
    foodElement.style.left = food.x + 'px';
    foodElement.style.top = food.y + 'px';
}
function drawObstacle(obstacle) {
  const obstacleElement = document.createElement('div');
  obstacleElement.className = 'obstacle';
  obstacleElement.style.left = obstacle.x + 'px';
  obstacleElement.style.top = obstacle.y + 'px';
  gameBoard.appendChild(obstacleElement);
  setTimeout(() => {
    obstacleElement.classList.add('black');
}, 2000);
}
function drawPoisonFood(poison) {
  const foodElement = document.createElement('div');
  foodElement.className = 'poison-food';
  foodElement.style.left = poison.x + 'px';
  foodElement.style.top = poison.y + 'px';
  gameBoard.appendChild(foodElement);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' && direction !== 'left') {
        direction = 'right';
    } else if (event.key === 'ArrowLeft' && direction !== 'right') {
        direction = 'left';
    } else if (event.key === 'ArrowUp' && direction !== 'down') {
        direction = 'up';
    } else if (event.key === 'ArrowDown' && direction !== 'up') {
        direction = 'down';
    }
});
function updateSnake() {
    snake.forEach((segment, index) => {
        let snakeSegment = document.getElementById('snake-segment-' + index);
        if (!snakeSegment) {
            snakeSegment = document.createElement('div');  // <-- Use the same variable name here
            snakeSegment.className = 'snake';
            snakeSegment.id = 'snake-segment-' + index;
            gameBoard.appendChild(snakeSegment);
        }
        snakeSegment.style.left = segment.x + 'px';
        snakeSegment.style.top = segment.y + 'px';
    });
}
function updateGame() {
    if (!isGameRunning) return;

    const head = { ...snake[0] };
    if (direction === 'right') {
        head.x += GRID_SIZE;
    } else if (direction === 'left') {
        head.x -= GRID_SIZE;
    } else if (direction === 'up') {
        head.y -= GRID_SIZE;
    } else if (direction === 'down') {
        head.y += GRID_SIZE;
    }
    if (checkCollision(head)) {
        endGame();
        return;
    }
    snake.unshift(head);  // Push the new head position
    if (poisonFood && head.x === poisonFood.x && head.y === poisonFood.y) {
        isSpeedBoostActive = true;
        updateInterval *= 0.8; // 假設加速效果是提高20%的速度
        // 設置或重置計時器
        clearTimeout(speedBoostTimer);
        speedBoostTimer = setTimeout(() => {
            updateInterval /= 0.8; // 假設加速效果是提高20%的速度
            isSpeedBoostActive = false;
        }, 5000); // 加速持續5秒
      // 移除毒食物並生成一個新的
      removePoisonFood(poisonFood);
      poisonFood = generatePoisonFoodCoordinates();
      drawPoisonFood(poisonFood);
    }
    if (head.x === food.x && head.y === food.y) {
        if (isSpeedBoostActive) {
            score += 200; // 雙倍分數
        } else {
            score += 100; // 正常分數
        }
        document.getElementById('score-board').innerText = "分數: " + score;
        food = generateFoodCoordinates();
        drawFood();
        const newObstacle = generateObstacleCoordinates();
        obstacles.push(newObstacle);
        drawObstacle(newObstacle);
        if (score % 500 === 0) {
            updateInterval *= 0.95;  // Make the game 10% faster
        }
        if (score >=1500) {
            toggleNightMode();
        } 
    } else {
        snake.pop();  // Only remove the tail if we didn't eat food
    }
    
    updateSnake();
    setTimeout(updateGame, updateInterval);
}
function removePoisonFood(poison) {
  const elements = document.querySelectorAll('.poison-food');
  for (let elem of elements) {
      if (parseInt(elem.style.left) === poison.x && parseInt(elem.style.top) === poison.y) {
          gameBoard.removeChild(elem);
      }
  }
}
function createFood() {
    let foodElement = document.createElement('div');
    foodElement.className = 'food';
    foodElement.id = 'food-element';
    gameBoard.appendChild(foodElement);
    foodElement.style.left = food.x + 'px';
    foodElement.style.top = food.y + 'px';
}
function updateFoodPosition() {
    const foodElement = document.getElementById('food-element');
    if (foodElement) {  // <-- Add this check
        foodElement.style.left = food.x + 'px';
        foodElement.style.top = food.y + 'px';
    }
}
function checkCollision(head) {
    // Check boundary collision
    //console.log(head.x,gameBoard.clientWidth)
    //console.log(head.y,gameBoard.clientHeight)
    if (
        head.x < 0 ||
        head.x >= gameBoard.offsetWidth- GRID_SIZE ||
        head.y < 0 ||
        head.y >= gameBoard.offsetHeight- GRID_SIZE
    ) {
        return true;
    }

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].x === head.x && obstacles[i].y === head.y) {
          return true;
      }
    }
    return false;
}
function endGame() {
    isGameRunning = false;
    alert("遊戲結束！你的得分是: " + score);
    clearTimeout(speedBoostTimer);
    location.reload();
    initializeGame();  // You can choose to restart the game automatically, or just end it here.
}
function toggleNightMode() {
        gameBoard.classList.add("night-mode");
        // 開始障礙物閃爍效果
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => obstacle.classList.add('flicker'));

}
document.getElementById('start-btn').addEventListener('click', startGame);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        startGame();
    }
});
initializeGame();