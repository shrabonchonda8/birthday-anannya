/* =========================================================
CHESS GAME
COMPLETE main.js

Features:

- SVG Chess Pieces
- Legal Chess Moves
- Check / Checkmate
- Stalemate
- Castling
- En Passant
- Pawn Promotion
- Capture
- Undo
- Board Flip
- Move History
- Chess Timer
- Draw
- Resign
- New Game
  ========================================================= */

"use strict";

/* =========================================================

1. DOM ELEMENTS
   ========================================================= */

const boardElement = document.getElementById("chessBoard");

const turnText = document.getElementById("turnText");

const newGameBtn = document.getElementById("newGameBtn");

const whiteTimerElement = document.getElementById("whiteTimer");
const blackTimerElement = document.getElementById("blackTimer");

const whitePlayer = document.querySelector(".player-white");
const blackPlayer = document.querySelector(".player-black");

const whiteStatus = document.getElementById("whiteStatus");
const blackStatus = document.getElementById("blackStatus");

const undoBtn = document.getElementById("undoBtn");
const flipBoardBtn = document.getElementById("flipBoardBtn");
const drawBtn = document.getElementById("drawBtn");
const resignBtn = document.getElementById("resignBtn");

const moveHistoryElement = document.getElementById("moveHistory");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const gameMessage = document.getElementById("gameMessage");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const playAgainBtn = document.getElementById("playAgainBtn");

const promotionModal = document.getElementById("promotionModal");

const drawModal = document.getElementById("drawModal");

const resignModal = document.getElementById("resignModal");

const acceptDrawBtn = document.getElementById("acceptDrawBtn");
const rejectDrawBtn = document.getElementById("rejectDrawBtn");

const confirmResignBtn =
document.getElementById("confirmResignBtn");

const cancelResignBtn =
document.getElementById("cancelResignBtn");

/* =========================================================
2. CHESS CONSTANTS
========================================================= */

const FILES = [
"a",
"b",
"c",
"d",
"e",
"f",
"g",
"h"
];

const PIECES = {
pawn: "p",
rook: "r",
knight: "n",
bishop: "b",
queen: "q",
king: "k"
};

/* =========================================================
3. GAME STATE
========================================================= */

let board = [];

let currentTurn = "white";

let selectedSquare = null;

let possibleMoves = [];

let boardFlipped = false;

let gameOver = false;

let history = [];

let enPassantTarget = null;

let pendingPromotion = null;

let whiteTime = 10 * 60;

let blackTime = 10 * 60;

let timerInterval = null;

let gameStarted = false;

/* =========================================================
4. SVG CHESS PIECES
========================================================= */

/*
These are inline SVG pieces.
No external image is required.
*/

const SVG_PIECES = {

white: {

    pawn: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpPawn" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <circle
            cx="50"
            cy="28"
            r="15"
            fill="url(#wpPawn)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M38 43
               C39 52 34 59 31 64
               L25 72
               L75 72
               L69 64
               C66 59 61 52 62 43
               Z"
            fill="url(#wpPawn)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M23 73
               Q50 66 77 73
               L81 83
               Q50 91 19 83
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`,

    rook: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpRook" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <path
            d="M25 18
               L25 30
               L33 30
               L33 20
               L43 20
               L43 30
               L57 30
               L57 20
               L67 20
               L67 30
               L75 30
               L75 18
               Z"
            fill="url(#wpRook)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M31 30
               L69 30
               L66 62
               L75 70
               L75 76
               L25 76
               L25 70
               L34 62
               Z"
            fill="url(#wpRook)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M21 76
               L79 76
               L83 86
               L17 86
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`,

    knight: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpKnight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <path
            d="M28 82
               L35 69
               L31 57
               Q27 42 36 28
               Q42 18 55 15
               L65 24
               L58 33
               Q69 38 70 51
               L67 65
               L75 76
               L75 82
               Z"
            fill="url(#wpKnight)"
            stroke="#64748b"
            stroke-width="2.5"
        />

        <path
            d="M43 29
               Q52 25 60 30"
            fill="none"
            stroke="#64748b"
            stroke-width="3"
        />

        <circle
            cx="55"
            cy="24"
            r="2.5"
            fill="#334155"
        />

        <path
            d="M22 82
               L78 82
               L82 88
               L18 88
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`,

    bishop: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpBishop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <path
            d="M50 12
               Q64 20 61 34
               Q59 42 52 51
               L64 68
               L72 74
               L28 74
               L36 68
               L48 51
               Q41 42 39 34
               Q36 20 50 12
               Z"
            fill="url(#wpBishop)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M44 22
               L56 36
               L49 43
               L43 35
               Z"
            fill="#64748b"
        />

        <path
            d="M23 74
               L77 74
               L81 85
               L19 85
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`,

    queen: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpQueen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <path
            d="M21 24
               L31 39
               L40 20
               L50 40
               L60 20
               L69 39
               L79 24
               L71 61
               L29 61
               Z"
            fill="url(#wpQueen)"
            stroke="#64748b"
            stroke-width="2"
        />

        <circle cx="21" cy="22" r="5" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <circle cx="40" cy="18" r="5" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <circle cx="50" cy="37" r="5" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <circle cx="60" cy="18" r="5" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <circle cx="79" cy="22" r="5" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>

        <path
            d="M29 61
               L71 61
               L76 75
               L24 75
               Z"
            fill="url(#wpQueen)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M20 76
               L80 76
               L83 87
               L17 87
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`,

    king: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="wpKing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="55%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
            </linearGradient>
        </defs>

        <path
            d="M44 10
               L56 10
               L56 21
               L66 21
               L66 31
               L56 31
               L56 40
               Q66 45 67 57
               L65 65
               L74 73
               L74 78
               L26 78
               L26 73
               L35 65
               L33 57
               Q34 45 44 40
               L44 31
               L34 31
               L34 21
               L44 21
               Z"
            fill="url(#wpKing)"
            stroke="#64748b"
            stroke-width="2"
        />

        <path
            d="M22 78
               L78 78
               L82 88
               L18 88
               Z"
            fill="#e2e8f0"
            stroke="#64748b"
            stroke-width="2"
        />
    </svg>`
},


black: {

    pawn: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpPawn" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <circle
            cx="50"
            cy="28"
            r="15"
            fill="url(#bpPawn)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M38 43
               C39 52 34 59 31 64
               L25 72
               L75 72
               L69 64
               C66 59 61 52 62 43
               Z"
            fill="url(#bpPawn)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M23 73
               Q50 66 77 73
               L81 83
               Q50 91 19 83
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`,

    rook: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpRook" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <path
            d="M25 18
               L25 30
               L33 30
               L33 20
               L43 20
               L43 30
               L57 30
               L57 20
               L67 20
               L67 30
               L75 30
               L75 18
               Z"
            fill="url(#bpRook)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M31 30
               L69 30
               L66 62
               L75 70
               L75 76
               L25 76
               L25 70
               L34 62
               Z"
            fill="url(#bpRook)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M21 76
               L79 76
               L83 86
               L17 86
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`,

    knight: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpKnight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <path
            d="M28 82
               L35 69
               L31 57
               Q27 42 36 28
               Q42 18 55 15
               L65 24
               L58 33
               Q69 38 70 51
               L67 65
               L75 76
               L75 82
               Z"
            fill="url(#bpKnight)"
            stroke="#020617"
            stroke-width="2.5"
        />

        <path
            d="M43 29
               Q52 25 60 30"
            fill="none"
            stroke="#64748b"
            stroke-width="3"
        />

        <circle
            cx="55"
            cy="24"
            r="2.5"
            fill="#020617"
        />

        <path
            d="M22 82
               L78 82
               L82 88
               L18 88
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`,

    bishop: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpBishop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <path
            d="M50 12
               Q64 20 61 34
               Q59 42 52 51
               L64 68
               L72 74
               L28 74
               L36 68
               L48 51
               Q41 42 39 34
               Q36 20 50 12
               Z"
            fill="url(#bpBishop)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M44 22
               L56 36
               L49 43
               L43 35
               Z"
            fill="#64748b"
        />

        <path
            d="M23 74
               L77 74
               L81 85
               L19 85
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`,

    queen: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpQueen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <path
            d="M21 24
               L31 39
               L40 20
               L50 40
               L60 20
               L69 39
               L79 24
               L71 61
               L29 61
               Z"
            fill="url(#bpQueen)"
            stroke="#020617"
            stroke-width="2"
        />

        <circle cx="21" cy="22" r="5" fill="#334155" stroke="#020617" stroke-width="2"/>
        <circle cx="40" cy="18" r="5" fill="#334155" stroke="#020617" stroke-width="2"/>
        <circle cx="50" cy="37" r="5" fill="#334155" stroke="#020617" stroke-width="2"/>
        <circle cx="60" cy="18" r="5" fill="#334155" stroke="#020617" stroke-width="2"/>
        <circle cx="79" cy="22" r="5" fill="#334155" stroke="#020617" stroke-width="2"/>

        <path
            d="M29 61
               L71 61
               L76 75
               L24 75
               Z"
            fill="url(#bpQueen)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M20 76
               L80 76
               L83 87
               L17 87
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`,

    king: `
    <svg class="piece-svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="bpKing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#1e293b"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
        </defs>

        <path
            d="M44 10
               L56 10
               L56 21
               L66 21
               L66 31
               L56 31
               L56 40
               Q66 45 67 57
               L65 65
               L74 73
               L74 78
               L26 78
               L26 73
               L35 65
               L33 57
               Q34 45 44 40
               L44 31
               L34 31
               L34 21
               L44 21
               Z"
            fill="url(#bpKing)"
            stroke="#020617"
            stroke-width="2"
        />

        <path
            d="M22 78
               L78 78
               L82 88
               L18 88
               Z"
            fill="#111827"
            stroke="#020617"
            stroke-width="2"
        />
    </svg>`
}

};

/* =========================================================
5. CREATE INITIAL BOARD
========================================================= */

function createInitialBoard() {

const empty = null;

const newBoard = [
    [
        createPiece("black", "rook"),
        createPiece("black", "knight"),
        createPiece("black", "bishop"),
        createPiece("black", "queen"),
        createPiece("black", "king"),
        createPiece("black", "bishop"),
        createPiece("black", "knight"),
        createPiece("black", "rook")
    ],

    [
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn"),
        createPiece("black", "pawn")
    ],

    [empty, empty, empty, empty, empty, empty, empty, empty],

    [empty, empty, empty, empty, empty, empty, empty, empty],

    [empty, empty, empty, empty, empty, empty, empty, empty],

    [empty, empty, empty, empty, empty, empty, empty, empty],

    [
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn"),
        createPiece("white", "pawn")
    ],

    [
        createPiece("white", "rook"),
        createPiece("white", "knight"),
        createPiece("white", "bishop"),
        createPiece("white", "queen"),
        createPiece("white", "king"),
        createPiece("white", "bishop"),
        createPiece("white", "knight"),
        createPiece("white", "rook")
    ]
];

return newBoard;

}

/* =========================================================
6. CREATE PIECE OBJECT
========================================================= */

function createPiece(color, type) {

return {
    color,
    type,
    hasMoved: false
};

}

/* =========================================================
7. DRAW BOARD
========================================================= */

function renderBoard() {

boardElement.innerHTML = "";

const rows = boardFlipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];

const cols = boardFlipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];

rows.forEach(row => {

    cols.forEach(col => {

        const square = document.createElement("div");

        square.classList.add("square");

        const isLight =
            (row + col) % 2 === 0;

        square.classList.add(
            isLight ? "light" : "dark"
        );

        square.dataset.row = row;
        square.dataset.col = col;

        const piece = board[row][col];

        if (piece) {

            const pieceElement =
                createPieceElement(piece);

            square.appendChild(pieceElement);
        }

        addCoordinates(
            square,
            row,
            col
        );

        boardElement.appendChild(square);
    });
});

updateSquareHighlights();

}

/* =========================================================
8. CREATE SVG PIECE ELEMENT
========================================================= */

function createPieceElement(piece) {

const wrapper =
    document.createElement("div");

wrapper.classList.add(
    "piece",
    piece.color === "white"
        ? "white-piece"
        : "black-piece"
);

wrapper.innerHTML =
    SVG_PIECES[piece.color][piece.type];

return wrapper;

}

/* =========================================================
9. COORDINATES
========================================================= */

function addCoordinates(square, row, col) {

const file =
    FILES[col];

const rank =
    8 - row;

const fileElement =
    document.createElement("span");

fileElement.className =
    "coordinate file";

const rankElement =
    document.createElement("span");

rankElement.className =
    "coordinate rank";

fileElement.textContent =
    file;

rankElement.textContent =
    rank;

/*
   Show file only on bottom rank.
   Show rank only on first file.
*/

const bottomRow =
    boardFlipped ? 0 : 7;

const leftCol =
    boardFlipped ? 7 : 0;

if (row === bottomRow) {
    square.appendChild(fileElement);
}

if (col === leftCol) {
    square.appendChild(rankElement);
}

}

/* =========================================================
10. SQUARE CLICK
========================================================= */

boardElement.addEventListener(
"click",
function (event) {

    if (gameOver) {
        return;
    }

    const square =
        event.target.closest(".square");

    if (!square) {
        return;
    }

    const row =
        Number(square.dataset.row);

    const col =
        Number(square.dataset.col);

    handleSquareClick(row, col);
}

);

/* =========================================================
11. HANDLE SQUARE CLICK
========================================================= */

function handleSquareClick(row, col) {

const clickedPiece =
    board[row][col];

/*
   If a square is already selected
   and clicked square is a legal move.
*/

const selectedMove =
    possibleMoves.find(
        move =>
            move.to.row === row &&
            move.to.col === col
    );

if (
    selectedSquare &&
    selectedMove
) {

    executeMove(
        selectedSquare,
        {
            row,
            col
        },
        selectedMove
    );

    return;
}


/*
   Select own piece.
*/

if (
    clickedPiece &&
    clickedPiece.color === currentTurn
) {

    selectSquare(row, col);

    return;
}


/*
   Otherwise clear selection.
*/

clearSelection();

}

/* =========================================================
12. SELECT SQUARE
========================================================= */

function selectSquare(row, col) {

selectedSquare = {
    row,
    col
};

possibleMoves =
    getLegalMoves(row, col);

updateSquareHighlights();

}

/* =========================================================
13. CLEAR SELECTION
========================================================= */

function clearSelection() {

selectedSquare = null;

possibleMoves = [];

updateSquareHighlights();

}

/* =========================================================
14. HIGHLIGHT SQUARES
========================================================= */

function updateSquareHighlights() {

const squares =
    boardElement.querySelectorAll(".square");

squares.forEach(square => {

    const row =
        Number(square.dataset.row);

    const col =
        Number(square.dataset.col);

    square.classList.remove(
        "selected",
        "possible-move",
        "capture-move",
        "in-check"
    );

    if (
        selectedSquare &&
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {
        square.classList.add("selected");
    }

    const move =
        possibleMoves.find(
            item =>
                item.to.row === row &&
                item.to.col === col
        );

    if (move) {

        if (move.capture) {
            square.classList.add(
                "capture-move"
            );
        } else {
            square.classList.add(
                "possible-move"
            );
        }
    }
});


/*
   Highlight checked king.
*/

["white", "black"].forEach(color => {

    if (isKingInCheck(color)) {

        const king =
            findKing(color);

        if (king) {

            const square =
                boardElement.querySelector(
                    `[data-row="${king.row}"][data-col="${king.col}"]`
                );

            if (square) {
                square.classList.add(
                    "in-check"
                );
            }
        }
    }
});

}

/* =========================================================
15. GET LEGAL MOVES
========================================================= */

function getLegalMoves(row, col) {

const piece =
    board[row][col];

if (!piece) {
    return [];
}

if (piece.color !== currentTurn) {
    return [];
}

const pseudoMoves =
    getPseudoLegalMoves(
        row,
        col,
        board
    );

const legalMoves = [];

for (const move of pseudoMoves) {

    const simulation =
        cloneBoard(board);

    applyMoveToBoard(
        simulation,
        {
            row,
            col
        },
        move,
        false
    );

    if (
        !isKingInCheckOnBoard(
            simulation,
            piece.color
        )
    ) {
        legalMoves.push(move);
    }
}

return legalMoves;

}

/* =========================================================
16. PSEUDO LEGAL MOVES
========================================================= */

function getPseudoLegalMoves(
row,
col,
currentBoard
) {

const piece =
    currentBoard[row][col];

if (!piece) {
    return [];
}

const moves = [];

if (piece.type === "pawn") {

    addPawnMoves(
        row,
        col,
        piece,
        currentBoard,
        moves
    );

} else if (piece.type === "rook") {

    addSlidingMoves(
        row,
        col,
        piece,
        currentBoard,
        moves,
        [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]
    );

} else if (piece.type === "bishop") {

    addSlidingMoves(
        row,
        col,
        piece,
        currentBoard,
        moves,
        [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
    );

} else if (piece.type === "queen") {

    addSlidingMoves(
        row,
        col,
        piece,
        currentBoard,
        moves,
        [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
    );

} else if (piece.type === "knight") {

    const jumps = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    jumps.forEach(
        ([dr, dc]) => {

            addNormalMove(
                row,
                col,
                row + dr,
                col + dc,
                piece,
                currentBoard,
                moves
            );
        }
    );

} else if (piece.type === "king") {

    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    directions.forEach(
        ([dr, dc]) => {

            addNormalMove(
                row,
                col,
                row + dr,
                col + dc,
                piece,
                currentBoard,
                moves
            );
        }
    );


    /*
       Castling.
    */

    if (
        !piece.hasMoved &&
        !isKingInCheckOnBoard(
            currentBoard,
            piece.color
        )
    ) {

        addCastlingMoves(
            row,
            col,
            piece,
            currentBoard,
            moves
        );
    }
}

return moves;

}

/* =========================================================
17. PAWN MOVES
========================================================= */

function addPawnMoves(
row,
col,
piece,
currentBoard,
moves
) {

const direction =
    piece.color === "white"
        ? -1
        : 1;

const startRow =
    piece.color === "white"
        ? 6
        : 1;

const oneRow =
    row + direction;

/*
   One square forward.
*/

if (
    isInsideBoard(oneRow, col) &&
    !currentBoard[oneRow][col]
) {

    moves.push({
        to: {
            row: oneRow,
            col
        },
        capture: false
    });


    /*
       Two squares forward.
    */

    const twoRow =
        row + direction * 2;

    if (
        row === startRow &&
        !currentBoard[twoRow][col]
    ) {

        moves.push({
            to: {
                row: twoRow,
                col
            },
            capture: false,
            doublePawnMove: true
        });
    }
}


/*
   Diagonal captures.
*/

[-1, 1].forEach(dc => {

    const targetRow =
        row + direction;

    const targetCol =
        col + dc;

    if (
        !isInsideBoard(
            targetRow,
            targetCol
        )
    ) {
        return;
    }

    const target =
        currentBoard[targetRow][targetCol];

    if (
        target &&
        target.color !== piece.color
    ) {

        moves.push({
            to: {
                row: targetRow,
                col: targetCol
            },
            capture: true
        });
    }
});


/*
   En passant.
*/

if (enPassantTarget) {

    if (
        enPassantTarget.row ===
            row + direction &&
        Math.abs(
            enPassantTarget.col - col
        ) === 1
    ) {

        moves.push({
            to: {
                row:
                    enPassantTarget.row,
                col:
                    enPassantTarget.col
            },
            capture: true,
            enPassant: true
        });
    }
}

}

/* =========================================================
18. NORMAL MOVE
========================================================= */

function addNormalMove(
row,
col,
targetRow,
targetCol,
piece,
currentBoard,
moves
) {

if (
    !isInsideBoard(
        targetRow,
        targetCol
    )
) {
    return;
}

const target =
    currentBoard[targetRow][targetCol];

if (!target) {

    moves.push({
        to: {
            row: targetRow,
            col: targetCol
        },
        capture: false
    });

    return;
}

/*
   Cannot capture own piece.
*/

if (
    target.color === piece.color
) {
    return;
}

/*
   A king cannot capture another king
   as a legal chess move.
*/

if (target.type === "king") {
    return;
}

moves.push({
    to: {
        row: targetRow,
        col: targetCol
    },
    capture: true
});

}

/* =========================================================
19. SLIDING MOVES
========================================================= */

function addSlidingMoves(
row,
col,
piece,
currentBoard,
moves,
directions
) {

directions.forEach(
    ([dr, dc]) => {

        let r =
            row + dr;

        let c =
            col + dc;

        while (
            isInsideBoard(r, c)
        ) {

            const target =
                currentBoard[r][c];

            if (!target) {

                moves.push({
                    to: {
                        row: r,
                        col: c
                    },
                    capture: false
                });

            } else {

                if (
                    target.color !==
                    piece.color &&
                    target.type !== "king"
                ) {

                    moves.push({
                        to: {
                            row: r,
                            col: c
                        },
                        capture: true
                    });
                }

                break;
            }

            r += dr;
            c += dc;
        }
    }
);

}

/* =========================================================
20. CASTLING
========================================================= */

function addCastlingMoves(
row,
col,
king,
currentBoard,
moves
) {

const homeRow =
    king.color === "white"
        ? 7
        : 0;

if (row !== homeRow || col !== 4) {
    return;
}


/*
   Kingside castling.
*/

const kingSideRook =
    currentBoard[homeRow][7];

if (
    kingSideRook &&
    kingSideRook.type === "rook" &&
    kingSideRook.color === king.color &&
    !kingSideRook.hasMoved &&
    !currentBoard[homeRow][5] &&
    !currentBoard[homeRow][6]
) {

    if (
        !isSquareAttacked(
            currentBoard,
            homeRow,
            5,
            oppositeColor(king.color)
        ) &&
        !isSquareAttacked(
            currentBoard,
            homeRow,
            6,
            oppositeColor(king.color)
        )
    ) {

        moves.push({
            to: {
                row: homeRow,
                col: 6
            },
            capture: false,
            castle: "king"
        });
    }
}


/*
   Queenside castling.
*/

const queenSideRook =
    currentBoard[homeRow][0];

if (
    queenSideRook &&
    queenSideRook.type === "rook" &&
    queenSideRook.color === king.color &&
    !queenSideRook.hasMoved &&
    !currentBoard[homeRow][1] &&
    !currentBoard[homeRow][2] &&
    !currentBoard[homeRow][3]
) {

    if (
        !isSquareAttacked(
            currentBoard,
            homeRow,
            3,
            oppositeColor(king.color)
        ) &&
        !isSquareAttacked(
            currentBoard,
            homeRow,
            2,
            oppositeColor(king.color)
        )
    ) {

        moves.push({
            to: {
                row: homeRow,
                col: 2
            },
            capture: false,
            castle: "queen"
        });
    }
}

}

/* =========================================================
21. EXECUTE MOVE
========================================================= */

function executeMove(
from,
to,
moveInfo
) {

const movingPiece =
    board[from.row][from.col];

if (!movingPiece) {
    return;
}


/*
   Save state for Undo.
*/

history.push({
    board: cloneBoard(board),
    currentTurn,
    enPassantTarget:
        enPassantTarget
            ? { ...enPassantTarget }
            : null,
    whiteTime,
    blackTime
});


const capturedPiece =
    board[to.row][to.col];


/*
   Move piece.
*/

board[to.row][to.col] =
    movingPiece;

board[from.row][from.col] =
    null;

movingPiece.hasMoved =
    true;


/*
   En passant capture.
*/

if (moveInfo.enPassant) {

    const capturedPawnRow =
        movingPiece.color === "white"
            ? to.row + 1
            : to.row - 1;

    board[capturedPawnRow][to.col] =
        null;
}


/*
   Castling.
*/

if (moveInfo.castle) {

    const row = from.row;

    if (moveInfo.castle === "king") {

        const rook =
            board[row][7];

        board[row][5] =
            rook;

        board[row][7] =
            null;

        if (rook) {
            rook.hasMoved = true;
        }

    } else {

        const rook =
            board[row][0];

        board[row][3] =
            rook;

        board[row][0] =
            null;

        if (rook) {
            rook.hasMoved = true;
        }
    }
}


/*
   Set en-passant target.
*/

enPassantTarget = null;

if (
    movingPiece.type === "pawn" &&
    Math.abs(
        to.row - from.row
    ) === 2
) {

    enPassantTarget = {
        row:
            (from.row + to.row) / 2,
        col:
            from.col
    };
}


/*
   Pawn promotion.
*/

if (
    movingPiece.type === "pawn" &&
    (
        to.row === 0 ||
        to.row === 7
    )
) {

    pendingPromotion = {
        row: to.row,
        col: to.col
    };

    currentTurn =
        oppositeColor(currentTurn);

    clearSelection();

    renderBoard();

    showPromotionModal();

    updateGameUI();

    return;
}


/*
   Normal turn switch.
*/

currentTurn =
    oppositeColor(currentTurn);

clearSelection();

addMoveToHistory(
    from,
    to,
    movingPiece,
    capturedPiece,
    moveInfo
);

renderBoard();

updateGameUI();

checkGameState();

startGameTimer();

}

/* =========================================================
22. APPLY MOVE TO SIMULATION BOARD
========================================================= */

function applyMoveToBoard(
currentBoard,
from,
move,
handleSpecial
) {

const piece =
    currentBoard[from.row][from.col];

if (!piece) {
    return;
}

currentBoard[move.to.row][move.to.col] =
    {
        ...piece
    };

currentBoard[from.row][from.col] =
    null;


/*
   En passant simulation.
*/

if (
    handleSpecial &&
    move.enPassant
) {

    const capturedRow =
        piece.color === "white"
            ? move.to.row + 1
            : move.to.row - 1;

    currentBoard[capturedRow][move.to.col] =
        null;
}


/*
   Castling simulation.
*/

if (
    handleSpecial &&
    move.castle
) {

    const row = from.row;

    if (move.castle === "king") {

        currentBoard[row][5] =
            currentBoard[row][7];

        currentBoard[row][7] =
            null;

    } else {

        currentBoard[row][3] =
            currentBoard[row][0];

        currentBoard[row][0] =
            null;
    }
}

}

/* =========================================================
23. FIND KING
========================================================= */

function findKing(
color,
currentBoard = board
) {

for (
    let row = 0;
    row < 8;
    row++
) {

    for (
        let col = 0;
        col < 8;
        col++
    ) {

        const piece =
            currentBoard[row][col];

        if (
            piece &&
            piece.color === color &&
            piece.type === "king"
        ) {

            return {
                row,
                col
            };
        }
    }
}

return null;

}

/* =========================================================
24. KING IN CHECK
========================================================= */

function isKingInCheck(color) {

return isKingInCheckOnBoard(
    board,
    color
);

}

function isKingInCheckOnBoard(
currentBoard,
color
) {

const king =
    findKing(
        color,
        currentBoard
    );

if (!king) {
    return true;
}

return isSquareAttacked(
    currentBoard,
    king.row,
    king.col,
    oppositeColor(color)
);

}

/* =========================================================
25. SQUARE ATTACKED
========================================================= */

function isSquareAttacked(
currentBoard,
row,
col,
attackerColor
) {

/*
   Pawn attacks.
*/

const pawnDirection =
    attackerColor === "white"
        ? -1
        : 1;

const pawnRow =
    row - pawnDirection;

for (
    const dc of [-1, 1]
) {

    const pawnCol =
        col + dc;

    if (
        isInsideBoard(
            pawnRow,
            pawnCol
        )
    ) {

        const piece =
            currentBoard[pawnRow][pawnCol];

        if (
            piece &&
            piece.color === attackerColor &&
            piece.type === "pawn"
        ) {
            return true;
        }
    }
}


/*
   Knight attacks.
*/

const knightJumps = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1]
];

for (
    const [dr, dc] of knightJumps
) {

    const r = row + dr;
    const c = col + dc;

    if (
        !isInsideBoard(r, c)
    ) {
        continue;
    }

    const piece =
        currentBoard[r][c];

    if (
        piece &&
        piece.color === attackerColor &&
        piece.type === "knight"
    ) {
        return true;
    }
}


/*
   King attacks.
*/

for (
    let dr = -1;
    dr <= 1;
    dr++
) {

    for (
        let dc = -1;
        dc <= 1;
        dc++
    ) {

        if (
            dr === 0 &&
            dc === 0
        ) {
            continue;
        }

        const r = row + dr;
        const c = col + dc;

        if (
            !isInsideBoard(r, c)
        ) {
            continue;
        }

        const piece =
            currentBoard[r][c];

        if (
            piece &&
            piece.color === attackerColor &&
            piece.type === "king"
        ) {
            return true;
        }
    }
}


/*
   Rook / Queen attacks.
*/

const straightDirections = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];

if (
    slidingAttackExists(
        currentBoard,
        row,
        col,
        attackerColor,
        straightDirections,
        ["rook", "queen"]
    )
) {
    return true;
}


/*
   Bishop / Queen attacks.
*/

const diagonalDirections = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
];

if (
    slidingAttackExists(
        currentBoard,
        row,
        col,
        attackerColor,
        diagonalDirections,
        ["bishop", "queen"]
    )
) {
    return true;
}

return false;

}

/* =========================================================
26. SLIDING ATTACK CHECK
========================================================= */

function slidingAttackExists(
currentBoard,
row,
col,
attackerColor,
directions,
attackerTypes
) {

for (
    const [dr, dc] of directions
) {

    let r =
        row + dr;

    let c =
        col + dc;

    while (
        isInsideBoard(r, c)
    ) {

        const piece =
            currentBoard[r][c];

        if (!piece) {

            r += dr;
            c += dc;
            continue;
        }

        if (
            piece.color === attackerColor &&
            attackerTypes.includes(
                piece.type
            )
        ) {
            return true;
        }

        break;
    }
}

return false;

}

/* =========================================================
27. CHECK GAME STATE
========================================================= */

function checkGameState() {

const color =
    currentTurn;

const hasLegalMove =
    playerHasLegalMoves(color);

const inCheck =
    isKingInCheck(color);


/*
   Checkmate.
*/

if (
    inCheck &&
    !hasLegalMove
) {

    gameOver = true;

    stopTimer();

    const winner =
        oppositeColor(color);

    showGameMessage(
        "♚",
        "Checkmate!",
        `${capitalize(winner)} wins the game.`
    );

    setStatus(
        winner,
        "Winner"
    );

    return;
}


/*
   Stalemate.
*/

if (
    !inCheck &&
    !hasLegalMove
) {

    gameOver = true;

    stopTimer();

    showGameMessage(
        "½",
        "Stalemate",
        "The game ends in a draw."
    );

    setStatus(
        "white",
        "Draw"
    );

    setStatus(
        "black",
        "Draw"
    );

    return;
}


/*
   Check.
*/

if (inCheck) {

    turnText.textContent =
        `${capitalize(color)} is in check!`;

} else {

    turnText.textContent =
        `${capitalize(color)}'s Turn`;
}

}

/* =========================================================
28. PLAYER HAS LEGAL MOVES
========================================================= */

function playerHasLegalMoves(color) {

for (
    let row = 0;
    row < 8;
    row++
) {

    for (
        let col = 0;
        col < 8;
        col++
    ) {

        const piece =
            board[row][col];

        if (
            piece &&
            piece.color === color
        ) {

            const moves =
                getAllLegalMovesForPiece(
                    row,
                    col,
                    color
                );

            if (
                moves.length > 0
            ) {
                return true;
            }
        }
    }
}

return false;

}

/* =========================================================
29. LEGAL MOVES FOR ANY PIECE
========================================================= */

function getAllLegalMovesForPiece(
row,
col,
color
) {

const piece =
    board[row][col];

if (
    !piece ||
    piece.color !== color
) {
    return [];
}

const pseudo =
    getPseudoLegalMoves(
        row,
        col,
        board
    );

const legal = [];

for (
    const move of pseudo
) {

    const simulation =
        cloneBoard(board);

    applyMoveToBoard(
        simulation,
        {
            row,
            col
        },
        move,
        true
    );

    if (
        !isKingInCheckOnBoard(
            simulation,
            color
        )
    ) {
        legal.push(move);
    }
}

return legal;

}

/* =========================================================
30. PROMOTION
========================================================= */

function showPromotionModal() {

promotionModal.classList.remove(
    "hidden"
);

}

function hidePromotionModal() {

promotionModal.classList.add(
    "hidden"
);

}

document
.querySelectorAll(".promotion-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (!pendingPromotion) {
                return;
            }

            const selectedType =
                button.dataset.piece;

            promotePawn(
                selectedType
            );
        }
    );
});

function promotePawn(type) {

if (!pendingPromotion) {
    return;
}

const {
    row,
    col
} = pendingPromotion;

const pawn =
    board[row][col];

if (!pawn) {
    pendingPromotion = null;
    hidePromotionModal();
    return;
}

const allowed = [
    "queen",
    "rook",
    "bishop",
    "knight"
];

if (
    !allowed.includes(type)
) {
    type = "queen";
}

pawn.type = type;

pendingPromotion = null;

hidePromotionModal();

addPromotionNotation(type);

renderBoard();

updateGameUI();

checkGameState();

startGameTimer();

}

/* =========================================================
31. PROMOTION NOTATION
========================================================= */

function addPromotionNotation(type) {

const symbols = {
    queen: "Q",
    rook: "R",
    bishop: "B",
    knight: "N"
};

const last =
    history[history.length - 1];

if (!last) {
    return;
}

last.promotion =
    symbols[type] || "Q";

updateMoveHistory();

}

/* =========================================================
32. MOVE NOTATION
========================================================= */

function addMoveToHistory(
from,
to,
piece,
capturedPiece,
moveInfo
) {

const notation =
    createMoveNotation(
        from,
        to,
        piece,
        capturedPiece,
        moveInfo
    );

const lastMove =
    history[history.length - 1];

if (lastMove) {
    lastMove.notation =
        notation;
}

updateMoveHistory();

}

function createMoveNotation(
from,
to,
piece,
capturedPiece,
moveInfo
) {

/*
   Castling notation.
*/

if (
    moveInfo.castle === "king"
) {
    return "O-O";
}

if (
    moveInfo.castle === "queen"
) {
    return "O-O-O";
}


const symbols = {
    king: "K",
    queen: "Q",
    rook: "R",
    bishop: "B",
    knight: "N",
    pawn: ""
};

let result =
    symbols[piece.type];


/*
   Pawn capture.
*/

if (
    piece.type === "pawn" &&
    capturedPiece
) {

    result +=
        FILES[from.col];
}


if (capturedPiece) {
    result += "x";
}

result +=
    FILES[to.col] +
    (8 - to.row);

return result;

}

/* =========================================================
33. MOVE HISTORY UI
========================================================= */

function updateMoveHistory() {

moveHistoryElement.innerHTML = "";

if (
    history.length === 0
) {

    const empty =
        document.createElement("p");

    empty.className =
        "empty-history";

    empty.textContent =
        "No moves yet";

    moveHistoryElement.appendChild(
        empty
    );

    return;
}


/*
   History stores every position.
   Each actual move corresponds to
   history item + current board.

   Build notation list.
*/

const moveList =
    history
        .map(item => item.notation)
        .filter(Boolean);


for (
    let i = 0;
    i < moveList.length;
    i += 2
) {

    const row =
        document.createElement("div");

    row.className =
        "move-row";

    const number =
        document.createElement("div");

    number.className =
        "move-number";

    number.textContent =
        `${Math.floor(i / 2) + 1}.`;

    const white =
        document.createElement("div");

    white.className =
        "move-white";

    white.textContent =
        moveList[i] || "";

    const black =
        document.createElement("div");

    black.className =
        "move-black";

    black.textContent =
        moveList[i + 1] || "";

    row.appendChild(number);
    row.appendChild(white);
    row.appendChild(black);

    moveHistoryElement.appendChild(
        row
    );
}

moveHistoryElement.scrollTop =
    moveHistoryElement.scrollHeight;

}

/* =========================================================
34. UNDO
========================================================= */

function undoMove() {

if (
    history.length === 0 ||
    gameOver
) {
    return;
}

const previous =
    history.pop();

board =
    cloneBoard(
        previous.board
    );

currentTurn =
    previous.currentTurn;

enPassantTarget =
    previous.enPassantTarget
        ? {
            ...previous.enPassantTarget
        }
        : null;

whiteTime =
    previous.whiteTime;

blackTime =
    previous.blackTime;

pendingPromotion =
    null;

hidePromotionModal();

clearSelection();

renderBoard();

updateMoveHistory();

updateGameUI();

gameOver = false;

startGameTimer();

}

/* =========================================================
35. BOARD FLIP
========================================================= */

function flipBoard() {

boardFlipped =
    !boardFlipped;

renderBoard();

}

/* =========================================================
36. NEW GAME
========================================================= */

function newGame() {

stopTimer();

board =
    createInitialBoard();

currentTurn =
    "white";

selectedSquare =
    null;

possibleMoves =
    [];

boardFlipped =
    false;

gameOver =
    false;

history =
    [];

enPassantTarget =
    null;

pendingPromotion =
    null;

whiteTime =
    10 * 60;

blackTime =
    10 * 60;

hidePromotionModal();
hideDrawModal();
hideResignModal();
hideGameMessage();

renderBoard();

updateMoveHistory();

updateGameUI();

gameStarted = false;

startGameTimer();

}

/* =========================================================
37. TIMER
========================================================= */

function startGameTimer() {

stopTimer();

if (gameOver) {
    return;
}

if (!gameStarted) {
    gameStarted = true;
}

timerInterval =
    setInterval(
        () => {

            if (
                currentTurn === "white"
            ) {

                whiteTime--;

                if (
                    whiteTime <= 0
                ) {

                    whiteTime = 0;

                    timeOut("white");
                }

            } else {

                blackTime--;

                if (
                    blackTime <= 0
                ) {

                    blackTime = 0;

                    timeOut("black");
                }
            }

            updateTimers();

        },
        1000
    );

}

function stopTimer() {

if (timerInterval) {

    clearInterval(
        timerInterval
    );

    timerInterval = null;
}

}

/* =========================================================
38. TIME OUT
========================================================= */

function timeOut(color) {

if (gameOver) {
    return;
}

gameOver = true;

stopTimer();

const winner =
    oppositeColor(color);

showGameMessage(
    "⏱",
    "Time Out!",
    `${capitalize(winner)} wins on time.`
);

setStatus(
    winner,
    "Winner"
);

}

/* =========================================================
39. UPDATE TIMERS
========================================================= */

function updateTimers() {

whiteTimerElement.textContent =
    formatTime(whiteTime);

blackTimerElement.textContent =
    formatTime(blackTime);


whiteTimerElement.classList.remove(
    "warning",
    "danger"
);

blackTimerElement.classList.remove(
    "warning",
    "danger"
);


if (whiteTime <= 60) {

    whiteTimerElement.classList.add(
        "danger"
    );

} else if (whiteTime <= 180) {

    whiteTimerElement.classList.add(
        "warning"
    );
}


if (blackTime <= 60) {

    blackTimerElement.classList.add(
        "danger"
    );

} else if (blackTime <= 180) {

    blackTimerElement.classList.add(
        "warning"
    );
}

}

function formatTime(seconds) {

const mins =
    Math.floor(seconds / 60);

const secs =
    seconds % 60;

return (
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
);

}

/* =========================================================
40. DRAW
========================================================= */

drawBtn.addEventListener(
"click",
() => {

    if (gameOver) {
        return;
    }

    showDrawModal();
}

);

function showDrawModal() {

drawModal.classList.remove(
    "hidden"
);

}

function hideDrawModal() {

drawModal.classList.add(
    "hidden"
);

}

acceptDrawBtn.addEventListener(
"click",
() => {

    hideDrawModal();

    gameOver = true;

    stopTimer();

    showGameMessage(
        "½",
        "Draw!",
        "Both players agreed to a draw."
    );

    setStatus(
        "white",
        "Draw"
    );

    setStatus(
        "black",
        "Draw"
    );
}

);

rejectDrawBtn.addEventListener(
"click",
hideDrawModal
);

/* =========================================================
41. RESIGN
========================================================= */

resignBtn.addEventListener(
"click",
() => {

    if (gameOver) {
        return;
    }

    showResignModal();
}

);

function showResignModal() {

resignModal.classList.remove(
    "hidden"
);

}

function hideResignModal() {

resignModal.classList.add(
    "hidden"
);

}

confirmResignBtn.addEventListener(
"click",
() => {

    hideResignModal();

    const winner =
        oppositeColor(currentTurn);

    gameOver = true;

    stopTimer();

    showGameMessage(
        "🏳",
        "Game Over",
        `${capitalize(currentTurn)} resigned. ${capitalize(winner)} wins.`
    );

    setStatus(
        winner,
        "Winner"
    );
}

);

cancelResignBtn.addEventListener(
"click",
hideResignModal
);

/* =========================================================
42. GAME MESSAGE
========================================================= */

function showGameMessage(
icon,
title,
text
) {

messageIcon.textContent =
    icon;

messageTitle.textContent =
    title;

messageText.textContent =
    text;

gameMessage.classList.remove(
    "hidden"
);

}

function hideGameMessage() {

gameMessage.classList.add(
    "hidden"
);

}

playAgainBtn.addEventListener(
"click",
newGame
);

/* =========================================================
43. UI UPDATE
========================================================= */

function updateGameUI() {

updateTimers();

turnText.textContent =
    `${capitalize(currentTurn)}'s Turn`;

whitePlayer.classList.remove(
    "active"
);

blackPlayer.classList.remove(
    "active"
);

if (
    currentTurn === "white"
) {

    whitePlayer.classList.add(
        "active"
    );

} else {

    blackPlayer.classList.add(
        "active"
    );
}

whiteStatus.textContent =
    currentTurn === "white"
        ? "Your turn"
        : "Waiting";

blackStatus.textContent =
    currentTurn === "black"
        ? "Your turn"
        : "Waiting";

undoBtn.disabled =
    history.length === 0;

}

/* =========================================================
44. STATUS
========================================================= */

function setStatus(
color,
text
) {

if (color === "white") {
    whiteStatus.textContent =
        text;
} else {
    blackStatus.textContent =
        text;
}

}

/* =========================================================
45. CLEAR HISTORY
========================================================= */

clearHistoryBtn.addEventListener(
"click",
() => {

    if (
        history.length === 0
    ) {
        return;
    }

    /*
       We don't destroy the game state.
       This button only clears visible history.
    */

    moveHistoryElement.innerHTML = "";

    const empty =
        document.createElement("p");

    empty.className =
        "empty-history";

    empty.textContent =
        "History cleared";

    moveHistoryElement.appendChild(
        empty
    );
}

);

/* =========================================================
46. BUTTON EVENTS
========================================================= */

newGameBtn.addEventListener(
"click",
newGame
);

undoBtn.addEventListener(
"click",
undoMove
);

flipBoardBtn.addEventListener(
"click",
flipBoard
);

/* =========================================================
47. KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
"keydown",
event => {

    if (event.key === "Escape") {

        clearSelection();

        hideDrawModal();

        hideResignModal();

        hidePromotionModal();
    }
}

);

/* =========================================================
48. HELPER FUNCTIONS
========================================================= */

function isInsideBoard(
row,
col
) {

return (
    row >= 0 &&
    row < 8 &&
    col >= 0 &&
    col < 8
);

}

function oppositeColor(color) {

return color === "white"
    ? "black"
    : "white";

}

function capitalize(text) {

return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
);

}

/* =========================================================
49. CLONE BOARD
========================================================= */

function cloneBoard(
original
) {

return original.map(
    row =>
        row.map(
            piece =>
                piece
                    ? { ...piece }
                    : null
        )
);

}

/* =========================================================
50. INITIALIZE GAME
========================================================= */

function initializeGame() {

board =
    createInitialBoard();

currentTurn =
    "white";

selectedSquare =
    null;

possibleMoves =
    [];

boardFlipped =
    false;

gameOver =
    false;

history =
    [];

enPassantTarget =
    null;

pendingPromotion =
    null;

whiteTime =
    10 * 60;

blackTime =
    10 * 60;

renderBoard();

updateMoveHistory();

updateGameUI();

startGameTimer();

}

/* =========================================================
51. START
========================================================= */

initializeGame();

/* =========================================================
END OF main.js
========================================================= */
