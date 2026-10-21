
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
});

const stockItems = {
    "Tins of tomatoes": 11,
    "Pasta": 9,
    "Rice": 5
};

function updateStock() {
    const item = document.getElementById("stockItem").value;
    const amount = Number(document.getElementById("stockChange").value);
    const action = document.getElementById("stockAction").value;
    const message = document.getElementById("stockMessage");

    if (!Number.isInteger(amount) || amount <= 0) {
        message.textContent = "Enter a quantity greater than zero.";
        return;
    }

    let newQuantity = stockItems[item];

    if (action === "add") {
        newQuantity += amount;
    } else {
        newQuantity -= amount;
    }

    if (newQuantity < 0) {
        message.textContent = "There is not enough stock to remove.";
        return;
    }

    stockItems[item] = newQuantity;
    document.getElementById("stockQuantity").textContent = newQuantity;
    message.textContent = item + " updated successfully!";
}
