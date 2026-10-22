function readSavedData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(function(screen) {
        screen.hidden = true;
    });

    document.getElementById(screenId).hidden = false;

    if (screenId === "stock") displayStock();
    if (screenId === "rota") displayRota();

    window.scrollTo(0, 0);
}

function showHome() {
    showScreen("home");
}

function showBooking() {
    showScreen("booking");
}

function showStock() {
    showScreen("stock");
}

function showRota() {
    showScreen("rota");
}

// Bookings
let bookings = readSavedData("bookings", []);

const dateInput = document.getElementById("shiftDate");
const todayString = getLocalDateString(new Date());
dateInput.min = todayString;

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function formatDate(dateString) {
    const parts = dateString.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("volunteerName").value.trim();
    const date = dateInput.value;
    const time = document.getElementById("shiftTime").value;
    const message = document.getElementById("bookingMessage");

    if (!name || !date || !time) {
        message.textContent = "Please complete every field.";
        return;
    }

    if (date < getLocalDateString(new Date())) {
        message.textContent = "Please choose today or a future date.";
        return;
    }

    const duplicate = bookings.some(function(booking) {
        return booking.name.toLowerCase() === name.toLowerCase()
            && booking.date === date
            && booking.time === time;
    });

    if (duplicate) {
        message.textContent = "This volunteer has already booked that shift.";
        return;
    }

    const newBooking = { name: name, date: date, time: time };
    bookings.push(newBooking);

    if (!saveData("bookings", bookings)) {
        bookings.pop();
        message.textContent = "Could not save the booking in this browser.";
        return;
    }

    message.textContent = "Booking confirmed. Thank you, " + name + "!";
    this.reset();
    dateInput.min = getLocalDateString(new Date());
});

// Stock cupboard
let stockItems = readSavedData("kitchenStock", null);

if (!stockItems || Array.isArray(stockItems) || typeof stockItems !== "object") {
    stockItems = {
        rice: { name: "Rice", quantity: 5 },
        pasta: { name: "Pasta", quantity: 9 },
        tomato: { name: "Tins of tomatoes", quantity: 11 }
    };
    saveData("kitchenStock", stockItems);
}

function displayStock() {
    const list = document.getElementById("stockList");
    list.replaceChildren();

    Object.keys(stockItems).forEach(function(id) {
        const item = stockItems[id];
        const card = document.createElement("article");
        card.className = "stock-item";

        const heading = document.createElement("h3");
        heading.textContent = item.name;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        const controls = document.createElement("div");
        controls.className = "stock-controls";

        const addButton = document.createElement("button");
        addButton.textContent = "Add Stock";
        addButton.type = "button";
        addButton.onclick = function() {
            changeStock(id, 1);
        };

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove Stock";
        removeButton.type = "button";
        removeButton.disabled = item.quantity === 0;
        removeButton.onclick = function() {
            changeStock(id, -1);
        };

        controls.append(addButton, removeButton);
        card.append(heading, quantity, controls);
        list.appendChild(card);
    });
}

function changeStock(id, amount) {
    const message = document.getElementById("stockMessage");
    const item = stockItems[id];

    if (!item || item.quantity + amount < 0) {
        message.textContent = "Stock cannot go below zero.";
        return;
    }

    item.quantity += amount;

    if (!saveData("kitchenStock", stockItems)) {
        item.quantity -= amount;
        message.textContent = "Could not save the stock change.";
        displayStock();
        return;
    }

    displayStock();
    message.textContent = item.name + " updated successfully.";
}

document.getElementById("newFoodForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const nameInput = document.getElementById("newFoodName");
    const quantityInput = document.getElementById("newFoodQuantity");
    const message = document.getElementById("stockMessage");

    const name = nameInput.value.trim();
    const quantity = Number(quantityInput.value);

    if (!name || !Number.isSafeInteger(quantity) || quantity < 0) {
        message.textContent = "Enter a food name and a whole quantity of zero or more.";
        return;
    }

    const alreadyExists = Object.values(stockItems).some(function(item) {
        return item.name.toLowerCase() === name.toLowerCase();
    });

    if (alreadyExists) {
        message.textContent = "That food item is already in the cupboard.";
        return;
    }

    const id = "food_" + Date.now();

    stockItems[id] = { name: name, quantity: quantity };

    if (!saveData("kitchenStock", stockItems)) {
        delete stockItems[id];
        message.textContent = "Could not save this food item.";
        return;
    }

    displayStock();
    this.reset();
    quantityInput.value = 1;
    message.textContent = name + " added successfully.";
});

// Volunteer rota
function displayRota() {
    const list = document.getElementById("rotaList");
    list.replaceChildren();

    const validBookings = bookings.filter(function(booking) {
        return booking && booking.name && booking.date && booking.time;
    });

    if (validBookings.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No shifts have been booked yet. Book a shift to see volunteers here.";
        list.appendChild(empty);
        return;
    }

    const dates = [...new Set(validBookings.map(function(booking) {
        return booking.date;
    }))].sort();

    dates.forEach(function(date) {
        const group = document.createElement("section");
        group.className = "rota-day";

        const heading = document.createElement("h3");
        heading.textContent = formatDate(date);
        group.appendChild(heading);

        ["9AM - 12PM", "1PM - 5PM"].forEach(function(time) {
            const shiftHeading = document.createElement("h4");
            shiftHeading.textContent = time === "9AM - 12PM"
                ? "Shift A · 9 AM - 12 PM"
                : "Shift B · 1 PM - 5 PM";
            group.appendChild(shiftHeading);

            const shiftBookings = validBookings.filter(function(booking) {
                return booking.date === date && booking.time === time;
            });

            if (shiftBookings.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "No volunteers booked.";
                group.appendChild(empty);
            } else {
                const names = document.createElement("ul");

                shiftBookings.forEach(function(booking) {
                    const person = document.createElement("li");
                    person.textContent = booking.name;
                    names.appendChild(person);
                });

                group.appendChild(names);
            }
        });

        list.appendChild(group);
    });
}

// Show the initial stock list on page load.
displayStock();
