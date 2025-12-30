# Portfolio static site

Собранный статический сайт под GitHub Pages.

## Структура
- `index.html` — домашняя страница (пиксель в пиксель с Figma, подключает `assets/css/shared.css` и `assets/css/main.css`).
- `posts/*.html` — посты на IDS (подключают IDS CSS/JS из `assets/css/ids` и `assets/js/ids`).
- `content/posts.json`, `content/references.json` — данные для карточек и референсов.
- `assets/js/main.js` — переключатель режимов, фильтры и рендер.
- `assets/js/lightbox.js` — лайтбокс для референсов.

## Запуск
Откройте `index.html` в браузере или поднимите простой сервер:
```sh
cd /Users/arthur/Desktop/portfolio-project-4
python3 -m http.server 8000
```
и откройте `http://localhost:8000`.

