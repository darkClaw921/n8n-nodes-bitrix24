'use strict';

module.exports = {
    nodeTypes: [
        require('./dist/nodes/Bitrix24/Bitrix24.node.js'),
    ],
    credentialTypes: [
        require('./dist/credentials/Bitrix24Api.credentials.js'),
    ],
}; 