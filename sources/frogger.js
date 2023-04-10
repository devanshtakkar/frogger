"use strict";

let lanes = [];
let lastRenderTime = 0;
let frogInitialX = 200;
let frogInitialY = 495;
let backgroundCanvas = document.getElementById("backgroundCanvas");
let spriteCanvas = document.getElementById("spriteCanvas");
let interfaceCanvas = document.getElementById("interfaceCanvas");

interfaceCanvas.addEventListener("click", startGame);

function startGame(event) {
  let btnX = 140;
  let btnY = 257.5;
  let btnW = 120;
  let btnH = 50;
  switch (player.state) {
    case "start":
      break;
    case "end":
      btnX = 95;
      btnY = 257.5;
      btnW = 215;
      btnH = 50;
      player.lives = 5;
      player.score = 0;
  }
  if (isPointCollision(event.offsetX, event.offsetY, btnX, btnY, btnW, btnH)) {
    player.state = "playing";
    interfaceCanvas.removeEventListener("click", startGame);
    let timer = setInterval(() => {
      if (player.time !== 0) {
        player.time -= 1;
      } else {
        clearInterval(timer);
      }
    }, 1000);
    requestAnimationFrame(renderGame);
  }

  function renderGame(t) {
    if (t - lastRenderTime > 50) {
      lastRenderTime = t;
      interfaceCtx.clearRect(0, 0, 400, 565);
      renderFrog();
      renderBackground();
      renderLives();
      renderScore();
      renderTime();
      renderSprites();
      renderEndScreen();
      requestAnimationFrame(renderGame);
    }
    requestAnimationFrame(renderGame);
  }
}

let spriteImg = new Image();
let deadImg = new Image();

spriteImg.src = "../assets/sprites.png";
deadImg.src = "../assets/dead.png";

let interfaceCtx = interfaceCanvas.getContext("2d");
let backgroundCtx = backgroundCanvas.getContext("2d");
let spriteCtx = spriteCanvas.getContext("2d");

function isPointCollision(px, py, bx, by, bw, bh) {
  let boxStartX = bx;
  let boxStartY = by;
  let boxEndX = bx + bw;
  let boxEndY = by + bh;
  if (px >= boxStartX && px <= boxEndX && py >= boxStartY && py <= boxEndY) {
    return true;
  } else {
    return false;
  }
}

function isBoxCollision(b1x, b1y, b1w, b1h, b2x, b2y, b2w, b2h) {
  let b1centerX = b1x + b1w / 2;
  let b1centerY = b1y + b1h / 2;

  let b2centerX = b2x + b2w / 2;
  let b2centerY = b2y + b2h / 2;
  let combinedWidth = b1w / 2 + b2w / 2;
  let combinedHeight = b1h / 2 + b2h / 2;
  if (
    Math.abs(b2centerX - b1centerX) <= combinedWidth &&
    Math.abs(b2centerY - b1centerY) <= combinedHeight
  ) {
    return true;
  } else {
    return false;
  }
}

function showStartScreen() {
  interfaceCtx.fillRect(0, 0, 400, 565);
  interfaceCtx.drawImage(spriteImg, 0, 0, 399, 50, 25, 170, 399, 50);
  interfaceCtx.fillStyle = "green";
  interfaceCtx.fillRect(140, 257.5, 120, 50);
  interfaceCtx.fillStyle = "black";
  interfaceCtx.font = "40px serif";
  interfaceCtx.fillText("Start", 160, 295);
}

let frog = {
  x: frogInitialX,
  y: frogInitialY,
  direction: "up",
  speed: 10,
  width: 26,
  height: 20,
};

let player = {
  time: 60,
  lives: 5,
  state: "start",
  score: 0,
  safeHome: [false, false, false, false],
};

function renderBackground() {
  backgroundCtx.fillStyle = "black";
  //make background black
  backgroundCtx.fillRect(0, 0, 399, 565);
  //draw frogger title
  backgroundCtx.drawImage(spriteImg, 0, 0, 399, 50, 30, 0, 399, 50);
  //make the water
  backgroundCtx.fillStyle = "blue";
  backgroundCtx.fillRect(0, 50, 400, 240);
  //insert safe area
  backgroundCtx.drawImage(spriteImg, 0, 55, 400, 60, 0, 50, 400, 60);
  //middle safe zones
  backgroundCtx.drawImage(spriteImg, 0, 115, 400, 50, 0, 265, 400, 50);
  backgroundCtx.drawImage(spriteImg, 0, 115, 400, 50, 0, 484, 400, 50);
  player.safeHome.forEach((live, index) => {
    if (live) {
      backgroundCtx.drawImage(
        spriteImg,
        10,
        367,
        26,
        20,
        58 + (85 * index + 1),
        70,
        26,
        20
      );
    }
  });
}

function renderFrog() {
  let imgX;
  let imgY;
  switch (frog.direction) {
    case "up":
      imgX = 10;
      imgY = 367;
      break;
    case "down":
      imgX = 79;
      imgY = 367;
      break;
    case "right":
      imgX = 11;
      imgY = 333;
      break;
    case "left":
      imgX = 80;
      imgY = 334;
      break;
  }
  let roadSpritesInView = [];
  let riverSpritesInView = [];
  lanes.forEach((lane, index) => {
    lane.sprites.forEach((sprite, index) => {
      if (sprite.x > -100 && sprite.x < 400) {
        let spriteInfo = {
          x: sprite.x,
          y: lane.y,
          width: sprite.width,
          height: sprite.height,
          direction: lane.direction,
          speed: lane.speed,
        };
        if (lane.isInRiver) {
          riverSpritesInView.push(spriteInfo);
        } else {
          roadSpritesInView.push(spriteInfo);
        }
      }
    });
  });
  function checkFrogRoadCollision() {
    for (let sprite of roadSpritesInView) {
      if (
        isBoxCollision(
          frog.x,
          frog.y,
          frog.width,
          frog.height,
          sprite.x,
          sprite.y,
          sprite.width,
          sprite.height
        )
      ) {
        return true;
      } else {
        continue;
      }
    }
    return false;
  }
  function checkFrogRiverCollision() {
    for (let sprite of riverSpritesInView) {
      if (
        isBoxCollision(
          frog.x,
          frog.y,
          frog.width,
          frog.height,
          sprite.x,
          sprite.y,
          sprite.width,
          sprite.height
        )
      ) {
        return sprite;
      } else {
        continue;
      }
    }
    return false;
  }
  if (frog.y > 265) {
    if (checkFrogRoadCollision()) {
      interfaceCtx.drawImage(deadImg, 0, 0, 30, 30, frog.x, frog.y, 30, 30);
      document.removeEventListener("keydown", movefrog);
      if (player.state !== "paused") {
        setTimeout(() => {
          player.lives -= 1;
          frog.x = frogInitialX;
          frog.y = frogInitialY;
          document.addEventListener("keydown", movefrog);
          player.state = "playing";
        }, 500);
        player.state = "paused";
      }
    } else {
      interfaceCtx.drawImage(
        spriteImg,
        imgX,
        imgY,
        frog.width,
        frog.height,
        frog.x,
        frog.y,
        frog.width,
        frog.height
      );
    }
  } else if (frog.y > 100 && frog.y < 265) {
    if (checkFrogRiverCollision()) {
      let currentLog = checkFrogRiverCollision();
      interfaceCtx.drawImage(
        spriteImg,
        imgX,
        imgY,
        frog.width,
        frog.height,
        frog.x,
        frog.y,
        frog.width,
        frog.height
      );
      if (currentLog.direction == 1) {
        if (frog.x > 400 - frog.width) {
          frog.x = 400 - frog.width;
        } else {
          frog.x += currentLog.speed;
        }
      } else {
        if (frog.x <= 0) {
          frog.x = 0;
        } else {
          frog.x -= currentLog.speed;
        }
      }
    } else {
      interfaceCtx.drawImage(deadImg, 0, 0, 30, 30, frog.x, frog.y, 30, 30);
      document.removeEventListener("keydown", movefrog);
      if (player.state !== "paused") {
        setTimeout(() => {
          player.lives -= 1;
          frog.x = frogInitialX;
          frog.y = frogInitialY;
          document.addEventListener("keydown", movefrog);
          player.state = "playing";
        }, 500);
        player.state = "paused";
      }
    }
  } else {
    interfaceCtx.drawImage(
      spriteImg,
      imgX,
      imgY,
      frog.width,
      frog.height,
      frog.x,
      frog.y,
      frog.width,
      frog.height
    );
  }
}

function renderLives() {
  let canvasX = 0;
  for (let i = 0; i < player.lives; i++) {
    backgroundCtx.drawImage(spriteImg, 10, 330, 30, 30, canvasX, 520, 25, 25);
    canvasX += 17;
  }
}

function renderScore() {
  backgroundCtx.font = "15px sans-serif";
  backgroundCtx.fillStyle = "yellow";
  backgroundCtx.fillText("Score: " + player.score, 0, 560);
}

function renderTime() {
  backgroundCtx.font = "25px sans-serif";
  backgroundCtx.fillStyle = "yellow";
  backgroundCtx.fillText("Time: " + player.time, 300, 560);
}

function movefrog(event) {
  switch (event.code) {
    case "ArrowUp":
      event.preventDefault();
      (frog.width = 26), (frog.height = 20), (frog.direction = "up");
      frog.y -= frog.speed;
      break;
    case "ArrowDown":
      event.preventDefault();
      (frog.width = 26), (frog.height = 20), (frog.direction = "down");
      frog.y += frog.speed;
      break;
    case "ArrowRight":
      event.preventDefault();
      (frog.width = 20), (frog.height = 26), (frog.direction = "right");
      frog.x += frog.speed;
      break;
    case "ArrowLeft":
      event.preventDefault();
      (frog.width = 20), (frog.height = 26), (frog.direction = "left");
      frog.x -= frog.speed;
      break;
  }
  if (frog.y >= 490) {
    frog.y = 490;
    if (frog.x >= 400 - frog.width) {
      frog.x = 400 - frog.width;
    } else if (frog.x <= 0) {
      frog.x = 0;
    }
  } else if (frog.y <= 110) {
    if (frog.x >= 35 && frog.x <= 80 && !player.safeHome[0]) {
      player.safeHome[0] = true;
      player.lives -= 1;
      frog.x = frogInitialX;
      frog.y = frogInitialY;
      incrementScore();
    } else if (frog.x >= 125 && frog.x <= 165 && !player.safeHome[1]) {
      player.safeHome[1] = true;
      player.lives -= 1;
      frog.x = frogInitialX;
      frog.y = frogInitialY;
      incrementScore();
    } else if (frog.x >= 205 && frog.x <= 245 && !player.safeHome[2]) {
      player.safeHome[2] = true;
      player.lives -= 1;
      frog.x = frogInitialX;
      frog.y = frogInitialY;
      incrementScore();
    } else if (frog.x >= 295 && frog.x <= 335 && !player.safeHome[3]) {
      player.safeHome[3] = true;
      player.lives -= 1;
      frog.x = frogInitialX;
      frog.y = frogInitialY;
      incrementScore();
    } else {
      frog.y = 110;
    }
    if (frog.x >= 400 - frog.width) {
      frog.x = 400 - frog.width;
    } else if (frog.x <= 0) {
      frog.x = 0;
    }
  } else if (frog.x >= 370) {
    frog.x = 370;
  } else if (frog.x <= 0) {
    frog.x = 0;
  }
  interfaceCtx.clearRect(0, 0, 400, 565);
  renderFrog();
}

document.addEventListener("keydown", movefrog);

class Sprite {
  constructor(width, height, ix, iy, x) {
    this.width = width;
    this.height = height;
    this.ix = ix;
    this.iy = iy;
    this.x = x;
  }
}

function Lane(direction, speed, sprites, y, isInRiver) {
  this.direction = direction;
  this.speed = speed;
  this.sprites = sprites;
  this.y = y;
  this.isInRiver = isInRiver;
}

function renderSprites() {
  function createSpritesArray(
    width,
    height,
    ix,
    iy,
    distanceInSprites,
    direction = 1
  ) {
    let spritePosX = Math.floor(Math.random() * 400);
    let spriteArray = [];
    for (let i = 0; i < 20; i++) {
      spriteArray.push(new Sprite(width, height, ix, iy, spritePosX));
      if (direction == -1) {
        spritePosX += distanceInSprites + width;
      } else {
        spritePosX -= distanceInSprites + width;
      }
    }
    return spriteArray;
  }
  if (lanes[0]) {
    for (let lane of lanes) {
      for (let sprite of lane.sprites) {
        if (lane.direction == 1) {
          sprite.x += lane.speed;
        } else {
          sprite.x -= lane.speed;
        }
      }
    }
  } else {
    lanes = [
      new Lane(-1, 1, createSpritesArray(179, 22, 6, 165, 50, -1), 110, true),
      new Lane(1, 2, createSpritesArray(118, 22, 6, 197, 80), 138, true),
      new Lane(-1, 3, createSpritesArray(85, 22, 6, 229, 30, -1), 162, true),
      new Lane(1, 1, createSpritesArray(118, 22, 6, 197, 80), 188, true),
      new Lane(-1, 2, createSpritesArray(85, 22, 6, 229, 45, -1), 216, true),
      new Lane(1, 3, createSpritesArray(179, 22, 6, 165, 110), 243, true),
      new Lane(-1, 1, createSpritesArray(29, 20, 9, 266, 120, -1), 310, false),
      new Lane(1, 2, createSpritesArray(48, 20, 104, 301, 70), 340, false),
      new Lane(-1, 3, createSpritesArray(26, 23, 10, 300, 100, -1), 365, false),
      new Lane(1, 1, createSpritesArray(26, 26, 80, 263, 90), 395, false),
      new Lane(-1, 2, createSpritesArray(29, 20, 9, 266, 120, -1), 430, false),
      new Lane(1, 3, createSpritesArray(30, 25, 45, 264, 120), 460, false),
    ];
  }
  spriteCtx.clearRect(0, 0, 400, 565);
  lanes.forEach((lane, index) => {
    for (let i = 0; i < lane.sprites.length; i++) {
      let sprite = lane.sprites[i];
      spriteCtx.drawImage(
        spriteImg,
        sprite.ix,
        sprite.iy,
        sprite.width,
        sprite.height,
        sprite.x,
        lane.y,
        sprite.width,
        sprite.height
      );
    }
  });
}

function incrementScore() {
  player.safeHome.forEach((item, index) => {
    if (item) {
      player.score += item * 100;
    }
  });
}

function renderEndScreen() {
  function gameCompleted() {
    let frogsInSafeHome = 0;
    player.safeHome.forEach((item, index) => {
      if (item) {
        frogsInSafeHome++;
      }
    });
    if (frogsInSafeHome == 4) {
      return true;
    } else {
      return false;
    }
  }
  if (player.lives == 0 || player.timer <= 0 || gameCompleted()) {
    player.state = "end";
    lanes = [];
    interfaceCtx.fillRect(0, 0, 400, 565);
    interfaceCtx.fillStyle = "green";
    interfaceCtx.fillRect(95, 257.5, 215, 50);
    interfaceCtx.fillStyle = "black";
    interfaceCtx.font = "40px serif";
    interfaceCtx.fillText("Play Again", 115, 295);
    interfaceCtx.fillStyle = "yellow";
    interfaceCtx.font = "60px serif";
    interfaceCtx.fillText("Game Over", 60, 150);
    interfaceCtx.fillText("Score: " + player.score, 80, 230);
    interfaceCtx.fillStyle = "black";
    interfaceCanvas.addEventListener("click", startGame);
  }
}
