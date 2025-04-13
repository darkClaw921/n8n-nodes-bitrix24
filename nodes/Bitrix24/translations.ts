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
}

// Русские переводы
const ru: ITranslations = {
    displayName: 'Битрикс24',
    description: 'Работа с Битрикс24 API',
    
    
    
    resources: {
        lead: 'Лид',
        deal: 'Сделка',
        contact: 'Контакт',
        company: 'Компания',
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
};

// Словарь переводов
const translations: Record<SupportedLanguage, ITranslations> = {
    ru,
    en,
};

// Определяем язык системы n8n
export const detectLanguage = (): SupportedLanguage => {
    // Проверяем наличие переменной окружения с языком
    const envLanguage = process.env.N8N_DEFAULT_LANGUAGE;
    console.log(`Текущий язык из переменной окружения: ${envLanguage}`);
    
    // Если переменная установлена и равна 'ru', возвращаем русский язык
    if (envLanguage === 'ru') {
        return 'ru';
    }

    // По умолчанию возвращаем английский
    return 'en';
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