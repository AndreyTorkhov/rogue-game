// Определение класса Game
class Game {
  constructor() {
    this.playerHealth = 100;
    this.enemyHealth = 100;
    this.playerDamage = 50;
    this.playX = null;
    this.playY = null;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

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

  init() {
    const map = this.generateMap(); // генерируем карту
    this.drawMap(map); // отрисовываем карту со стенами, коридорами и комнатами

    const field = $(".field");

    // Сохраняем начальные координаты игрока
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === "player") {
          this.playX = x;
          this.playY = y;
        }
      });
    });

    let lastKeyPressTime = 0;

    // Изменяем обработчик событий клавиш
    $(document).keydown((e) => {
      const currentTime = new Date().getTime();

      if (currentTime - lastKeyPressTime >= 250) {
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
    const rows = 24;
    const cols = 40;
    const map = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
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
        hallLineX = this.getRandomInt(1, cols - 1);
        hallLineY = 0;
        hallWidth = 1;
        hallHeight = rows;
        validCorridor = corridors.every(
          (corridor) => Math.abs(hallLineX - corridor.x) >= 2
        );
      } while (
        !validCorridor ||
        map
          .slice(hallLineY - 1, hallLineY + hallHeight + 1)
          .some((row) =>
            row
              .slice(hallLineX - 1, hallLineX + hallWidth + 1)
              .includes("empty")
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
        hallLineY = this.getRandomInt(1, rows - 1);
        hallWidth = cols;
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
    let numRoomsGenerated = 0;
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
        roomX + roomWidth - 3 < cols &&
        roomY + roomHeight - 3 < rows
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
      }

      // Создаем комнату, только если она подходит
      if (connected) {
        this.createRoomOrCorridor(map, roomX, roomY, roomWidth, roomHeight);
      }
    }

    const numSwords = 2;
    const numPotions = 10;
    const numEnemys = 10;
    let swordX, swordY;
    let potionX, potionY;
    let enemyX, enemyY;

    for (let i = 0; i < numSwords; i++) {
      do {
        swordX = this.getRandomInt(0, cols - 1);
        swordY = this.getRandomInt(0, rows - 1);
      } while (map[swordY][swordX] !== "tile");
      map[swordY][swordX] = "sword";
    }

    for (let i = 0; i < numPotions; i++) {
      do {
        potionX = this.getRandomInt(0, cols - 1);
        potionY = this.getRandomInt(0, rows - 1);
      } while (map[potionY][potionX] !== "tile");
      map[potionY][potionX] = "potion";
    }

    for (let i = 0; i < numEnemys; i++) {
      do {
        enemyX = this.getRandomInt(0, cols - 1);
        enemyY = this.getRandomInt(0, rows - 1);
      } while (map[enemyY][enemyX] !== "tile");
      map[enemyY][enemyX] = "enemy";
    }

    do {
      this.playerX = this.getRandomInt(0, cols - 1);
      this.playerY = this.getRandomInt(0, rows - 1);
    } while (map[this.playerY][this.playerX] !== "tile");
    map[this.playerY][this.playerX] = "player";

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
          const playerHealth = this.playerHealth <= 0 ? 0 : this.playerHealth; // Исправление здесь
          tile.append(
            `<div class="health" style="width: ${playerHealth}%;"></div>`
          ); // Исправление здесь
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

  movePlayer(map, deltaY, deltaX) {
    const newX = this.playX + deltaX;
    const newY = this.playY + deltaY;

    if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
      const newTile = map[newY][newX];

      // Проверяем, что новая клетка является проходимой и не содержит врага
      if (newTile !== "wall" && newTile !== "enemy") {
        // Удаляем изображение игрока из старой клетки
        const oldPlayerTile = $(".tileP");
        oldPlayerTile.removeClass("tileP");
        oldPlayerTile.addClass("tile"); // Возвращаем клетке класс "tile"

        if (newTile === "potion") {
          // Плитка с зельем - лечим игрока
          this.playerHealth = 100; // Предполагается, что 100 - максимальное здоровье
          // Удаляем зелье из текущей клетки на странице
          $(".tileHP").removeClass("tileHP").addClass("tile");
          // Обновляем клетку на карте, чтобы зелье было использовано
          map[newY][newX] = "tile";
        }
        if (newTile === "sword") {
          // Плитка с мечом - увеличиваем урон игрока
          this.playerDamage += 25;
          // Удаляем меч из текущей клетки на странице
          $(".tileSW").removeClass("tileSW").addClass("tile");
          // Обновляем клетку на карте, чтобы меч был использован
          map[newY][newX] = "tile";
        }

        // Обновляем позицию игрока на карте
        map[this.playY][this.playX] = "tile";
        this.playX = newX;
        this.playY = newY;
        map[this.playY][this.playX] = "player";

        this.moveEnemies(map);
        this.drawMap(map); // Отрисовываем карту после перемещения игрока
      }
    }
  }

  moveEnemies(map) {
    const directions = [
      { deltaY: -1, deltaX: 0 }, // Вверх
      { deltaY: 1, deltaX: 0 }, // Вниз
      { deltaY: 0, deltaX: -1 }, // Влево
      { deltaY: 0, deltaX: 1 }, // Вправо
    ];

    // Создадим список противников, которые еще не двигались в этом ходу
    const enemiesToMove = [];

    // Перебираем всех противников на карте
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === "enemy") {
          enemiesToMove.push({ y, x }); // Добавляем координаты противника в список
        }
      }
    }

    // Перемещаем каждого противника
    enemiesToMove.forEach(({ y, x }) => {
      // Проверяем наличие игрока в смежных клетках
      const playerAdjacent = this.getAdjacentCells(x, y);

      let playerAttacked = false;
      playerAdjacent.forEach((cell) => {
        const px = cell.x;
        const py = cell.y;

        // Проверяем, находится ли в этой клетке игрок
        if (map[py] && map[py][px] === "player") {
          // Если игрок найден, вызываем метод атаки
          this.attackPlayer(map);
          playerAttacked = true;
        }
      });

      // Проверяем, был ли атакован игрок перед перемещением противника
      if (!playerAttacked) {
        // Выбираем случайное направление для перемещения
        const randomDirection =
          directions[Math.floor(Math.random() * directions.length)];

        // Вычисляем новые координаты для противника
        const newY = y + randomDirection.deltaY;
        const newX = x + randomDirection.deltaX;

        // Проверяем, чтобы новая позиция была на карте и являлась проходимой
        if (
          newY >= 0 &&
          newY < map.length &&
          newX >= 0 &&
          newX < map[y].length &&
          map[newY][newX] === "tile"
        ) {
          // Удаляем изображение противника из предыдущей клетки
          const oldEnemyTile = $(".tileE");
          oldEnemyTile.removeClass("tileE");
          oldEnemyTile.addClass("tile"); // Возвращаем клетке класс "tile"

          // Перемещаем противника
          map[y][x] = "tile";
          map[newY][newX] = "enemy";
        }
      }
    });

    this.drawMap(map); // Отрисовываем карту после перемещения противников
  }

  attackPlayer(map) {
    const playerPosition = { x: this.playX, y: this.playY };

    const playerTile = $(`.tileP`); // Выбираем только элемент противника на текущей клетке
    const adjacentCells = this.getAdjacentCells(this.playX, this.playY);

    adjacentCells.forEach((cell) => {
      const x = cell.x;
      const y = cell.y;

      if (map[y] && map[y][x] === "enemy") {
        const enemyPosition = { x: x, y: y };
        // Рассчитываем расстояние между игроком и противником
        const distance =
          Math.abs(playerPosition.x - enemyPosition.x) +
          Math.abs(playerPosition.y - enemyPosition.y);
        if (distance <= 1) {
          this.playerHealth -= 50;
          playerTile.children(".health").css("width", this.playerHealth + "%"); // Предполагается, что у игрока есть свойство "player" с классом "player"
          if (this.playerHealth === 0) {
            setTimeout(() => {
              alert("Игра окончена!");
            }, 500);
          }
        }
      }
    });

    // Отрисовываем обновленную карту
    this.drawMap(map);
  }

  attack(map) {
    const playerPosition = { x: this.playX, y: this.playY };

    const adjacentCells = this.getAdjacentCells(this.playX, this.playY);

    let enemyCount = 0; // Счетчик соперников
    adjacentCells.forEach((cell) => {
      const x = cell.x;
      const y = cell.y;

      // Проверяем, находится ли в этой клетке соперник
      if (map[y] && map[y][x] === "enemy") {
        const enemyTile = $(".tileE");
        const enemyPosition = { x: x, y: y };

        // Рассчитываем расстояние между игроком и противником
        const distance =
          Math.abs(playerPosition.x - enemyPosition.x) +
          Math.abs(playerPosition.y - enemyPosition.y);

        // Если противник находится в зоне поражения 1 клетки от игрока
        if (distance <= 1) {
          // Присваиваем класс ".damage" противнику
          enemyTile.addClass("damage");

          // Убеждаемся, что у противника есть класс ".damage"
          if (enemyTile.hasClass("damage")) {
            // Уменьшаем здоровье противника на 50%
            this.enemyHealth -= this.playerDamage;

            // Обновляем здоровье противника на экране
            enemyTile.children(".health").css("width", this.enemyHealth + "%");
            if (this.enemyHealth <= 0) {
              map[y][x] = "tile"; // Убираем соперника с поля
              enemyTile.removeClass("tileE"); // Удаляем класс противника
              enemyTile.removeClass("damage"); // Удаляем класс ".damage"
              enemyTile.addClass("tile"); // Добавляем класс пустой клетки
              this.enemyHealth = 100;

              enemyCount++; // Увеличиваем счетчик убитых соперников
            }
          }
        }
      }
    });

    // Если у игрока закончилось здоровье или убиты все соперники, выводим сообщение и начинаем новую игру
    if (this.playerHealth <= 0 || enemyCount === 10) {
      setTimeout(() => {
        alert("Игра окончена!");
      }, 500);

      // Сброс состояния игры
      this.resetGame();
      return; // Завершаем выполнение метода
    }

    // Обновляем карту и отрисовываем ее заново
    this.drawMap(map);
  }
}
