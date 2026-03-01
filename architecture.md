# Architecture — n8n-nodes-bitrix24

## Overview

Community-пакет n8n-нод для работы с Bitrix24 CRM API через webhook-аутентификацию. Предоставляет CRUD-операции для основных CRM-сущностей (Lead, Deal, Contact, Company), управление воронками продаж, пользовательскими полями и смарт-процессами.

**Версия:** 0.11.9
**Лицензия:** MIT
**Пакетный менеджер:** npm
**Язык:** TypeScript (target ES2019, module CommonJS, skipLibCheck: true)

---

## Directory Structure

```
n8n-nodes-bitrix24/
├── index.js                          # Главная точка входа npm-пакета
├── package.json                      # Конфигурация пакета, зависимости, n8n-регистрация нод
├── tsconfig.json                     # Конфигурация TypeScript
├── gulpfile.js                       # Gulp-таск: копирование SVG-иконок в dist/
├── .eslintrc.js                      # ESLint конфигурация (n8n-правила)
├── .prettierrc.js                    # Prettier конфигурация
├── .editorconfig                     # Стандарты редактора
│
├── credentials/
│   └── Bitrix24Api.credentials.ts    # Тип учётных данных (webhook URL + язык)
│
├── nodes/
│   ├── shared/                       # Общие утилиты и типы для всех нод
│   │   ├── GenericFunctions.ts       # API-клиент: httpRequest, пагинация, credentials
│   │   ├── FilterBuilder.ts          # Построение Bitrix24-фильтров из массива полей
│   │   ├── DefaultFields.ts          # Маппинг ресурсов к дефолтным полям select
│   │   └── types.ts                  # Каноническое расположение shared-типов, интерфейсов, утилит
│   │
│   ├── Bitrix24/                     # Основная нода: CRM-сущности
│   │   ├── Bitrix24.node.ts          # Главный класс ноды (INodeType)
│   │   ├── Lead.ts                   # Ресурс "Лид" — описание + дефолтные поля
│   │   ├── Deal.ts                   # Ресурс "Сделка" — описание + дефолтные поля
│   │   ├── Contact.ts                # Ресурс "Контакт" — описание + дефолтные поля + типы связи
│   │   ├── Company.ts                # Ресурс "Компания" — описание + дефолтные поля
│   │   ├── types.ts                  # Re-export из ../shared/types (обратная совместимость)
│   │   ├── translations.ts           # i18n система (ru/en), detectLanguage, applyTranslations
│   │   └── bitrix24.svg              # Иконка ноды
│   │
│   ├── Bitrix24Auxiliary/            # Вспомогательная нода: воронки и статусы
│   │   ├── Bitrix24Auxiliary.node.ts # Класс ноды (категории + статусы сделок)
│   │   └── bitrix24.svg              # Иконка ноды
│   │
│   ├── Bitrix24UserField/            # Нода пользовательских полей
│   │   ├── Bitrix24UserField.node.ts # Класс ноды (CRUD для UF-полей)
│   │   └── bitrix24.svg              # Иконка ноды
│   │
│
└── dist/                             # Скомпилированный вывод (tsc + gulp)
```

---

## Nodes (Ноды)

### 1. Bitrix24 (`nodes/Bitrix24/Bitrix24.node.ts`)

Основная нода для работы с CRM-сущностями.

| Ресурс   | Операции                        | API-методы                                       |
|----------|---------------------------------|--------------------------------------------------|
| Lead          | Create, Get, List, Update, Delete | `crm.lead.add/list/update/delete`              |
| Deal          | Create, Get, List, Update, Delete | `crm.deal.add/list/update/delete`              |
| Contact       | Create, Get, List, Update, Delete | `crm.contact.add/list/update/delete`           |
| Company       | Create, Get, List, Update, Delete | `crm.company.add/list/update/delete`           |
| Smart Process | Create, Get, List, Update, Delete | `crm.item.add/get/list/update/delete`          |

**Ключевые возможности:**
- Динамическая загрузка полей через `loadOptions` (`getFields`, `getEnumValues`)
- Два формата ввода: форма (с маппингом enum-значений) и JSON
- Фильтрация через `buildBitrixFilter()` с 12 операторами сравнения (=, !=, >, >=, <, <=, %, !%, =%, %=, @, !@)
- Дефолтные поля через `getDefaultFieldsForResource()` — единая точка маппинга ресурсов к полям
- Пагинация (`bitrix24ApiRequestAllItems`) с батчами по 50 записей и задержкой 1с
- Выбор конкретных полей для получения (`select`)
- Специальная обработка коммуникационных полей для Contact (PHONE, EMAIL)
- Смарт-процессы: динамический выбор entityTypeId из `crm.type.list`, поля из `crm.item.fields`
- Inline-пагинация для смарт-процессов (response.result.items — вложенный массив)
- i18n поддержка (ru/en) через `translations.ts`

### 2. Bitrix24 Auxiliary (`nodes/Bitrix24Auxiliary/Bitrix24Auxiliary.node.ts`)

Управление воронками продаж и статусами.

| Ресурс       | Операции                             | API-методы                                    |
|--------------|--------------------------------------|-----------------------------------------------|
| Category          | Create, Update, Get, GetAll, Delete  | `crm.category.add/update/get/list/delete`    |
| Status            | Create, Update, Get, GetAll, Delete  | `crm.status.add/update/get/list/delete`      |
| Smart Process Type| Create, Update, Get, GetAll, Delete  | `crm.type.add/update/get/list/delete`        |

**Ключевые возможности:**
- Массовое создание/обновление категорий и статусов
- Настройка семантики статусов (P — процесс, S — успех, F — неудача)
- Цвет статуса в HEX-формате
- Управление типами смарт-процессов: 12 feature toggle полей (стадии, категории, клиент, автоматизация и др.)
- i18n поддержка (ru/en) через `translations.ts` (секции `auxiliary`, `smartProcess`)

### 3. Bitrix24 User Field (`nodes/Bitrix24UserField/Bitrix24UserField.node.ts`)

Управление пользовательскими полями CRM-сущностей.

| Ресурс  | Операции                             | API-методы                                        |
|---------|--------------------------------------|---------------------------------------------------|
| Lead    | Create, Update, Get, GetAll, Delete  | `crm.lead.userfield.add/update/get/list/delete`  |
| Deal    | Create, Update, Get, GetAll, Delete  | `crm.deal.userfield.add/update/get/list/delete`  |
| Contact | Create, Update, Get, GetAll, Delete  | `crm.contact.userfield.add/update/get/list/delete`|
| Company | Create, Update, Get, GetAll, Delete  | `crm.company.userfield.add/update/get/list/delete`|

**Типы полей:** string, integer, double, boolean, enumeration, date, datetime, file, money, url
- i18n поддержка (ru/en) через `translations.ts` (секция `userField`)

---

## Credentials (`credentials/Bitrix24Api.credentials.ts`)

| Поле        | Тип     | Описание                                  |
|-------------|---------|-------------------------------------------|
| webhookUrl  | string  | Webhook URL из Bitrix24                   |
| language    | options | Язык интерфейса (ru/en, по умолчанию ru)  |

**Аутентификация:** Generic (Content-Type header).
**Тестирование:** GET-запрос к `{webhookUrl}profile/`.

---

## Resource Classes

Классы ресурсов (`Lead.ts`, `Deal.ts`, `Contact.ts`, `Company.ts`) — статические классы, предоставляющие:

| Метод/Свойство          | Описание                                         |
|-------------------------|--------------------------------------------------|
| `resource`              | Идентификатор ресурса (lead/deal/contact/company) |
| `getDescription()`      | Опция для UI-селектора                           |
| `getDefaultFields()`    | Массив полей по умолчанию для select-запросов     |
| `communicationTypes`    | (только Contact) Типы связи для PHONE/EMAIL      |

---

## Shared Modules (`nodes/shared/`)

### API Client (`nodes/shared/GenericFunctions.ts`)

Единый модуль для HTTP-взаимодействия с Bitrix24 API. Использует `this.helpers.httpRequest()` из n8n-core вместо прямых вызовов axios/fetch.

| Экспорт                            | Тип       | Описание                                              |
|-------------------------------------|-----------|-------------------------------------------------------|
| `getValidatedCredentials()`         | Function  | Получение и валидация credentials (webhookUrl + language), нормализация URL |
| `bitrix24ApiRequest()`              | Function  | Универсальный API-запрос через httpRequest (GET/POST), проверка ошибок Bitrix24 |
| `bitrix24ApiRequestAllItems()`      | Function  | Пагинированная загрузка всех записей (batch по 50, задержка 1с) |

**Использование в нодах:**
- `bitrix24ApiRequest.call(this, method, endpoint, body?)` — все ноды
- `bitrix24ApiRequestAllItems.call(this, endpoint, params)` — только Bitrix24.node.ts (операция list + returnAll)

### Filter Builder (`nodes/shared/FilterBuilder.ts`)

Построение Bitrix24-совместимых объектов фильтрации из массива пользовательских условий.

| Экспорт                | Тип       | Описание                                                         |
|------------------------|-----------|------------------------------------------------------------------|
| `IFilterField`         | Interface | Описание одного условия фильтра (fieldName, operation, value)    |
| `buildBitrixFilter()`  | Function  | Конвертация массива IFilterField в IDataObject-фильтр для API    |

**Логика:** `equals` — без префикса, `@`/`!@` — split по запятой, остальные — префикс операции к имени поля.

### Default Fields (`nodes/shared/DefaultFields.ts`)

Маппинг CRM-ресурсов к массивам полей по умолчанию для select-запросов.

| Экспорт                          | Тип       | Описание                                                    |
|----------------------------------|-----------|-------------------------------------------------------------|
| `getDefaultFieldsForResource()`  | Function  | Возвращает дефолтный массив полей для указанного ресурса    |

**Внутри:** `DEFAULT_FIELDS` — pre-computed Record<string, string[]> из Lead/Deal/Contact/Company.getDefaultFields().

### Types & Utilities (`nodes/shared/types.ts`)

Каноническое расположение общих типов и утилит. Файл `nodes/Bitrix24/types.ts` является re-export для обратной совместимости.

| Экспорт                            | Тип       | Описание                                              |
|-------------------------------------|-----------|-------------------------------------------------------|
| `IBitrix24Field`                    | Interface | Метаданные поля Bitrix24 (тип, required, items и др.) |
| `IEnumValue`                        | Interface | Значение перечисления (name + value)                  |
| `BitrixResourceType`                | Type      | Union-тип: 'lead' \| 'deal' \| 'contact' \| 'company'|
| `IFieldCollection`                  | Interface | Элемент коллекции полей формы                         |
| `CommunicationType`                 | Enum      | Типы связи (WORK, MOBILE, HOME, FAX, и др.)          |
| `formatContactCommunicationField()` | Function  | Формат PHONE/EMAIL для Contact (VALUE_TYPE)           |
| `formatCommunicationField()`        | Function  | Формат PHONE/EMAIL для других сущностей (TYPE)        |
| `processFormFields()`               | Function  | Конвертация коллекции полей формы в API-payload       |

---

## i18n System (`nodes/Bitrix24/translations.ts`)

| Экспорт               | Описание                                                  |
|------------------------|-----------------------------------------------------------|
| `SupportedLanguage`    | Type: 'ru' \| 'en'                                       |
| `ITranslations`        | Полный интерфейс переводов (ресурсы, операции, поля, auxiliary, userField, smartProcess)|
| `detectLanguage(language?)` | Определение языка: приоритет параметра > `N8N_DEFAULT_LANGUAGE` > 'en' |
| `getTranslations()`    | Получение полного объекта переводов                       |
| `getTranslation(path)` | Получение перевода по dot-notation пути                   |
| `applyTranslations()`  | Применение переводов к `INodeTypeDescription`             |

---

## Data Flow

```
Credentials (webhookUrl + language)
        |
        v
  +---------------+
  |  Node.execute  | <-- getInputData() (n8n items)
  +-------+-------+
          |
     +----+----+
     | Resource | (lead/deal/contact/company)
     +----+----+
          |
     +----+-----+
     | Operation | (create/get/list/update/delete)
     +----+-----+
          |
    +-----+------+
    | Build Params| <-- fields (form/JSON), filters (FilterBuilder), select (DefaultFields), pagination
    +-----+------+
          |
    +-----+------------------+
    | bitrix24ApiRequest()   | --> this.helpers.httpRequest()
    | (GenericFunctions.ts)  | --> {webhookUrl}crm.{resource}.{method}.json
    +-----+------------------+
          |
          v
  returnJsonArray(results)
```

---

## Build & Publish

```bash
npm run build     # tsc && gulp build:icons -> dist/
npm run dev       # tsc --watch
npm run lint      # eslint
npm run format    # prettier
```

**Публикация:** `npm publish` (pre-publish hook автоматически запускает build).

---

## Dependencies

| Пакет                        | Тип  | Версия    | Назначение                                      |
|------------------------------|------|-----------|--------------------------------------------------|
| n8n-core                     | peer | >=0.131.0 | Контекст выполнения ноды (httpRequest API)       |
| n8n-workflow                 | peer | >=0.107.0 | Типы и интерфейсы n8n                            |
| @types/node                  | dev  | ^14.18.0  | Типы Node.js (требуется tsconfig "types":["node"])|
| @typescript-eslint/parser    | dev  | ~5.45     | TypeScript-парсер для ESLint                     |
| eslint-plugin-n8n-nodes-base | dev  | ^1.0.0    | ESLint-правила для n8n-нод                       |
| gulp                         | dev  | ^4.0.2    | Копирование SVG-иконок в dist/                   |
| n8n-core                     | dev  | 0.125.0   | Типы n8n-core для локальной разработки           |
| n8n-workflow                 | dev  | 0.107.0   | Типы n8n-workflow для локальной разработки        |
| prettier                     | dev  | ^2.7.1    | Форматирование кода                              |
| typescript                   | dev  | ~4.8.4    | Компиляция TypeScript                            |

Нет production-зависимостей (`"dependencies": {}`). HTTP-запросы выполняются через `this.helpers.httpRequest()` из n8n-core.

---

## Entry Point (`index.js`)

```javascript
module.exports = {
    nodeTypes: [
        require('./dist/nodes/Bitrix24/Bitrix24.node.js'),
        require('./dist/nodes/Bitrix24Auxiliary/Bitrix24Auxiliary.node.js'),
        require('./dist/nodes/Bitrix24UserField/Bitrix24UserField.node.js'),
    ],
    credentialTypes: [
        require('./dist/credentials/Bitrix24Api.credentials.js'),
    ],
};
```

Экспортирует все 3 ноды и credentials. Ноды также регистрируются через `package.json` -> `n8n.nodes`.
