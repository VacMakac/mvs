// Загружаем задачи из LocalStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskList = document.getElementById("task-list");
const addTaskButton = document.getElementById("add-task-button");

// Функция для обновления LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Функция для склонения слов
function pluralize(number, one, few, many) {
  if (number % 10 === 1 && number % 100 !== 11) return one;
  if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return few;
  return many;
}

// Функция для плавной анимации рамки
function setBorderWithGlow(element, color) {
  element.style.transition = "all 1s ease";
  element.style.border = `2px solid ${color}`;
  element.style.boxShadow = `0 0 10px ${color}`;
}

// Функция для обновления обратного отсчёта
function updateCountdown(deadline) {
  const now = new Date();
  const endTime = new Date(deadline);
  const diff = endTime - now;

  if (diff <= 0) return { text: "Время вышло!", expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return { 
      text: `${days} ${pluralize(days, "день", "дня", "дней")}, ${hours} ${pluralize(hours, "час", "часа", "часов")}`,
      expired: false 
    };
  } else if (hours > 0) {
    return { 
      text: `${hours} ${pluralize(hours, "час", "часа", "часов")}, ${minutes} ${pluralize(minutes, "минута", "минуты", "минут")}`,
      expired: false 
    };
  } else {
    return { 
      text: `${minutes} ${pluralize(minutes, "минута", "минуты", "минут")}, ${seconds} ${pluralize(seconds, "секунда", "секунды", "секунд")}`,
      expired: false 
    };
  }
}

// Функция для рендера задач
function renderTasks() {
  taskList.innerHTML = ""; // Очистка списка
  tasks.forEach((task, index) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const timer = document.createElement("div");
    timer.className = "task-timer";

    // Итоговая дата
    const deadline = document.createElement("div");
    deadline.className = "task-deadline";
    deadline.textContent = new Date(task.deadline).toLocaleString("ru-RU");

    deadline.onclick = () => {
      const newTitle = prompt("Изменить название:", task.title);
      const newDeadline = prompt("Изменить дату (в формате ГГГГ-ММ-ДД ЧЧ:ММ):", task.deadline);

      if (newTitle && newDeadline) {
        task.title = newTitle;
        task.deadline = newDeadline;
        saveTasks();
        renderTasks();
      }
    };

    // Обновляем таймер
    function updateTimer() {
      const countdown = updateCountdown(task.deadline);
      timer.textContent = countdown.text;

      // Добавляем красный цвет, если время вышло
      if (countdown.expired) {
        setBorderWithGlow(taskElement, "red");
      } else {
        taskElement.style.border = "none";
        taskElement.style.boxShadow = "none";
      }
    }
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Контейнер для кнопок
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    // Кнопка выполнения
    const completeButton = document.createElement("button");
    completeButton.className = "complete-button";
    completeButton.innerHTML = `<img src="/task/ok.svg" alt="Выполнить">`;
    completeButton.onclick = () => {
      title.style.textDecoration = "line-through";
      setBorderWithGlow(taskElement, "green");
      setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }, 3000);
    };

    // Кнопка удаления
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = `<img src="/task/del.svg" alt="Удалить">`;
    deleteButton.onclick = () => {
      clearInterval(timerInterval); // Останавливаем таймер
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    // Добавляем кнопки в контейнер
    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);

    // Показываем кнопки только при наведении
    taskElement.onmouseover = () => {
      buttonContainer.style.display = "flex";
    };

    taskElement.onmouseout = () => {
      buttonContainer.style.display = "none";
    };

    // Добавляем элементы в карточку
    taskElement.appendChild(title);
    taskElement.appendChild(timer);
    taskElement.appendChild(deadline);
    taskElement.appendChild(buttonContainer);
    taskList.appendChild(taskElement);
  });
}

// Добавление задачи
addTaskButton.onclick = () => {
  const title = document.getElementById("task-title").value;
  const deadline = document.getElementById("task-deadline").value;

  if (title && deadline) {
    tasks.push({ title, deadline });
    saveTasks();
    renderTasks();

    // Очищаем поля ввода
    document.getElementById("task-title").value = "";
    document.getElementById("task-deadline").value = "";
  } else {
    alert("Пожалуйста, заполните все поля!");
  }
};

// Рендер задач при загрузке
renderTasks();
