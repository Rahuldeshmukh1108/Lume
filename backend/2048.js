const gameBoard = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");

let board = Array(4).fill().map(() => Array(4).fill(0));
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

highScoreDisplay.textContent = highScore;

function generateTile() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() > 0.1 ? 2 : 4;
    }
}

function drawBoard() {
    gameBoard.innerHTML = "";
    board.forEach(row => row.forEach(value => {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        if (value) {
            tile.textContent = value;
            tile.setAttribute("data-value", value);
            tile.style.background = getTileColor(value);
            tile.style.color = value > 4 ? "#fff" : "#222";
        } else {
            tile.style.background = "#2b2b3c";
        }
        gameBoard.appendChild(tile);
    }));
}

function getTileColor(value) {
    const colors = {
        2: "#ffdbac", 4: "#ffc47e", 8: "#ff8c42", 16: "#ff6347",
        32: "#ff3b3b", 64: "#e3170a", 128: "#ffe100", 256: "#ffcc00",
        512: "#ffb400", 1024: "#ff9100", 2048: "#00ffcc"
    };
    return colors[value] || "#ff0080";
}

function slideRow(row) {
    let newRow = row.filter(val => val);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow[i + 1] = 0;
        }
    }
    newRow = newRow.filter(val => val);
    return newRow.concat(Array(4 - newRow.length).fill(0));
}

function move(direction) {
    let moved = false;
    let oldBoard = JSON.stringify(board);

    if (direction === "ArrowLeft") {
        board = board.map(row => slideRow(row));
    } else if (direction === "ArrowRight") {
        board = board.map(row => slideRow(row.reverse()).reverse());
    } else if (direction === "ArrowUp") {
        for (let c = 0; c < 4; c++) {
            let col = board.map(row => row[c]);
            col = slideRow(col);
            for (let r = 0; r < 4; r++) board[r][c] = col[r];
        }
    } else if (direction === "ArrowDown") {
        for (let c = 0; c < 4; c++) {
            let col = board.map(row => row[c]).reverse();
            col = slideRow(col).reverse();
            for (let r = 0; r < 4; r++) board[r][c] = col[r];
        }
    }
    
    if (JSON.stringify(board) !== oldBoard) {
        generateTile();
        moved = true;
    }
    updateScore();
    drawBoard();
    if (moved) checkGameOver();
}

function updateScore() {
    scoreDisplay.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = highScore;
    }
}

function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return;
            if (c < 3 && board[r][c] === board[r][c + 1]) return;
            if (r < 3 && board[r][c] === board[r + 1][c]) return;
        }
    }
    setTimeout(() => alert("Game Over! Final Score: " + score), 200);
}

restartBtn.addEventListener("click", () => {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    generateTile();
    generateTile();
    updateScore();
    drawBoard();
});

document.addEventListener("keydown", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        move(e.key);
    }
});

generateTile();
generateTile();
drawBoard();