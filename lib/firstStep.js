const cmd = require('../main');
const utils = require('@iobroker/adapter-core');

let adapter;
const bla = cmd.getName;
//const test = utils.config.valueOf(import());

const id = 'Test';

console.log(bla);
//console.log(cmd.setting.host)



       adapter.setObjectNotExist(id, {
            type: 'state',
            common: {
                name: id,
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });


module.exports = bla;

/*
    this.adapter.setObjectNotExists(stateId, {
        type: 'state',
        common: {name: id},
    }, () => {
        this.adapter.setState(stateId, JSON.stringify(params), true, () => {
            callback();
        });

 */