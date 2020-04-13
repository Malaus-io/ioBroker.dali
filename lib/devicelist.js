const dali = require('./dali');


//const query [device type, groups 0,7 , groups 8,15, physical min level, actual level]
//const queryDali = ['0x99', '0xc0', '0xc1', '0x9a', '0xa0'];
const queryDali = {
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1'
}
const queryEDali = {
    switchState: '0xc0',
    eventSource: '0xbe'
}
const accessMode = {0: 'Master Mode', 1: 'Event Message Mode', 2: 'Slave Mode'};

const daliSize = ['0x03', '0x04', '0x06'];
//const daliClass []
const daliClass = ['0x00', '0x05'];

const daliGetHex = ['01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F', '81', '83', '85', '87', '89', '8B', '8D', '8F', '91', '93', '95', '97', '99', 
    '9B', '9D', '9F', '01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F'
];
const daliLevel = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 
    44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 
    84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 
    122, 124, 126, 128, 130, 132, 134, 136
];

let cacheGroup = {0: 0, 1: 0};


const states = {

    level: {
        type: 'state',
        common: {
            name: 'Level',
            type: 'number',
            min: 0,
            max: 100, 
            unit: '%', 
            role: 'level.dimmer',
            read: true,
            write: true
        }
    },

    switchState: {
        type: 'state',
        common: {
            name: 'Switch State',
            type: 'number',
            role: 'state',
            read: true,
            write: false
        }
    },

    eventSource: {
        type: 'state',
        common: {
            name: 'Event Source',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    min: {
        type: 'state',
        common: {
            name: 'Min Physical Level',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    type: {
        type: 'state',
        common: {
            name: 'Device Type',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    group: {
        type: 'state',
        common: {
            name: 'Group Member',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    scene: {
        type: 'state',
        common: {
            name: 'Scene', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    bus: {
        type: 'device',
        common: {
            name: 'bus'
        }
    },

    lamps: {
        type: 'channel',
        common: {
            name: 'lamps'
        }
    },

    groups: {
        type: 'channel',
        common: {
            name: 'groups'
        }
    },

    scenes: {
        type: 'channel',
        common: {
            name: 'scenes'
        }
    }
}

class Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass, info, state, folder) {
    
        this.dali = dali;
        this.name = name;
        this.folder = folder;
        this.size = size;
        this.daliClass = daliClass;
        this.info = info;
        this.type = type;
        this.busAdd = busAdd;
        this.busName = busName;
        this.address = address;
        this.source = null;
        this.level = null;
        this.min = null;
        this.group = null;
        this.state = null;
        this.newState = null;
        this.newLevel = null;
        
    }

    getName() {
        return null;
    }
    getInfo() {
        return null; //throw new Error('No statedefinition duntion defined');
    }
    getLevel() {
        return null;
    }
    getState() {
        return null;
    }
    getStateDefinition() {
        return null;
    }
    getSource(){
        return null;
    }
    getFolder(){
        return null;
    }
    getSize(){
        return null;
    }
    getClass(){
        return null;
    }
    getMinLevel (){
        return null;
    }
    getGroup07(){
        return null;
    }
    getGroup815(){
        return null;
    }
    getGroup(){
        return null;
    }
    getLevelpos (){
        return null;
    }
    getNewLevel(){
        return null;
    }
    getbusName(){
        return null;
    }
    getPath(){
        return null;
    }
    getNewState(){
        return null;
    }
    getType() {
        return null;
    }

    static fromType(dali, type, name, address, busAdd, busName, size, daliClass) {

        if(type === 'LED Modules') {
            return new Lamp(dali, type, name, address, busAdd, busName, size, daliClass);
        }

        if(type === 'Dali Switch' || type === 'Dali MC+') {
            return new DaliSwitch(dali, type, name, address, busAdd, busName, size, daliClass);
        }

        if(type === 'Group') {
            return new Group(dali, type, name, address, busAdd, busName, size, daliClass);
        }

        throw type + ' is not a valid type.';
    }
}

class DaliSwitch extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.switchState;
        states.eventSource;
    }

    // @ts-ignore
    async getState() {

        if(this.state === null){

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.switchState, this.size, this.daliClass);
            this.state = data[14]
        }

        return this.state;
    }

    // @ts-ignore
    async getNewState() {

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.switchState, this.size, this.daliClass);
            this.newState = data[14]
        
        return this.newState;
    }

    setNewState(data){

        this.state = data;
    }

    // @ts-ignore
    async getSource() {

        if(this.source === null) {

            const data = await this.dali.getInfo(this.busAdd, this.address, queryEDali.eventSource, this.size, this.daliClass);
            this.source = data[14]
        }

        return accessMode[this.source];
    }

    // @ts-ignore
    getName(){
        console.debug('name devicelist ' + this.name)
        return this.name;
    }

    getType() {
        return this.type;
    }

    // @ts-ignore
    getFolder(){
        return '.device'
    }

    // @ts-ignore
    getbusName(){
        return this.busName;
    }

    // @ts-ignore
    getPath(){
        return this.busName + '.devices.' + this.name + '.';
    }

    // @ts-ignore
    getSize(){
        return this.size
    }

    // @ts-ignore
    getClass(){
        return this.daliClass
    }
}

class Lamp extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }
    
    getType() {
        return this.type;
    }

    // @ts-ignore
    async getLevel() {

       console.debug('level device' + this.level)
        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            this.level = Math.round((data[14] / 254) * 100);
        }
        
        return this.level
    }

    setNewLevel(data){
        console.debug('setnewlevel ' + data)
        this.level = data;
    }

    // @ts-ignore
    async getMinLevel (){

        if(!this.min) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.min, daliSize[0], daliClass[0]);
            this.min = Math.round((data[14] / 254) * 100) + '%'
        }

        return this.min;
    }

    // @ts-ignore
    async getGroup07(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group07, daliSize[0], daliClass[0]);
        cacheGroup[0] = data[14];
    }

    // @ts-ignore
    async getGroup815(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group815, daliSize[0], daliClass[0]);
        cacheGroup[1] = data[14];
    }

    getGroup(){

        if(!this.group){
            this.group = this.dali.getGroup(cacheGroup[0], cacheGroup[1]);
        }
        
        return this.group;
    }

    // @ts-ignore
    getName(){
        
        return this.name;
    }

    // @ts-ignore
    getFolder(){
        return '.lamps'
    }

    // @ts-ignore
    getbusName(){
        return this.busName;
    }

    // @ts-ignore
    getPath(){
        return this.busName + '.lamps.' + this.name + '.';
    }

    // @ts-ignore
    getSize(){
        return this.size
    }

    // @ts-ignore
    getClass(){
        return this.daliClass
    }

    // @ts-ignore
    getLevelpos (){
        return daliLevel[daliGetHex.indexOf(this.address)]
    }

}

class Group extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }

    getType() {
        return this.type;
    }

    // @ts-ignore
    async getLevel() {
        
        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            this.level = Math.round((data[14] / 254) * 100);
        }

        return this.level;
    }

    // @ts-ignore
    async getNewLevel() {
        
        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
        this.newLevel = Math.round((data[14] / 254) * 100);

        return this.newLevel;
    }

    setNewLevel(data){
        console.debug('setnewlevel ' + data)
        this.level = data;
    }

    // @ts-ignore
    getName(){
        console.debug('name devicelist ' + this.name)
        return this.name;
    }

    // @ts-ignore
    getFolder(){
        return '.groups'
    }

    // @ts-ignore
    getbusName(){
        return this.busName;
    }

    // @ts-ignore
    getPath(){
        return this.busName + '.groups.' + this.name + '.';
    }

    // @ts-ignore
    getSize(){
        return this.size
    }

    // @ts-ignore
    getClass(){
        return this.daliClass
    }
}   



module.exports = {daliDevice: Device,
                state: states
    }

