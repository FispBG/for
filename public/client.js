// client.js

function getTokens() {
    fetch('/getTokens')
        .then(response => response.json())
        .then(tokens => {
            const tokensList = document.getElementById('tokensList');
            tokensList.innerHTML = ''; // Очистка списка
            tokens.forEach(token => {
                const listItem = document.createElement('li');
                listItem.style.display = 'flex'; // Используем Flexbox для упорядочивания содержимого
                listItem.style.justifyContent = 'space-between'; // Распределяем пространство между элементами
                listItem.style.padding = '10px';
                listItem.textContent = `Token ID: ${token.id}, Radius 1: ${token.radius1}, Radius 2: ${token.radius2}, Potencial 1: ${token.fi1},  Potencial 2: ${token.fi2}`;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.style.marginLeft = 'auto';
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
