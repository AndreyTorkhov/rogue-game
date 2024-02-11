// Функция для генерации случайного целого числа в заданном диапазоне
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let playerX, playerY;

// Определение класса Game
class Game {
  constructor() {
    this.playerHealth = 100; // Устанавливаем начальное здоровье игрока
    this.enemyHealth = 100; // Устанавливаем начальное здоровье противников
  }

  init() {
    const map = this.generateMap(); // генерируем карту
    this.drawMap(map); // отрисовываем карту со стенами, коридорами и комнатами

    const field = $(".field");

    // Сохраняем начальные координаты игрока
    playerX, playerY;
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === "player") {
          playerX = x;
          playerY = y;
        }
      });
    });

    let lastKeyPressTime = 0;

    // Изменяем обработчик событий клавиш
    $(document).keydown((e) => {
      const currentTime = new Date().getTime();

      // Проверяем, прошла ли секунда с момента последнего нажатия
      if (currentTime - lastKeyPressTime >= 100) {
        // Обновляем время последнего нажатия
        lastKeyPressTime = currentTime;

        // Получаем код нажатой клавиши
        const key = e.key;

        // Перемещаем игрока в зависимости от нажатой клавиши
        switch (key) {
          case "ц":
          case "w": // Вверх
            this.movePlayer(map, -1, 0);
            break;
          case "ы":
          case "s": // Вниз
            this.movePlayer(map, 1, 0);
            break;
          case "ф":
          case "a": // Влево
            this.movePlayer(map, 0, -1);
            break;
          case "в":
          case "d": // Вправо
            this.movePlayer(map, 0, 1);
            break;
          case " ": // Пробел
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

    // Создание двумерного массива и заполнение его стенами
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push("wall"); // заполняем каждую ячейку стеной
      }
      map.push(row);
    }

    const corridors = []; // Массив для хранения координат коридоров

    // Генерация коридоров по вертикали
    const numHallV = getRandomInt(3, 5);
    for (let i = 0; i < numHallV; i++) {
      let hallLineX, hallLineY, hallWidth, hallHeight;
      let validCorridor = false; // Флаг для проверки валидности коридора
      do {
        hallLineX = getRandomInt(1, cols - 1);
        hallLineY = 0;
        hallWidth = 1;
        hallHeight = rows;
        // Проверяем, что текущий коридор находится достаточно далеко от других коридоров
        validCorridor = corridors.every(
          (corridor) => Math.abs(hallLineX - corridor.x) >= 2
        );
      } while (
        !validCorridor || // Пока коридор не прошел проверку на расстояние между соседними коридорами
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
    const numHallH = getRandomInt(3, 5);
    for (let i = 0; i < numHallH; i++) {
      let hallLineX, hallLineY, hallWidth, hallHeight;
      let validCorridor = false; // Флаг для проверки валидности коридора
      do {
        hallLineX = 0;
        hallLineY = getRandomInt(1, rows - 1);
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
    const existingRooms = []; // Массив для хранения существующих комнат

    for (let i = 0; i < numRooms; i++) {
      let roomX, roomY, roomWidth, roomHeight;
      let connected = false;

      // Выбираем случайный коридор
      const corridor = corridors[getRandomInt(0, corridors.length - 1)];

      // Определяем координаты и размеры комнаты
      // Генерируем координаты комнаты в пределах коридора с учетом размеров самой комнаты
      roomX = getRandomInt(corridor.x, corridor.x + corridor.width);
      roomY = getRandomInt(corridor.y, corridor.y + corridor.height);
      roomWidth = getRandomInt(3, 8);
      roomHeight = getRandomInt(3, 8);

      // Проверяем, чтобы комната не вышла за пределы карты
      if (
        roomX >= 0 &&
        roomY >= 0 &&
        roomX + roomWidth - 3 < cols &&
        roomY + roomHeight - 3 < rows
      ) {
        // Проверяем, чтобы новая комната не пересекалась с уже существующими комнатами
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

    const numSwords = 2; // Количество мечей
    const numPotions = 10; // Количество зелий
    const numEnemys = 10; //Количество противников

    for (let i = 0; i < numSwords; i++) {
      let swordX, swordY;
      do {
        swordX = getRandomInt(0, cols - 1);
        swordY = getRandomInt(0, rows - 1);
      } while (map[swordY][swordX] !== "tile"); // Проверяем, что выбранная позиция находится в проходимой области
      map[swordY][swordX] = "sword"; // Обозначаем позицию меча на карте
    }

    for (let i = 0; i < numPotions; i++) {
      let potionX, potionY;
      do {
        potionX = getRandomInt(0, cols - 1);
        potionY = getRandomInt(0, rows - 1);
      } while (map[potionY][potionX] !== "tile"); // Проверяем, что выбранная позиция находится в проходимой области
      map[potionY][potionX] = "potion"; // Обозначаем позицию зелья на карте
    }

    for (let i = 0; i < numEnemys; i++) {
      let enemyX, enemyY;
      do {
        enemyX = getRandomInt(0, cols - 1);
        enemyY = getRandomInt(0, rows - 1);
      } while (map[enemyY][enemyX] !== "tile"); // Проверяем, что выбранная позиция находится в проходимой области
      map[enemyY][enemyX] = "enemy"; // Обозначаем позицию противника на карте
    }

    do {
      playerX = getRandomInt(0, cols - 1);
      playerY = getRandomInt(0, rows - 1);
    } while (map[playerY][playerX] !== "tile"); // Проверяем, что выбранная позиция находится в проходимой области
    map[playerY][playerX] = "player"; // Обозначаем позицию игрока на карте

    return map;
  }

  // Определение метода для отрисовки карты
  // Определение метода для отрисовки карты с учетом здоровья
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
          map[y][x] = "tile"; // Обозначаем проходимую область
        }
      }
    }
  }

  movePlayer(map, deltaY, deltaX) {
    const newX = playerX + deltaX;
    const newY = playerY + deltaY;

    if (
      newX >= 0 &&
      newX < map[0].length &&
      newY >= 0 &&
      newY < map.length &&
      map[newY][newX] === "tile"
    ) {
      // Удаляем изображение игрока из старой клетки
      const oldPlayerTile = $(".tileP");
      oldPlayerTile.removeClass("tileP");
      oldPlayerTile.addClass("tile"); // Возвращаем клетке класс "tile"

      map[playerY][playerX] = "tile"; // Обновляем карту
      playerX = newX;
      playerY = newY;
      map[playerY][playerX] = "player"; // Обновляем позицию игрока на карте

      this.moveEnemies(map);
      this.drawMap(map); // Отрисовываем карту после перемещения игрока
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
      const playerAdjacent = [
        { y: y - 1, x }, // Сверху
        { y: y + 1, x }, // Снизу
        { y, x: x - 1 }, // Слева
        { y, x: x + 1 }, // Справа
      ];

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
    const playerPosition = { x: playerX, y: playerY };

    const playerTile = $(`.tileP`); // Выбираем только элемент противника на текущей клетке
    const adjacentCells = [
      { x: playerX - 1, y: playerY }, // Слева
      { x: playerX + 1, y: playerY }, // Справа
      { x: playerX, y: playerY - 1 }, // Сверху
      { x: playerX, y: playerY + 1 }, // Снизу
    ];
    console.log(playerPosition);
    adjacentCells.forEach((cell) => {
      const x = cell.x;
      const y = cell.y;
      console.log(
        "Player X:",
        playerX,
        "Player Y:",
        playerY,
        "Cell X:",
        x,
        "Cell Y:",
        y
      ); // Вывод координат в консоль
      if (map[y] && map[y][x] === "enemy") {
        const enemyPosition = { x: x, y: y };
        // Рассчитываем расстояние между игроком и противником
        const distance =
          Math.abs(playerPosition.x - enemyPosition.x) +
          Math.abs(playerPosition.y - enemyPosition.y);
        if (distance <= 1) {
          this.playerHealth -= 50;
          playerTile.children(".health").css("width", this.playerHealth + "%"); // Предполагается, что у игрока есть свойство "player" с классом "player"
          setTimeout(() => {
            alert("У вас осталось " + this.playerHealth + " здоровья");
          }, 500);
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
    const playerPosition = { x: playerX, y: playerY };

    const adjacentCells = [
      { x: playerX - 1, y: playerY }, // Слева
      { x: playerX + 1, y: playerY }, // Справа
      { x: playerX, y: playerY - 1 }, // Сверху
      { x: playerX, y: playerY + 1 }, // Снизу
      { x: playerX - 1, y: playerY - 1 }, // Слева
      { x: playerX + 1, y: playerY + 1 }, // Справа
      { x: playerX + 1, y: playerY - 1 }, // Сверху
      { x: playerX - 1, y: playerY + 1 }, // Снизу
    ];

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
            this.enemyHealth -= 50;

            // Обновляем здоровье противника на экране
            enemyTile.children(".health").css("width", this.enemyHealth + "%");
            // alert("-50 Xp");
            if (this.enemyHealth === 0) {
              map[y][x] = "tile"; // Убираем соперника с поля
              enemyTile.removeClass("tileE"); // Удаляем класс противника
              enemyTile.removeClass("damage"); // Удаляем класс ".damage"
              enemyTile.addClass("tile"); // Добавляем класс пустой клетки
              this.enemyHealth = 100;
            }
          }
        }
      }
    });

    // Обновляем карту и отрисовываем ее заново
    this.drawMap(map);
  }
}
