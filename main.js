const intro = document.querySelector(".game-intro");
const mainGame = document.querySelector(".main-game");
const afterGame = document.querySelector(".after-game");

const goal = document.getElementById("goal");
const playerScore = document.getElementById("player-score");
const lives = document.getElementById("lives");

const hintBtn = document.querySelector(".hint-btn");
const remaininingHints = document.getElementById("remaining-hints");

const gameStatus = document.getElementById("status");
const gameMessage = document.getElementById("after-game-msg");

const colorToGuess = document.querySelector("#color-to-guess");
const colorsContainer = document.querySelector(".random-colors");

const nextClrBtn = document.getElementById("next-color");

const muteBtn = document.querySelector(".volume-btn.on");
const unmuteBtn = document.querySelector(".volume-btn.off");

let randomColors;

const difficulties = [
    {
        difficulty: "easy",
        goal: 5,
        numberOfColors: 4,
        colorRange: 256,
        lives: 2,
        hints: 1
    },
    {
        difficulty: "medium",
        goal: 10,
        numberOfColors: 5,
        colorRange: 100,
        lives: 3,
        hints: 2
    },
    {
        difficulty: "hard",
        goal: 15,
        numberOfColors: 6,
        colorRange: 45,
        lives: 4,
        hints: 3
    }
];

let currDifficulty;
let audio = new Audio();
audio.volume = 0.2;

/* Starts a game with a difficulty that user has chosen.
   Draws game board and randomizes colors for the first time */

const startGame = (difficulty) => {
    currDifficulty = difficulties.find((diff) => diff.difficulty === difficulty);
    initializeBoard();
    randomizeBoard();
}

/*  Adds new <div> elements in document. The number of created elements
    depends on the difficulty that user has chosen. Initializes number of
    hints, user score, lives and the goal score of the game, also depending on
    difficulty */

const initializeBoard = () => {
    for (let i = 0; i < currDifficulty.numberOfColors; i++) {
        let newColorContainer = document.createElement("div");
        newColorContainer.classList.add("random-color");
        newColorContainer.addEventListener("click", checkColor);
        colorsContainer.appendChild(newColorContainer);
    }

    goal.innerHTML = currDifficulty.goal;
    playerScore.innerHTML = 0;
    lives.innerHTML = currDifficulty.lives;

    remaininingHints.innerHTML = currDifficulty.hints;

    intro.style.display = "none";
    mainGame.style.display = "flex";
}

/*  Checks if the color that user has clicked is the same color
    as the random color that the game has generated. Then changes
    scores and lives and plays some sounds depending on the correctness 
    of the choice and state of game */

const checkColor = (e) => {
    let chosenColor = e.target.style.backgroundColor;

    if (chosenColor === colorToGuess.style.backgroundColor) {
        gameStatus.innerHTML = "Correct!"
        gameStatus.style.color = "green"
        playerScore.innerHTML = parseInt(playerScore.innerHTML) + 1;
        if (playerScore.innerHTML == currDifficulty.goal) {
            endGame("Congratulations, you've won the game!");
            audio.src = "./audio/win.wav";
        } else {
            audio.src = "./audio/correct.wav";
        }
    } else {
        gameStatus.innerHTML = "Wrong!"
        gameStatus.style.color = "red"
        lives.innerHTML = parseInt(lives.innerHTML) - 1;
        if (lives.innerHTML == 0) {
            endGame(`You've lost the game with ${playerScore.innerHTML} points.`);
            audio.src = "./audio/lose.wav";
        } else {
            audio.src = "./audio/wrong.wav";
        }
    }
    audio.play();

    nextClrBtn.style.pointerEvents = "initial";

    randomColors.forEach((element) => {
        element.style.pointerEvents = "none";
    });

    hintBtn.style.pointerEvents = "none";
}

/*  At first, generates random color that user has to guess.
    Then, generates 4 to 6(depending on game difficulty) random
    colors(one of which is the same color as the first one) 
    that user has to guess from. */

const randomizeBoard = () => {
    let randomColor = getRandomColor(null);
    colorToGuess.style.backgroundColor = randomColor;

    nextClrBtn.style.pointerEvents = "none";

    gameStatus.innerHTML = "";

    randomColors = document.querySelectorAll(".random-color");
    let correctIndex = Math.floor(Math.random() * currDifficulty.numberOfColors);
    for (let i = 0; i < currDifficulty.numberOfColors; i++) {
        if (i === correctIndex) {
            randomColors[i].style.backgroundColor = randomColor;
        } else {
            randomColors[i].style.backgroundColor = getRandomColor(randomColor);
        }
    }

    randomColors.forEach((element) => {
        element.style.pointerEvents = "initial";
        element.style.opacity = "1";
    });

    if (remaininingHints.innerHTML > 0) {
        hintBtn.style.pointerEvents = "initial";
    }
}

/*  This function gets one argument - color. If color is null,
    the function returns randomly generated RGB color. In that 
    case, Red, Green and Blue can vary from 0 to 255. However,
    if color is not null, this function takes color that user 
    has to guess and generates random Red, Green and Blue 
    depending of that components of the color and the maximum
    range of colors of the chosen difficulty. This function 
    works this way so that there will be more difference
    between playing on easy and playing on hard. On hard mode,
    randomly generated colors will be more similar to the 
    color that user has to guess. */

const getRandomColor = (color) => {
    if (!color) {
        return `rgb(${getColorComponent(0, 255)}, ${getColorComponent(0, 255)}, ${getColorComponent(0, 255)})`;
    } else {
        let rgb = color.match(/\d+/g);
        let toGuessRed = parseInt(rgb[0]);
        let toGuessGreen = parseInt(rgb[1]);
        let toGuessBlue = parseInt(rgb[2]);

        let range = currDifficulty.colorRange;

        return `rgb(${getColorComponent(toGuessRed, range)}, ${getColorComponent(toGuessGreen, range)}, ${getColorComponent(toGuessBlue, range)})`;
    }
}

/*  This function gets two arguments. The first argument is the value
    of the component(Red, green or blue) of the RGB color that user has
    to guess. The second argument is the number which is the maximum
    difference between that color component and the color component that
    this function returns. */

const getColorComponent = (toGuessComponent, range) => {
    return Math.floor(Math.random() * (Math.min(toGuessComponent + range, 255) - Math.max(toGuessComponent - range, 0) + 1)
        + Math.max(toGuessComponent - range, 0));
}

/*  Gives a hint to the user. Deletes half of the possible choices
    (if that number is not integer, rounds it down). */

const makeHint = () => {
    hintBtn.style.pointerEvents = "none";
    remaininingHints.innerHTML--;

    let correctColor = colorToGuess.style.backgroundColor;
    let numberOfChoices = randomColors.length;
    let deletesOnHint = Math.floor(numberOfChoices / 2);
    let deleted = 0;

    for (let i = 0; i < numberOfChoices; i++) {
        let currColor = randomColors[i].style.backgroundColor;
        let randomNum = Math.random();

        if (randomNum < (deletesOnHint - deleted) / (numberOfChoices - 1 - i) && currColor != correctColor) {
            randomColors[i].style.opacity = "0.25";
            randomColors[i].style.pointerEvents = "none";
            deleted++;
        }
        if (deleted === deletesOnHint) {
            return;
        }
    }
}

/*  Simply displays an endgame message */

const endGame = (message) => {
    afterGame.style.display = "flex";
    gameMessage.innerHTML = `${message} <br> Would you like to play again or choose other difficulty?`
}

/*  Resets board and starts the game again with the same difficulty */

const playAgain = () => {
    resetBoard();
    startGame(currDifficulty.difficulty);
}

/*  Resets board and returns user to the main page, where they can choose
    other difficulties */

const toMainMenu = () => {
    resetBoard();
    intro.style.display = "flex";
    mainGame.style.display = "none";
}

/*  Resets board by deleting all multiple choice colors */

const resetBoard = () => {
    colorsContainer.innerHTML = "";
    afterGame.style.display = "none";
}

const mute = () => {
    muteBtn.style.display = "none"
    unmuteBtn.style.display = "block";

    audio.volume = 0;
}

const unmute = () => {
    muteBtn.style.display = "block"
    unmuteBtn.style.display = "none";

    audio.volume = 0.2;
}