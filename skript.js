
// ───────────── Heute auslesen ─────────────
const today = new Date();  // aktuelles Datum
// year = aktuelles Jahr, month = aktueller Monat (0 = Januar)
const year = today.getFullYear();  // z. B. 2025
const month = today.getMonth();    // 0 = Januar, 11 = Dezember
const daysInMonth = new Date(year, month + 1, 0).getDate(); 
// new Date(year, month+1, 0) → letztes Datum des aktuellen Monats
// getDate() gibt die Tageszahl zurück

// ───────────── DOM Elemente holen ─────────────
const calendarTableBody = document.querySelector("#calendar-table tbody");
const monthYearLabel = document.getElementById("month-year");
const prevButton = document.getElementById("prevMonth");
const nextButton = document.getElementById("nextMonth");

// ───────────── Aktuell angezeigter Monat ─────────────
let currentDate = new Date(); // speichert Monat, der gerade angezeigt wird

// ───────────── Monat + Jahr im Label anzeigen ─────────────
function updateMonthLabel() {
    const monthNames = [
        "Januar","Februar","März","April","Mai","Juni",
        "Juli","August","September","Oktober","November","Dezember"
    ];

    // Holen von Monat & Jahr aus currentDate
    const month = currentDate.getMonth();       // 0 = Januar
    const year = currentDate.getFullYear();     // z. B. 2025

    // Monat + Jahr in Label anzeigen
    monthYearLabel.textContent = monthNames[month] + " " + year;
}

// ───────────── Funktion: vorherigen Monat anzeigen ─────────────
function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1); // Monat um 1 zurücksetzen
    updateMonthLabel();
    renderCalendar();
}

// ───────────── Funktion: nächsten Monat anzeigen ─────────────
function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1); // Monat um 1 vor
    updateMonthLabel();
    renderCalendar();
}

// ───────────── Funktion: Kalender rendern ─────────────
function renderCalendar() {
    const tbody = document.querySelector("#calendar-table tbody");
    tbody.innerHTML = ""; // alten Kalenderinhalt löschen

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1); // 1. Tag im Monat
    let startWeekday = firstDay.getDay();      // 0 = Sonntag, 1 = Montag ...
    if (startWeekday === 0) startWeekday = 7;  // Sonntag = 7 für Montag-Start

    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Anzahl Tage

    let row = document.createElement("tr"); // neue Zeile erstellen

    // Leere Zellen vor dem 1. Tag
    for (let i = 1; i < startWeekday; i++) {
        row.appendChild(document.createElement("td"));
    }

    // Tage des Monats einfügen
    for (let day = 1; day <= daysInMonth; day++) {
        const td = document.createElement("td");
        td.textContent = day;
        td.style.cursor = "pointer"; // Mauszeiger-Hand bei Hover
        td.addEventListener("click", () => openTrainingProcess(year, month, day));

        // Heute markieren
        if (day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()) {
            td.classList.add("today");
        }

        row.appendChild(td);

        // Neue Zeile starten, wenn Woche voll
        if ((startWeekday - 1 + day) % 7 === 0) {
            tbody.appendChild(row);
            row = document.createElement("tr");
        }
    }

    tbody.appendChild(row); // letzte Zeile anhängen
}

// ───────────── Trainingsdaten Fenster öffnen ─────────────
let selectedDateKey = ""; // Key für LocalStorage

function openTrainingProcess(year, month, day) {
    const dateString = `${day}.${month + 1}.${year}`; // für Anzeige
    const dateISO = `${day}.${month + 1}.${year}`;    // für LocalStorage Key
    selectedDateKey = "training_" + dateISO;

    // DOM-Elemente
    const windowEl = document.getElementById("training-window");
    const dateEl = document.getElementById("training-date");

    dateEl.textContent = "Training am " + dateString;
    windowEl.style.display = "block"; // Fenster öffnen

    loadExercise(); // Trainingsdaten laden
}

// ───────────── Trainingsdaten laden ─────────────
function loadExercise() {
    const tbody = document.querySelector("#exercise-table tbody");
    tbody.innerHTML = ""; // alte Daten löschen

    const data = localStorage.getItem(selectedDateKey);
    if (!data) return;

    const exercises = JSON.parse(data);
    exercises.forEach(ex => addExerciseToTable(ex.exercise, ex.sets, ex.reps));
}

// ───────────── Übung zur Tabelle hinzufügen ─────────────
function addExerciseToTable(exercise, sets, reps) {
    const tbody = document.querySelector("#exercise-table tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${exercise}</td>
        <td>${sets}</td>
        <td>${reps}</td>
        <td><button class="delete-btn">Löschen</button></td>
    `;

    // Delete Button
    tr.querySelector(".delete-btn").addEventListener("click", () => {
        tr.remove();
        saveExercises(); // nach Löschen speichern
    });

    tbody.appendChild(tr);
}

// ───────────── Neue Übung hinzufügen (vom Formular) ─────────────
function addExercise() {
    const exercise = document.getElementById("exercise").value.trim();
    const sets = document.getElementById("sets").value.trim();
    const reps = document.getElementById("reps").value.trim();

    if (!exercise) { alert("Bitte eine Übung eingeben!"); return; }
    if (!sets || sets < 0) { alert("Bitte Anzahl der Sätze eingeben!"); return; }
    if (!reps || reps < 0) { alert("Bitte Anzahl der Wiederholungen eingeben!"); return; }

    addExerciseToTable(exercise, sets, reps);
    saveExercises(); // LocalStorage aktualisieren

    // Inputs leeren
    document.getElementById("exercise").value = "";
    document.getElementById("sets").value = "";
    document.getElementById("reps").value = "";
}

// ───────────── Trainingsdaten speichern ─────────────
function saveExercises() {
    const rows = document.querySelectorAll("#exercise-table tbody tr");
    const data = [];

    rows.forEach(row => {
        const tds = row.querySelectorAll("td");
        data.push({
            exercise: tds[0].textContent,
            sets: tds[1].textContent,
            reps: tds[2].textContent
        });
    });

    localStorage.setItem(selectedDateKey, JSON.stringify(data));
}

// ───────────── EventListener für Monat-Buttons ─────────────
prevButton.addEventListener("click", goToPreviousMonth);
nextButton.addEventListener("click", goToNextMonth);

// ───────────── Kalender initial rendern ─────────────
updateMonthLabel();
renderCalendar();