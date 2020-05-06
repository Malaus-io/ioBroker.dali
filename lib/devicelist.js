const dali = require('./dali');


//const query [device type, groups 0,7 , groups 8,15, physical min level, actual level]
//const queryDali = ['0x99', '0xc0', '0xc1', '0x9a', '0xa0'];
const queryDali = {
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1',
    off: '0x00',
    up: '0x01',
    down: '0x02',
    stepUp: '0x03',
    stepDown: '0x04'
}
const queryEDali = {
    switchState: '0xc0',
    eventSource: '0xbe'
}
const jalousieLevel = {0: 'Off', 99: 'Down', 100: 'Up'}
const accessMode = {0: 'Master Mode', 1: 'Event Message Mode', 2: 'Slave Mode'};
const motionState = {0: 'No Motion', 1: 'Motion detected', 2: 'Current Motion'}

const daliSize = ['0x03', '0x04', '0x06'];
//const daliClass []
const daliClass = ['0x00', '0x05'];

const daliGetHex = ['01', '03', '05', '07', '09', '0b', '0d', '0f', '11', '13', '15', '17', '19', '1b', '1d', '1f', '21', 
'23', '25', '27', '29', '2b', '2d', '2f', '31', '33', '35', '37', '39', '3b', '3d', '3f', '41', '43', '45', '47', '49', 
'4b', '4d', '4f', '51', '53', '55', '57', '59', '5b', '5d', '5f', '61', '63', '65', '67', '69', '6b', '6d', '6f', '71', 
'73', '75', '77', '79', '7b', '7d', '7f', '81', '83', '85', '87', '89', '8b', '8d', '8f', '91', '93', '95', '97', '99', 
'9b', '9d', '9f', '01', '03', '05', '07', '09', '0b', '0d', '0f', '11', '13', '15', '17', '19', '1b', '1d', '1f', '21', 
'23', '25', '27', '29', '2b', '2d', '2f', '31', '33', '35', '37', '39', '3b', '3d', '3f', '41', '43', '45', '47', '49', 
'4b', '4d', '4f', '51', '53', '55', '57', '59', '5b', '5d', '5f', '61', '63', '65', '67', '69', '6b', '6d', '6f', '71', 
'73', '75', '77', '79', '7b', '7d', '7f'
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

    color: {
        type: 'state',
        common: {
            name: 'Color',
            type: 'number',
            min: 0,
            max: 255, 
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
            write: false,
            states: '16: T1short; 17: T1long; 32: T2short; 34: T2long; 64: T3short; 68: T3long; 128: T4short; 136: T4long'
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

    jalousieState: {
        type: 'state',
        common: {
            name: 'Jalousie State',
            type: 'number',
            role: 'state',
            read: true,
            write: false,
            states: '0: Off; 99: Down; 100: Up'
        }
    },

    motionState: {
        type: 'state',
        common: {
            name: 'Motion State',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    illuminance: {
        type: 'state',
        common: {
            name: 'actual Illuminance',
            type: 'number',
            unit: 'lux',
            read: true,
            write: true
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

    accessMode: {
        type: 'state',
        common: {
            name: 'Access Mode',
            type: 'string',
            role: 'state',
            read: true,
            write: false
        }
    },

    lightMode: {
        type: 'state',
        common: {
            name: 'Light Mode',
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

    off: {
        type: 'state',
        common: {
            name: 'OFF', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    up: {
        type: 'state',
        common: {
            name: 'Up', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    down: {
        type: 'state',
        common: {
            name: 'Down', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    stepUp: {
        type: 'state',
        common: {
            name: 'Step Up', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    stepDown: {
        type: 'state',
        common: {
            name: 'Step Down', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    upstairs: {
        type: 'state',
        common: {
            name: 'Level Upstairs', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    downstairs: {
        type: 'state',
        common: {
            name: 'Level Downstairs', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    goToSecene0: {
        type: 'state',
        common: {
            name: 'Scene 0', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    goToSecene1: {
        type: 'state',
        common: {
            name: 'Scene 1', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    goToSecene2: {
        type: 'state',
        common: {
            name: 'Scene 2', 
            role: 'button', 
            type: 'boolean', 
            read: false, 
            write: true, 
            def: false
        }
    },

    goToSecene3: {
        type: 'state',
        common: {
            name: 'Scene 3', 
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

    devices: {
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
        this.illuminance = null;
        this.newIlluminance = null;
        
        
    }
    async callUp(){
        return {level: await this.getLevel(),
                color: await this.getColor(),
                min: await this.getMinLevel(),
                group: await this.getGroup(),
                switchState: await this.getState(),
                eventSource: await this.getSource(),
                type: await this.getType(),
                up: await this.setUp(),
                down: await this.setDown(),
                stepUp: await this.setStepUp(),
                stepDown: await this.setStepDown(),
                off: await this.setOff(),
                jalousieState: await this.getLevel(),
                upstairs: await this.setUpstairs(),
                downstairs: await this.setDownstairs(),
                goToSecene0: await this.goToSecene0(),
                goToSecene1: await this.goToSecene1(),
                goToSecene2: await this.goToSecene2(),
                goToSecene3: await this.goToSecene3(),
                motionState: await this.getMotionState(),
                accessMode: await this.getAccessMode(),
                lightMode: await this.getLightMode(),
                illuminance: await this.getIlluminance()
                


        }
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
    getRelayState(){
        return null;
    }
    setNewRelayState(){
        return null;
    }
    setIdentify(){
        return null;
    }
    setUp(){
        return null;
    }
    setDown(){
        return null;
    }
    setStepUp(){
        return null;
    }
    setStepDown(){
        return null;
    }
    setOff(){
        return null;
    }
    getJalState(){
        return null;
    }
    setUpstairs(){
        return null;
    }
    setDownstairs(){
        return null;
    }
    goToSecene0(){
        return null;
    }
    goToSecene1(){
        return null;
    }
    goToSecene2(){
        return null;
    }
    goToSecene3(){
        return null;
    }
    getColor(){
        return null;
    }
    getLightMode(){
        return null;
    }
    getAccessMode(){
        return null;
    }
    getMotionState(){
        return null;
    }
    getNewMotionState(){
        return null;
    }
    setNewMotionState(){
        return null;
    }
    getStates(){
        return null;
    }
    getIlluminance(){
        return null;
    }
    getNewIlluminance(){
        return null;
    }
    setNewIlluminance(){
        return null;
    }

    

    static fromType(dali, type, name, address, busAdd, busName, size, daliClass) {

        if(type === 'LED Modules' || type === 'Dali 3ch LED DIMMER bright' ) {
            return new Lamp(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Dali Switch' || type === 'Dali MC+' || type === 'Dali MC') {
            return new DaliSwitch(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Group') {
            return new Group(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Relays') {
            return new Relay(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Fluoresecent Lamps') {
            return new Jalousie(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Dali CS Temp') {
            return new Dalimotion(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Dali Touch') {
            return new DaliTouch(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Dali Sequencer') {
            return new Sequenzer(dali, type, name, address, busAdd, busName, size, daliClass);
        }
        if(type === 'Dali 3ch LED DIMMER color' || type === 'Dali 3ch LED DIMMER red' || type === 'Dali 3ch LED DIMMER green' || type === 'Dali 3ch LED DIMMER blue') {
            return new DaliRGBcolor(dali, type, name, address, busAdd, busName, size, daliClass);
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
    async getStates(){

        return {
            switch: {
                name: this.name,
                old: await this.getState(),
                new: await this.getNewState(),
                set: data => this.setNewState(data)
            }
        }
    }

    // @ts-ignore
    getName(){
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
class Dalimotion extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.switchState;
        states.eventSource;
    }

    // @ts-ignore
    async getMotionState() {

        if(this.state === null){

            const data = await this.dali.getInfo(this.busAdd, this.address, '0xc8', this.size, this.daliClass);
            this.state = motionState[data[14]]
        }

        return this.state;
    }

    // @ts-ignore
    async getNewMotionState() {

            const data = await this.dali.getInfo(this.busAdd, this.address, '0xc8', this.size, this.daliClass);
            this.newState = motionState[data[14]]
        
        return this.newState;
    }

    // @ts-ignore
    setNewMotionState(data){

        this.state = motionState[data];
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
    async getAccessMode(){

        const data = await this.dali.getInfo(this.busAdd, this.address, '0xe2', this.size, this.daliClass);
        return data[14]
       
    }

    // @ts-ignore
    async getLightMode(){

        const data = await this.dali.getInfo(this.busAdd, this.address, '0xdb', this.size, this.daliClass);
        if(data[14] === 0){return 'OFF'}
        else{return 'ON'}
       
    }

    // @ts-ignore
    async getIlluminance(){

        if(this.illuminance === null){
            const data = await this.dali.getInfo(this.busAdd, this.address, '0xcd', this.size, this.daliClass);
            this.illuminance = data[14]
        }

        return this.illuminance;
    }

    // @ts-ignore
    async getNewIlluminance(){

        const data = await this.dali.getInfo(this.busAdd, this.address, '0xcd', this.size, this.daliClass);
        this.newIlluminance = data[14]
        return this.newIlluminance;

    }

    // @ts-ignore
    setNewIlluminance(data){

        this.illuminance = data;
    }

    // @ts-ignore
    async getStates(){

        return {
            motion: {
                name: 'motionState',
                old: await this.getMotionState(),
                new: await this.getNewMotionState(),
                set: data => this.setNewMotionState(data)
            },
            brightness: {
                name: 'illuminance',
                old: await this.getIlluminance(),
                new: await this.getNewIlluminance(),
                set: data => this.setNewIlluminance(data)

            }

        }
    }

    // @ts-ignore
    getName(){
        return this.name;
    }

    getType() {
        return this.type;
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
class DaliTouch extends Device {

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
class Sequenzer extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.switchState;
        states.eventSource;
    }

    
    // @ts-ignore
    async getGroup07(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group07, this.size, this.daliClass);
        cacheGroup[0] = data[14];
    }

    // @ts-ignore
    async getGroup815(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group815, this.size, this.daliClass);
        cacheGroup[1] = data[14];
    }

    getGroup(){

        if(!this.group){
            this.group = this.dali.getGroup(cacheGroup[0], cacheGroup[1]);
        }
        
        return this.group;
    }

    // @ts-ignore
    setOff(){
        return true;
    }
    // @ts-ignore
    goToSecene0(){
        return true;
    }
    // @ts-ignore
    goToSecene1(){
        return true;
    }
    // @ts-ignore
    goToSecene2(){
        return true;
    }
    // @ts-ignore
    goToSecene3(){
        return true;
    }

    // @ts-ignore
    getName(){
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
    
    // @ts-ignore
    async getLevel() {

        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            this.level = Math.round((data[14] / 254) * 100);
        }
        
        return this.level
    }

    setNewLevel(data){
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
    setUp(){
        return true;
   }

    // @ts-ignore
    setDown(){
        return true;
   }

    // @ts-ignore
    setStepUp(){
        return true;
   }

    // @ts-ignore
    setStepDown(){
        return true;
   }

    getType() {
        return this.type;
    }
    // @ts-ignore
    getName(){
        return this.name;
    }

    getLevelId(){
        return this.name;
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

    // @ts-ignore
    getLevelpos (){
        return daliLevel[daliGetHex.indexOf(this.address)]
    }

}
class DaliRGBcolor extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }
    
    // @ts-ignore
    async getColor() {

        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            this.level = data[14];
        }
        
        return this.level
    }

    setNewColor(data){
        this.level = data;
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
    setUp(){
        return true;
   }

    // @ts-ignore
    setDown(){
        return true;
   }

    // @ts-ignore
    setStepUp(){
        return true;
   }

    // @ts-ignore
    setStepDown(){
        return true;
   }

    getType() {
        return this.type;
    }
    // @ts-ignore
    getName(){
        return this.name;
    }

    getLevelId(){
        return this.name;
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

    // @ts-ignore
    getLevelpos (){
        return daliLevel[daliGetHex.indexOf(this.address)]
    }

}
class Relay extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }
    
    // @ts-ignore
    async getRelayState() {

        if(this.relay === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            const r = Math.round((data[14] / 254) * 100);
            if(r>0){this.relay = true}
            else{this.relay = false}
        }
        
        return this.relay
    }

    // @ts-ignore
    setNewRelayState(data){
        console.debug('setnewlevel ' + data)
        this.relay = data;
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
    setIdentify(){
        return true;
    }

    getType() {
        return this.type;
    }
    // @ts-ignore
    getName(){
        console.debug('name devicelist ' + this.name)
        return this.name;
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

    // @ts-ignore
    getLevelpos (){
        return daliLevel[daliGetHex.indexOf(this.address)]
    }

}
class Jalousie extends Device {

    constructor(dali, type, name, address, busAdd, busName, size, daliClass) {
        super(dali, type, name, address, busAdd, busName, size, daliClass);

        console.log(this.info);

        states.level,
        states.min,
        states.group
        
    }
    
    // @ts-ignore
    async getLevel() {

       
        if(this.level === null) {
            const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
            console.debug('data ' + data[14])
            
            this.level = data[14];

        }
        console.debug('level device OLD ' + this.level)
        return this.level
    }

    async getNewJalState() {

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.level, daliSize[0], daliClass[0]);
        this.newLevel = jalousieLevel[data[14]];
        console.debug('level device NEW ' + this.newLevel)
        return this.newLevel
     }

     setNewLevel(data){
console.debug('setnewstate')
        this.level = data;
    }

    // @ts-ignore
    async getGroup07(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group07, this.size, this.daliClass);
        cacheGroup[0] = data[14];
    }

    // @ts-ignore
    async getGroup815(){

        const data = await this.dali.getInfo(this.busAdd, this.address, queryDali.group815, this.size, this.daliClass);
        cacheGroup[1] = data[14];
    }

    getGroup(){

        if(!this.group){
            this.group = this.dali.getGroup(cacheGroup[0], cacheGroup[1]);
        }
        
        return this.group;
    }

    // @ts-ignore
    /*
    async getStates(data){

        return {
            state: {
                name: 'jalousieState',
                old: await this.getJalState(),
                new: await this.getNewJalState(),
                set: data => this.setNewJalState(data)
            }
        }
    }*/
    
    // @ts-ignore
    setUpstairs(){
        return true;
   }

   // @ts-ignore
   setOff(){
        return true;
    }

    // @ts-ignore
    setDownstairs(){
        return true;
   }
    // @ts-ignore
    goToSecene0(){
        return true;
    }
    // @ts-ignore
    goToSecene1(){
        return true;
    }
    // @ts-ignore
    goToSecene2(){
        return true;
    }
    // @ts-ignore
    goToSecene3(){
        return true;
    }
    getType() {
        return this.type;
    }
    // @ts-ignore
    getName(){
        return this.name;
    }

    getLevelId(){
        return 'jalousieState'
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
        this.level = data;
    }

    // @ts-ignore
    getName(){
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
        return this.busName + '.groups.';
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

