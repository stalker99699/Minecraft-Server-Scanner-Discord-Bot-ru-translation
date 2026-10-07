<h1 align="center">Minecraft Server Scanner</h1>

<div align="center">
    <img src="https://raw.githubusercontent.com/kgurchiek/Minecraft-Server-Scanner-Discord-Bot/main/Icon.PNG" alt="Minecraft Server Scanner Logo" width="20%"/>
    <br>
    <br>
    <a href="https://discord.gg/Uy9m5TP5na"><img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"/></a>
    <a href="https://www.buymeacoffee.com/cornbread2100"><img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee"/></a>
    <a href="https://nodejs.org/en"><img src="https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white&style=for-the-badge" alt="Node.js"/></a>
    <a href="https://github.com/kgurchiek/Minecraft-Server-Scanner-Discord-Bot"><img src="https://img.shields.io/github/last-commit/kgurchiek/Minecraft-Server-Scanner-Discord-Bot?style=for-the-badge&logo=github&logoColor=white&logoWidth=20"/></a>
</div>

## 📝 О проекте

Этот бот не выполняет сканирование сам — он лишь ищет серверы в моей базе данных, которая активно собирается отдельной программой сканирования. Сканирование состоит из двух основных частей: сначала [сканер обнаружения](https://github.com/kgurchiek/Minecraft-Server-Scanner) сканирует (почти) каждый IPv4-адрес, чтобы найти серверы Minecraft, что занимает несколько дней. Он проверяет серверы Minecraft, используя [протокол Server List Ping (SLP)](https://minecraft.wiki/w/Java_Edition_protocol/Server_List_Ping) Java Edition и [протокол RakNet Unconnected Ping](https://wiki.bedrock.dev/servers/raknet#unconnected-pings) Bedrock Edition — именно так клиенты Minecraft получают данные от серверов для отображения в меню многопользовательской игры (например, количество игроков, favicon и т. д.). Эти результаты отправляются в [повторный сканер](https://github.com/kgurchiek/Minecraft-Server-Rescanner), который постоянно пересканирует результаты, чтобы получить обновлённую информацию и сохранить её в базу данных. Некоторые данные не предоставляются в ответе SLP, поэтому требуется несколько различных повторных сканирований. Например, дополнительное сканирование запускается раз в день, чтобы проверить, требуют ли серверы Java Edition аутентификацию аккаунта, и параллельно запускается совершенно отдельный сканер для проверки белых списков.

Если вы найдёте какие-либо ошибки, пожалуйста, сообщите о них в [официальном Discord-сервере](https://discord.gg/TSWcF2m67m).

Вы можете связаться со мной через Discord: [cornbread2100](https://discord.com/users/720658048611516559)

## 💻 Использование

| Команда | Описание | Аргументы |
| --- | --- | --- |
| /help | Показывает список команд бота | Нет |
| /stats | Отправляет некоторую статистику о боте | Нет |
| /random | Получает случайный онлайн-сервер Java Edition | Нет |
| /ping | Получает информацию с указанного сервера Java Edition | ip (обязательно), port (необязательно, по умолчанию 25565) |
| /bedrockping | Получает информацию с указанного сервера Bedrock Edition | ip (обязательно), port (необязательно, по умолчанию 19132) |
| /search | Ищет в базе данных сервер Java Edition с определёнными свойствами | minimal (true/false), sort (автодополнение), page (целое число), playercount (диапазон), playercap (целое число), isfull (true/false), player (имя игрока), uuid (uuid игрока), playerhistory (имя игрока), uuidhistory (uuid игрока), version (текст), hasimage (true/false), description (текст), hasplayerlist (true/false), seenafter (unix timestamp), iprange (ip-подсеть), port (целое число), country (текст), org (текст), cracked (true/false), whitelist (true/false), vanilla (true/false) |
| /bedrocksearch | Ищет в базе данных сервер Bedrock Edition с определёнными свойствами | minimal (true/false), sort (автодополнение), page (целое число), playercount (диапазон), playercap (целое число), isfull (true/false), version (текст), description (текст), seenafter (unix timestamp), iprange (ip-подсеть), port (целое число), gamemode (текст), country (текст), org (текст) |

## 🌐 Самостоятельный хостинг бота

> [!IMPORTANT]
> Вы можете попробовать бота на его [официальном Discord-сервере](https://discord.gg/TSWcF2m67m), не размещая его самостоятельно.

Сначала вам нужно установить Node.js v18 или новее с https://nodejs.org/. Затем установите все необходимые зависимости с помощью `npm i`.

### ⚙️ Конфигурация
- Переименуйте или скопируйте `config.template.json` в `config.json`.
- Создайте Discord-бота в [Discord Developer Portal](https://discord.com/developers) и введите client id и токен бота вашего приложения в конфиг.
- Если вы также запускаете сканер самостоятельно со своей собственной базой данных, вы можете [разместить свой собственный API](https://github.com/kgurchiek/Minecraft-Server-Scanner-API) и ввести URL вашего API в настройку `api`.
  - Вы также можете изменить `displayURL`, чтобы бот использовал другой URL в ссылках API, показываемых пользователям. Это полезно, если у вас есть публичная конечная точка, но внутренне вы хотите, чтобы бот использовал локальное или приватное соединение.
- Вы также можете включить `stats`, чтобы отображать количество серверов в статусе профиля бота и в команде /stats. Если вы не запускаете свою собственную базу данных и API, вероятно, вы захотите отключить это, так как это расходует много кредитов.
- После настройки запустите `node index`, чтобы запустить бота. Каждая команда должна загрузиться, и при готовности будет записано "\[Bot\]".
