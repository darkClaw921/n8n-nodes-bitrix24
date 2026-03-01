'use strict';

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
