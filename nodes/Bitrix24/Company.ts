import { INodePropertyOptions } from 'n8n-workflow';
import { BitrixResourceType } from './types';

export class Company {
    static resource: BitrixResourceType = 'company';
    
    static getDescription(): INodePropertyOptions {
        return {
            name: 'Company',
            value: 'company',
        };
    }

    // Методы специфичные для Company
    static getDefaultFields(): string[] {
        return ['TITLE', 'COMPANY_TYPE', 'INDUSTRY', 'PHONE', 'EMAIL', 'WEB', 'OPENED', 'ASSIGNED_BY_ID'];
    }
} 