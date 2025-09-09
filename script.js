(() => {
  // DOM Elements
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const dnaCountEl = document.getElementById("dnaCount");
  const dnaTotalEl = document.getElementById("dnaTotal");

  // Canvas resizing for responsiveness
  function resize() {
    const maxWidth = 900;
    const w = Math.min(window.innerWidth - 20, maxWidth);
    const h = w * 0.75;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener("resize", resize);
  resize();

  const W = () => canvas.width;
  const H = () => canvas.height;

  // Player
  const player = {
    x: 50,
    y: H() - 150,
    w: 40,
    h: 60,
    speed: 6,
    dx: 0,
    dy: 0,
    color: "#00ff00",
    canJump: true,
    jumpPower: -14,
    isMutated: false,
    mutationTimer: 0,
    maxMutationTime: 300, // frames
  };

  // Ground
  const groundHeight = 40;

  // Gravity
  const gravity = 0.8;

  // DNA Fragments
  let dnaFragments = [];
  const totalDNAToCollect = 5;
  let dnaCollected = 0;

  // Controls
  let leftPressed = false;
  let rightPressed = false;
  let jumpPressed = false;

  // Input handling
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
    if (e.key === "ArrowRight" || e.key === "d") rightPressed = true;
    if (e.key === " " || e.key === "ArrowUp") {
      jumpPressed = true;
      e.preventDefault(); // prevent scroll
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
    if (e.key === "ArrowRight" || e.key === "d") rightPressed = false;
    if (e.key === " " || e.key === "ArrowUp") jumpPressed = false;
  });

  // Spawn DNA fragments
  function spawnDNA() {
    for (let i = 0; i < totalDNAToCollect; i++) {
      const x = 200 + Math.random() * (W() - 400);
      const y = 100 + Math.random() * (H() - groundHeight - 200);
      dnaFragments.push({
        x,
        y,
        w: 30,
        h: 30,
        collected: false,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }
    dnaTotalEl.textContent = totalDNAToCollect;
  }

  // Check collision
  function isColliding(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // Update player
  function updatePlayer(dt) {
    // Horizontal movement
    player.dx = 0;
    if (leftPressed) player.dx = -player.speed;
    if (rightPressed) player.dx = player.speed;

    // Apply jump
    if (jumpPressed && player.canJump) {
      player.dy = player.jumpPow;
      player.canJump = false;
      jumpPressed = false; // prevent holding jump
    }

    // Apply physics
    player.dy += gravity;
    player.y += player.dy;
    player.x += player.dx;

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W()) player.x = W() - player.w;

    // Ground collision
    if (player.y >= H() - player.h - groundHeight) {
      player.y = H() - player.h - groundHeight;
      player.dy = 0;
      player.canJump = true;
    }
  }

  // Update DNA collection
  function checkDNA() {
    for (let dna of dnaFragments) {
      if (!dna.collected && isColliding(player, dna)) {
        dna.collected = true;
        dnaCollected++;
        dnaCountEl.textContent = dnaCollected;
        player.isMutated = true;
        player.mutationTimer = player.maxMutationTime;

        // Visual feedback
        player.color = "#00ff88";
        setTimeout(() => {
          if (!isAllCollected()) player.color = "#00ff00";
        }, 200);
      }
    }

    // Check win condition
    if (isAllCollected()) {
      setTimeout(() => {
        showVictory();
      }, 500);
    }
  }

  function isAllCollected() {
    return dnaCollected >= totalDNAToCollect;
  }

  // Draw everything
  function draw() {
    ctx.clearRect(0, 0, W(), H());

    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, H() - groundHeight, W(), groundHeight);

    // Draw DNA fragments
    dnaFragments.forEach((dna) => {
      if (!dna.collected) {
        // Floating animation
        const float = Math.sin(Date.now() * 0.005 + dna.floatOffset) * 5;
        ctx.fillStyle = "yellow";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "yellow";
        ctx.fillRect(dna.x, dna.y + float, dna.w, dna.h);

        // DNA double helix hint
        ctx.fillStyle = "white";
        ctx.fillRect(dna.x + 8, dna.y + float + 6, 4, 18);
        ctx.fillRect(dna.x + 20, dna.y + float + 6, 4, 18);
      }
    });
    ctx.shadowBlur = 0;

    // Draw mutation effect
    if (player.isMutated && player.mutationTimer > 0) {
      const alpha = 0.1 + 0.4 * Math.sin(Date.now() * 0.01);
      ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        60 + Math.sin(Date.now() * 0.008) * 10,
        0,
        Math.PI * 2
      );
      ctx.fill();
      player.mutationTimer--;
      if (player.mutationTimer <= 0) {
        player.isMutated = false;
        player.color = "#00ff00";
      }
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Add eyes
    ctx.fillStyle = "black";
    ctx.fillRect(player.x + 10, player.y + 10, 5, 5);
    ctx.fillRect(player.x + 25, player.y + 10, 5, 5);
  }

  // Victory screen
  function showVictory() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, W(), H());

    ctx.fillStyle = "#00ff00";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mutation Complete! 🧬", W() / 2, H() / 2 - 40);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText(`You collected ${dnaCollected} DNA strands!`, W() / 2, H() / 2 + 20);

    ctx.font = "18px sans-serif";
    ctx.fillText("Click or press SPACE to play again", W() / 2, H() / 2 + 70);

    // Reset on click/space
    function restart() {
      document.removeEventListener("click", restart);
      document.removeEventListener("keydown", spaceRestart);
      resetGame();
    }

    function spaceRestart(e) {
      if (e.code === "Space") {
        document.removeEventListener("keydown", spaceRestart);
        document.removeEventListener("click", restart);
        resetGame();
      }
    }

    document.addEventListener("click", restart);
    document.addEventListener("keydown", spaceRestart);
  }

  function resetGame() {
    dnaFragments = [];
    dnaCollected = 0;
    dnaCountEl.textContent = "0";
    player.isMutated = false;
    player.mutationTimer = 0;
    player.color = "#00ff00";
    player.x = 50;
    player.y = H() - 150;
    player.dy = 0;
    spawnDNA();
    requestAnimationFrame(gameLoop);
  }

  // Game loop
  let lastTime = 0;
  function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    updatePlayer(dt);
    checkDNA();
    draw();

    requestAnimationFrame(gameLoop);
  }

  // Start game
  spawnDNA();
  requestAnimationFrame(gameLoop);
})();
