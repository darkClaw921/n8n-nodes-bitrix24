import { IDataObject } from 'n8n-workflow';
import { INodeTypeDescription } from 'n8n-workflow';

// Типы для поддерживаемых языков
export type SupportedLanguage = 'ru' | 'en';

// Интерфейс для переводов
export interface ITranslations {
    // Общие переводы
    displayName: string;
    description: string;
    // Ресурсы
    resources: {
        lead: string;
        deal: string;
        contact: string;
        company: string;
        smartProcess: string;
    };
    
    // Операции
    operations: {
        create: {
            name: string;
            description: string;
            action: string;
        };
        get: {
            name: string;
            description: string;
            action: string;
        };
        list: {
            name: string;
            description: string;
            action: string;
        };
        update: {
            name: string;
            description: string;
            action: string;
        };
        delete: {
            name: string;
            description: string;
            action: string;
        };
    };
    
    // Поля интерфейса
    fields: {
        resource: string;
        operation: string;
        getBy: string;
        id: string;
        idDescription: string;
        filterFields: string;
        filterFieldsPlaceholder: string;
        filterFieldName: string;
        filterFieldNameDescription: string;
        filterOperation: string;
        filterOperationDescription: string;
        filterValue: string;
        filterValueDescription: string;
        inputFormat: string;
        fieldsJson: string;
        fieldsJsonDescription: string;
        fields: string;
        fieldsDescription: string;
        fieldsPlaceholder: string;
        fieldName: string;
        fieldNameDescription: string;
        fieldValueType: string;
        fieldValueTypeDescription: string;
        fieldValue: string;
        fieldValueDescription: string;
        returnAll: string;
        returnAllDescription: string;
        limit: string;
        limitDescription: string;
        useFilter: string;
        useFilterDescription: string;
        selectFields: string;
        selectFieldsDescription: string;
    };
    
    // Опции фильтрации
    filterOperations: {
        equals: string;
        notEquals: string;
        greaterThan: string;
        greaterThanOrEqual: string;
        lessThan: string;
        lessThanOrEqual: string;
        contains: string;
        notContains: string;
        startsWith: string;
        endsWith: string;
        inList: string;
        notInList: string;
    };
    
    // Опции ввода
    inputFormats: {
        form: string;
        formDescription: string;
        json: string;
        jsonDescription: string;
    };
    
    // Опции получения данных
    getByOptions: {
        id: string;
        idDescription: string;
        filter: string;
        filterDescription: string;
    };

    // Переводы для Bitrix24Auxiliary
    auxiliary: {
        displayName: string;
        description: string;
        resources: {
            category: string;
            status: string;
            department: string;
            callStatistic: string;
        };
        operations: {
            create: { description: string; action: string; };
            update: { description: string; action: string; };
            get: { description: string; action: string; };
            getAll: { description: string; action: string; };
            delete: { description: string; action: string; };
        };
        fields: {
            id: string;
            idDescription: string;
            name: string;
            nameDescription: string;
            sort: string;
            sortDescription: string;
            isDefault: string;
            isDefaultDescription: string;
            categoryId: string;
            categoryIdDescription: string;
            statusName: string;
            statusNameDescription: string;
            statusSort: string;
            statusSortDescription: string;
            statusColor: string;
            statusColorDescription: string;
            statusSemantic: string;
            statusSemanticDescription: string;
            multipleItems: string;
            multipleItemsDescription: string;
            items: string;
            itemsDescription: string;
            statusItems: string;
            statusItemsDescription: string;
        };
        semantics: {
            process: string;
            success: string;
            failure: string;
        };
        departmentFields: {
            id: string;
            idDescription: string;
            name: string;
            nameDescription: string;
            sort: string;
            sortDescription: string;
            parent: string;
            parentDescription: string;
            head: string;
            headDescription: string;
        };
        callFields: {
            filterType: string;
            filterTypeDescription: string;
            filterPhone: string;
            filterPhoneDescription: string;
            filterUserId: string;
            filterUserIdDescription: string;
            filterDateFrom: string;
            filterDateFromDescription: string;
            filterDateTo: string;
            filterDateToDescription: string;
            sortField: string;
            sortFieldDescription: string;
            sortOrder: string;
            sortOrderDescription: string;
        };
        callTypes: {
            outbound: string;
            inbound: string;
            inboundRedirect: string;
            callback: string;
        };
        callSortFields: {
            callDuration: string;
            callStartDate: string;
            cost: string;
            id: string;
        };
    };

    // Переводы для Bitrix24UserField
    userField: {
        displayName: string;
        description: string;
        operations: {
            create: { description: string; action: string; };
            update: { description: string; action: string; };
            get: { description: string; action: string; };
            getAll: { description: string; action: string; };
            delete: { description: string; action: string; };
        };
        fieldTypes: {
            string: string;
            integer: string;
            double: string;
            boolean: string;
            enumeration: string;
            date: string;
            datetime: string;
            file: string;
            money: string;
            url: string;
        };
        fields: {
            fieldId: string;
            fieldIdDescription: string;
            fieldName: string;
            fieldNameDescription: string;
            fieldLabel: string;
            fieldLabelDescription: string;
            fieldType: string;
            fieldTypeDescription: string;
            listValues: string;
            listValuesDescription: string;
            value: string;
            valueDescription: string;
            multiple: string;
            multipleDescription: string;
            mandatory: string;
            mandatoryDescription: string;
            showFilter: string;
            showFilterDescription: string;
            showInList: string;
            showInListDescription: string;
        };
    };

    // Переводы для Bitrix24SmartProcess
    smartProcess: {
        displayName: string;
        description: string;
        resources: {
            type: string;
            item: string;
        };
        operations: {
            create: { description: string; action: string; };
            get: { description: string; action: string; };
            list: { description: string; action: string; };
            update: { description: string; action: string; };
            delete: { description: string; action: string; };
        };
        itemOperations: {
            create: { description: string; action: string; };
            get: { description: string; action: string; };
            list: { description: string; action: string; };
            update: { description: string; action: string; };
            delete: { description: string; action: string; };
        };
        fields: {
            entityTypeId: string;
            entityTypeIdDescription: string;
            title: string;
            titleDescription: string;
            id: string;
            idDescription: string;
            isStagesEnabled: string;
            isStagesEnabledDescription: string;
            isCategoriesEnabled: string;
            isCategoriesEnabledDescription: string;
            isClientEnabled: string;
            isClientEnabledDescription: string;
            isBeginCloseDatesEnabled: string;
            isBeginCloseDatesEnabledDescription: string;
            isLinkWithProductsEnabled: string;
            isLinkWithProductsEnabledDescription: string;
            isObserversEnabled: string;
            isObserversEnabledDescription: string;
            isSourceEnabled: string;
            isSourceEnabledDescription: string;
            isAutomationEnabled: string;
            isAutomationEnabledDescription: string;
            isBizProcEnabled: string;
            isBizProcEnabledDescription: string;
            isDocumentsEnabled: string;
            isDocumentsEnabledDescription: string;
            isRecyclebinEnabled: string;
            isRecyclebinEnabledDescription: string;
            isMycompanyEnabled: string;
            isMycompanyEnabledDescription: string;
            createFields: string;
            createFieldsDescription: string;
            customFields: string;
            customFieldsDescription: string;
            ufFieldName: string;
            ufFieldNameDescription: string;
            ufFieldLabel: string;
            ufFieldLabelDescription: string;
            ufFieldType: string;
            ufFieldTypeDescription: string;
            ufMultiple: string;
            ufMultipleDescription: string;
            ufMandatory: string;
            ufMandatoryDescription: string;
            ufShowFilter: string;
            ufShowFilterDescription: string;
            ufListValues: string;
            ufListValuesDescription: string;
            ufValue: string;
            ufValueDescription: string;
        };
    };
}

// Русские переводы
const ru: ITranslations = {
    displayName: 'Bitrix24',
    description: 'Работа с Bitrix24 API',
    
    
    
    resources: {
        lead: 'Лид',
        deal: 'Сделка',
        contact: 'Контакт',
        company: 'Компания',
        smartProcess: 'Смарт-процесс',
    },
    
    operations: {
        create: {
            name: 'Создать',
            description: 'Создать запись',
            action: 'Создать запись',
        },
        get: {
            name: 'Получить',
            description: 'Получить запись',
            action: 'Получить запись',
        },
        list: {
            name: 'Список',
            description: 'Получить список записей',
            action: 'Получить список записей',
        },
        update: {
            name: 'Обновить',
            description: 'Обновить запись',
            action: 'Обновить запись',
        },
        delete: {
            name: 'Удалить',
            description: 'Удалить запись',
            action: 'Удалить запись',
        },
    },
    
    fields: {
        resource: 'Ресурс',
        operation: 'Операция',
        getBy: 'Получить по',
        id: 'ID',
        idDescription: 'ID записи',
        filterFields: 'Поля фильтра',
        filterFieldsPlaceholder: 'Добавить поле фильтра',
        filterFieldName: 'Имя поля',
        filterFieldNameDescription: 'Имя поля для фильтрации',
        filterOperation: 'Операция',
        filterOperationDescription: 'Операция сравнения',
        filterValue: 'Значение',
        filterValueDescription: 'Значение для фильтрации',
        inputFormat: 'Формат ввода',
        fieldsJson: 'Поля (JSON)',
        fieldsJsonDescription: 'Поля в формате JSON',
        fields: 'Поля',
        fieldsDescription: 'Поля для создания/обновления',
        fieldsPlaceholder: 'Добавить поле',
        fieldName: 'Имя поля',
        fieldNameDescription: 'Имя поля для обновления',
        fieldValueType: 'Тип связи',
        fieldValueTypeDescription: 'Тип контактных данных',
        fieldValue: 'Значение поля',
        fieldValueDescription: 'Значение поля',
        returnAll: 'Вернуть все',
        returnAllDescription: 'Получить все записи',
        limit: 'Лимит',
        limitDescription: 'Максимальное количество записей',
        useFilter: 'Использовать фильтр',
        useFilterDescription: 'Использовать фильтрацию записей',
        selectFields: 'Выбрать поля',
        selectFieldsDescription: 'Выберите поля для получения',
    },
    
    filterOperations: {
        equals: 'Равно',
        notEquals: 'Не равно',
        greaterThan: 'Больше',
        greaterThanOrEqual: 'Больше или равно',
        lessThan: 'Меньше',
        lessThanOrEqual: 'Меньше или равно',
        contains: 'Содержит',
        notContains: 'Не содержит',
        startsWith: 'Начинается с',
        endsWith: 'Заканчивается на',
        inList: 'В списке',
        notInList: 'Не в списке',
    },
    
    inputFormats: {
        form: 'Форма',
        formDescription: 'Использовать форму для ввода полей',
        json: 'JSON',
        jsonDescription: 'Использовать JSON формат для ввода полей',
    },
    
    getByOptions: {
        id: 'ID',
        idDescription: 'Получить по ID',
        filter: 'Фильтр',
        filterDescription: 'Получить по фильтру',
    },

    auxiliary: {
        displayName: 'Bitrix24 Auxiliary',
        description: 'Управление вспомогательными сущностями в Bitrix24',
        resources: {
            category: 'Воронка продаж',
            status: 'Статус воронки',
            department: 'Подразделение',
            callStatistic: 'Статистика звонков',
        },
        operations: {
            create: { description: 'Создать элемент', action: 'Создать элемент' },
            update: { description: 'Обновить элемент', action: 'Обновить элемент' },
            get: { description: 'Получить элемент', action: 'Получить элемент' },
            getAll: { description: 'Получить все элементы', action: 'Получить все элементы' },
            delete: { description: 'Удалить элемент', action: 'Удалить элемент' },
        },
        fields: {
            id: 'ID',
            idDescription: 'ID воронки продаж',
            name: 'Название',
            nameDescription: 'Название воронки продаж',
            sort: 'Сортировка',
            sortDescription: 'Сортировка воронки',
            isDefault: 'По умолчанию',
            isDefaultDescription: 'Воронка по умолчанию',
            categoryId: 'ID воронки',
            categoryIdDescription: 'ID воронки продаж',
            statusName: 'Название статуса',
            statusNameDescription: 'Название статуса',
            statusSort: 'Сортировка статуса',
            statusSortDescription: 'Сортировка статуса',
            statusColor: 'Цвет статуса',
            statusColorDescription: 'Цвет статуса в формате HEX',
            statusSemantic: 'Семантика статуса',
            statusSemanticDescription: 'Семантика статуса (P - процесс, S - успех, F - неудача)',
            multipleItems: 'Несколько элементов',
            multipleItemsDescription: 'Создать несколько элементов',
            items: 'Элементы',
            itemsDescription: 'Список воронок для создания',
            statusItems: 'Элементы',
            statusItemsDescription: 'Список статусов для создания',
        },
        semantics: {
            process: 'Процесс',
            success: 'Успех',
            failure: 'Неудача',
        },
        departmentFields: {
            id: 'ID подразделения',
            idDescription: 'Идентификатор подразделения',
            name: 'Название',
            nameDescription: 'Название подразделения',
            sort: 'Сортировка',
            sortDescription: 'Порядок сортировки подразделения',
            parent: 'Родительское подразделение',
            parentDescription: 'ID родительского подразделения',
            head: 'Руководитель',
            headDescription: 'ID пользователя-руководителя подразделения',
        },
        callFields: {
            filterType: 'Тип звонка',
            filterTypeDescription: 'Фильтр по типу звонка',
            filterPhone: 'Номер телефона',
            filterPhoneDescription: 'Фильтр по номеру телефона',
            filterUserId: 'ID оператора',
            filterUserIdDescription: 'Фильтр по ID пользователя-оператора',
            filterDateFrom: 'Дата с',
            filterDateFromDescription: 'Начало периода фильтрации',
            filterDateTo: 'Дата по',
            filterDateToDescription: 'Конец периода фильтрации',
            sortField: 'Поле сортировки',
            sortFieldDescription: 'Поле для сортировки результатов',
            sortOrder: 'Направление сортировки',
            sortOrderDescription: 'Направление сортировки (по возрастанию/убыванию)',
        },
        callTypes: {
            outbound: 'Исходящий',
            inbound: 'Входящий',
            inboundRedirect: 'Входящий с перенаправлением',
            callback: 'Обратный звонок',
        },
        callSortFields: {
            callDuration: 'Длительность звонка',
            callStartDate: 'Дата начала звонка',
            cost: 'Стоимость',
            id: 'ID',
        },
    },

    userField: {
        displayName: 'Bitrix24 User Field',
        description: 'Работа с пользовательскими полями в Bitrix24',
        operations: {
            create: { description: 'Создать пользовательское поле', action: 'Создать пользовательское поле' },
            update: { description: 'Обновить пользовательское поле', action: 'Обновить пользовательское поле' },
            get: { description: 'Получить пользовательское поле', action: 'Получить пользовательское поле' },
            getAll: { description: 'Получить все пользовательские поля', action: 'Получить все пользовательские поля' },
            delete: { description: 'Удалить пользовательское поле', action: 'Удалить пользовательское поле' },
        },
        fieldTypes: {
            string: 'Строка',
            integer: 'Целое число',
            double: 'Дробное число',
            boolean: 'Да/Нет',
            enumeration: 'Список',
            date: 'Дата',
            datetime: 'Дата и время',
            file: 'Файл',
            money: 'Деньги',
            url: 'URL',
        },
        fields: {
            fieldId: 'ID поля',
            fieldIdDescription: 'ID пользовательского поля',
            fieldName: 'Название поля',
            fieldNameDescription: 'Название поля (например: UF_CRM_CUSTOM_FIELD)',
            fieldLabel: 'Отображаемое название',
            fieldLabelDescription: 'Отображаемое название поля',
            fieldType: 'Тип поля',
            fieldTypeDescription: 'Тип пользовательского поля',
            listValues: 'Значения списка',
            listValuesDescription: 'Значения для списка',
            value: 'Значение',
            valueDescription: 'Значение элемента списка',
            multiple: 'Множественное',
            multipleDescription: 'Множественное поле',
            mandatory: 'Обязательное',
            mandatoryDescription: 'Обязательное поле',
            showFilter: 'Показывать в фильтре',
            showFilterDescription: 'Показывать в фильтре',
            showInList: 'Показывать в списке',
            showInListDescription: 'Показывать в списке',
        },
    },

    smartProcess: {
        displayName: 'Битрикс24 Смарт-процесс',
        description: 'Управление смарт-процессами в Битрикс24',
        resources: {
            type: 'Смарт-процесс',
            item: 'Элемент',
        },
        operations: {
            create: { description: 'Создать смарт-процесс', action: 'Создать смарт-процесс' },
            get: { description: 'Получить смарт-процесс', action: 'Получить смарт-процесс' },
            list: { description: 'Получить список смарт-процессов', action: 'Получить список смарт-процессов' },
            update: { description: 'Обновить смарт-процесс', action: 'Обновить смарт-процесс' },
            delete: { description: 'Удалить смарт-процесс', action: 'Удалить смарт-процесс' },
        },
        itemOperations: {
            create: { description: 'Создать элемент', action: 'Создать элемент' },
            get: { description: 'Получить элемент', action: 'Получить элемент' },
            list: { description: 'Получить список элементов', action: 'Получить список элементов' },
            update: { description: 'Обновить элемент', action: 'Обновить элемент' },
            delete: { description: 'Удалить элемент', action: 'Удалить элемент' },
        },
        fields: {
            entityTypeId: 'Тип смарт-процесса',
            entityTypeIdDescription: 'Выберите тип смарт-процесса',
            title: 'Название',
            titleDescription: 'Название смарт-процесса',
            id: 'ID',
            idDescription: 'ID смарт-процесса',
            isStagesEnabled: 'Стадии',
            isStagesEnabledDescription: 'Включить поддержку стадий',
            isCategoriesEnabled: 'Категории',
            isCategoriesEnabledDescription: 'Включить поддержку категорий (воронок)',
            isClientEnabled: 'Клиент',
            isClientEnabledDescription: 'Включить привязку клиента',
            isBeginCloseDatesEnabled: 'Даты начала и завершения',
            isBeginCloseDatesEnabledDescription: 'Включить даты начала и завершения',
            isLinkWithProductsEnabled: 'Привязка товаров',
            isLinkWithProductsEnabledDescription: 'Включить привязку товаров',
            isObserversEnabled: 'Наблюдатели',
            isObserversEnabledDescription: 'Включить поддержку наблюдателей',
            isSourceEnabled: 'Источник',
            isSourceEnabledDescription: 'Включить поле источника',
            isAutomationEnabled: 'Автоматизация',
            isAutomationEnabledDescription: 'Включить автоматизацию (роботы и триггеры)',
            isBizProcEnabled: 'Бизнес-процессы',
            isBizProcEnabledDescription: 'Включить бизнес-процессы',
            isDocumentsEnabled: 'Документы',
            isDocumentsEnabledDescription: 'Включить генерацию документов',
            isRecyclebinEnabled: 'Корзина',
            isRecyclebinEnabledDescription: 'Включить корзину (удалённые элементы)',
            isMycompanyEnabled: 'Моя компания',
            isMycompanyEnabledDescription: 'Включить привязку своей компании',
            createFields: 'Создать поля',
            createFieldsDescription: 'Создать пользовательские поля для смарт-процесса',
            customFields: 'Пользовательские поля',
            customFieldsDescription: 'Список пользовательских полей для создания',
            ufFieldName: 'Код поля',
            ufFieldNameDescription: 'Суффикс кода поля (будет добавлен к UF_CRM_{id}_)',
            ufFieldLabel: 'Название поля',
            ufFieldLabelDescription: 'Отображаемое название поля',
            ufFieldType: 'Тип поля',
            ufFieldTypeDescription: 'Тип пользовательского поля',
            ufMultiple: 'Множественное',
            ufMultipleDescription: 'Множественное поле',
            ufMandatory: 'Обязательное',
            ufMandatoryDescription: 'Обязательное поле',
            ufShowFilter: 'Показывать в фильтре',
            ufShowFilterDescription: 'Показывать поле в фильтре',
            ufListValues: 'Значения списка',
            ufListValuesDescription: 'Значения через запятую (для типа "Список")',
            ufValue: 'Значение',
            ufValueDescription: 'Значение элемента списка',
        },
    },
};

// Английские переводы
const en: ITranslations = {
    displayName: 'Bitrix24',
    description: 'Work with Bitrix24 API',
    
    resources: {
        lead: 'Lead',
        deal: 'Deal',
        contact: 'Contact',
        company: 'Company',
        smartProcess: 'Smart Process',
    },
    
    operations: {
        create: {
            name: 'Create',
            description: 'Create a record',
            action: 'Create a record',
        },
        get: {
            name: 'Get',
            description: 'Get a record',
            action: 'Get a record',
        },
        list: {
            name: 'List',
            description: 'Get list of records',
            action: 'Get list of records',
        },
        update: {
            name: 'Update',
            description: 'Update a record',
            action: 'Update a record',
        },
        delete: {
            name: 'Delete',
            description: 'Delete a record',
            action: 'Delete a record',
        },
    },
    
    fields: {
        resource: 'Resource',
        operation: 'Operation',
        getBy: 'Get By',
        id: 'ID',
        idDescription: 'Record ID',
        filterFields: 'Filter Fields',
        filterFieldsPlaceholder: 'Add Filter Field',
        filterFieldName: 'Field Name',
        filterFieldNameDescription: 'Name of the field to filter by',
        filterOperation: 'Operation',
        filterOperationDescription: 'Comparison operation',
        filterValue: 'Value',
        filterValueDescription: 'Filter value',
        inputFormat: 'Input Format',
        fieldsJson: 'Fields (JSON)',
        fieldsJsonDescription: 'Fields in JSON format',
        fields: 'Fields',
        fieldsDescription: 'Fields for creation/update',
        fieldsPlaceholder: 'Add Field',
        fieldName: 'Field Name',
        fieldNameDescription: 'Name of the field to update',
        fieldValueType: 'Communication Type',
        fieldValueTypeDescription: 'Type of contact data',
        fieldValue: 'Field Value',
        fieldValueDescription: 'Value of the field',
        returnAll: 'Return All',
        returnAllDescription: 'Return all records',
        limit: 'Limit',
        limitDescription: 'Maximum number of records',
        useFilter: 'Use Filter',
        useFilterDescription: 'Use record filtering',
        selectFields: 'Select Fields',
        selectFieldsDescription: 'Select fields to retrieve',
    },
    
    filterOperations: {
        equals: 'Equals',
        notEquals: 'Not Equals',
        greaterThan: 'Greater Than',
        greaterThanOrEqual: 'Greater Than or Equal',
        lessThan: 'Less Than',
        lessThanOrEqual: 'Less Than or Equal',
        contains: 'Contains',
        notContains: 'Not Contains',
        startsWith: 'Starts With',
        endsWith: 'Ends With',
        inList: 'In List',
        notInList: 'Not In List',
    },
    
    inputFormats: {
        form: 'Form',
        formDescription: 'Use form for field input',
        json: 'JSON',
        jsonDescription: 'Use JSON format for field input',
    },
    
    getByOptions: {
        id: 'ID',
        idDescription: 'Get by ID',
        filter: 'Filter',
        filterDescription: 'Get by filter',
    },

    auxiliary: {
        displayName: 'Bitrix24 Auxiliary',
        description: 'Manage auxiliary entities in Bitrix24',
        resources: {
            category: 'Sales Pipeline',
            status: 'Pipeline Status',
            department: 'Department',
            callStatistic: 'Call Statistics',
        },
        operations: {
            create: { description: 'Create an item', action: 'Create an item' },
            update: { description: 'Update an item', action: 'Update an item' },
            get: { description: 'Get an item', action: 'Get an item' },
            getAll: { description: 'Get all items', action: 'Get all items' },
            delete: { description: 'Delete an item', action: 'Delete an item' },
        },
        fields: {
            id: 'ID',
            idDescription: 'Sales pipeline ID',
            name: 'Name',
            nameDescription: 'Sales pipeline name',
            sort: 'Sort',
            sortDescription: 'Pipeline sort order',
            isDefault: 'Is Default',
            isDefaultDescription: 'Default pipeline',
            categoryId: 'Category ID',
            categoryIdDescription: 'Sales pipeline ID',
            statusName: 'Status Name',
            statusNameDescription: 'Status name',
            statusSort: 'Status Sort',
            statusSortDescription: 'Status sort order',
            statusColor: 'Status Color',
            statusColorDescription: 'Status color in HEX format',
            statusSemantic: 'Status Semantic',
            statusSemanticDescription: 'Status semantic (P - in progress, S - success, F - failure)',
            multipleItems: 'Multiple Items',
            multipleItemsDescription: 'Create multiple items',
            items: 'Items',
            itemsDescription: 'List of pipelines to create',
            statusItems: 'Items',
            statusItemsDescription: 'List of statuses to create',
        },
        semantics: {
            process: 'In Progress',
            success: 'Success',
            failure: 'Failure',
        },
        departmentFields: {
            id: 'Department ID',
            idDescription: 'Department identifier',
            name: 'Name',
            nameDescription: 'Department name',
            sort: 'Sort',
            sortDescription: 'Department sort order',
            parent: 'Parent Department',
            parentDescription: 'Parent department ID',
            head: 'Head',
            headDescription: 'Head user ID of the department',
        },
        callFields: {
            filterType: 'Call Type',
            filterTypeDescription: 'Filter by call type',
            filterPhone: 'Phone Number',
            filterPhoneDescription: 'Filter by phone number',
            filterUserId: 'Operator ID',
            filterUserIdDescription: 'Filter by operator user ID',
            filterDateFrom: 'Date From',
            filterDateFromDescription: 'Start of filtering period',
            filterDateTo: 'Date To',
            filterDateToDescription: 'End of filtering period',
            sortField: 'Sort Field',
            sortFieldDescription: 'Field to sort results by',
            sortOrder: 'Sort Order',
            sortOrderDescription: 'Sort direction (ascending/descending)',
        },
        callTypes: {
            outbound: 'Outbound',
            inbound: 'Inbound',
            inboundRedirect: 'Inbound with redirect',
            callback: 'Callback',
        },
        callSortFields: {
            callDuration: 'Call Duration',
            callStartDate: 'Call Start Date',
            cost: 'Cost',
            id: 'ID',
        },
    },

    userField: {
        displayName: 'Bitrix24 User Field',
        description: 'Manage user fields in Bitrix24',
        operations: {
            create: { description: 'Create a user field', action: 'Create a user field' },
            update: { description: 'Update a user field', action: 'Update a user field' },
            get: { description: 'Get a user field', action: 'Get a user field' },
            getAll: { description: 'Get all user fields', action: 'Get all user fields' },
            delete: { description: 'Delete a user field', action: 'Delete a user field' },
        },
        fieldTypes: {
            string: 'String',
            integer: 'Integer',
            double: 'Double',
            boolean: 'Yes/No',
            enumeration: 'List',
            date: 'Date',
            datetime: 'Date and Time',
            file: 'File',
            money: 'Money',
            url: 'URL',
        },
        fields: {
            fieldId: 'Field ID',
            fieldIdDescription: 'User field ID',
            fieldName: 'Field Name',
            fieldNameDescription: 'Field name (e.g., UF_CRM_CUSTOM_FIELD)',
            fieldLabel: 'Field Label',
            fieldLabelDescription: 'Display name of the field',
            fieldType: 'Field Type',
            fieldTypeDescription: 'User field type',
            listValues: 'List Values',
            listValuesDescription: 'Values for the list',
            value: 'Value',
            valueDescription: 'List item value',
            multiple: 'Multiple',
            multipleDescription: 'Multiple field',
            mandatory: 'Mandatory',
            mandatoryDescription: 'Mandatory field',
            showFilter: 'Show in Filter',
            showFilterDescription: 'Show in filter',
            showInList: 'Show in List',
            showInListDescription: 'Show in list',
        },
    },

    smartProcess: {
        displayName: 'Bitrix24 Smart Process',
        description: 'Manage smart processes in Bitrix24',
        resources: {
            type: 'Smart Process',
            item: 'Item',
        },
        operations: {
            create: { description: 'Create a smart process', action: 'Create a smart process' },
            get: { description: 'Get a smart process', action: 'Get a smart process' },
            list: { description: 'Get list of smart processes', action: 'Get list of smart processes' },
            update: { description: 'Update a smart process', action: 'Update a smart process' },
            delete: { description: 'Delete a smart process', action: 'Delete a smart process' },
        },
        itemOperations: {
            create: { description: 'Create an item', action: 'Create an item' },
            get: { description: 'Get an item', action: 'Get an item' },
            list: { description: 'Get list of items', action: 'Get list of items' },
            update: { description: 'Update an item', action: 'Update an item' },
            delete: { description: 'Delete an item', action: 'Delete an item' },
        },
        fields: {
            entityTypeId: 'Smart Process Type',
            entityTypeIdDescription: 'Select the smart process type',
            title: 'Title',
            titleDescription: 'Smart process title',
            id: 'ID',
            idDescription: 'Smart process ID',
            isStagesEnabled: 'Stages',
            isStagesEnabledDescription: 'Enable stages support',
            isCategoriesEnabled: 'Categories',
            isCategoriesEnabledDescription: 'Enable categories (pipelines) support',
            isClientEnabled: 'Client',
            isClientEnabledDescription: 'Enable client binding',
            isBeginCloseDatesEnabled: 'Begin/Close Dates',
            isBeginCloseDatesEnabledDescription: 'Enable begin and close dates',
            isLinkWithProductsEnabled: 'Link with Products',
            isLinkWithProductsEnabledDescription: 'Enable product linking',
            isObserversEnabled: 'Observers',
            isObserversEnabledDescription: 'Enable observers support',
            isSourceEnabled: 'Source',
            isSourceEnabledDescription: 'Enable source field',
            isAutomationEnabled: 'Automation',
            isAutomationEnabledDescription: 'Enable automation (robots and triggers)',
            isBizProcEnabled: 'Business Processes',
            isBizProcEnabledDescription: 'Enable business processes',
            isDocumentsEnabled: 'Documents',
            isDocumentsEnabledDescription: 'Enable document generation',
            isRecyclebinEnabled: 'Recycle Bin',
            isRecyclebinEnabledDescription: 'Enable recycle bin (deleted items)',
            isMycompanyEnabled: 'My Company',
            isMycompanyEnabledDescription: 'Enable own company binding',
            createFields: 'Create Fields',
            createFieldsDescription: 'Create custom fields for the smart process',
            customFields: 'Custom Fields',
            customFieldsDescription: 'List of custom fields to create',
            ufFieldName: 'Field Code',
            ufFieldNameDescription: 'Field code suffix (will be prefixed with UF_CRM_{id}_)',
            ufFieldLabel: 'Field Label',
            ufFieldLabelDescription: 'Display name of the field',
            ufFieldType: 'Field Type',
            ufFieldTypeDescription: 'User field type',
            ufMultiple: 'Multiple',
            ufMultipleDescription: 'Multiple field',
            ufMandatory: 'Mandatory',
            ufMandatoryDescription: 'Mandatory field',
            ufShowFilter: 'Show in Filter',
            ufShowFilterDescription: 'Show field in filter',
            ufListValues: 'List Values',
            ufListValuesDescription: 'Comma-separated values (for "List" type)',
            ufValue: 'Value',
            ufValueDescription: 'List item value',
        },
    },
};

// Словарь переводов
const translations: Record<SupportedLanguage, ITranslations> = {
    ru,
    en,
};

// Определяем язык системы n8n
// Если передан language — используем его, иначе fallback на переменные окружения
export const detectLanguage = (language?: string): SupportedLanguage => {
    // Приоритет: явно переданный параметр > N8N_DEFAULT_LANGUAGE > N8N_DEFAULT_LOCALE > 'ru'
    const lang = language || process.env.N8N_DEFAULT_LANGUAGE || process.env.N8N_DEFAULT_LOCALE;

    if (lang === 'en') {
        return 'en';
    }

    // По умолчанию возвращаем русский (основная аудитория — пользователи Bitrix24)
    return 'ru';
};

// Получить переводы для конкретного языка
export const getTranslations = (lang?: SupportedLanguage): ITranslations => {
    const language = lang || detectLanguage();
    return translations[language] || translations.en;
};

// Получить конкретный перевод по пути
export const getTranslation = (path: string, lang?: SupportedLanguage): string => {
    const t = getTranslations(lang);
    const keys = path.split('.');
    let result: any = t;
    
    for (const key of keys) {
        if (result[key] === undefined) {
            return path; // Возвращаем путь, если перевод не найден
        }
        result = result[key];
    }
    
    return typeof result === 'string' ? result : path;
};

// Вспомогательная функция для подстановки переводов в описании узла
export const applyTranslations = (description: INodeTypeDescription, lang?: SupportedLanguage): INodeTypeDescription => {
    const t = getTranslations(lang);
    const result = { ...description };
    
    // Применяем переводы для свойств узла
    if (result.displayName) {
        result.displayName = t.displayName;
    }
    
    if (result.description) {
        result.description = t.description;
    }
    
    // Переводим свойства
    if (result.properties && Array.isArray(result.properties)) {
        for (const property of result.properties) {
            // Переводим имя свойства если есть соответствующий перевод
            if (property.name && property.displayName) {
                const fieldKey = `fields.${property.name}`;
                const translation = getTranslation(fieldKey, lang);
                if (translation !== fieldKey) {
                    property.displayName = translation;
                }
            }
            
            // Переводим описание свойства если есть соответствующий перевод
            if (property.name && property.description) {
                const descKey = `fields.${property.name}Description`;
                const translation = getTranslation(descKey, lang);
                if (translation !== descKey) {
                    property.description = translation;
                }
            }
            
            // Переводим опции
            if (property.options && Array.isArray(property.options)) {
                for (const option of property.options) {
                    // Для ресурсов
                    if (property.name === 'resource' && 'value' in option && typeof option.value === 'string') {
                        const resKey = `resources.${option.value}`;
                        const translation = getTranslation(resKey, lang);
                        if (translation !== resKey) {
                            option.name = translation;
                        }
                    }
                    
                    // Для операций
                    if (property.name === 'operation' && 'value' in option && typeof option.value === 'string') {
                        // Имя операции
                        const nameKey = `operations.${option.value}.name`;
                        const nameTranslation = getTranslation(nameKey, lang);
                        if (nameTranslation !== nameKey) {
                            option.name = nameTranslation;
                        }
                        
                        // Описание операции
                        if ('description' in option) {
                            const descKey = `operations.${option.value}.description`;
                            const descTranslation = getTranslation(descKey, lang);
                            if (descTranslation !== descKey) {
                                option.description = descTranslation;
                            }
                        }
                        
                        // Действие операции
                        if ('action' in option) {
                            const actionKey = `operations.${option.value}.action`;
                            const actionTranslation = getTranslation(actionKey, lang);
                            if (actionTranslation !== actionKey) {
                                option.action = actionTranslation;
                            }
                        }
                    }
                    
                    // Для getBy
                    if (property.name === 'getBy' && 'value' in option && typeof option.value === 'string') {
                        const getByKey = `getByOptions.${option.value}`;
                        const translation = getTranslation(getByKey, lang);
                        if (translation !== getByKey) {
                            option.name = translation;
                        }
                        
                        if ('description' in option) {
                            const descKey = `getByOptions.${option.value}Description`;
                            const descTranslation = getTranslation(descKey, lang);
                            if (descTranslation !== descKey) {
                                option.description = descTranslation;
                            }
                        }
                    }
                    
                    // Для операций фильтрации
                    if (property.name === 'operation' && property.displayName === 'Operation' && 'value' in option && option.value) {
                        const opKey = `filterOperations.${option.value === 'equals' ? 'equals' : option.value}`;
                        const translation = getTranslation(opKey, lang);
                        if (translation !== opKey) {
                            option.name = translation;
                        }
                    }
                    
                    // Для формата ввода
                    if (property.name === 'inputFormat' && 'value' in option && typeof option.value === 'string') {
                        const formatKey = `inputFormats.${option.value}`;
                        const translation = getTranslation(formatKey, lang);
                        if (translation !== formatKey) {
                            option.name = translation;
                        }
                        
                        if ('description' in option) {
                            const descKey = `inputFormats.${option.value}Description`;
                            const descTranslation = getTranslation(descKey, lang);
                            if (descTranslation !== descKey) {
                                option.description = descTranslation;
                            }
                        }
                    }
                }
            }
        }
    }
    
    return result;
}; 