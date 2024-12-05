// Подгрузка данных из Google Таблицы
const SHEET_ID = '1uKspv8h--dbH2YkcoE_rFRV3yO4D0YV4BOyepVTXl8Q';
const API_KEY = 'AIzaSyBLk447caB9J5cSZ_RSuI65VSYTDrNNexA';
const RANGE = 'A2:C';

async function fetchSheetData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
        const data = await response.json();

        if (data.values) {
            await loadImagesSequentially(data.values);
        } else {
            console.error("Нет данных в таблице или они не видимы для API.");
        }
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

// Функция последовательной загрузки изображений
async function loadImagesSequentially(rows) {
    for (const row of rows) {
        const [imageUrl, author, authorLink] = row;

        await new Promise((resolve) => {
            const img = new Image();
            img.src = imageUrl;

            img.onload = () => {
                const ratio = img.width / img.height;

                // Создание карточки
                const card = document.createElement("div");
                card.className = "card";

                const rowsToSpan = Math.ceil((1 / ratio) * 14);
                card.style.gridRowEnd = `span ${rowsToSpan}`;

                img.classList.add("loaded");

                card.innerHTML = `
                    <img src="${imageUrl}" alt="${author}" onclick="openModal('${imageUrl}')">
                    <div class="card-footer">
                        ${
                            authorLink && authorLink.trim() !== ""
                                ? `<a href="${authorLink}" target="_blank" rel="noopener noreferrer">${author}</a>`
                                : `<span>${author}</span>`
                        }
                    </div>
                `;
                document.getElementById("gallery").appendChild(card);

                resolve(); // Разрешаем следующий шаг после загрузки изображения
            };

            img.onerror = () => {
                console.error(`Ошибка загрузки изображения: ${imageUrl}`);
                resolve(); // Продолжаем, даже если изображение не загрузилось
            };
        });
    }
}

// Открытие модального окна
function openModal(imageUrl) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    const modalImg = document.getElementById("modal-img");
    modalImg.src = imageUrl;
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    modal.style.display = "none";
    modalImg.src = "";
}

// Инициализация
fetchSheetData();
