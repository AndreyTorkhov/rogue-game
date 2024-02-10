// Определение класса Game
class Game {
  constructor() {
    // Создаем экземпляр игры
  }

  init() {
    const map = this.generateMap(); // генерируем карту
    this.drawMap(map); // отрисовываем карту со стенами
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

    return map;
  }

  // Определение метода для отрисовки карты
  drawMap(map) {
    const field = $(".field");

    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        const tile = $("<div></div>");
        tile.addClass("tile");
        tile.addClass("tileW"); // добавляем класс для стены
        tile.css("width", "20px"); // устанавливаем ширину
        tile.css("height", "20px"); // устанавливаем высоту
        tile.css("top", y * 20 + "px"); // устанавливаем вертикальное положение
        tile.css("left", x * 20 + "px"); // устанавливаем горизонтальное положение
        tile.appendTo(field); // добавляем блок в поле
      });
    });
  }
}
