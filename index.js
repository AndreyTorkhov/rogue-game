// Определение класса Game
class Game {
  constructor() {
    this.playerHealth = 100;
    this.enemyHealth = 100;
    this.playerDamage = 50;
    this.playX = null;
    this.playY = null;
    this.enemyCount = 0;
    this.rows = 24;
    this.cols = 40;
  }
  // случайное число
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // соседние координаты при атаке
  getAdjacentCells(x, y) {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];
  }
  // Сбрасываем состояние игры
  resetGame() {
    this.playerHealth = 100;
    this.playerDamage = 50;
    this.enemyHealth = 100;
    this.playX = 0;
    this.playY = 0;
    location.reload();
  }
  // расстояние от противника до игрока
  distance(playerPosition, enemyPosition) {
    return (
      Math.abs(playerPosition.x - enemyPosition.x) +
      Math.abs(playerPosition.y - enemyPosition.y)
    );
  }
  //добавление объектов на карту
  generateObjects(map, numObjects, objectType) {
    for (let i = 0; i < numObjects; i++) {
      let objectX, objectY;
      do {
        objectX = this.getRandomInt(0, this.cols - 1);
        objectY = this.getRandomInt(0, this.rows - 1);
      } while (map[objectY][objectX] !== "tile");
      map[objectY][objectX] = objectType;
    }
  }
  //инициализация игры
  init() {
    const map = this.generateMap(); // генерируем карту
    this.drawMap(map); // отрисовываем карту со стенами, коридорами и комнатами

    // Сохраняем начальные координаты игрока
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === "player") {
          this.playX = x;
          this.playY = y;
        }
      });
    });
    let lastKeyPressTime = 0; //флаг для создания интервала между ходом игрока
    // Изменяем обработчик событий клавиш
    $(document).keydown((e) => {
      const currentTime = new Date().getTime();

      if (currentTime - lastKeyPressTime >= 50) {
        lastKeyPressTime = currentTime;
        const key = e.key;
        // Перемещаем игрока в зависимости от нажатой клавиши
        switch (key) {
          case "ц":
          case "w":
            this.movePlayer(map, -1, 0);
            break;
          case "ы":
          case "s":
            this.movePlayer(map, 1, 0);
            break;
          case "ф":
          case "a":
            this.movePlayer(map, 0, -1);
            break;
          case "в":
          case "d":
            this.movePlayer(map, 0, 1);
            break;
          case " ":
            this.attack(map);
            break;
        }
      }
    });
  }
  // Определение метода для генерации карты
  generateMap() {
    const map = [];
    for (let i = 0; i < this.rows; i++) {
      const row = [];
      for (let j = 0; j < this.cols; j++) {
        row.push("wall");
      }
      map.push(row);
    }
    const corridors = [];
    // Генерация коридоров по вертикали
    const numHallV = this.getRandomInt(3, 5);
    for (let i = 0; i < numHallV; i++) {
      let hallLineX, hallLineY, hallWidth, hallHeight;
      let validCorridor = false;
      do {
        hallLineX = this.getRandomInt(1, this.cols - 1);
        hallLineY = 0;
        hallWidth = 1;
        hallHeight = this.rows;
        validCorridor = corridors.every(
          (corridor) => Math.abs(hallLineX - corridor.x) >= 2
        );
      } while (
        !validCorridor ||
        map
          .slice(hallLineY - 1, hallLineY + hallHeight + 1)
          .some((row) =>
            row.slice(hallLineX - 1, hallLineX + hallWidth + 1).includes("tile")
          )
      );
      this.createRoomOrCorridor(
        map,
        hallLineX,
        hallLineY,
        hallWidth,
        hallHeight
      );
      corridors.push({
        x: hallLineX,
        y: hallLineY,
        width: hallWidth,
        height: hallHeight,
      });
    }
    // Генерация коридоров по горизонтали
    const numHallH = this.getRandomInt(3, 5);
    for (let i = 0; i < numHallH; i++) {
      let hallLineX, hallLineY, hallWidth, hallHeight;
      let validCorridor = false;
      do {
        hallLineX = 0;
        hallLineY = this.getRandomInt(1, this.rows - 1);
        hallWidth = this.cols;
        hallHeight = 1;
        validCorridor = corridors.every(
          (corridor) => Math.abs(hallLineY - corridor.y) >= 2
        );
      } while (
        !validCorridor ||
        map
          .slice(hallLineY - 1, hallLineY + hallHeight + 1)
          .some((row) =>
            row.slice(hallLineX - 1, hallLineX + hallWidth + 1).includes("tile")
          )
      );
      this.createRoomOrCorridor(
        map,
        hallLineX,
        hallLineY,
        hallWidth,
        hallHeight
      );
      corridors.push({
        x: hallLineX,
        y: hallLineY,
        width: hallWidth,
        height: hallHeight,
      });
    }
    // Генерация комнат
    const numRooms = 10;
    const existingRooms = [];
    for (let i = 0; i < numRooms; i++) {
      let roomX, roomY, roomWidth, roomHeight;
      let connected = false;
      const corridor = corridors[this.getRandomInt(0, corridors.length - 1)];
      // Генерируем координаты комнаты в пределах коридора с учетом размеров самой комнаты
      roomX = this.getRandomInt(corridor.x, corridor.x + corridor.width);
      roomY = this.getRandomInt(corridor.y, corridor.y + corridor.height);
      roomWidth = this.getRandomInt(3, 8);
      roomHeight = this.getRandomInt(3, 8);
      if (
        roomX >= 0 &&
        roomY >= 0 &&
        roomX + roomWidth - 3 < this.cols &&
        roomY + roomHeight - 3 < this.rows
      ) {
        let intersects = false;
        for (const existingRoom of existingRooms) {
          if (
            !(
              roomX + roomWidth < existingRoom.x ||
              roomX > existingRoom.x + existingRoom.width ||
              roomY + roomHeight < existingRoom.y ||
              roomY > existingRoom.y + existingRoom.height
            )
          ) {
            intersects = true;
            break;
          }
        }
        if (!intersects) {
          connected = true;
        }
      }
      // Если комната подходит, добавляем ее в массив существующих комнат
      if (connected) {
        existingRooms.push({
          x: roomX,
          y: roomY,
          width: roomWidth,
          height: roomHeight,
        });
        this.createRoomOrCorridor(map, roomX, roomY, roomWidth, roomHeight);
      }
    }

    //добавление специальных клеток на карту
    const numSwords = 2;
    const numPotions = 10;
    const numEnemies = 10;
    this.generateObjects(map, numSwords, "sword");
    this.generateObjects(map, numPotions, "potion");
    this.generateObjects(map, numEnemies, "enemy");
    this.generateObjects(map, 1, "player");

    return map;
  }

  // Определение метода для отрисовки карты
  drawMap(map) {
    const field = $(".field");
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        const tile = $("<div></div>");
        tile.addClass("tile");
        if (cell === "wall") {
          tile.addClass("tileW");
        } else if (cell === "sword") {
          tile.addClass("tileSW");
        } else if (cell === "potion") {
          tile.addClass("tileHP");
        } else if (cell === "enemy") {
          tile.addClass("tileE");
          // Добавляем здоровье противника внутрь клетки
          tile.append(
            `<div class="health" style="width: ${this.enemyHealth}%;"></div>`
          );
        } else if (cell === "player") {
          tile.addClass("tileP");
          // Добавляем здоровье игрока внутрь клетки
          const playerHealth = this.playerHealth <= 0 ? 0 : this.playerHealth;
          tile.append(
            `<div class="health" style="width: ${playerHealth}%;"></div>`
          );
        }
        tile.css("width", "20px");
        tile.css("height", "20px");
        tile.css("top", y * 20 + "px");
        tile.css("left", x * 20 + "px");
        tile.appendTo(field);
      });
    });
  }

  // Определение метода для создания комнаты или коридора
  createRoomOrCorridor(map, startX, startY, width, height) {
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + height; y++) {
        if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
          // Добавляем проверку, чтобы не перезаписывать клетку с зельем
          map[y][x] = "tile"; // Обозначаем проходимую область
        }
      }
    }
  }

  //передвижение игрока
  movePlayer(map, deltaY, deltaX) {
    const newX = this.playX + deltaX;
    const newY = this.playY + deltaY;
    if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
      const newTile = map[newY][newX];
      // Проверяем, что новая клетка является проходимой и не содержит врага
      if (newTile !== "wall" && newTile !== "enemy") {
        const oldPlayerTile = $(".tileP");
        oldPlayerTile.removeClass("tileP").addClass("tile");
        if (newTile === "potion") {
          this.playerHealth = 100;
          $(".tileHP").removeClass("tileHP").addClass("tile");
          map[newY][newX] = "tile";
        }
        if (newTile === "sword") {
          this.playerDamage += 25;
          $(".tileSW").removeClass("tileSW").addClass("tile");
          map[newY][newX] = "tile";
        }
        // Обновляем позицию игрока на карте
        map[this.playY][this.playX] = "tile";
        this.playX = newX;
        this.playY = newY;
        map[this.playY][this.playX] = "player";
        this.moveEnemies(map);
        this.drawMap(map);
      }
    }
  }

  //перемещение врага
  moveEnemies(map) {
    const directions = [
      { deltaY: -1, deltaX: 0 },
      { deltaY: 1, deltaX: 0 },
      { deltaY: 0, deltaX: -1 },
      { deltaY: 0, deltaX: 1 },
    ];

    // Создадим список противников, которые еще не двигались в этом ходу
    const enemiesToMove = [];

    // Перебираем всех противников на карте
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === "enemy") {
          enemiesToMove.push({ y, x });
        }
      }
    }

    // Перемещаем каждого противника
    enemiesToMove.forEach(({ y, x }) => {
      const playerAdjacent = this.getAdjacentCells(x, y);
      let playerAttacked = false;
      playerAdjacent.forEach((cell) => {
        const px = cell.x;
        const py = cell.y;

        if (map[py] && map[py][px] === "player") {
          this.attackPlayer(map);
          playerAttacked = true;
        }
      });
      if (!playerAttacked) {
        const randomDirection =
          directions[Math.floor(Math.random() * directions.length)];
        const newY = y + randomDirection.deltaY;
        const newX = x + randomDirection.deltaX;
        if (
          newY >= 0 &&
          newY < map.length &&
          newX >= 0 &&
          newX < map[y].length &&
          map[newY][newX] === "tile"
        ) {
          const oldEnemyTile = $(".tileE");
          oldEnemyTile.removeClass("tileE").addClass("tile");
          map[y][x] = "tile";
          map[newY][newX] = "enemy";
        }
      }
    });

    this.drawMap(map);
  }

  //атака противника
  attackPlayer(map) {
    const playerPosition = { x: this.playX, y: this.playY };

    const playerTile = $(`.tileP`);
    const adjacentCells = this.getAdjacentCells(this.playX, this.playY);

    adjacentCells.forEach((cell) => {
      const x = cell.x;
      const y = cell.y;

      if (map[y] && map[y][x] === "enemy") {
        const enemyPosition = { x: x, y: y };
        const distance = this.distance(playerPosition, enemyPosition);
        if (distance <= 1) {
          this.playerHealth -= 50;
          playerTile.children(".health").css("width", this.playerHealth + "%");
          if (this.playerHealth === 0) {
            alert("Игра окончена! Вы проиграли");
            setTimeout(() => {
              this.resetGame();
              return;
            }, 500);
          }
        }
      }
    });
    this.drawMap(map);
  }

  //атака игрока
  attack(map) {
    const playerPosition = { x: this.playX, y: this.playY };
    const adjacentCells = this.getAdjacentCells(this.playX, this.playY);
    adjacentCells.forEach((cell) => {
      const x = cell.x;
      const y = cell.y;

      if (map[y] && map[y][x] === "enemy") {
        const enemyTile = $(".tileE");
        const enemyPosition = { x: x, y: y };
        const distance = this.distance(playerPosition, enemyPosition);
        if (distance <= 1) {
          this.enemyHealth -= this.playerDamage;
          enemyTile.children(".health").css("width", this.enemyHealth + "%");
          if (this.enemyHealth <= 0) {
            map[y][x] = "tile"; // Убираем соперника с поля
            enemyTile.removeClass("tileE").addClass("tile");
            this.enemyHealth = 100;
            this.enemyCount++; // Увеличиваем счетчик убитых соперников
            if (this.enemyCount === 10) {
              alert("Игра окончена! Вы выиграли");
              setTimeout(() => {
                this.resetGame();
                return;
              }, 500);
            }
          }
        }
      }
    });
    this.drawMap(map);
  }
}
