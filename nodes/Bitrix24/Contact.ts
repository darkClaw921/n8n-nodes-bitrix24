import { INodePropertyOptions } from 'n8n-workflow';
import { BitrixResourceType, CommunicationType } from './types';

export class Contact {
    static resource: BitrixResourceType = 'contact';
    
    // Типы значений для полей контакта
    static communicationTypes = [
        { name: 'Work', value: CommunicationType.WORK },
        { name: 'Mobile', value: CommunicationType.MOBILE },
        { name: 'Home', value: CommunicationType.HOME },
        { name: 'Fax', value: CommunicationType.FAX },
        { name: 'Telegram', value: CommunicationType.TELEGRAM },
        { name: 'WhatsApp', value: CommunicationType.WHATSAPP },
        { name: 'Viber', value: CommunicationType.VIBER },
        { name: 'Facebook', value: CommunicationType.FACEBOOK },
        { name: 'Skype', value: CommunicationType.SKYPE },
        { name: 'Other', value: CommunicationType.OTHER },
    ];
    
    static getDescription(): INodePropertyOptions {
        return {
            name: 'Contact',
            value: 'contact',
        };
    }

    // Методы специфичные для Contact
    static getDefaultFields(): string[] {
        return ['NAME', 'SECOND_NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'COMPANY_ID', 'OPENED', 'ASSIGNED_BY_ID', 'TYPE_ID'];
    }
} 