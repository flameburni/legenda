const input = document.getElementById("taskInput");

const button = document.getElementById("addBtn");

const button2 = document.getElementById("clrBtn");

const list = document.getElementById("taskList");

const msg = document.getElementById("errorMsg");

const counter = document.getElementById("taskCounter");

const msg2 = document.getElementById("emptyState");

const dueDateInput = document.getElementById("dueDateInput");

dueDateInput.addEventListener("change", function() {
      input.focus();
    });

let selectedPriority = "high";

document.querySelector(".priorityBtn").classList.add("active");

const priorityBtns = document.querySelectorAll(".priorityBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";

  tasks.forEach(function(task, index) {
    const li = document.createElement("li");
    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    li.appendChild(textSpan);

    const prioritySpan = document.createElement("span");
    prioritySpan.textContent = task.priority;
    prioritySpan.className = `priority-${task.priority} priorityLabel`;
    li.appendChild(prioritySpan);

    const dueDateSpan = document.createElement("span");
    if (task.dueDate) {
      const date = new Date(task.dueDate + "T00:00:00");
      dueDateSpan.textContent = date.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
    } else {
      dueDateSpan.textContent = "";
    }
    dueDateSpan.className = "dueDateSpan";
    li.appendChild(dueDateSpan);
    
    if (task.completed) li.classList.add("completed");
      li.addEventListener("click", function() {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "deleteBtn";
    deleteBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    const getSuggestionBtn = document.createElement("button");
      getSuggestionBtn.textContent = "Get suggestion";
    getSuggestionBtn.className = "suggestBtn";

    getSuggestionBtn.addEventListener("click", async function(event) {
      event.stopPropagation();
      const existing = li.querySelector(".suggestionText");
      if (existing) existing.remove();
      getSuggestionBtn.textContent = "Loading...";
      getSuggestionBtn.disabled = true;

      try {
        const response = await fetch("https://todo-server-production-1406.up.railway.app/suggest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
         body: JSON.stringify({ task: task.text })
        });
        
        const data = await response.json();
        const suggestion = data.suggestion;

        const suggestionP = document.createElement("p");
        suggestionP.textContent = suggestion;
        suggestionP.className = "suggestionText";
        li.appendChild(suggestionP);

        suggestionP.addEventListener("click", function(event) {
          event.stopPropagation();
        })

        getSuggestionBtn.textContent = "Get suggestion";
        getSuggestionBtn.disabled = false;
        
      } catch (error) {
        getSuggestionBtn.textContent = "Try again";
        getSuggestionBtn.disabled = false;
      }
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "editBtn";
    editBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      li.textContent = "";
      const editInput = document.createElement("input");
      editInput.style.flex = "1";
      editInput.style.minWidth = "0";
      editInput.style.width = "auto";
      editInput.style.padding = "8px 10px";
      editInput.style.border = "1.5px solid #6c63ff";
      editInput.style.borderRadius = "6px";
      editInput.style.fontFamily = "inherit";
      editInput.style.fontSize = "14px";
      editInput.style.outline = "none";
      editInput.type = "text";
      editInput.value = task.text;
      li.appendChild(editInput);

      editInput.addEventListener("click", function(event) {
        event.stopPropagation();
      });

      const saveBtn = document.createElement("button");
      saveBtn.className = "saveBtnEdit";
      saveBtn.textContent = "Save";
      li.appendChild(saveBtn);
   

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "cancelBtnEdit";
      cancelBtn.textContent = "Cancel";
      li.appendChild(cancelBtn);

      saveBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        if (editInput.value.trim() === "") {
          alert("Task cannot be empty!");
          return;
        }
        task.text = editInput.value;
        saveTasks();
        renderTasks();
      });

      cancelBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        renderTasks();
      });   
    });
    li.appendChild(deleteBtn);
    li.appendChild(editBtn);
    li.appendChild(getSuggestionBtn);
    list.appendChild(li);
  });

  const completed = tasks.filter(function(task) {
     return task.completed === true; 
    }).length;

    const total = tasks.length;

    counter.textContent = `${completed} of ${total} completed.`

  if (total === 0) {
    counter.style.display = "none";
    msg2.style.display = "block";
  } else {
    counter.style.display = "block";
    msg2.style.display = "none";
  }
}

priorityBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    selectedPriority = btn.dataset.priority;

    priorityBtns.forEach(function(b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    input.focus();
  });
});

button.addEventListener("click", function () {
  if (input.value.trim() === "") {
    msg.style.display = "block";
    return;
  }
  tasks.unshift({text: input.value, completed: false, priority: selectedPriority, dueDate: dueDateInput.value});
  saveTasks();
  renderTasks();
  input.value = "";
  dueDateInput.value = "";
});

button2.addEventListener("click", function() {
  tasks = [];
  saveTasks();
  renderTasks();
})

input.addEventListener("input", function() {
  msg.style.display = "none";
})

input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    button.click();
  }
})

renderTasks();