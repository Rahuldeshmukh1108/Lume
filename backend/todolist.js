document.addEventListener('DOMContentLoaded', function () {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAHL_VjbFjsnemCxfnR3rS4IrFMrhhKaF0",
        authDomain: "lume-6c502.firebaseapp.com",
        projectId: "lume-6c502",
        storageBucket: "lume-6c502.appspot.com",
        messagingSenderId: "1060714065022",
        appId: "1:1060714065022:web:adb6119e4bf3e0fd0a3c2f",
        measurementId: "G-ZQHSG20061",
    }

    // Initialize Firebase
    // Assuming firebase is available globally from CDN or similar
    // If not, you'll need to import it:
    // import firebase from 'firebase/app';
    // import 'firebase/auth';
    // import 'firebase/firestore';
    const firebase = window.firebase // Accessing the global firebase object

    // Add error handling for Firebase initialization
    try {
        firebase.initializeApp(firebaseConfig)
        const auth = firebase.auth()
        const db = firebase.firestore()
    } catch (error) {
        console.error("Error initializing Firebase:", error)
        alert("Error initializing the app. Please check your internet connection and refresh the page.")
    }

    // DOM Elements - Add null checks
    const addTaskBtn = document.getElementById("add-task-btn")
    const taskModal = document.getElementById("task-modal")
    const thoughtsModal = document.getElementById("thoughts-modal")
    const eventModal = document.getElementById("event-modal")
    const authModal = document.getElementById("auth-modal")
    const thoughtsBtn = document.getElementById("thoughts-btn")
    const calendarBtn = document.getElementById("calendar-btn")
    const closeButtons = document.querySelectorAll(".close")
    const taskForm = document.getElementById("task-form")
    const thoughtsForm = document.getElementById("thoughts-form")
    const eventForm = document.getElementById("event-form")
    const todoTasks = document.getElementById("todo-tasks")
    const progressTasks = document.getElementById("progress-tasks")
    const holdTasks = document.getElementById("hold-tasks")
    const completedTasks = document.getElementById("completed-tasks")
    const calendarGrid = document.getElementById("calendar-grid")
    const googleCalendarContainer = document.getElementById("google-calendar")
    const calendarCard = document.querySelector(".calendar-card")
    const notesContainer = document.getElementById("notes-container")
    const prevNoteBtn = document.getElementById("prev-note")
    const nextNoteBtn = document.getElementById("next-note")
    const noteCounter = document.getElementById("note-counter")
    const currentMonthElement = document.getElementById("current-month")
    const prevMonthBtn = document.getElementById("prev-month")
    const nextMonthBtn = document.getElementById("next-month")
    const userProfile = document.getElementById("user-profile")
    const userMenu = document.getElementById("user-menu")
    const logoutBtn = document.getElementById("logout-btn")
    const authTabs = document.querySelectorAll(".auth-tab")
    const loginForm = document.getElementById("login-form")
    const signupForm = document.getElementById("signup-form")
    const loginBtn = document.getElementById("login-btn")
    const signupBtn = document.getElementById("signup-btn")
    const loginError = document.getElementById("login-error")
    const signupError = document.getElementById("signup-error")
    const appContent = document.getElementById("app-content")
    const loadingSpinner = document.getElementById("loading-spinner")

    // App State
    let tasks = []
    let thoughts = []
    let currentUser = null
    let userName = "User"
    let showingCalendar = false
    let currentNoteIndex = 0
    const currentDate = new Date()
    let selectedDate = null
    let googleApiLoaded = false

    // Add a function to check if Firebase is initialized properly
    function checkFirebaseConnection() {
        if (!firebase || !auth || !db) {
            console.error("Firebase is not properly initialized")
            alert("There was an error connecting to the database. Please refresh the page and try again.")
            return false
        }
        return true
    }

    // Fix: Define auth and db in the global scope
    const auth = firebase.auth()
    const db = firebase.firestore()

    // Auth State Listener
    auth.onAuthStateChanged((user) => {
        try {
            if (user) {
                currentUser = user
                loadUserData()
                updateUserUI(user)
                if (appContent) appContent.style.display = "block"
                if (authModal) authModal.style.display = "none"
            } else {
                currentUser = null
                if (appContent) appContent.style.display = "none"
                if (authModal) authModal.style.display = "block"
                if (loadingSpinner) loadingSpinner.style.display = "none"
            }
        } catch (error) {
            console.error("Error in auth state change:", error)
            alert("Authentication error. Please refresh the page and try again.")
        }
    })

    // Auth Functions
    function updateUserUI(user) {
        // Update user name in greeting
        db.collection("users")
            .doc(user.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    userName = doc.data().name || user.displayName || user.email.split("@")[0]
                    const userNameElement = document.getElementById("user-name")
                    const userMenuNameElement = document.getElementById("user-menu-name")
                    const userMenuEmailElement = document.getElementById("user-menu-email")
                    
                    if (userNameElement) userNameElement.textContent = userName
                    if (userMenuNameElement) userMenuNameElement.textContent = userName
                    if (userMenuEmailElement) userMenuEmailElement.textContent = user.email
                }
            })
    }

    function loadUserData() {
        if (loadingSpinner) loadingSpinner.style.display = "flex"

        // Load tasks
        db.collection("users")
            .doc(currentUser.uid)
            .collection("tasks")
            .get()
            .then((snapshot) => {
                tasks = []
                snapshot.forEach((doc) => {
                    tasks.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                renderTasks()
            })
            .catch((error) => {
                console.error("Error loading tasks: ", error)
            })

        // Load thoughts
        db.collection("users")
            .doc(currentUser.uid)
            .collection("thoughts")
            .orderBy("createdAt", "desc")
            .get()
            .then((snapshot) => {
                thoughts = []
                snapshot.forEach((doc) => {
                    thoughts.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                renderNotes()
            })
            .catch((error) => {
                console.error("Error loading thoughts: ", error)
            })
            .finally(() => {
                if (loadingSpinner) loadingSpinner.style.display = "none"
                init()
            })
    }

    // Initialize the app
    function init() {
        renderCalendar()
        setupDragAndDrop()

        // Add floating button for adding events
        if (calendarCard) {
            // Check if button already exists
            if (!calendarCard.querySelector(".add-event-btn")) {
                const addEventBtn = document.createElement("div")
                addEventBtn.className = "add-event-btn"
                addEventBtn.innerHTML = '<i class="fas fa-plus"></i>'
                addEventBtn.addEventListener("click", () => {
                    // Pre-fill the date if a date is selected
                    if (selectedDate) {
                        const eventStartDateElement = document.getElementById("event-start-date")
                        const eventEndDateElement = document.getElementById("event-end-date")
                        
                        if (eventStartDateElement) eventStartDateElement.value = formatDateForInput(selectedDate)
                        if (eventEndDateElement) eventEndDateElement.value = formatDateForInput(selectedDate)
                    }
                    if (eventModal) eventModal.style.display = "block"
                })
                calendarCard.appendChild(addEventBtn)
            }
        }
    }

    // Event Listeners - Add null checks
    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", () => {
            if (taskModal) taskModal.style.display = "block"
        })
    }

    if (thoughtsBtn) {
        thoughtsBtn.addEventListener("click", () => {
            if (thoughtsModal) thoughtsModal.style.display = "block"
        })
    }

    if (calendarBtn) {
        calendarBtn.addEventListener("click", () => {
            showingCalendar = !showingCalendar
            if (googleCalendarContainer) {
                if (showingCalendar) {
                    googleCalendarContainer.style.display = "block"
                    if (!googleApiLoaded) {
                        initGoogleCalendar()
                    }
                } else {
                    googleCalendarContainer.style.display = "none"
                }
            }
        })
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1)
            renderCalendar()
        })
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1)
            renderCalendar()
        })
    }

    if (prevNoteBtn) {
        prevNoteBtn.addEventListener("click", () => {
            if (thoughts.length > 0 && currentNoteIndex > 0) {
                currentNoteIndex--
                updateNotesDisplay()
            }
        })
    }

    if (nextNoteBtn) {
        nextNoteBtn.addEventListener("click", () => {
            if (thoughts.length > 0 && currentNoteIndex < thoughts.length - 1) {
                currentNoteIndex++
                updateNotesDisplay()
            }
        })
    }

    if (closeButtons) {
        closeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (taskModal) taskModal.style.display = "none"
                if (thoughtsModal) thoughtsModal.style.display = "none"
                if (eventModal) eventModal.style.display = "none"
                if (authModal) authModal.style.display = "none"
            })
        })
    }

    window.addEventListener("click", (e) => {
        if (taskModal && e.target === taskModal) {
            taskModal.style.display = "none"
        }
        if (thoughtsModal && e.target === thoughtsModal) {
            thoughtsModal.style.display = "none"
        }
        if (eventModal && e.target === eventModal) {
            eventModal.style.display = "none"
        }
        if (authModal && e.target === authModal) {
            // Don't close auth modal on outside click
        }
        if (userProfile && userMenu && e.target !== userProfile && e.target !== userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove("active")
        }
    })

    if (userProfile && userMenu) {
        userProfile.addEventListener("click", () => {
            userMenu.classList.toggle("active")
        })
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth
                .signOut()
                .then(() => {
                    if (userMenu) userMenu.classList.remove("active")
                })
                .catch((error) => {
                    console.error("Error signing out: ", error)
                })
        })
    }

    // Auth Tabs
    if (authTabs) {
        authTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                // Remove active class from all tabs
                authTabs.forEach((t) => t.classList.remove("active"))

                // Add active class to clicked tab
                tab.classList.add("active")

                // Show corresponding form
                const tabName = tab.dataset.tab
                document.querySelectorAll(".auth-form").forEach((form) => {
                    form.classList.remove("active")
                })

                // Fix: Use template literals for string interpolation
                const formElement = document.getElementById(`${tabName}-form`)
                if (formElement) formElement.classList.add("active")
            })
        })
    }

    // Login
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const emailElement = document.getElementById("login-email")
            const passwordElement = document.getElementById("login-password")
            
            if (!emailElement || !passwordElement || !loginError) return
            
            const email = emailElement.value
            const password = passwordElement.value

            loginError.textContent = ""

            if (!email || !password) {
                loginError.textContent = "Please enter both email and password"
                return
            }

            auth.signInWithEmailAndPassword(email, password).catch((error) => {
                loginError.textContent = error.message
            })
        })
    }

    // Sign Up
    if (signupBtn) {
        signupBtn.addEventListener("click", () => {
            const nameElement = document.getElementById("signup-name")
            const emailElement = document.getElementById("signup-email")
            const passwordElement = document.getElementById("signup-password")
            
            if (!nameElement || !emailElement || !passwordElement || !signupError) return
            
            const name = nameElement.value
            const email = emailElement.value
            const password = passwordElement.value

            signupError.textContent = ""

            if (!name || !email || !password) {
                signupError.textContent = "Please fill in all fields"
                return
            }

            auth
                .createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Create user document
                    return db.collection("users").doc(userCredential.user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                })
                .catch((error) => {
                    signupError.textContent = error.message
                })
        })
    }

    if (taskForm) {
        taskForm.addEventListener("submit", (e) => {
            e.preventDefault()

            if (!currentUser) {
                alert("Please log in to add tasks")
                return
            }

            const titleElement = document.getElementById("task-title")
            const descriptionElement = document.getElementById("task-description")
            const dueDateElement = document.getElementById("task-due-date")
            const priorityElement = document.getElementById("task-priority")
            
            if (!titleElement || !descriptionElement || !dueDateElement || !priorityElement) return
            
            const title = titleElement.value
            const description = descriptionElement.value
            const dueDate = dueDateElement.value
            const priority = priorityElement.value

            if (!title.trim()) {
                alert("Please enter a task title")
                return
            }

            const newTask = {
                title,
                description,
                dueDate,
                priority,
                status: "todo",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }

            db.collection("users")
                .doc(currentUser.uid)
                .collection("tasks")
                .add(newTask)
                .then((docRef) => {
                    tasks.push({
                        id: docRef.id,
                        ...newTask,
                        createdAt: new Date().toISOString(), // For immediate display
                    })
                    renderTasks()

                    taskForm.reset()
                    if (taskModal) taskModal.style.display = "none"
                })
                .catch((error) => {
                    console.error("Error adding task: ", error)
                    alert("Error adding task: " + error.message)
                })
        })
    }

    if (thoughtsForm) {
        thoughtsForm.addEventListener("submit", (e) => {
            e.preventDefault()

            if (!currentUser) {
                alert("Please log in to add notes")
                return
            }

            const textElement = document.getElementById("thoughts-text")
            const colorElement = document.getElementById("note-color")
            
            if (!textElement || !colorElement) return
            
            const text = textElement.value
            const color = colorElement.value

            if (!text.trim()) {
                alert("Please enter some text for your note")
                return
            }

            const newThought = {
                text,
                color,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }

            db.collection("users")
                .doc(currentUser.uid)
                .collection("thoughts")
                .add(newThought)
                .then((docRef) => {
                    thoughts.unshift({
                        id: docRef.id,
                        ...newThought,
                        createdAt: new Date().toISOString(), // For immediate display
                    })
                    renderNotes()

                    // Set current note to the new note
                    currentNoteIndex = 0
                    updateNotesDisplay()

                    thoughtsForm.reset()
                    if (thoughtsModal) thoughtsModal.style.display = "none"
                })
                .catch((error) => {
                    console.error("Error adding thought: ", error)
                    alert("Error adding note: " + error.message)
                })
        })
    }

    if (eventForm) {
        eventForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const titleElement = document.getElementById("event-title")
            const descriptionElement = document.getElementById("event-description")
            const startDateElement = document.getElementById("event-start-date")
            const startTimeElement = document.getElementById("event-start-time")
            const endDateElement = document.getElementById("event-end-date")
            const endTimeElement = document.getElementById("event-end-time")
            const locationElement = document.getElementById("event-location")
            
            if (!titleElement || !descriptionElement || !startDateElement || 
                !startTimeElement || !endDateElement || !endTimeElement || !locationElement) return
            
            const title = titleElement.value
            const description = descriptionElement.value
            const startDate = startDateElement.value
            const startTime = startTimeElement.value || "00:00"
            const endDate = endDateElement.value
            const endTime = endTimeElement.value || "23:59"
            const location = locationElement.value

            if (!title.trim() || !startDate || !endDate) {
                alert("Please fill in the required fields (title, start date, end date)")
                return
            }

            // Create event in Google Calendar
            // Assuming gapi is available globally from the Google API script
            // If not, ensure the Google API script is loaded in your HTML
            const gapi = window.gapi // Accessing the global gapi object

            if (
                typeof gapi !== "undefined" &&
                gapi.auth2 &&
                gapi.auth2.getAuthInstance() &&
                gapi.auth2.getAuthInstance().isSignedIn.get()
            ) {
                const event = {
                    summary: title,
                    location: location,
                    description: description,
                    start: {
                        // Fix: Use template literals for string interpolation
                        dateTime: `${startDate}T${startTime}:00`,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        // Fix: Use template literals for string interpolation
                        dateTime: `${endDate}T${endTime}:00`,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                }

                createCalendarEvent(event)
            } else {
                // If Google Calendar is not available, store the event locally
                alert("Google Calendar not connected. Event will be stored locally.")

                // Store event in Firestore if user is logged in
                if (currentUser) {
                    const newEvent = {
                        title,
                        description,
                        location,
                        startDate,
                        startTime,
                        endDate,
                        endTime,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    }

                    db.collection("users")
                        .doc(currentUser.uid)
                        .collection("events")
                        .add(newEvent)
                        .then(() => {
                            alert("Event saved successfully!")
                        })
                        .catch((error) => {
                            console.error("Error adding event: ", error)
                            alert("Error saving event: " + error.message)
                        })
                }
            }

            eventForm.reset()
            if (eventModal) eventModal.style.display = "none"
        })
    }

    // Task Management Functions
    function renderTasks() {
        // Check if DOM elements exist
        if (!todoTasks || !progressTasks || !holdTasks || !completedTasks) return
        
        // Clear all task containers
        todoTasks.innerHTML = ""
        progressTasks.innerHTML = ""
        holdTasks.innerHTML = ""
        completedTasks.innerHTML = ""

        // Render tasks by status
        tasks.forEach((task) => {
            const taskElement = createTaskElement(task)

            switch (task.status) {
                case "todo":
                    todoTasks.appendChild(taskElement)
                    break
                case "progress":
                    progressTasks.appendChild(taskElement)
                    break
                case "hold":
                    holdTasks.appendChild(taskElement)
                    break
                case "completed":
                    completedTasks.appendChild(taskElement)
                    break
            }
        })

        // Add empty task placeholders
        addEmptyTaskPlaceholders(todoTasks, 3)
        addEmptyTaskPlaceholders(progressTasks, 3)
        addEmptyTaskPlaceholders(holdTasks, 3)
        addEmptyTaskPlaceholders(completedTasks, 3)
    }

    function createTaskElement(task) {
        const taskElement = document.createElement("div")
        taskElement.className = "task-card"
        taskElement.draggable = true
        taskElement.dataset.id = task.id

        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"

        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || "No description"}</div>
            <div class="task-meta">
                <span class="task-date">${formattedDate}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="delete-task" data-id="${task.id}">×</button>
            </div>
        `

        // Add delete event listener
        taskElement.querySelector(".delete-task").addEventListener("click", (e) => {
            e.stopPropagation()
            deleteTask(task.id)
        })

        return taskElement
    }

    function addEmptyTaskPlaceholders(container, count) {
        if (!container) return
        
        const currentCount = container.querySelectorAll(".task-card").length

        if (currentCount < count) {
            for (let i = 0; i < count - currentCount; i++) {
                const placeholder = document.createElement("div")
                placeholder.className = "task-card empty-task"
                container.appendChild(placeholder)
            }
        }
    }

    function deleteTask(id) {
        if (!currentUser) return
        
        db.collection("users")
            .doc(currentUser.uid)
            .collection("tasks")
            .doc(id)
            .delete()
            .then(() => {
                tasks = tasks.filter((task) => task.id !== id)
                renderTasks()
            })
            .catch((error) => {
                console.error("Error deleting task: ", error)
                alert("Error deleting task. Please try again.")
            })
    }

    // Notes Functions
    function renderNotes() {
        if (!notesContainer || !noteCounter) return
        
        notesContainer.innerHTML = ""

        if (thoughts.length === 0) {
            noteCounter.textContent = "0/0"
            return
        }

        thoughts.forEach((thought, index) => {
            const noteElement = document.createElement("div")
            // Fix: Use template literals for string interpolation
            noteElement.className = `note ${index === currentNoteIndex ? "active" : index < currentNoteIndex ? "prev" : "next"}`
            noteElement.style.backgroundColor = thought.color || "#f9efaf"
            // Fix: Use template literals for string interpolation
            noteElement.innerHTML = `<p>${thought.text}</p>`
            notesContainer.appendChild(noteElement)
        })

        updateNotesDisplay()
    }

    function updateNotesDisplay() {
        if (!notesContainer || !noteCounter) return
        
        const notes = document.querySelectorAll(".note")

        notes.forEach((note, index) => {
            note.className = "note"
            if (index === currentNoteIndex) {
                note.classList.add("active")
            } else if (index < currentNoteIndex) {
                note.classList.add("prev")
            } else {
                note.classList.add("next")
            }
        })

        // Fix: Use template literals for string interpolation
        noteCounter.textContent = thoughts.length > 0 ? `${currentNoteIndex + 1}/${thoughts.length}` : "0/0"
    }

    // Calendar Functions
    // Fix: Replace the problematic calendar button event listener
    if (document.getElementById("calendar-btn")) {
        document.getElementById("calendar-btn").addEventListener("click", async () => {
            const user = firebase.auth().currentUser; 

            if (!user) {
                showNotification("Please sign in to access Google Calendar.");
                return;
            }

            // Redirect to Google Calendar
            window.open("https://calendar.google.com", "_blank");
        });
    }

    // Function to show notification
    function showNotification(message) {
        alert(message); // You can replace this with your custom notification UI
    }

    function renderCalendar() {
        if (!calendarGrid || !currentMonthElement) return
        
        calendarGrid.innerHTML = ""

        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // Update the month display
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]
        // Fix: Use template literals for string interpolation
        currentMonthElement.textContent = `${monthNames[month]} ${year}`

        // Get first day of month and last day
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // Get the day of the week for the first day (0-6)
        const firstDayOfWeek = firstDay.getDay()

        // Get days from previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate()

        // Add days from previous month
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = document.createElement("div")
            dayElement.className = "calendar-day other-month"
            dayElement.textContent = prevMonthLastDay - i
            calendarGrid.appendChild(dayElement)
        }

        // Add days for current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement("div")
            dayElement.className = "calendar-day"

            // Check if this is today
            const today = new Date()
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add("today")
            }

            // Check if this is the selected date
            if (
                selectedDate &&
                i === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear()
            ) {
                dayElement.classList.add("selected")
            }

            dayElement.textContent = i

            // Add click event to select date
            dayElement.addEventListener("click", () => {
                // Remove selected class from all days
                document.querySelectorAll(".calendar-day").forEach((day) => {
                    day.classList.remove("selected")
                })

                // Add selected class to clicked day
                dayElement.classList.add("selected")

                // Update selected date
                selectedDate = new Date(year, month, i)

                // If Google Calendar is authenticated, fetch events for this date
                if (typeof gapi !== "undefined" && gapi.auth2 && gapi.auth2.getAuthInstance().isSignedIn.get()) {
                    fetchEventsForDate(selectedDate)
                }
            })

            calendarGrid.appendChild(dayElement)
        }

        // Add days from next month to fill the grid
        const totalDaysDisplayed = firstDayOfWeek + lastDay.getDate()
        const remainingDays = 7 - (totalDaysDisplayed % 7)

        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                const dayElement = document.createElement("div")
                dayElement.className = "calendar-day other-month"
                dayElement.textContent = i
                calendarGrid.appendChild(dayElement)
            }
        }
    }

    function formatDateForInput(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        // Fix: Use template literals for string interpolation
        return `${year}-${month}-${day}`
    }

    // Google Calendar Integration
    function initGoogleCalendar() {
        // Load the Google API client
        const gapi = window.gapi;
        if (typeof gapi !== "undefined") {
            gapi.load("client:auth2", initClient)
            googleApiLoaded = true
        } else {
            if (googleCalendarContainer) {
                googleCalendarContainer.innerHTML = `
                    <div class="calendar-auth">
                        <p>Google Calendar API not loaded. Please check your internet connection.</p>
                        <p>You can still use the calendar for viewing dates.</p>
                    </div>
                `
            }
        }
    }

    function initClient() {
        // Initialize the Google API client with your API key and client ID
        const gapi = window.gapi // Accessing the global gapi object

        if (typeof gapi !== "undefined") {
            gapi.client
                .init({
                    apiKey: "AIzaSyAHL_VjbFjsnemCxfnR3rS4IrFMrhhKaF0", // Using Firebase API key
                    clientId: "1060714065022-rvvs9d7jcars2qbh3hh3a5s3rj18fk3n.apps.googleusercontent.com", // You would need to create this
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                    scope: "https://www.googleapis.com/auth/calendar",
                })
                .then(() => {
                    // Listen for sign-in state changes
                    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)

                    // Handle the initial sign-in state
                    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
                })
                .catch((error) => {
                    console.error("Error initializing Google API client", error)
                    if (googleCalendarContainer) {
                        googleCalendarContainer.innerHTML = `
                            <div class="calendar-auth">
                                <p>Error initializing Google Calendar: ${error.details || error.message || "Unknown error"}</p>
                                <p>You can still use the calendar for viewing dates.</p>
                            </div>
                        `
                    }
                })
        } else {
            console.error("gapi is not defined. Ensure the Google API script is loaded.")
            if (googleCalendarContainer) {
                googleCalendarContainer.innerHTML = `
                    <div class="calendar-auth">
                        <p>Google Calendar API not loaded. Please check your internet connection.</p>
                        <p>You can still use the calendar for viewing dates.</p>
                    </div>
                `
            }
        }
    }

    function updateSigninStatus(isSignedIn) {
        const gapi = window.gapi // Accessing the global gapi object
        
        if (!googleCalendarContainer) return

        if (isSignedIn) {
            // User is signed in, fetch calendar events
            listUpcomingEvents()
        } else {
            // User is not signed in, show sign-in button
            googleCalendarContainer.innerHTML = `
                <div class="calendar-auth">
                    <p>Connect to Google Calendar to see your events</p>
                    <button id="authorize-button" class="btn">Authorize</button>
                </div>
            `

            const authorizeButton = document.getElementById("authorize-button")
            if (authorizeButton) {
                authorizeButton.addEventListener("click", () => {
                    if (typeof gapi !== "undefined") {
                        gapi.auth2.getAuthInstance().signIn()
                    } else {
                        console.error("gapi is not defined. Ensure the Google API script is loaded.")
                        alert("Google API not loaded. Please check your internet connection.")
                    }
                })
            }
        }
    }

    function listUpcomingEvents() {
        const gapi = window.gapi // Accessing the global gapi object
        
        if (!googleCalendarContainer) return

        if (typeof gapi !== "undefined") {
            gapi.client.calendar.events
                .list({
                    calendarId: "primary",
                    timeMin: new Date().toISOString(),
                    showDeleted: false,
                    singleEvents: true,
                    maxResults: 10,
                    orderBy: "startTime",
                })
                .then((response) => {
                    const events = response.result.items

                if (events.length > 0) {
                    let eventsHtml = '<div class="calendar-events">'

                    events.forEach((event) => {
                        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date)
                        const formattedDate = start.toLocaleDateString()
                        const formattedTime = event.start.dateTime
                            ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "All day"

                        eventsHtml += `
                            <div class="calendar-event">
                                <div class="event-time">${formattedDate} ${formattedTime}</div>
                                <div class="event-title">${event.summary}</div>
                                ${event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ""}
                            </div>
                        `

                        // Mark days with events
                        markDayWithEvent(start)
                    })

                    eventsHtml += "</div>"
                    googleCalendarContainer.innerHTML = eventsHtml
                } else {
                    googleCalendarContainer.innerHTML = `
                        <div class="calendar-auth">
                            <p>No upcoming events found.</p>
                            <button id="signout-button" class="btn">Sign Out</button>
                        </div>
                    `

                    const signoutButton = document.getElementById("signout-button")
                    if (signoutButton) {
                        signoutButton.addEventListener("click", () => {
                            if (typeof gapi !== "undefined") {
                                gapi.auth2.getAuthInstance().signOut()
                            } else {
                                console.error("gapi is not defined. Ensure the Google API script is loaded.")
                                alert("Google API not loaded. Please check your internet connection.")
                            }
                        })
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching events", error)
                googleCalendarContainer.innerHTML = `
                    <div class="calendar-auth">
                        <p>Error fetching events: ${error.details || error.message || "Unknown error"}</p>
                        <button id="retry-button" class="btn">Retry</button>
                    </div>
                `

                const retryButton = document.getElementById("retry-button")
                if (retryButton) {
                    retryButton.addEventListener("click", listUpcomingEvents)
                }
            })
    } else {
        console.error("gapi is not defined. Ensure the Google API script is loaded.")
        googleCalendarContainer.innerHTML = `
            <div class="calendar-auth">
                <p>Google Calendar API not loaded. Please check your internet connection.</p>
            </div>
        `
    }
}

function fetchEventsForDate(date) {
    if (!googleCalendarContainer) return
    
    // Create time range for the selected date (full day)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const gapi = window.gapi // Accessing the global gapi object

    if (typeof gapi !== "undefined") {
        gapi.client.calendar.events
            .list({
                calendarId: "primary",
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                showDeleted: false,
                singleEvents: true,
                orderBy: "startTime",
            })
            .then((response) => {
                const events = response.result.items

                if (events.length > 0) {
                    let eventsHtml = `<h3>Events on ${date.toLocaleDateString()}</h3><div class="calendar-events">`

                    events.forEach((event) => {
                        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date)
                        const formattedTime = event.start.dateTime
                            ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "All day"

                        eventsHtml += `
                            <div class="calendar-event">
                                <div class="event-time">${formattedTime}</div>
                                <div class="event-title">${event.summary}</div>
                                ${event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ""}
                            </div>
                        `
                    })

                    eventsHtml += "</div>"
                    googleCalendarContainer.innerHTML = eventsHtml
                } else {
                    googleCalendarContainer.innerHTML = `
                        <h3>Events on ${date.toLocaleDateString()}</h3>
                        <p>No events found for this date.</p>
                    `
                }
            })
    } else {
        console.error("gapi is not defined. Ensure the Google API script is loaded.")
        googleCalendarContainer.innerHTML = `
            <p>Google Calendar API not loaded. Please check your internet connection.</p>
        `
    }
}

function createCalendarEvent(event) {
    const gapi = window.gapi // Accessing the global gapi object

    if (typeof gapi !== "undefined") {
        gapi.client.calendar.events
            .insert({
                calendarId: "primary",
                resource: event,
            })
            .then((response) => {
                // Refresh the events list
                if (selectedDate) {
                    fetchEventsForDate(selectedDate)
                } else {
                    listUpcomingEvents()
                }

                // Mark the day with an event
                const eventDate = new Date(event.start.dateTime || event.start.date)
                markDayWithEvent(eventDate)

                alert("Event created successfully!")
            })
            .catch((error) => {
                console.error("Error creating event", error)
                alert("Error creating event: " + (error.details || error.message || "Unknown error"))
            })
    } else {
        console.error("gapi is not defined. Ensure the Google API script is loaded.")
        alert("Google API not loaded. Please check your internet connection.")
    }
}

function markDayWithEvent(date) {
    // Find the calendar day element for this date
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    // Only mark if it's in the current month view
    if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
        const dayElements = document.querySelectorAll(".calendar-day:not(.other-month)")
        if (dayElements[day - 1]) {
            dayElements[day - 1].classList.add("has-events")
        }
    }
}

// Drag and Drop Functionality
function setupDragAndDrop() {
    const taskCards = document.querySelectorAll(".task-card")
    const dropZones = document.querySelectorAll(".tasks-container")

    taskCards.forEach((card) => {
        if (!card.classList.contains("empty-task")) {
            card.addEventListener("dragstart", dragStart)
            card.addEventListener("dragend", dragEnd)
        }
    })

    dropZones.forEach((zone) => {
        zone.addEventListener("dragover", dragOver)
        zone.addEventListener("dragenter", dragEnter)
        zone.addEventListener("dragleave", dragLeave)
        zone.addEventListener("drop", drop)
    })
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id)
    e.target.classList.add("dragging")
}

function dragEnd(e) {
    e.target.classList.remove("dragging")
}

function dragOver(e) {
    e.preventDefault()
}

function dragEnter(e) {
    e.preventDefault()
    e.target.classList.add("drag-over")
}

function dragLeave(e) {
    e.target.classList.remove("drag-over")
}

function drop(e) {
    e.preventDefault()

    const container = e.target.closest(".tasks-container")
    if (!container) return

    container.classList.remove("drag-over")

    const taskId = e.dataTransfer.getData("text/plain")
    // Fix: Use template literals for string interpolation
    const taskElement = document.querySelector(`.task-card[data-id="${taskId}"]`)

    if (!taskElement || !currentUser) return

    // Update task status based on the container it was dropped into
    const newStatus = getStatusFromContainerId(container.id)

    // Update task in Firestore
    db.collection("users")
        .doc(currentUser.uid)
        .collection("tasks")
        .doc(taskId)
        .update({
            status: newStatus,
        })
        .then(() => {
            // Update task in the tasks array
            const taskIndex = tasks.findIndex((task) => task.id == taskId)
            if (taskIndex !== -1) {
                tasks[taskIndex].status = newStatus
            }

            // Re-render all tasks to ensure proper order
            renderTasks()
        })
        .catch((error) => {
            console.error("Error updating task status: ", error)
            alert("Error updating task status. Please try again.")
        })
}

function getStatusFromContainerId(containerId) {
    switch (containerId) {
        case "todo-tasks":
            return "todo"
        case "progress-tasks":
            return "progress"
        case "hold-tasks":
            return "hold"
        case "completed-tasks":
            return "completed"
        default:
            return "todo"
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Check if Firebase is available before initializing
    if (typeof firebase !== 'undefined') {
        init();
    } else {
        console.error("Firebase is not loaded. Please check your internet connection.");
        alert("Error loading required libraries. Please refresh the page.");
    }
}
)
}
);
