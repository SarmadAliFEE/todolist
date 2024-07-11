const clockInBtn = document.getElementById('clockIn');
const clockOutBtn = document.getElementById('clockOut');
const downloadPDFBtn = document.getElementById('downloadPDF');
const workHistory = document.getElementById('workHistory');
const historyTypeSelect = document.getElementById('historyType');

let clockInTime = localStorage.getItem('clockInTime') ? new Date(localStorage.getItem('clockInTime')) : null;
let clockOutTime = localStorage.getItem('clockOutTime') ? new Date(localStorage.getItem('clockOutTime')) : null;


document.addEventListener('DOMContentLoaded', loadWorkHistoryFromLocalStorage);

function formatTimeDifference(timeDifference) {
    if (timeDifference < 60) {
        return `${Math.floor(timeDifference)} seconds`;
    } else if (timeDifference < 60 * 60) {
        const minutes = Math.floor(timeDifference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (timeDifference < 60 * 60 * 24) {
        const hours = Math.floor(timeDifference / (60 * 60));
        const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        const days = Math.floor(timeDifference / (60 * 60 * 24));
        const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
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


clockInBtn.addEventListener('click', function() {
    clockInTime = new Date();
    localStorage.setItem('clockInTime', clockInTime.toISOString()); // Save clock-in time to localStorage
    clockOutTime = null; // Reset clock-out time
    localStorage.removeItem('clockOutTime'); // Remove clock-out time from localStorage
    console.log('Clocked in at:', clockInTime);
    showClockInPopup();
});

function showClockInPopup() {
    var popup = document.getElementById('clockInPopup');
    popup.classList.add('showclockpops');
    setTimeout(function() {
        popup.classList.remove('showclockpops');
    }, 2000);
}

function showClockOutPopup() {
    var popup = document.getElementById('clockOutPopup');
    popup.classList.add('showclockpops');
    setTimeout(function() {
        popup.classList.remove('showclockpops');
    }, 2000);
}

clockOutBtn.addEventListener('click', function() {
    if (!clockInTime) {
        console.log('Please clock in first.');
        return;
    }
    
    if (clockOutTime) {
        console.log('You have already clocked out at:', clockOutTime);
        return; // Exit function if already clocked out
    }
    
    clockOutTime = new Date();
    localStorage.setItem('clockOutTime', clockOutTime.toISOString()); // Save clock-out time to localStorage
    console.log('Clocked out at:', clockOutTime);
    
    const timeDifference = (clockOutTime - clockInTime) / 1000; // in seconds
    const formattedTimeDifference = formatTimeDifference(timeDifference);
    console.log('Time worked:', formattedTimeDifference);
    
    addToWorkHistory(clockInTime, clockOutTime, formattedTimeDifference);
    
    showClockOutPopup();
});

downloadPDFBtn.addEventListener('click', function() {
    generatePDF();
});

historyTypeSelect.addEventListener('change', function() {
    updateWorkHistoryDisplay();
});

function updateWorkHistoryDisplay() {
    const selectedOption = historyTypeSelect.value;
    
    // Clear existing table
    workHistory.innerHTML = '';

    // Load work history based on selected option
    if (selectedOption === 'Daily') {
        loadDailyWorkHistory();
    } else if (selectedOption === 'Weekly') {
        loadWeeklyWorkHistory();
    }
}

function loadDailyWorkHistory() {
    const workLog = JSON.parse(localStorage.getItem('workLog')) || [];
    const today = new Date().toLocaleDateString();

    const filteredWorkLog = workLog.filter(entry => {
        return new Date(entry.clockIn).toLocaleDateString() === today;
    });

    displayWorkLog(filteredWorkLog);
}

function loadWeeklyWorkHistory() {
    const workLog = JSON.parse(localStorage.getItem('workLog')) || [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get start of current week

    const filteredWorkLog = workLog.filter(entry => {
        const logDate = new Date(entry.clockIn);
        return logDate >= startOfWeek && logDate <= today;
    });

    displayWorkLog(filteredWorkLog);
}

function addToWorkHistory(clockIn, clockOut, timeWorked) {
    if (!workHistory.querySelector('table')) {
        const table = document.createElement('table');
        
        const headerRow = document.createElement('tr');
        
        const clockInHeader = document.createElement('th');
        clockInHeader.innerText = 'Clock In';
        headerRow.appendChild(clockInHeader);
        
        const clockOutHeader = document.createElement('th');
        clockOutHeader.innerText = 'Clock Out';
        headerRow.appendChild(clockOutHeader);
        
        const timeWorkedHeader = document.createElement('th');
        timeWorkedHeader.innerText = 'Time Worked';
        headerRow.appendChild(timeWorkedHeader);
        
        const deleteHeader = document.createElement('th');
        deleteHeader.innerText = 'Actions';
        headerRow.appendChild(deleteHeader);
        
        table.appendChild(headerRow);
        workHistory.appendChild(table);
    }
    
    const table = workHistory.querySelector('table');
    const row = document.createElement('tr');
    
    const clockInCell = document.createElement('td');
    clockInCell.innerText = clockIn.toLocaleString();
    row.appendChild(clockInCell);
    
    const clockOutCell = document.createElement('td');
    clockOutCell.innerText = clockOut.toLocaleString();
    row.appendChild(clockOutCell);
    
    const timeWorkedCell = document.createElement('td');
    timeWorkedCell.innerText = timeWorked;
    row.appendChild(timeWorkedCell);
    
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('img');
    deleteButton.src = 'icons/delete.png';
    deleteButton.style.width = '25px';
    deleteButton.style.height = '25px';
    deleteButton.style.cursor = 'pointer'; // Optional: Add cursor pointer for better UX
    deleteButton.classList.add('delete'); // Add 'delete' class
    
    // Attach event listener to delete button
    deleteButton.addEventListener('click', function() {
        row.remove(); // Remove row from table
        
        // Remove from local storage
        removeFromLocalStorage(clockInCell.innerText, clockOutCell.innerText, timeWorkedCell.innerText);
    });
    
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);
    
    table.appendChild(row);

    saveToLocalStorage(clockIn, clockOut, timeWorked);
}

function displayWorkLog(workLog) {
    const table = document.createElement('table');
        
    const headerRow = document.createElement('tr');
        
    const clockInHeader = document.createElement('th');
    clockInHeader.innerText = 'Clock In';
    clockInHeader.classList.add('hdr');
    headerRow.appendChild(clockInHeader);
        
    const clockOutHeader = document.createElement('th');
    clockOutHeader.innerText = 'Clock Out';
    clockOutHeader.classList.add('hdr');
    headerRow.appendChild(clockOutHeader);
        
    const timeWorkedHeader = document.createElement('th');
    timeWorkedHeader.innerText = 'Time Worked';
    timeWorkedHeader.classList.add('hdr');
    headerRow.appendChild(timeWorkedHeader);
        
    const deleteHeader = document.createElement('th');
    deleteHeader.innerText = 'Actions';
    deleteHeader.classList.add('hdr');
    headerRow.appendChild(deleteHeader);
        
    table.appendChild(headerRow);
    workHistory.appendChild(table);

    workLog.forEach(entry => {
        const row = document.createElement('tr');
            
        const clockInCell = document.createElement('td');
        clockInCell.innerText = entry.clockIn;
        row.appendChild(clockInCell);
            
        const clockOutCell = document.createElement('td');
        clockOutCell.innerText = entry.clockOut;
        row.appendChild(clockOutCell);
            
        const timeWorkedCell = document.createElement('td');
        timeWorkedCell.innerText = entry.timeWorked;
        row.appendChild(timeWorkedCell);
            
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('img');
        deleteButton.src= 'icons/delete.png';
        deleteButton.style.width = '25px';
        deleteButton.style.height = '25px';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', function() {
            row.remove(); // Remove row from table
                
            // Remove from local storage
            removeFromLocalStorage(entry.clockIn, entry.clockOut, entry.timeWorked);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
            
        table.appendChild(row);
    });
}

function removeFromLocalStorage(clockIn, clockOut, timeWorked) {
    let workLog = JSON.parse(localStorage.getItem('workLog')) || [];
    workLog = workLog.filter(entry => {
        return !(entry.clockIn === clockIn && entry.clockOut === clockOut && entry.timeWorked === timeWorked);
    });
    localStorage.setItem('workLog', JSON.stringify(workLog));
}

function saveToLocalStorage(clockIn, clockOut, timeWorked) {
    const workLog = JSON.parse(localStorage.getItem('workLog')) || [];
    workLog.push({
        clockIn: clockIn.toLocaleString(),
        clockOut: clockOut.toLocaleString(),
        timeWorked: timeWorked
    });
    localStorage.setItem('workLog', JSON.stringify(workLog));
}

function loadWorkHistoryFromLocalStorage() {
    updateWorkHistoryDisplay();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 10;
    const fontSize = 12;
    doc.setFontSize(fontSize); 
    doc.text('Work Log History', 10, y);
    y += fontSize + 5; // Increase y position for spacing after title

    if (!workHistory.querySelector('table')) {
        doc.text('No work log history available.', 10, y);
    } else {
        const table = workHistory.querySelector('table');
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('th, td');
            const cellHeight = 10;
            const cellWidth = 60;
            const startX = 10;
            const startY = y;
            const endX = startX + cellWidth;
            const endY = startY + cellHeight;
            
            // Draw cells excluding the last cell (Actions)
            cells.forEach((cell, cellIndex) => {
                if (cellIndex < cells.length - 1) {
                    // Calculate text position to center it within the cell
                    const textWidth = doc.getStringUnitWidth(cell.innerText) * fontSize / doc.internal.scaleFactor;
                    const textX = startX + (cellIndex * cellWidth) + (cellWidth / 2) - (textWidth / 2);
                    const textY = y + fontSize / 2;

                    // Draw cell content
                    doc.text(cell.innerText, textX, textY);

                    // Draw cell borders
                    doc.rect(startX + (cellIndex * cellWidth), y, cellWidth, cellHeight);
                }
            });

            // Draw row borders
            if (rowIndex > 0) {
                doc.line(startX, startY, endX, startY); // Top border
            }
            doc.line(startX, endY, endX, endY); // Bottom border
            y += cellHeight;
        });
    }
    
    doc.save('work-log.pdf');
}
