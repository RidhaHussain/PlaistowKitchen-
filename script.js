
function showScreen(screenId) {
    document.getElementById("home").style.display = "none";
    document.getElementById("booking").style.display = "none";
    document.getElementById("stock").style.display = "none";
    document.getElementById("rota").style.display = "none";

    document.getElementById(screenId).style.display = "block";
}

function showBooking() {
    showScreen("booking");
}

function showHome() {
    showScreen("home");
}

function showStock() {
    showScreen("stock");
}

function showRota() {
    showScreen("rota");
}

// Load saved bookings, or start with an empty list.
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("volunteerName").value.trim();
    const date = document.getElementById("shiftDate").value;
    const time = document.getElementById("shiftTime").value;
    const message = document.getElementById("bookingMessage");

    if (!name || !date || !time) {
        message.textContent = "Please complete all fields.";
        return;
    }

    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        message.textContent = "Please choose today or a future date.";
        return;
    }

    const duplicate = bookings.some(function(booking) {
        return booking.name.toLowerCase() === name.toLowerCase()
            && booking.date === date
            && booking.time === time;
    });

    if (duplicate) {
        message.textContent = "You have already booked this shift.";
        return;
    }

    const newBooking = {
        name: name,
        date: date,
        time: time
    };

    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    message.textContent = "Booking confirmed! Thank you, " + name + ".";
    document.getElementById("bookingForm").reset();

   let stockItems = JSON.parse(localStorage.getItem("kitchenStock")) || {
    rice: { name: "Rice", quantity: 5 },
    pasta: { name: "Pasta", quantity: 9 },
    tomato: { name: "Tins of tomatoes", quantity: 11 }
};

function saveStock() {
    localStorage.setItem("kitchenStock", JSON.stringify(stockItems));
}

function displayStock() {
    const list = document.getElementById("stockList");
    list.innerHTML = "";

    for (const id in stockItems) {
        const item = stockItems[id];

        const card = document.createElement("div");
        card.className = "stock-item";

        const heading = document.createElement("h3");
        heading.textContent = item.name;

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        const addButton = document.createElement("button");
        addButton.textContent = "Add Stock";
        addButton.onclick = function () {
            changeStock(id, 1);
        };

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove Stock";
        removeButton.onclick = function () {
            changeStock(id, -1);
        };

        card.appendChild(heading);
        card.appendChild(quantity);
        card.appendChild(addButton);
        card.appendChild(removeButton);
        list.appendChild(card);
    }
}

function changeStock(id, amount) {
    if (stockItems[id].quantity + amount < 0) {
        document.getElementById("stockMessage").textContent =
            "Stock cannot go below zero.";
        return;
    }

    stockItems[id].quantity += amount;
    saveStock();
    displayStock();

    document.getElementById("stockMessage").textContent =
        "Stock updated successfully!";
}

document.getElementById("newFoodForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const nameInput = document.getElementById("newFoodName");
    const quantityInput = document.getElementById("newFoodQuantity");
    const message = document.getElementById("stockMessage");

    const name = nameInput.value.trim();
    const quantity = Number(quantityInput.value);

    if (!name || !Number.isInteger(quantity) || quantity < 0) {
        message.textContent = "Enter a food name and a valid quantity.";
        return;
    }

    const duplicate = Object.values(stockItems).some(function(item) {
        return item.name.toLowerCase() === name.toLowerCase();
    });

    if (duplicate) {
        message.textContent = "That food item already exists.";
        return;
    }

    const id = "food_" + Date.now();

    stockItems[id] = {
        name: name,
        quantity: quantity
    };

    saveStock();
    displayStock();
    this.reset();
    quantityInput.value = 1;

    message.textContent = name + " added to the stock cupboard!";
});

displayStock();
