window.addEventListener('load', function() {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    const nameInput = document.querySelector('#name');
    const newTodoForm = document.querySelector('#new-todo-form');

    const username = localStorage.getItem('username') || '';
    nameInput.value = username;

    nameInput.addEventListener('change', function(e) {
        let inputValue = e.target.value.trim() + '.';
        if (inputValue === '' || inputValue === '.') {
            inputValue = 'Guest.';
        }
        localStorage.setItem('username', inputValue);
        nameInput.value = inputValue;
    });

    newTodoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newTodoPriority = document.getElementById('prioritySelect').value;

        const todo = {
            content: e.target.elements.content.value,
            category: e.target.elements.category.value,
            done: false,
            createdAt: new Date().getTime(),
            priority: newTodoPriority,
        };

        todos.push(todo);

        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('category', e.target.elements.category.value);
        e.target.reset();
        e.target.elements.category.value = localStorage.getItem('category');
        displayTodos();
    });

    displayTodos();

    const clearContainer = document.getElementsByClassName('confirm-clear')[0];
    const confirmClear = document.getElementsByClassName('confirm-clear-button')[0];
    const declineClear = document.getElementsByClassName('decline-clear-button')[0];
    const clearBtn = document.getElementsByClassName('clear-all')[0];
    clearBtn.addEventListener('click', function(){
        clearContainer.style.display = 'block';
        overlay.style.display = 'block';
    });
    declineClear.addEventListener('click', function() {
        clearContainer.style.display = 'none';
        overlay.style.display = 'none';
    });
    confirmClear.addEventListener('click', function(){
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('note-')) {
                localStorage.removeItem(key);
            }
        });
        todos = [];
        localStorage.setItem('todos', JSON.stringify(todos));
        clearContainer.style.display = 'none';
        overlay.style.display = 'none';
        displayTodos();
    });

    // Create overlay element once
    overlay = document.createElement('div');
    overlay.classList.add('blur-overlay');
    document.body.appendChild(overlay);
});

function displayTodos() {
    const todoList = document.querySelector('#todo-list');
    todoList.innerHTML = "";

    todos.sort((a, b) => {
        if (a.priority === 'High' && (b.priority === 'Medium' || b.priority === 'Low')) {
            return -1;
        } else if (a.priority === 'Medium' && b.priority === 'Low') {
            return -1;
        } else if (a.priority === 'Low' && (b.priority === 'High' || b.priority === 'Medium')) {
            return 1;
        } else {
            return 0;
        }
    });

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        // Function to format time difference
        function formatTimeDifference(timeDifference) {
            if (timeDifference < 60) {
                return `${timeDifference} seconds ago`;
            } else if (timeDifference < 60 * 60) {
                const minutes = Math.floor(timeDifference / 60);
                const seconds = timeDifference % 60;
                return `${minutes} minutes ${seconds} seconds ago`;
            } else if (timeDifference < 60 * 60 * 24) {
                const hours = Math.floor(timeDifference / (60 * 60));
                const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
                const seconds = timeDifference % 60;
                return `${hours} hours ${minutes} minutes ${seconds} seconds ago`;
            } else {
                const days = Math.floor(timeDifference / (60 * 60 * 24));
                const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
                const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
                const seconds = timeDifference % 60;
                return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds ago`;
            }
        }

        function updateTimeLabel() {
            const timeCreated = new Date(todo.createdAt);
            const now = new Date();
            const timeDifference = Math.floor((now - timeCreated) / 1000);
            timeLabel.innerText = `Created ${formatTimeDifference(timeDifference)}`;
        }
        setInterval(updateTimeLabel, 1000);

        const label = document.createElement('label');
        const timeLabel = document.createElement('h6');
        const input = document.createElement('input');
        const span = document.createElement('span');
        const content = document.createElement('div');
        const actions = document.createElement('div');
        const note = document.createElement('img');
        const edit = document.createElement('img');
        const deleteButton = document.createElement('img');
        const priority = document.createElement('span');

        input.type = 'checkbox';
        input.checked = todo.done;
        span.classList.add('bubble');
        if (todo.category === 'personal') {
            span.classList.add('personal');
        } else {
            span.classList.add('business');
        }
        content.classList.add('todo-content');
        actions.classList.add('actions');
        edit.classList.add('edit');
        note.classList.add('note');
        deleteButton.classList.add('delete');
        priority.classList.add('priority-label');

        content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
        priority.innerText = `${todo.priority}`;
        updateTimeLabel();
        edit.src = 'icons/pen.png';
        edit.style.width = '30px';
        edit.style.height = '30px';
        deleteButton.src = 'icons/delete.png';
        deleteButton.style.width = '30px';
        deleteButton.style.height = '30px';
        note.src = 'icons/notes.png';
        note.style.width = '36.5px';
        note.style.height = '36.5px';

        label.appendChild(input);
        label.appendChild(span);
        actions.appendChild(edit);
        actions.appendChild(deleteButton);
        actions.appendChild(note);
        todoItem.appendChild(label);
        todoItem.appendChild(timeLabel);
        todoItem.appendChild(content);
        content.appendChild(priority);
        todoItem.appendChild(actions);

        todoList.appendChild(todoItem);

        if (priority.innerText === 'High') {
            priority.style.backgroundColor = 'rgb(80, 200, 120)';
        } else if (priority.innerText === 'Medium') {
            priority.style.backgroundColor = 'rgb(255, 95, 31)';
        } else {
            priority.style.backgroundColor = 'rgb(255, 49, 49)';
        }

        if (todo.done) {
            todoItem.classList.add('done');
        }

        const noteButton = note;
        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        const overlay = document.createElement('div');
        overlay.classList.add('blur-overlay');
        const exitNote = document.createElement('button');
        exitNote.classList.add('close-note');
        exitNote.innerHTML = 'Close';
        const saveNote = document.createElement('button');
        saveNote.classList.add('save-note');
        saveNote.innerHTML = 'Save';
        const textArea = document.createElement('textarea');
        textArea.classList.add('note-data');
        textArea.setAttribute('cols', '44');
        textArea.setAttribute('rows', '10');

        textArea.value = localStorage.getItem(`note-${todo.content}`) || '';

        saveNote.addEventListener('click', function() {
            localStorage.setItem(`note-${todo.content}`, textArea.value);
        });

        noteButton.addEventListener('click', function() {
            const initialNoteValue = localStorage.getItem(`note-${todo.createdAt}`) || '';
            textArea.value = initialNoteValue;
            noteContent.innerHTML = `
                <textarea class="note-data" cols="44" rows="10">${textArea.value}</textarea>
                <div>
                    <button class="save-note">Save</button>
                    <button class="close-note">Close</button>
                </div>
            `;
            noteContent.style.display = 'block';
            overlay.style.display = 'block';
        
            const saveButton = noteContent.querySelector('.save-note');
            saveButton.addEventListener('click', function() {
                const noteTextArea = noteContent.querySelector('.note-data');
                const newNoteValue = noteTextArea.value;
                
                if (newNoteValue !== initialNoteValue) {
                    localStorage.setItem(`note-${todo.createdAt}`, newNoteValue);
                    showSavePopup();
                } else {
                    localStorage.setItem(`note-${todo.createdAt}`, newNoteValue);
                    showSavePopup();
                }
            });
        
            const closeButton = noteContent.querySelector('.close-note');
            closeButton.addEventListener('click', function() {
                const noteTextArea = noteContent.querySelector('.note-data');
                const newNoteValue = noteTextArea.value;
                
                if (newNoteValue !== initialNoteValue) {
                    localStorage.setItem(`note-${todo.createdAt}`, newNoteValue);
                    showSavePopup();
                } else {
                    localStorage.setItem(`note-${todo.createdAt}`, newNoteValue);
                }
        
                noteContent.style.display = 'none';
                overlay.style.display = 'none';
            });
        
            function showSavePopup() {
                var popup = document.getElementById('savePopup');
                popup.classList.add('show');
                setTimeout(function() {
                    popup.classList.remove('show');
                }, 2000);
            }
            
        });
        
        todoItem.appendChild(noteContent);
        todoItem.appendChild(overlay);

        input.addEventListener('change', function(e) {
            todo.done = e.target.checked;
            localStorage.setItem('todos', JSON.stringify(todos));

            if (todo.done) {
                todoItem.classList.add('done');
            } else {
                todoItem.classList.remove('done');
            }

            displayTodos();
        });

        edit.addEventListener('click', function() {
            const input = content.querySelector('input');
            input.removeAttribute('readonly');
            input.focus();
            const value = input.value;
            input.value = '';
            input.value = value;

            input.addEventListener('blur', function(e) {
                input.setAttribute('readonly', true);
                todo.content = e.target.value;
                localStorage.setItem('todos', JSON.stringify(todos));
                displayTodos();
            });
        });

        deleteButton.addEventListener('click', function() {
            localStorage.removeItem(`note-${todo.content}`);
            todos = todos.filter(t => t !== todo);
            localStorage.setItem('todos', JSON.stringify(todos));
            displayTodos();
        });

        textArea.addEventListener('input', function() {
            textArea.value = this.value;
        });
    });
}



const icon = document.getElementById('theme');
const isDarkMode = localStorage.getItem('theme') === 'dark';
if (isDarkMode) {
    document.body.classList.add('dark-theme');
    icon.src = 'icons/sun.png'; 
} else {
    document.body.classList.remove('dark-theme');
    icon.src = 'icons/moon.png';
}

icon.onclick = function () {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        icon.src = 'icons/sun.png';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.src = 'icons/moon.png';
        localStorage.setItem('theme', 'light');
    }
};
