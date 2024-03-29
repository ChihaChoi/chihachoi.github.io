const targetWord = "gladge";
const WORD_LENGTH = targetWord.length;
const NUMBER_OF_GUESSES = 6;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const greenEmoji = ":hypern:";
const yellowEmoji = ":smugA:";
const redEmoji = ":bencel:";
const preGuessGridMessage = "Chidle";
const postGuessGridMessage = "\n https://chihachoi.github.io/index.html";
const numberOfGuessesEmojis = [
  ":googleGary:",
  ":gladge:",
  ":YEP:",
  ":UHM:",
  ":criticalP:",
  ":mald:",
  ":digi:",
];
// const numberOfGuessesEmojis = [
//   ":cryge:",
//   ":cryge:",
//   ":cryge:",
//   ":cryge:",
//   ":cryge:",
//   ":cryge:",
//   ":cryge:",
// ];
const winMessage = "click if you're :gladge: to be back";
// const loseMessage = (word) => `gg the word was ${word}. click to let everyone know you're a dissapointment`
const loseMessage = (word) => `gg the word was ${word}. click to :cryge:`;

function createGrid() {
  let container = document.querySelector(".guess-grid");
  container.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, 4em)`;
  for (let i = 0; i < WORD_LENGTH * NUMBER_OF_GUESSES; i++) {
    const newDiv = document.createElement("div");
    newDiv.classList.add("tile");
    container.append(newDiv);
  }
}

createGrid();

startInteraction();

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  let shareButton = document.querySelector(".share-button");
  if (guess === targetWord) {
    shareButton.style.display = "block";
    shareButton.innerHTML = winMessage;
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    shareButton.style.display = "block";
    shareButton.innerHTML = loseMessage(targetWord);
    stopInteraction();
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

function copyClipboardMessage() {
  navigator.clipboard.writeText(writeMessage());
  document.querySelector(".share-button").innerHTML = "COPIED! :D";
}
function writeMessage() {
  const guesses = Array.from(guessGrid.querySelectorAll("[data-letter]")).map(
    (node) => node.attributes["data-state"].value
  );
  const attempts = guesses.length / WORD_LENGTH - 1;
  let newLineCount = 0;
  let message =
    preGuessGridMessage +
    ` ${numberOfGuessesEmojis[attempts]}/${NUMBER_OF_GUESSES}\n`;

  guesses.forEach((guess) => {
    console.log(newLineCount);

    switch (guess) {
      case "correct":
        console.log("correct");
        message = message.concat(greenEmoji);
        break;
      case "wrong":
        message = message.concat(redEmoji);
        break;
      case "wrong-location":
        message = message.concat(yellowEmoji);
        break;
    }

    newLineCount++;
    if (newLineCount === WORD_LENGTH) {
      message = message.concat("\n");
      newLineCount = 0;
    }
  });
  message = message.concat(postGuessGridMessage);
  return message;
}
