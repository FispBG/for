

var modal = document.getElementById("modal");
var exitButton = document.getElementById("exitButton"); // Changed from 'btn' to 'exitButton' for clarity

document.getElementById("exitButton").addEventListener('click', function(event) { // Changed from '.button' to 'exitButton'
    event.preventDefault();
    modal.style.display = "block";
});

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Assuming 'confirmLogout' is the ID of the button inside the modal that confirms the logout action
var confirmLogout = document.getElementById("confirmLogout");
confirmLogout.onclick = function() {
    window.location.href = "/logout";
}

function closeModal() {
    modal.style.display = "none";
}

