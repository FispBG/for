const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
var admin = require("firebase-admin");
app.set('view engine', 'ejs');

// Указываем Express, где искать шаблоны
app.set('views', path.join(__dirname, 'public'));

var serviceAccount = require("./test-cfce8-firebase-adminsdk-fkihm-2848571da9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-cfce8-default-rtdb.europe-west1.firebasedatabase.app/"
});


const db = admin.firestore();


app.use(bodyParser.urlencoded({ extended: false }));// Настройка сессий
app.use(session({
    secret: 'your_secret_key', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Установка флага Secure в false для локального тестирования
}));


async function checkUser(userType, usernameOrToken, password) {
    return new Promise((resolve, reject) => {
        if (!usernameOrToken || typeof usernameOrToken !== 'string') {
            resolve({ success: false, message: 'Требуется имя пользователя или токен.' });
            return;
        }

        if (userType === 'admin') {
            const adminRef = db.collection('admin').doc(usernameOrToken);
            adminRef.get().then(doc => {
                if (doc.exists && doc.data().password === password) {
                    resolve({ success: true, user: { username: usernameOrToken, userType: 'admin' } });
                } else {
                    resolve({ success: false, message: 'Неверное имя пользователя или пароль.' });
                }
            }).catch(error => {
                console.error('Ошибка при получении документа:', error);
                resolve({ success: false, message: 'Произошла ошибка.' });
            });
        } else if (userType === 'user') {
            const tokenRef = db.collection('tokenUsers').doc(usernameOrToken);
            tokenRef.get().then(doc => {
                if (doc.exists) {
                    resolve({ success: true, user: { username: usernameOrToken, userType: 'user' } });
                } else {
                    resolve({ success: false, message: 'Недействительный токен.' });
                }
            }).catch(error => {
                console.error('Ошибка при получении документа:', error);
                resolve({ success: false, message: 'Произошла ошибка.' });
            });
        } else {
            resolve({ success: false, message: 'Недопустимый тип пользователя.' });
        }
    });
}







function checkAdmin(req, res, next) {
    // console.log(req.session.user,req.session.user.userType);
    if (req.session.user && req.session.user.userType === 'admin') {
        req.isAdmin = true; // Устанавливаем флаг isAdmin в true, если пользователь является администратором
    }
    next(); // Продолжаем обработку запроса
}

app.get('/getTokens', async (req, res) => {
    try {
        const snapshot = await db.collection('tokenUsers').get();
        const tokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tokens);
    } catch (error) {
        console.error("Error getting tokens: ", error);
        res.status(500).send("Error getting tokens");
    }
});

app.delete('/deleteToken/:tokenId', async (req, res) => {
    const { tokenId } = req.params;
    try {
        await db.collection('tokenUsers').doc(tokenId).delete();
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting token: ", error);
        res.status(500).send("Error deleting token");
    }
});



app.get('/admin', checkAdmin, (req, res) => {
    if (req.isAdmin){
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.redirect('/login');
    }
});

app.post('/createToken', async (req, res) => {
    const { radius, distance, E } = req.body;

    // Генерация уникального имени для документа
    const docName = 'doc_' + new Date().getTime();

    // Добавление документа в Firestore
    try {
        await db.collection('tokenUsers').doc(docName).set({
            radius: radius,
            distance: distance,
            E: E
        });
        // Отправляем ответ с кодом статуса 200 и сообщением об успехе
        res.status(200);
    } catch (error) {
        console.error("Error creating document: ", error);
        res.status(500).send("Error creating document");
    }
});

// Настройка парсера тела запроса

// Маршрут для отображения формы логина
app.get('/login', (req, res) => {
    const errorMessage = req.session.errorMessage || '';
    res.render('login', { errorMessage });
});


// Маршрут для обработки формы логина
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await checkUser('admin', username, password);
    if (result.success) {
        req.session.user = result.user;
        res.redirect('/admin');
    } else {
        // Redirect back to the login page with an error message
        req.session.errorMessage = result.message;
        res.redirect('/login');
    }
});


app.get('/token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'token.html'));
});

app.post('/token', async (req, res) => {
    const { token } = req.body;
    const result = await checkUser('user', token, null);
    if (result.success) {
        req.session.user = result.user;
        res.redirect('/laba');
    } else {
        res.status(401).send(result.message); // Send a 401 Unauthorized status code with a message
    }
});

app.get('/laba', checkAdmin, (req, res) => {
    console.log(req.session.user);
    if (req.session.user){
        res.sendFile(path.join(__dirname, 'public', 'laba.html'));
    } else {
        res.redirect('/token');
    }
});

// Маршрут для выхода из аккаунта
app.get('/logout', (req, res) => { // Изменено на GET, так как форма отправляет GET запрос
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Удаление cookie сессии
        res.redirect('/'); // Перенаправление на страницу входа после выхода
    });
});

// Маршрут для главной страницы
app.get('/', (req, res) => {
    console.log(req.session.user);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));
// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
