# Landing Wizard — деплой на Railway

Статический лендинг (одна HTML-страница), который Railway запускает как маленький Node-сервер.

## Структура проекта

| Файл / папка | Назначение |
|--------------|------------|
| `public/index.html` | Страница, которую видят посетители (редактируйте её) |
| `landing-wizard-presentation.html` | Копия для локальной работы; после правок скопируйте в `public/index.html` |
| `server.js` | Раздаёт файлы из `public/` |
| `railway.json` | Настройки деплоя для Railway |

## Локальный запуск

```bash
npm install
npm start
```

Откройте в браузере: http://localhost:3000

## Переменные окружения

Для этого проекта **не нужны** секреты. Railway сам задаёт `PORT`.

| Переменная | Где | Пример | Зачем |
|------------|-----|--------|-------|
| `PORT` | Railway (авто) | `8080` | Порт, на котором слушает сервер |

---

## Деплой на Railway (пошагово)

### 1. Репозиторий Git

1. Создайте репозиторий на GitHub (или GitLab).
2. В папке проекта:

```bash
git init
git add .
git commit -m "Подготовка лендинга для Railway"
git branch -M main
git remote add origin https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПО.git
git push -u origin main
```

### 2. Проект в Railway

1. Зайдите на [railway.app](https://railway.app) → **New Project**.
2. **Deploy from GitHub repo** → выберите репозиторий.
3. Railway сам определит Node.js, выполнит `npm install` и `npm start`.
4. Вкладка **Settings** → **Networking** → **Generate Domain** — получите адрес вида `ваш-проект.up.railway.app`.
5. Откройте этот URL — должна открыться лендинг-страница.

### 3. Обновление сайта

После правок в `public/index.html`:

```bash
git add public/index.html
git commit -m "Обновление лендинга"
git push
```

Railway пересоберёт и задеплоит автоматически.

---

## Подключение своего домена + Google Workspace (почта)

**Важно:** сайт и почта — разные «записи» в DNS. Почта Google **не мешает** сайту на Railway, если не удалять MX-записи Google.

### Где править DNS

Обычно DNS живёт там, где куплен домен:

- Google Domains / Squarespace Domains
- Cloudflare
- Loopia, One.com и т.д.

Google Workspace **не заменяет** DNS — он только говорит, **какие MX-записи** добавить для почты.

### Шаг A — добавить домен в Railway

1. Railway → ваш сервис → **Settings** → **Networking** → **+ Custom Domain**.
2. Введите домен, например:
   - `www.dittforetag.se` (рекомендуется сначала)
   - затем `dittforetag.se` (корень, без www)
3. Railway покажет **две записи** для каждого домена:
   - **CNAME** — куда направлять трафик (сайт)
   - **TXT** — проверка, что домен ваш
4. Статус должен стать **Active** / зелёным (иногда 5–60 минут, иногда до 24 ч).

Значения CNAME/TXT **копируйте из Railway** — они уникальны для вашего проекта.

### Шаг B — записи DNS у регистратора (пример)

Замените `dittforetag.se` на ваш домен. Значения CNAME/TXT — **только из Railway**.

| Тип | Имя / Host | Значение | Зачем |
|-----|------------|----------|-------|
| CNAME | `www` | *(из Railway)* | Сайт: www.dittforetag.se |
| TXT | `_railway` или как указано | *(из Railway)* | Подтверждение домена |
| CNAME | `@` или корень | *(из Railway, если поддерживается)* | Сайт без www |

**Корневой домен (`@`):** не все регистраторы разрешают CNAME на «голом» домене. Тогда:

- подключите в Railway только `www.ваш-домен.se`;
- у регистратора настройте **перенаправление** `ваш-домен.se` → `https://www.ваш-домен.se`.

### Шаг C — почта Google Workspace (не трогать лишнее)

Оставьте (или добавьте по инструкции Google) **MX-записи**, например:

| Приоритет | Сервер |
|-----------|--------|
| 1 | `ASPMX.L.GOOGLE.COM` |
| 5 | `ALT1.ASPMX.L.GOOGLE.COM` |
| 5 | `ALT2.ASPMX.L.GOOGLE.COM` |
| 10 | `ALT3.ASPMX.L.GOOGLE.COM` |
| 10 | `ALT4.ASPMX.L.GOOGLE.COM` |

Также для почты часто нужны (Google Admin → **Apps** → **Google Workspace** → **Gmail** → **Authenticate**):

| Тип | Назначение |
|-----|------------|
| TXT | SPF (`v=spf1 include:_spf.google.com ~all`) |
| TXT | DKIM (длинный ключ от Google) |
| TXT | DMARC (по желанию) |

**Не удаляйте MX**, когда добавляете CNAME для сайта — они работают параллельно.

### Шаг D — проверка

1. Сайт: `https://www.ваш-домен.se` открывает лендинг, замок HTTPS в браузере.
2. Почта: отправьте письмо на `info@ваш-домен.se` с Gmail — должно прийти.
3. Если сайт не открывается: подождите 1–2 часа (DNS), проверьте записи в [dnschecker.org](https://dnschecker.org).

---

## Runbook: откат

1. Railway → **Deployments** → выберите предыдущий успешный деплой → **Redeploy**.
2. Или `git revert` + `git push`.

## Runbook: диагностика

| Симптом | Что проверить |
|---------|----------------|
| 502 / Application failed to respond | Логи Railway; `npm start` локально; порт через `process.env.PORT` |
| Домен «Pending» | TXT и CNAME совпадают с Railway; нет лишних старых A-записей на `@` |
| Сайт есть, почта нет | MX-записи Google на месте |
| Почта есть, сайта нет | CNAME `www` указывает на Railway, не на старый хостинг |

---

## Два варианта деплоя (кратко)

| | Node + Express (текущий) | Docker + Caddy |
|--|--------------------------|----------------|
| Сложность | Низкая | Выше |
| Подходит | Один HTML-лендинг | Много файлов, SPA |
| **Выбран** | **Да** | Запасной вариант |

Текущий вариант проще поддерживать: один `index.html`, понятный `npm start`.
