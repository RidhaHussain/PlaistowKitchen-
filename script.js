
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
