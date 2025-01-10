import tsParser from '@typescript-eslint/parser';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      'n8n-nodes-base': n8nNodesBase,
    },
    rules: {
      'n8n-nodes-base/node-param-description-missing-for-return-all': 'off',
      'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
    },
  },
]; 