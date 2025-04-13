import { INodePropertyOptions } from 'n8n-workflow';
import { BitrixResourceType } from './types';

export class Lead {
    static resource: BitrixResourceType = 'lead';
    
    static getDescription(): INodePropertyOptions {
        return {
            name: 'Lead',
            value: 'lead',
        };
    }

    // Методы специфичные для Lead
    static getDefaultFields(): string[] {
        return ['TITLE', 'NAME', 'SECOND_NAME', 'LAST_NAME', 'STATUS_ID', 'OPENED', 'ASSIGNED_BY_ID', 'PHONE', 'EMAIL'];
    }
} 