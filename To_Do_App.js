 const itemNameInput = document.getElementById('itemName');
        const itemDateInput = document.getElementById('itemDate');
        const itemPrioritySelect = document.getElementById('itemPriority');
        const addItemBtn = document.getElementById('addItemBtn');

        const todayListContainer = document.getElementById('todayList');
        const futureListContainer = document.getElementById('futureList');
        const completedListContainer = document.getElementById('completedList');

        // SVG Icons definitions
        const tickIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q167 0 283.5-116.5T800-480q0-167-116.5-283.5T480-800q-167 0-283.5 116.5T800-480q0 167 116.5 283.5T480-160Zm0-320Z"/></svg>`;
        const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;

        // Initialize tasks array from LocalStorage
        let todoList = JSON.parse(localStorage.getItem('todoList')) || [];

        // Helper function to format internal Date strings (YYYY-MM-DD) to Display Format (D/M/YYYY)
        function formatDisplayDate(dateString) {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${parseInt(day)}/${parseInt(month)}/${year}`;
        }

        // Get localized midnight timestamps for proper comparison
        function getCleanTimestamps(dateStr) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const targetDate = new Date(dateStr);
            targetDate.setHours(0, 0, 0, 0);

            return { todayTime: today.getTime(), targetTime: targetDate.getTime() };
        }

        // Render the application interface
        function render() {
            // Clear current UI lists
            todayListContainer.innerHTML = '';
            futureListContainer.innerHTML = '';
            completedListContainer.innerHTML = '';

            // Keep index tracks per category section as requested by UI design
            let todayIndex = 1;
            let futureIndex = 1;
            let completedIndex = 1;

            todoList.forEach((task, globalIndex) => {
                const displayDate = formatDisplayDate(task.date);
                
                // Formulate HTML structure for a single item element
                const itemHTML = `
                    <div class="item-left">
                        <span class="item-index">${task.completed ? completedIndex++ : (isToday(task.date) ? todayIndex++ : futureIndex++)}.</span>
                        <span class="item-name">${task.name}</span>
                    </div>
                    <div class="item-center">${displayDate}</div>
                    <div class="item-right">
                        <span>Priority: ${task.priority}</span>
                        <div class="item-actions">
                            ${!task.completed ? `
                                <button class="icon-btn" onclick="toggleComplete(${globalIndex})" title="Mark as Completed">
                                    ${tickIcon}
                                </button>
                            ` : ''}
                            <button class="icon-btn" onclick="deleteTask(${globalIndex})" title="Delete Task">
                                    ${trashIcon}
                            </button>
                        </div>
                    </div>
                `;

                const taskElement = document.createElement('div');
                taskElement.className = `todo-item ${task.completed ? 'item-completed' : 'item-active'}`;
                taskElement.innerHTML = itemHTML;

                // Distribution Criteria logic
                if (task.completed) {
                    completedListContainer.appendChild(taskElement);
                } else if (isToday(task.date)) {
                    todayListContainer.appendChild(taskElement);
                } else {
                    // Future deadlines or past incomplete deadlines both land into "Future TodoList"
                    futureListContainer.appendChild(taskElement);
                }
            });

            // Show placeholders if categories run completely empty
            checkEmptyContainers();
            
            // Sync with local storage state
            localStorage.setItem('todoList', JSON.stringify(todoList));
        }

        // Date Checker Functions
        function isToday(dateStr) {
            if (!dateStr) return false;
            const { todayTime, targetTime } = getCleanTimestamps(dateStr);
            return todayTime === targetTime;
        }

        // Check and render messaging if lists are empty
        function checkEmptyContainers() {
            [
                { container: todayListContainer, text: "No tasks set for today." },
                { container: futureListContainer, text: "No future or pending tasks." },
                { container: completedListContainer, text: "No completed tasks yet." }
            ].forEach(item => {
                if(item.container.children.length === 0) {
                    item.container.innerHTML = `<p class="empty-message">${item.text}</p>`;
                }
            });
        }

        // Action: Add Item 
        addItemBtn.addEventListener('click', () => {
            const name = itemNameInput.value.trim();
            const date = itemDateInput.value;
            const priority = itemPrioritySelect.value;

            // Input Validation constraint - Ensures absolutely no field stays unfilled
            if (!name || !date || !priority) {
                alert('Please cleanly fill out all fields (Task Name, Deadline, and Priority) before submitting!');
                return;
            }

            // Append item structure to local collection context array
            todoList.push({
                name: name,
                date: date,
                priority: priority,
                completed: false
            });

            // Reset inputs form elements
            itemNameInput.value = '';
            itemDateInput.value = '';
            itemPrioritySelect.value = '';

            render();
        });

        // Action: Toggle completion state 
        window.toggleComplete = function(index) {
            todoList[index].completed = !todoList[index].completed;
            render();
        };

        // Action: Delete Task 
        window.deleteTask = function(index) {
            todoList.splice(index, 1);
            render();
        };

        // Initial setup boot trace
        render();