

document.addEventListener('DOMContentLoaded', function() {
    const authInput = document.getElementById('auth-input');
    const authButton = document.getElementById('auth-button');
    const tokenList = document.getElementById('token-list');
    const addTokenButton = document.getElementById('add-token-button');
    const removeTokenButton = document.getElementById('remove-token-button');

    authButton.addEventListener('click', function() {
        const token = authInput.value.trim();
        if (token) {
            addTokenToList(token);
            authInput.value = '';
        }
    });


    addTokenButton.addEventListener('click', function() {
        const token = prompt('Введите токен для добавления:');
        if (token) {
            addTokenToList(token);
        }
    });

    removeTokenButton.addEventListener('click', function() {
        const selectedToken = document.querySelector('.token-list-item.selected');
        if (selectedToken) {
            selectedToken.remove();
        }
    });

    function addTokenToList(token) {
        const listItem = document.createElement('li');
        listItem.textContent = token;
        listItem.classList.add('token-list-item');
        listItem.addEventListener('click', function() {
            document.querySelectorAll('.token-list-item').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
        });
        tokenList.appendChild(listItem);
    }
});

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

document.addEventListener('DOMContentLoaded', function() {
    // Получаем форму по её идентификатору
    const createTokenForm = document.getElementById('createTokenForm');

    // Добавляем обработчик событий на форму
    createTokenForm.addEventListener('submit', function(event) {
        // Предотвращаем стандартное поведение формы (перезагрузку страницы)
        event.preventDefault();

        // Создаем объект FormData для отправки данных формы
        const formData = new FormData(createTokenForm);

        // Отправляем данные формы на сервер
        fetch('/createToken', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // После успешной отправки формы вызываем функцию getTokens()
            getTokens();
        })
        .catch(error => console.error('Error submitting form:', error));
    });
});