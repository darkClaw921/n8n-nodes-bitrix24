import { INodePropertyOptions } from 'n8n-workflow';
import { BitrixResourceType } from './types';

export class Deal {
    static resource: BitrixResourceType = 'deal';
    
    static getDescription(): INodePropertyOptions {
        return {
            name: 'Deal',
            value: 'deal',
        };
    }

    // Методы специфичные для Deal
    static getDefaultFields(): string[] {
        return ['TITLE', 'TYPE_ID', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'COMPANY_ID', 'CONTACT_ID', 'OPENED', 'ASSIGNED_BY_ID'];
    }
} 