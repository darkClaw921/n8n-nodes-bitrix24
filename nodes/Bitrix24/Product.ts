import { INodePropertyOptions } from 'n8n-workflow';
import { BitrixResourceType } from './types';

export class Product {
    static resource: BitrixResourceType = 'product';

    static getDescription(): INodePropertyOptions {
        return {
            name: 'Product',
            value: 'product',
        };
    }

    static getDefaultFields(): string[] {
        return ['NAME', 'PRICE', 'CURRENCY_ID', 'DESCRIPTION', 'ACTIVE', 'SECTION_ID', 'SORT', 'VAT_ID', 'VAT_INCLUDED', 'MEASURE'];
    }
}
