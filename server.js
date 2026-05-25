const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');

// Отдаём статические файлы из папки public
app.use(express.static(publicDir));

// Любой неизвестный путь — на главную (на будущее, если появятся подстраницы)
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Railway требует слушать 0.0.0.0 и порт из переменной PORT
app.listen(port, '0.0.0.0', () => {
  console.log(`Landing Wizard: http://0.0.0.0:${port}`);
});
