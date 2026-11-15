# EMBER COFFEE — Final Project

Team: Aslan Ulasbek and Sultonbek Ibrokhimov · SE-2501

A nine-page responsive student coffee-shop website, built on the existing Assignments 5 and 6 project, now with a demo order drawer and configurable drinks. HTML, CSS, JavaScript, Bootstrap 5 and jQuery. No build step, npm packages or backend are needed to run it.

## Запуск на Mac / IntelliJ IDEA

1. Распакуйте ZIP.
2. В IntelliJ IDEA выберите File → Open и откройте папку `ember-coffee`.
3. В терминале этой папки выполните:

```bash
python3 -m http.server 8000
```

4. Откройте http://localhost:8000 в браузере.
5. Остановить сервер: Control+C.

Можно использовать встроенный просмотр HTML через IntelliJ. Для предсказуемой работы localStorage запускайте сайт через HTTP, а не двойным щелчком по HTML. Используйте один и тот же адрес и порт: `localhost` и `127.0.0.1` имеют отдельные хранилища.

## Учебный администратор

Откройте Sign in и введите:

- Email: `admin@ember.demo`
- Password: `EmberAdmin1!`

После входа: My profile → Manage menu. Доступны добавление, редактирование и удаление позиций с подтверждением. Для фотографии выбирается один из существующих локальных файлов. Изменения меню отображаются после перехода на Menu; избранное использует тот же набор товаров.

Обычный аккаунт: Sign in → Create an account. Пароль: 8–64 символа, заглавная и строчная латинские буквы, цифра и специальный символ, без пробелов. Например, придумайте отдельный пароль только для демонстрации.

## Pages

- `index.html`: home, subscription popup, live weather, View drink link and Astana-based opening status.
- `menu.html`: shared catalog, search, autocomplete, highlighting, combined filters, price sorting, drink options, Add to order, favorites and rating with sound.
- `about.html`: story and team.
- `contact.html`: two-step form, JavaScript validation, cup preview, copy phone and FAQ.
- `gallery.html`: carousel and lazy image loading.
- `login.html`: simulated sign-in.
- `signup.html`: simulated registration with duplicate-email and password checks.
- `profile.html`: editable name/email, favorites, sign-out and admin link for the demo administrator.
- `admin.html`: local menu management.

## Main files

```text
ember-coffee/
  index.html, menu.html, about.html, contact.html, gallery.html
  login.html, signup.html, profile.html, admin.html
  css/
    style.css       original shared styling
    final.css       palettes, light/dark modes and new page layouts
  js/
    store.js        localStorage wrapper and early theme setup
    app.js          appearance controls, account navigation, storage errors
    validation.js   shared JavaScript validation rules
    menu-data.js    26 menu items (11 original + 15 additions)
    catalog.js      menu cards and favorites
    auth.js         local accounts, sign-in and profile
    admin.js        local menu editing, including explicit drink capabilities
    weather.js      Open-Meteo request, drink recommendations and failure states
    hours.js        Astana-time opening hours, shared with Visit Us
    order.js        guest order drawer and localStorage persistence
    base.js         existing popup, newsletter, clock and FAQ
    advanced.js     existing rating, navigation and contact form
    script.js       existing jQuery interactions and saved menu search
  images/, audio/, vendor/
  PHOTO_SOURCES.md
  README.md
```

Bootstrap and jQuery are bundled locally. Google Fonts is optional; the CSS has system font fallbacks. Local images and audio are preserved. `jquery-fallback.js` is retained from the original project but is no longer required by the pages because jQuery loads locally.

## API

The home page calls Open-Meteo using `fetch()` for Astana (51.1694, 71.4491), requesting `temperature_2m` and `weather_code`, with `Asia/Almaty` as the time zone.

Documentation: https://open-meteo.com/en/docs

A loading message is shown during the request. HTTP errors, invalid JSON/data, connection errors and a 10-second timeout produce an honest unavailable message with a retry button. Failed requests never show invented weather. The source is credited next to the widget. Warm weather recommends Cold Brew; cold weather recommends Velvet Latte; mild weather recommends Cappuccino. Each View drink link opens the exact product, clearing conflicting saved menu filters. The recommendation is hidden when weather is unavailable.

## Themes and local data

The header contains independent palette and light/dark controls. Cream, Sage and Clay each have readable light and dark variants. Settings persist across pages. On the first visit the site follows the device's light/dark preference.

The browser stores `ember.users`, `ember.session`, `ember.menu`, `ember.theme`, `ember.palette`, `ember.search`, `ember.order`, and `ember.menuVersion`. Favorites belong to each account, but the demo order works for guests as well. All accounts, menu edits and preferences are local to this browser and origin. They do not synchronize between devices or visitors.

This is the authentication simulation specifically requested by the assignment. Passwords are stored locally in readable form. Do not use real passwords or private information. Admin credentials are public demo data; frontend role checks are not a security boundary. Real authentication would need a backend with server-side authorization and appropriate password hashing.

Contact and subscription submissions remain demonstrations; they do not send email or create bookings. The cafe is a student concept.

## Expanded menu (new version)

The menu now has **26 choices**: 16 drinks (coffee and other) and 10 bakery items. Eight new drinks and seven new pastries/desserts have been added, with English names, prices in tenge, explicit category and capability flags, and a small "New" badge.

The new photo links are documented in `PHOTO_SOURCES.md`. They load from Pexels when online; the menu falls back to existing local images if those links fail. Existing images, themes and other pages have not been removed.

If your browser already has a modified menu in `ember.menu`, the first visit automatically merges in only the 15 new items. Previous custom items, edited prices and previously deleted older items are preserved. The marker `ember.menuVersion` avoids re-adding items after the admin deletes them. Existing cart items and favorites remain stored as before.

## My Order и настройки меню

- My order is available in the header of every page. On desktop it opens a right-side panel; on mobile the panel fills the screen. The counter sums quantities, not unique products.
- The order can be used without an account. There is no payment, checkout, email submission or real order transmission. Data is saved only in the browser in `ember.order`.
- Add to order appears on menu cards. A product with different size or milk choices becomes a separate order line; matching choices increase quantity.
- Price rules for drinks with a size selector: Small −200 ₸, Medium base price, Large +300 ₸. Plant-based milk adds 200 ₸. Products without these options keep their base price. Prices never go below zero.
- Size choice is available for the original configurable drinks plus the newly added Iced Latte, Iced Americano, Mocha, Caramel Macchiato, Decaf Cappuccino, Honey Latte, Chai Latte and Iced Matcha Latte. Espresso and pastries keep their original portions. Plant-based milk is available for the five original configured drinks and for the newly added milk-based drinks (Iced Latte, Mocha, Caramel Macchiato, Decaf Cappuccino, Honey Latte, Chai Latte and Iced Matcha Latte).
- Cold drinks: Cold Brew, Iced Latte, Iced Americano and Iced Matcha Latte by default. Decaf: Decaf Cappuccino only by default. Admin can explicitly set or remove Cold, Decaf, Plant-based milk available and Size selection for each drink. Bakery items cannot receive these flags.
- Search, autocomplete, category, Cold drinks, Decaf, Plant-based milk available and price sorting work together. The saved search state uses `ember.search` and remains compatible with older saved state.
- Opening hours are shared via `js/hours.js`: Monday–Friday 08:00–22:00, Saturday 09:00–23:00, Sunday 09:00–21:00, in Astana time (`Asia/Almaty`).
- Login and signup password inputs provide Show/Hide buttons. No backend has been added.

## Проверка перед защитой

1. Переключите светлую/тёмную тему и палитру. Перейдите на другую страницу — выбор сохраняется.
2. На главной дождитесь погоды. Отключите интернет и нажмите Refresh — появится ошибка и Try again.
3. Создайте обычный аккаунт. Проверьте пустые поля, неверный email, слабый пароль, несовпадение паролей и повторный email.
4. В Menu найдите `latte`, смените категорию, выберите подсказку. Сбросьте поиск и категорию для просмотра всего меню.
5. Сохраните напиток в избранное. В профиле он должен появиться; удаление из избранного обновляет список.
6. Измените имя и email, перезагрузите профиль. Выйдите и проверьте вход с неверным и правильным паролем.
7. Войдите администратором. Добавьте тестовую позицию, измените её цену, проверьте в Menu. Удалите тестовую позицию с подтверждением.
8. Откройте `admin.html` обычным пользователем — сайт вернёт в профиль. Без входа профиль и админка направляют на Sign in.
9. На Visit Us проверьте оба шага, телефон, сообщение, Clear, FAQ и копирование номера. Проверьте рейтинг, звук и галерею.
10. Проверьте ширины телефона, планшета и компьютера в инструментах браузера.

## Проверки обновлённой версии (15 ноября 2026)

- `node --check`: all 14 JavaScript files passed syntax checks.
- Static local-file verification: all nine HTML pages, script/style/image references and internal HTML links checked. 35 local target files were referenced and none were missing. No duplicate HTML element IDs.
- Chromium isolated-document tests: **27/27 checks passed**, including order totals, quantity changes, guest persistence between pages, distinct milk/size combinations, clearing, filtering, global price sorting, weather-link target, reset of conflicting saved menu search, password toggles, Astana opening hours, no uncaught errors, and 390 px mobile layout/order drawer.
- Additional Chromium isolated-document checks: Admin can create decaf drinks, edit while retaining flags, load old saved menu data, prevent milk flags for pastries; existing signup validation still rejects invalid input.
- Tested desktop viewport at 1440×900 and mobile viewport at 390×844. No horizontal overflow on the checked Home, Menu, Login and Sign Up mobile layouts. The order panel fills the mobile viewport.
- The browser sandbox disallowed direct navigation to localhost/file URLs. Tests loaded actual HTML, CSS and JS sources into Chromium in an isolated document with a storage shim; they **do not replace a complete real-URL navigation test**. Original gallery images were not visually verified through this browser sandbox. The weather success case used a mock Open-Meteo response, not a claimed live API response.
- No publication to GitHub or GitHub Pages was made. Public deployed URLs were not rechecked.

## Публикация

Эта обновлённая версия **не опубликована**. По запросу пользователя GitHub и GitHub Pages не изменялись. Существующие адреса из проекта:

- Repository: https://github.com/Aslan-017/ember-coffee
- Website: https://aslan-017.github.io/ember-coffee/

Чтобы опубликовать, замените содержимое рабочей копии своего репозитория файлами из папки `ember-coffee`, затем выполните commit и push. Не удаляйте `.git` своей рабочей копии. В Settings → Pages используйте существующий способ публикации репозитория. Если Pages настроен на Deploy from a branch, выберите `main` и `/(root)`.

Перед сдачей откройте опубликованную версию, проверьте все страницы и предоставьте преподавателю действующие ссылки на репозиторий и сайт. Требование хостинга и качество устной защиты нельзя подтвердить одним локальным ZIP.
