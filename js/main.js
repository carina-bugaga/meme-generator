//Получаем элементы из DOM
const inputFile = document.getElementById('input-file');
const inputColor = document.getElementById('input-color');
const select = document.getElementById('select');
const fontSize = document.getElementById('font-size');
const inputTop = document.getElementById('textTop');
const inputBottom = document.getElementById('textBottom');
const buttonDownload = document.getElementById('button-download');
const canvas = document.getElementById('canvas');
const box = document.getElementById('canvas-box');

//Начальные состояния
const canvasContext = canvas.getContext('2d');
let image;
let textTop = '';
let textBottom = '';
let sizeText = 30;
let color = '#F953C7';
let fontFamily = 'Arial, Helvetica, sans-serif';
let spanTextTop, spanTextBottom;
let isDraggable = false;
let isTop = false;

//Слушатели событий на изменение настроек текста
inputTop.addEventListener('input', (event) => {
  textTop = event.target.value;
  if (spanTextTop) {
    spanTextTop.innerHTML = textTop;
  }
})
inputBottom.addEventListener('input', (event) => {
  textBottom = event.target.value;
  if (spanTextBottom) {
    spanTextBottom.innerHTML = textBottom;
  }
})
fontSize.addEventListener('input', (event) => {
  sizeText = Number(event.target.value);
  if (spanTextTop) {
    spanTextTop.style.fontSize = `${sizeText}px`;
    spanTextBottom.style.fontSize = `${sizeText}px`;
  }
})
inputColor.addEventListener('input', (event) => {
  color = event.target.value;
  if (spanTextTop) {
    spanTextTop.style.color = color;
    spanTextBottom.style.color = color;
  }
})
select.addEventListener('change', (event) => {
  fontFamily = event.target.value;
  if (spanTextTop) {
    spanTextTop.style.fontFamily = fontFamily;
    spanTextBottom.style.fontFamily = fontFamily;
  }
})
buttonDownload.addEventListener('click', () => {
  if (image) {
    updateCanvas();
    downloadImage();
  }
})

//Слушатель события при добавлении изображения
inputFile.addEventListener('change',(event) => {
  if (event.target.files) {
    //Получаем файл изображения
    let imageFile = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(imageFile);

    reader.addEventListener('loadend', (event) => {
      //Создаем объект изображения
      image = new Image;
      //Присваиваем преобразованное изображение объекту image
      image.src = event.target.result;
      drawImageBox();
    })
  }
})

/**
 * Метод для отрисовки изображения с тестами
 */
function drawImageBox () {
  if (!image) return; 
  box.innerHTML = '';
  box.appendChild(image);
  spanTextTop = document.createElement('span');
  spanTextBottom = document.createElement('span');

  //Подготавливаем верхний текст
  spanTextTop.classList.add('draggable-element');
  spanTextTop.style.fontSize = `${sizeText}px`;
  spanTextTop.style.color = color;
  spanTextTop.style.fontFamily = fontFamily;
  spanTextTop.innerHTML = textTop;
  box.prepend(spanTextTop);

  //Подготавливаем нижний текст
  spanTextBottom.classList.add('draggable-element');
  spanTextBottom.style.fontSize = `${sizeText}px`;
  spanTextBottom.style.color = color;
  spanTextBottom.style.fontFamily = fontFamily;
  spanTextBottom.innerHTML = textBottom;
  box.prepend(spanTextBottom);

  //Инициализация событий для ПК
  spanTextTop.addEventListener('mousedown', (event) => {
    isTop = true;
    draggableStartPosition(event, spanTextTop)
  })
  spanTextBottom.addEventListener('mousedown', (event) => {
    isTop = false;
    draggableStartPosition(event, spanTextBottom)
  })
  
  document.addEventListener('mousemove', (event) => draggableNewPosition(event, isTop ? spanTextTop : spanTextBottom))
  document.addEventListener('mouseup', () => isDraggable = false);

  //Инициализация событий для мобильного устройства
  //Если устройство сенсорное
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    //Определяем стартовые координаты прикосновения 
    spanTextTop.addEventListener('touchstart', event => {
      draggableStartPosition(event, spanTextTop);
    })
    spanTextBottom.addEventListener('touchstart', event => {
      draggableStartPosition(event, spanTextBottom);
    })
    //Определяем направления движения касания
    spanTextTop.addEventListener('touchmove', event => {
      event.preventDefault();
      draggableNewPosition(event, spanTextTop);
    })
    spanTextBottom.addEventListener('touchmove', event => {
      event.preventDefault();
      draggableNewPosition(event, spanTextBottom);
    })
    spanTextTop.addEventListener('touchend', () => isDraggable = false);
    spanTextBottom.addEventListener('touchend', () => isDraggable = false);
  }
}

/**
 * Добавление изображения на холст
 * @param {HTMLElement} canvas Элемент холст
 * @param {HTMLElement} image Элемент изображение
 * @param {String} textValue Значение текста
 */
function updateCanvas () {
  //Присваиваем ширину и высоту изображения холсту
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  //Рисуем изображение на холсте
  canvasContext.drawImage(image, 0, 0);
  canvasContext.font = `${Number(fontSize.value)/ image.height * canvas.height}px ${fontFamily}`;
  canvasContext.fillStyle = color;
  canvasContext.fillText(textTop, 
    spanTextTop.offsetLeft / image.width * canvas.width, 
    (spanTextTop.offsetTop + Number(fontSize.value)) / image.height * canvas.height);
  canvasContext.fillText(textBottom, 
    spanTextBottom.offsetLeft / image.width * canvas.width, 
    (spanTextBottom.offsetTop + Number(fontSize.value)) / image.height * canvas.height);
}

/**
 * Метод для создания ссылки для скачивания изображения
 */
function downloadImage () {
  const linkDownload = document.createElement('a');
  linkDownload.href = canvas.toDataURL();
  linkDownload.download = 'meme-image.png';
  document.body.appendChild(linkDownload);
  linkDownload.click();
  document.body.removeChild(linkDownload);
}

/**
 * Функция задает начальные значения для перемещения элемента
 * @param {Event} event Событие 
 * @param {HTMLElement} element Элемент
 */
function draggableStartPosition (event, element) {
  //Флаг, указывающий что элемент можно перемещать
  isDraggable = true;
  //Проверяем какое событие сработало
  if (event.type == 'touchstart') {
    element.dataset.offsetX = event.touches[0].clientX - element.offsetLeft;
    element.dataset.offsetY = event.touches[0].clientY - element.offsetTop;
  } else {
    element.dataset.offsetX = event.clientX - element.offsetLeft;
    element.dataset.offsetY = event.clientY - element.offsetTop;
  }
}

/**
 * Функция для перемещения на новые координаты, вычисляемые относительно начального клика и текущего положения мыши
 * @param {Event} event Событие
 * @param {HTMLElement} element Элемент
*/
function draggableNewPosition (event, element) {
  //Если элемент перемещен
  if (isDraggable) {
    //Проверяем какое событие сработало
    if (event.type == 'touchmove') {
      element.style.left = `${event.touches[0].clientX - element.dataset.offsetX}px`;
      element.style.top = `${event.touches[0].clientY - element.dataset.offsetY}px`;
    } else {
      element.style.left = `${event.clientX - element.dataset.offsetX}px`;
      element.style.top = `${event.clientY - element.dataset.offsetY}px`;
    }
  }
}
