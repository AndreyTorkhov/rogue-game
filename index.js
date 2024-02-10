// Функция для генерации случайного целого числа в заданном диапазоне
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Определение класса Game
class Game {
  constructor() {
    // Создаем экземпляр игры
  }

  init() {
    const map = this.generateMap(); // генерируем карту
    this.drawMap(map); // отрисовываем карту со стенами, коридорами и комнатами
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

    let playerX, playerY;
    do {
      playerX = getRandomInt(0, cols - 1);
      playerY = getRandomInt(0, rows - 1);
    } while (map[playerY][playerX] !== "tile"); // Проверяем, что выбранная позиция находится в проходимой области
    map[playerY][playerX] = "player"; // Обозначаем позицию игрока на карте

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
          tile.addClass("tileW"); // добавляем класс для стены
        } else if (cell === "sword") {
          tile.addClass("tileSW"); // добавляем класс для меча
        } else if (cell === "potion") {
          tile.addClass("tileHP"); // добавляем класс для зелья
        } else if (cell === "enemy") {
          tile.addClass("tileE"); // добавляем класс для зелья
        } else if (cell === "player") {
          tile.addClass("tileP"); // добавляем класс для зелья
        }
        tile.css("width", "20px"); // устанавливаем ширину
        tile.css("height", "20px"); // устанавливаем высоту
        tile.css("top", y * 20 + "px"); // устанавливаем вертикальное положение
        tile.css("left", x * 20 + "px"); // устанавливаем горизонтальное положение
        tile.appendTo(field); // добавляем блок в поле
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
}
