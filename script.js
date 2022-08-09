window.onresize = changeWindow;
const game = new Game();
const reversedControls = false;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  runFrame();
}

function runFrame() {
  //DO ALL DRAWING HERE
  ctx.clearRect(0, 0, width, height);
  game.step();
  game.draw();
  requestAnimationFrame(runFrame);
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
}

function keyDown(key) {
  if(key.keyCode == 65) {
    if(!reversedControls) {
      input.ll = true;
    }
  }
  if(key.keyCode == 83) {
    if(!reversedControls) {
      input.l = true;
    }
  }
  if(key.keyCode == 68) {
    if(!reversedControls) {
      input.r = true;
    }
  }
  if(key.keyCode == 70) {
    if(!reversedControls) {
      input.rr = true;
    }
  }
  if(key.keyCode == 74) {
    if(reversedControls) {
      input.ll = true;
    }
  }
  if(key.keyCode == 75) {
    if(reversedControls) {
      input.l = true;
    }
  }
  if(key.keyCode == 76) {
    if(reversedControls) {
      input.r = true;
    }
  }
  if(key.keyCode == 186) {
    if(reversedControls) {
      input.rr = true;
    }
  }
  if(key.keyCode == 32) {
    space = true;
  }
}

function keyUp(key) {
  if(key.keyCode == 65) {
    if(!reversedControls) {
      input.ll = false;
    }
  }
  if(key.keyCode == 83) {
    if(!reversedControls) {
      input.l = false;
    }
  }
  if(key.keyCode == 68) {
    if(!reversedControls) {
      input.r = false;
    }
  }
  if(key.keyCode == 70) {
    if(!reversedControls) {
      input.rr = false;
    }
  }
  if(key.keyCode == 74) {
    if(reversedControls) {
      input.ll = false;
    }
  }
  if(key.keyCode == 75) {
    if(reversedControls) {
      input.l = false;
    }
  }
  if(key.keyCode == 76) {
    if(reversedControls) {
      input.r = false;
    }
  }
  if(key.keyCode == 186) {
    if(reversedControls) {
      input.rr = false;
    }
  }
  if(key.keyCode == 32) {
    space = false;
  }
}

function leftClick() {
  const x = event.clientX;
  const y = event.clientY;
}
