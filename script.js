const weekPicker = document.getElementById('weekPicker');
const weekContainer = document.getElementById('weekContainer');

let tasksData = {}; 
const daysOfWeek = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

// Calcular fecha de inicio (lunes) de una semana ISO
function getMondayOfWeek(weekString) {
    const [year, week] = weekString.split("-W");
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay(); 
    const ISOweekStart = simple;
    if (dayOfWeek <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

const renderWeek = (weekKey) => {
    weekContainer.innerHTML = "";

    if (!tasksData[weekKey]) {
        tasksData[weekKey] = {};
        daysOfWeek.forEach(d => tasksData[weekKey][d] = []);
    }

    const monday = getMondayOfWeek(weekKey);

    // Primera fila (Lunes a Jueves)
    for (let i = 0; i < 4; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        createDayColumn(daysOfWeek[i], date, weekKey, weekContainer);
    }

    // Segunda fila (Viernes a Domingo)
    const secondRow = document.createElement("div");
    secondRow.classList.add("row");
    for (let i = 4; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        createDayColumn(daysOfWeek[i], date, weekKey, secondRow);
    }
    weekContainer.appendChild(secondRow);
};

const createDayColumn = (dayName, date, weekKey, container) => {
    const column = document.createElement("div");
    column.classList.add("day-column");

    // Encabezado con fecha
    const header = document.createElement("div");
    header.classList.add("day-header");
    header.textContent = `${dayName} - ${date.getDate()} de ${date.toLocaleString('es', { month: 'long' })}`;
    column.appendChild(header);

    // Formulario
    const form = document.createElement("form");
    form.onsubmit = (e) => addNewTask(e, weekKey, dayName);
    form.innerHTML = `
        <input type="text" name="taskText" placeholder="Nueva tarea">
        <button type="submit" class="addTaskButton">+</button>
        <button type="button" class="orderButton" onclick="renderOrderedTasks('${weekKey}','${dayName}')">Ordenar</button>
    `;
    column.appendChild(form);

    // Contenedor de tareas
    const tasksContainer = document.createElement("div");
    tasksContainer.id = `${weekKey}-${dayName}-tasks`;
    column.appendChild(tasksContainer);

    // Renderizar tareas guardadas
    tasksData[weekKey][dayName].forEach(taskObj => {
        const task = createTaskElement(taskObj.text, taskObj.done, weekKey, dayName);
        tasksContainer.appendChild(task);
    });

    container.appendChild(column);
};

const createTaskElement = (text, done, weekKey, day) => {
    const task = document.createElement("div");
    task.classList.add("task","roundBorder");
    if (done) task.classList.add("done");

    // Texto
    const span = document.createElement("span");
    span.textContent = text;
    span.style.flex = "1";

    // Botón eliminar
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "−";
    deleteBtn.classList.add("delete-btn");

    // Eliminar tarea
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        task.remove();
        tasksData[weekKey][day] = tasksData[weekKey][day].filter(t => t.text !== text);
    });

    // Toggle "done" al hacer clic en el texto
    span.onclick = () => {
        task.classList.toggle("done");
        const taskList = tasksData[weekKey][day];
        const idx = taskList.findIndex(t => t.text === text);
        if (idx > -1) taskList[idx].done = task.classList.contains("done");
    };

    task.style.display = "flex";
    task.style.alignItems = "center";
    task.style.justifyContent = "space-between";

    task.appendChild(span);
    task.appendChild(deleteBtn);

    return task;
};

const addNewTask = (event, weekKey, day) => {
    event.preventDefault();
    const { value } = event.target.taskText;
    if (!value) return;

    const taskObj = { text: value, done: false };
    tasksData[weekKey][day].unshift(taskObj);

    const tasksContainer = document.getElementById(`${weekKey}-${day}-tasks`);
    const task = createTaskElement(value, false, weekKey, day);
    tasksContainer.prepend(task);

    event.target.reset();
};

const renderOrderedTasks = (weekKey, day) => {
    const tasksContainer = document.getElementById(`${weekKey}-${day}-tasks`);
    let ordered = [...tasksData[weekKey][day]].sort((a, b) => a.done - b.done);
    tasksData[weekKey][day] = ordered;

    tasksContainer.innerHTML = "";
    ordered.forEach(t => {
        const task = createTaskElement(t.text, t.done, weekKey, day);
        tasksContainer.appendChild(task);
    });
};

// Evento al cambiar la semana
weekPicker.addEventListener("change", (e) => {
    renderWeek(e.target.value);
});

// Cargar semana actual por defecto
const today = new Date();
const currentWeek = today.toISOString().slice(0,10);
weekPicker.value = today.toISOString().slice(0,10);
renderWeek(weekPicker.value);