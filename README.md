# n8n-nodes-bitrix24

Этот пакет содержит ноду для n8n для работы с Bitrix24 API.

## Установка

### В существующую установку n8n

```bash
cd /usr/local/lib/node_modules/n8n
npm install n8n-nodes-bitrix24
```

### Обновление модуля

Для полного обновления модуля выполните следующие команды:

```bash
# 1. Остановить n8n
pm2 stop n8n  # или systemctl stop n8n

# 2. Перейти в директорию n8n
cd /usr/local/lib/node_modules/n8n

# 3. Удалить старую версию модуля
npm uninstall n8n-nodes-bitrix24

# 4. Очистить кэш npm
npm cache clean --force

# 5. Установить новую версию модуля
npm install n8n-nodes-bitrix24@latest

# 6. Запустить n8n
pm2 start n8n  # или systemctl start n8n
```

### Для разработки

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Соберите проект: `npm run build`
4. Создайте символическую ссылку: `npm link`
5. В директории n8n: `npm link n8n-nodes-bitrix24`

## Использование

1. В Bitrix24 создайте входящий вебхук (REST API)
2. Скопируйте URL вебхука
3. В n8n добавьте новые учетные данные типа "Bitrix24 API"
4. Вставьте URL вебхука в поле "Webhook URL"
5. Используйте ноду Bitrix24 в ваших рабочих процессах

## Функциональность

### Поддерживаемые сущности (Resources)
- Lead (Лиды)
- Deal (Сделки)
- Contact (Контакты)
- Company (Компании)

### Операции
- Create (Создание записи)
  - Выбор поля из списка доступных
  - Установка значения поля
- Get (Получение записи)
  - Получение по ID
  - Выбор возвращаемых полей
- List (Получение списка)
  - Возможность получить все записи
  - Ограничение количества записей
  - Выбор возвращаемых полей
- Update (Обновление)
  - Обновление по ID
  - Выбор поля из списка доступных
  - Установка нового значения
- Delete (Удаление)
  - Удаление по ID

### Особенности
- Динамическая загрузка полей в зависимости от выбранной сущности
- Подробная информация о каждом поле (тип, обязательность, только для чтения, множественность)
- Поддержка пагинации при получении списка записей
- Обработка ошибок и возможность продолжить выполнение при ошибках
- Создание и обновление пользовательских полей
- Поддержка категорий и статусов для сделок (но не все операции, смотрите как есть)
## Разработка

### Сборка
```bash
npm run build
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Линтинг
```bash
npm run lint
```

## Лицензия

[MIT](LICENSE)
 