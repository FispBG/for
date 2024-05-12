// client.js

function getTokens() {
    fetch('/getTokens')
        .then(response => response.json())
        .then(tokens => {
            const tokensList = document.getElementById('tokensList');
            tokensList.innerHTML = ''; // Очистка списка
            tokens.forEach(token => {
                const listItem = document.createElement('li');
                listItem.textContent = `Token ID: ${token.id}, Radius: ${token.radius}, Distance: ${token.distance}, E: ${token.E}`;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.onclick = () => deleteToken(token.id);
                listItem.appendChild(deleteButton);
                tokensList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching tokens:', error));
}

function deleteToken(tokenId) {
    fetch(`/deleteToken/${tokenId}`, { method: 'DELETE' })
        .then(() => {
            console.log('Token deleted successfully');
            getTokens(); // Обновление списка после удаления
        })
        .catch(error => console.error('Error deleting token:', error));
}

function update(){
    fetch('/createToken');
    getTokens();
}

document.addEventListener('DOMContentLoaded', getTokens);
