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
├── jest.integration.config.ts        # Конфигурация Jest для интеграционных тестов
├── .env.test.example                 # Шаблон env-файла для интеграционных тестов
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
│   │   ├── Product.ts                # Ресурс "Товар" — описание + дефолтные поля
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
├── tests/
│   └── integration/
│       ├── setup-global.ts           # Глобальный setup: верификация webhook перед тестами
│       ├── helpers/
│       │   ├── test-config.ts        # Конфигурация тестов: WEBHOOK_URL, TEST_PREFIX, delay, testName
│       │   ├── bitrix24-api.ts       # API-клиент для тестов: callBitrix24, callBitrix24Result (axios + retry)
│       │   └── cleanup.ts            # Безопасное удаление тестовых сущностей: safeDelete, safeDeleteMultiple
│       ├── crm/
│       │   ├── lead.test.ts          # CRUD-тест для Lead (7 тестов: create/get/list/update/verify/delete/verify)
│       │   ├── deal.test.ts          # CRUD-тест для Deal (7 тестов, проверка OPPORTUNITY/STAGE_ID)
│       │   ├── contact.test.ts       # CRUD-тест для Contact (7 тестов, проверка PHONE/EMAIL с VALUE_TYPE)
│       │   ├── company.test.ts       # CRUD-тест для Company (7 тестов, проверка COMPANY_TYPE)
│       │   └── product.test.ts       # CRUD-тест для Product (7 тестов, проверка PRICE/CURRENCY_ID)
│       ├── smart-process/
│       │   └── smart-process.test.ts # CRUD-тест для Smart Process Item (7 тестов, lifecycle SP Type в beforeAll/afterAll)
│       ├── auxiliary/
│       │   ├── category.test.ts      # CRUD-тест для Category/воронка (7 тестов, entityTypeId:2 Deal)
│       │   ├── status.test.ts        # CRUD-тест для Status/стадия (7 тестов, ENTITY_ID=DEAL_STAGE_{categoryId})
│       │   ├── smart-process-type.test.ts # CRUD-тест для Smart Process Type (7 тестов, feature toggles)
│       │   ├── department.test.ts    # CRUD-тест для Department (7 тестов, flat params, PARENT)
│       │   ├── task.test.ts          # CRUD-тест для Task (7 тестов, taskId param, RESPONSIBLE_ID:1)
│       │   ├── product-row.test.ts   # CRUD-тест для Product Row (7 тестов, Deal owner, camelCase fields)
│       │   └── call-statistic.test.ts # Read-only тест для Call Statistic (4 теста, voximplant.statistic.get)
│       └── user-fields/
│           ├── lead-userfield.test.ts    # CRUD-тест для Lead User Field (7 тестов, UF_CRM_ prefix)
│           ├── deal-userfield.test.ts    # CRUD-тест для Deal User Field (7 тестов)
│           ├── contact-userfield.test.ts # CRUD-тест для Contact User Field (7 тестов)
│           └── company-userfield.test.ts # CRUD-тест для Company User Field (7 тестов)
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
| Product       | Create, Get, List, Update, Delete | `crm.product.add/list/update/delete`           |
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

Управление воронками продаж, статусами, структурой компании и статистикой звонков.

| Ресурс       | Операции                             | API-методы                                    |
|--------------|--------------------------------------|-----------------------------------------------|
| Category          | Create, Update, Get, GetAll, Delete  | `crm.category.add/update/get/list/delete`    |
| Status            | Create, Update, Get, GetAll, Delete  | `crm.status.add/update/get/list/delete`      |
| Smart Process Type| Create, Update, Get, GetAll, Delete  | `crm.type.add/update/get/list/delete`        |
| Department        | Create, Update, Get, GetAll, Delete  | `department.add/update/get/delete`            |
| Call Statistic    | GetAll                               | `voximplant.statistic.get`                    |
| Task              | Create, Update, Get, GetAll, Delete  | `tasks.task.add/update/get/list/delete`       |
| Product Row       | Create, Update, Get, GetAll, Delete  | `crm.item.productrow.add/update/get/list/delete` |

**Ключевые возможности:**
- Массовое создание/обновление категорий и статусов
- Настройка семантики статусов (P — процесс, S — успех, F — неудача)
- Цвет статуса в HEX-формате
- Управление типами смарт-процессов: 12 feature toggle полей (стадии, категории, клиент, автоматизация и др.)
- Создание пользовательских полей при создании смарт-процесса (`userfieldconfig.add` с `moduleId: "crm"`, `entityId: "CRM_{entityTypeId}"`). Поддержка 10 типов полей (string, integer, double, boolean, enumeration, date, datetime, file, money, url), настройки множественности, обязательности, фильтра, а также значений списка для типа enumeration
- Управление подразделениями: CRUD-операции (создание, обновление, получение, удаление), поля NAME, SORT, PARENT, UF_HEAD
- Статистика звонков (только чтение): фильтрация по типу звонка (исходящий/входящий/перенаправленный/обратный), номеру телефона, оператору, периоду; сортировка по дате/длительности/стоимости
- Задачи (tasks.task.*): CRUD-операции, поддержка формы и JSON-ввода, приоритеты, крайний срок, привязка к CRM, пагинация батчами по 50, фильтрация с операторами сравнения
- Товарные позиции (crm.item.productrow.*): CRUD-операции, привязка к Deal/Lead/Quote/SmartProcess, цена/количество/скидка/налог, формат и JSON-ввод
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

Классы ресурсов (`Lead.ts`, `Deal.ts`, `Contact.ts`, `Company.ts`, `Product.ts`) — статические классы, предоставляющие:

| Метод/Свойство          | Описание                                         |
|-------------------------|--------------------------------------------------|
| `resource`              | Идентификатор ресурса (lead/deal/contact/company/product) |
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

**Внутри:** `DEFAULT_FIELDS` — pre-computed Record<string, string[]> из Lead/Deal/Contact/Company/Product.getDefaultFields().

### Types & Utilities (`nodes/shared/types.ts`)

Каноническое расположение общих типов и утилит. Файл `nodes/Bitrix24/types.ts` является re-export для обратной совместимости.

| Экспорт                            | Тип       | Описание                                              |
|-------------------------------------|-----------|-------------------------------------------------------|
| `IBitrix24Field`                    | Interface | Метаданные поля Bitrix24 (тип, required, items и др.) |
| `IEnumValue`                        | Interface | Значение перечисления (name + value)                  |
| `BitrixResourceType`                | Type      | Union-тип: 'lead' \| 'deal' \| 'contact' \| 'company' \| 'product'|
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

## Integration Tests Infrastructure

Интеграционные тесты выполняют реальные API-запросы к Bitrix24 через webhook.

### Configuration

| Файл | Описание |
|------|----------|
| `jest.integration.config.ts` | Jest конфигурация: ts-jest, testTimeout 30s, maxWorkers 1, globalSetup |
| `.env.test.example` | Шаблон конфигурации (BITRIX24_WEBHOOK_URL, API_DELAY) |
| `.env.test` | Локальная конфигурация (в .gitignore) |

### Test Helpers (`tests/integration/helpers/`)

| Модуль | Экспорты | Описание |
|--------|----------|----------|
| `test-config.ts` | `WEBHOOK_URL`, `TEST_PREFIX`, `API_DELAY`, `delay()`, `testName()` | Конфигурация тестов: загрузка env, уникальные имена с timestamp, задержки для rate limiting |
| `bitrix24-api.ts` | `callBitrix24()`, `callBitrix24Result()`, `BitrixResponse` | API-клиент на axios: retry до 2x при transient ошибках, delay после каждого вызова, проверка Bitrix24 ошибок |
| `cleanup.ts` | `safeDelete()`, `safeDeleteMultiple()` | Безопасное удаление тестовых сущностей (try/catch, console.warn, без throw в afterAll) |

### Global Setup (`tests/integration/setup-global.ts`)

Выполняется один раз перед всеми тестами. Верифицирует webhook через GET `profile.json`. При неудаче — понятная ошибка с инструкцией.

### CRM Integration Tests (`tests/integration/crm/`)

Каждый файл реализует полный CRUD-цикл для CRM-сущности: create -> get (через list с filter по ID) -> list (с filter по TEST_PREFIX) -> update -> verify update -> delete -> verify delete.

| Файл | Сущность | Поля create | Поля update | Особенности |
|------|----------|-------------|-------------|-------------|
| `lead.test.ts` | Lead | TITLE, NAME, LAST_NAME, STATUS_ID | TITLE, STATUS_ID (NEW->IN_PROCESS) | Базовый паттерн CRUD |
| `deal.test.ts` | Deal | TITLE, STAGE_ID, OPPORTUNITY, CURRENCY_ID | TITLE, STAGE_ID (NEW->PREPARATION), OPPORTUNITY | OPPORTUNITY как строка с десятичными |
| `contact.test.ts` | Contact | NAME, LAST_NAME, PHONE, EMAIL | NAME, PHONE (добавление MOBILE) | Коммуникационные поля: массив {VALUE, VALUE_TYPE} |
| `company.test.ts` | Company | TITLE, COMPANY_TYPE | TITLE, COMPANY_TYPE (CUSTOMER->SUPPLIER) | Простой CRUD |
| `product.test.ts` | Product | NAME, PRICE, CURRENCY_ID | NAME, PRICE | PRICE как строка с десятичными |

**Общий паттерн:**
- `describe` блок с 7 `it`-тестами (последовательное выполнение)
- `let createdId: number` на уровне describe для передачи ID между тестами
- `afterAll` с `safeDelete()` — страховочная очистка
- `testName()` для уникальных имен с `TEST_PREFIX`
- `callBitrix24Result()` для получения result, `callBitrix24()` для доступа к total
- Все эндпоинты с суффиксом `.json`

### Smart Process Integration Tests (`tests/integration/smart-process/`)

| Файл | Описание | Тесты |
|------|----------|-------|
| `smart-process.test.ts` | CRUD-тест для Smart Process Item | 7 тестов: create/get/list/update/verify update/delete/verify delete |

**Паттерн lifecycle:**
- `beforeAll`: создание SP Type через `crm.type.add` (сохраняет `typeId` и `entityTypeId`)
- `afterAll`: удаление item (страховка) + удаление SP Type через `crm.type.delete`
- Все item-операции используют `entityTypeId` из созданного типа (не хардкод)
- Ответы: `result.item` (get/add/update), `result.items` (list), `result: []` (delete)
- Поля в camelCase: `id`, `title` (в отличие от CRM: `ID`, `TITLE`)
- `crm.type.delete` требует отсутствия привязанных элементов -- item удаляется первым

### Auxiliary Integration Tests (`tests/integration/auxiliary/`)

Тесты вспомогательных сущностей: воронки, статусы, типы смарт-процессов, подразделения, задачи, товарные позиции, статистика звонков.

| Файл | Сущность | Тесты | Особенности |
|------|----------|-------|-------------|
| `category.test.ts` | Category (воронка) | 7 CRUD | entityTypeId:2 (Deal), lowercase поля (name, sort, id), result.category/result.categories |
| `status.test.ts` | Status (стадия) | 7 CRUD | beforeAll создает категорию, ENTITY_ID=DEAL_STAGE_{categoryId}, uppercase поля, result — flat объект/массив |
| `smart-process-type.test.ts` | Smart Process Type | 7 CRUD | Feature toggles (isStagesEnabled и др.), entityTypeId auto >=128, result.type/result.types |
| `department.test.ts` | Department | 7 CRUD | Flat params (не fields:{}), PARENT к существующему отделу, result — массив с string ID |
| `task.test.ts` | Task | 7 CRUD | taskId param, RESPONSIBLE_ID:1, UPPERCASE request/camelCase response, result.task/result.tasks |
| `product-row.test.ts` | Product Row | 7 CRUD | beforeAll создает Deal, camelCase поля (ownerId, ownerType:'D'), result.productRow/result.productRows |
| `call-statistic.test.ts` | Call Statistic | 4 read-only | voximplant.statistic.get, фильтры по дате/типу/сортировке, устойчив к пустым данным |

**Общий паттерн Auxiliary:**
- Тот же CRUD-цикл (create/get/list/update/verify/delete/verify) что и CRM-тесты
- `beforeAll`/`afterAll` для тестов, требующих зависимые сущности (status->category, product-row->deal)
- Порядок cleanup: зависимые сущности удаляются первыми (статус до категории, product row до deal)
- Не используют `.json` суффикс для эндпоинтов (crm.category.*, crm.type.*, department.*, tasks.task.*, crm.item.productrow.*, voximplant.statistic.*)

### User Field Integration Tests (`tests/integration/user-fields/`)

CRUD-тесты для пользовательских полей 4 CRM-сущностей. Одинаковый паттерн для всех: create -> get -> list -> update -> verify update -> delete -> verify delete.

| Файл | Сущность | Эндпоинты | Особенности |
|------|----------|-----------|-------------|
| `lead-userfield.test.ts` | Lead UF | `crm.lead.userfield.add/get/list/update/delete.json` | Шаблон для остальных, FIELD_NAME с суффиксом LEAD |
| `deal-userfield.test.ts` | Deal UF | `crm.deal.userfield.add/get/list/update/delete.json` | FIELD_NAME с суффиксом DEAL |
| `contact-userfield.test.ts` | Contact UF | `crm.contact.userfield.add/get/list/update/delete.json` | FIELD_NAME с суффиксом CONTACT |
| `company-userfield.test.ts` | Company UF | `crm.company.userfield.add/get/list/update/delete.json` | FIELD_NAME с суффиксом COMPANY |

**Общий паттерн User Field:**
- FIELD_NAME обязательно начинается с `UF_CRM_` (требование Bitrix24), допустимые символы: A-Z, 0-9, _
- USER_TYPE_ID: `string` — простейший тип для тестирования
- EDIT_FORM_LABEL: объект `{ ru, en }` — локализованная метка
- API-параметры get/update/delete используют lowercase `id` (не `ID`)
- create возвращает `result: number` (ID поля), get — `result: object`, list — `result: array`, update/delete — `result: true`
- afterAll: `safeDelete()` с `idField: 'id'` (lowercase)
- Верификация удаления: try/catch на `get` (API возвращает ошибку для удалённого поля)

### npm Scripts

| Скрипт | Описание |
|--------|----------|
| `test:integration` | Все интеграционные тесты (--runInBand) |
| `test:integration:crm` | Только CRM-тесты (testPathPattern=crm/) |
| `test:integration:auxiliary` | Только Auxiliary-тесты (testPathPattern=auxiliary/) |
| `test:integration:userfields` | Только User Fields-тесты (testPathPattern=user-fields/) |
| `test:integration:smart-process` | Только Smart Process-тесты (testPathPattern=smart-process/) |

---

## Dependencies

| Пакет                        | Тип  | Версия    | Назначение                                      |
|------------------------------|------|-----------|--------------------------------------------------|
| n8n-core                     | peer | >=0.131.0 | Контекст выполнения ноды (httpRequest API)       |
| n8n-workflow                 | peer | >=0.107.0 | Типы и интерфейсы n8n                            |
| @types/jest                  | dev  | ^29.5.0   | Типы Jest для TypeScript                         |
| @types/node                  | dev  | ^14.18.0  | Типы Node.js (требуется tsconfig "types":["node"])|
| @typescript-eslint/parser    | dev  | ~5.45     | TypeScript-парсер для ESLint                     |
| axios                        | dev  | ^1.7.0    | HTTP-клиент для интеграционных тестов            |
| dotenv                       | dev  | ^16.4.0   | Загрузка env-переменных для тестов               |
| eslint-plugin-n8n-nodes-base | dev  | ^1.0.0    | ESLint-правила для n8n-нод                       |
| gulp                         | dev  | ^4.0.2    | Копирование SVG-иконок в dist/                   |
| jest                         | dev  | ^29.7.0   | Фреймворк тестирования                          |
| n8n-core                     | dev  | 0.125.0   | Типы n8n-core для локальной разработки           |
| n8n-workflow                 | dev  | 0.107.0   | Типы n8n-workflow для локальной разработки        |
| prettier                     | dev  | ^2.7.1    | Форматирование кода                              |
| ts-jest                      | dev  | ^29.2.0   | TypeScript-транспайлер для Jest                  |
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
