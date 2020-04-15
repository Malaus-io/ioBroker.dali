const net = require('net');
const lib = require('./devicelist');

//const daliSize [DALI 16bit, DALI 25bit (eDali), DALI 24bit]
const daliSize = ['0x03', '0x04', '0x06'];
//const daliClass [Class 0, Class 1, Class 2, Class 3, Class 4, Class 5, Class 6, Class 7]
const daliClass = ['0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07'];
const queryType = {dali: '0x99', edali: '0x31' }
const queryDali = {
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1',
    off: '0x00',
    up: '0x01',
    down: '0x02',
    stepUp: '0x03',
    stepDown: '0x04',
    recallMax: '0x05',
    recalMin: '0x06',
}
//const queryEDali [Switch Status 0-4, Event Source ]
const queryEDali = ['0xc0', '0xbe'];


const accessMode = {0: 'Master Mode', 1: 'Event Message Mode', 2: 'Slave Mode'};

const typeDali = ['Fluoresecent Lamps', 'Emergency lighting', 'Discharge Lamps', 'Low Voltage Halogen Lamps', 'Supply Voltage Regulator', 
                'DALI to 1-10V', 'LED Modules', 'Relays', 'Color Controls', 'Sequencers','unknown' ,'unknown','unknown','unknown','unknown', 
                'Load referencing', 'Thermal Gear Protection', 'Dimming Curve Selection', 'unknown', 'unknown', 'Demand Response',
                 'Thermal Lamp Protection'
];
const typeEDali = ['Dali CS Temp', 'Dali CS Irda', 'Dali CS LS', 'Dali Touch', 'Dali MC', 'Dali Switch', 'Dali MC+', 'wDali Receiver', 
                    'Dali 100k', 'Dali Bluetooth 4.0', 'Dali Corridor Module', 'Dali Daylight BE', 'Dali Sequencer'
];
const group07 = {0: 0, 1: 'g00', 2: 'g01', 4: 'g02', 8: 'g03', 16: 'g04', 32: 'g05', 64: 'g06', 128: 'g07',
                3: 'g00 + g01', 5: 'g00 + g02', 9: 'g00 + g03', 17: 'g00 + g04', 33: 'g00 + g05', 65: 'g00 + 06', 
                129: 'g00 + g07', 6: 'g01 + g02', 10: 'g01 + g03', 18: 'g01 + g04', 34: 'g01 + g05', 66: 'g01 + g06', 
                130: 'g01 + g07', 12: 'g02 + g03', 20: 'g02 + g04', 36: 'g02 + g05', 68: 'g02 + g06', 132: 'g02 + g07', 
                24: 'g03 + g04', 40: 'g03 + g05', 72: 'g03 + g06', 136: 'go3 + g07', 48: 'g04 + g05', 80: 'g04 + g06', 
                144: 'g04 + g07', 96: 'g05 + g06', 160: 'g05 + g07', 192: 'g06 + g07'
}
const group815 = {0: 0, 1: 'g08', 2: 'g09', 4: 'g10', 8: 'g11', 16: 'g12', 32: 'g13', 64: 'g14', 128: 'g15',
                3: 'g08 + g09', 5: 'g08 + g10', 9: 'g08 + g11', 17: 'g08 + g12', 33: 'g08 + g13', 65: 'g08 + 06', 
                129: 'g08 + g15', 6: 'g09 + g10', 10: 'g09 + g11', 18: 'g09 + g12', 34: 'g09 + g13', 66: 'g09 + g14', 
                130: 'g09 + g15', 12: 'g10 + g11', 20: 'g10 + g12', 36: 'g10 + g13', 68: 'g10 + g14', 132: 'g10 + g15', 
                24: 'g11 + g12', 40: 'g11 + g13', 72: 'g11 + g14', 136: 'go3 + g15', 48: 'g12 + g13', 80: 'g12 + g14', 
                144: 'g12 + g15', 96: 'g13 + g14', 160: 'g13 + g15', 192: 'g14 + g15'
}
const searchDevice = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
'a62', 'a63', 'g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 
'g14', 'g15', 'ea00', 'ea01', 'ea02', 'ea03', 'ea04', 'ea05', 'ea06', 'ea07', 'ea08', 'ea09', 'ea10', 'ea11', 'ea12', 'ea13', 
'ea14', 'ea15', 'ea16', 'ea17', 'ea18', 'ea19', 'ea20', 'ea21', 'ea22', 'ea23', 'ea24', 'ea25', 'ea26', 'ea27', 'ea28', 'ea29', 
'ea30', 'ea31', 'ea32', 'ea33', 'ea34', 'ea35', 'ea36', 'ea37', 'ea38', 'ea39', 'ea40', 'ea41', 'ea42', 'ea43', 'ea44', 'ea45', 
'ea46', 'ea47', 'ea48', 'ea49', 'ea50', 'ea51', 'ea52', 'ea53', 'ea54', 'ea55', 'ea56', 'ea57', 'ea58', 'ea59', 'ea60', 'ea61', 
'ea62', 'ea63'
]
const daliName = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
    'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
    'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
    'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
    'a62', 'a63', 'g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 
    'g14', 'g15', 'ea00', 'ea01', 'ea02', 'ea03', 'ea04', 'ea05', 'ea06', 'ea07', 'ea08', 'ea09', 'ea10', 'ea11', 'ea12', 'ea13', 
    'ea14', 'ea15', 'ea16', 'ea17', 'ea18', 'ea19', 'ea20', 'ea21', 'ea22', 'ea23', 'ea24', 'ea25', 'ea26', 'ea27', 'ea28', 'ea29', 
    'ea30', 'ea31', 'ea32', 'ea33', 'ea34', 'ea35', 'ea36', 'ea37', 'ea38', 'ea39', 'ea40', 'ea41', 'ea42', 'ea43', 'ea44', 'ea45', 
    'ea46', 'ea47', 'ea48', 'ea49', 'ea50', 'ea51', 'ea52', 'ea53', 'ea54', 'ea55', 'ea56', 'ea57', 'ea58', 'ea59', 'ea60', 'ea61', 
    'ea62', 'ea63','s00', 's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15'
];
const daliGetHex = ['01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F', '81', '83', '85', '87', '89', '8B', '8D', '8F', '91', '93', '95', '97', '99', 
    '9B', '9D', '9F', '01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F'
];
const daliSetHex = ['00', '02', '04', '06', '08', '0A', '0C', '0E', '10', '12', '14', '16', '18', '1A', '1C', '1E', 
    '20', '22', '24', '26', '28', '2A', '2C', '2E', '30', '32', '34', '36', '38', '3A', '3C', '3E', '40', '42', '44', '46', 
    '48', '4A', '4C', '4E', '50', '52', '54', '56', '58', '5A', '5C', '5E', '60', '62', '64', '66', '68', '6A', '6C', '6E', 
    '70', '72', '74', '76', '78', '7A', '7C', '7E', '80', '82', '84', '86', '88', '8A', '8C', '8E', '90', '92', '94', '96', 
    '98', '9A', '9C', '9E', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', '1E', '1F', 
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', '1E', '1F'
];
const daliLevel = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 
    44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 
    84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 
    122, 124, 126, 128, 130, 132, 134, 136
];


class Dali4Net {
    constructor(adapter, host, port, bus0, bus1, bus2, bus3) {
       
        console.debug = (message) => {
            this.adapter.log.debug(message);
        }

        this.adapter = adapter;
        this.devices = [];
        this.host = host;
        this.port = port;
        this.bus = {
            0: {
                name: 'bus0', 
                status: bus0, 
                address: '0x01'
            }, 
            1: {
                name: 'bus1', 
                status: bus1, 
                address: '0x02'
                }, 
            2: {
                name: 'bus2', 
                status: bus2, 
                address: '0x04'
            }, 
            3: {
                name: 'bus3', 
                status: bus3, 
                address: '0x08'
            }
        };
        this.schedule = null;

        this.client = net.connect( { host: host, port: port }, () => {
            this.adapter.log.debug('Connected to server!');
        });

        this.client.once('connect', () => {
            this.adapter.log.info('Connected to server!');
        });

        this.client.on('end', () => {
            this.adapter.log.info('Disconnected from server');
        });
        
        this.client.on('error', (error) => {
            this.adapter.log.error('Error: ' + error);
            this.client.end();
        });
    }

    
    async startSearch(bus) {
       
        let message;
        let typeName;
        this.adapter.log.debug('BUS ' + bus);
        this.adapter.log.debug(this.bus[bus] && this.bus[bus].status);

        if(this.bus[bus] && this.bus[bus].status) {

            for(const i in searchDevice) {
               
                this.adapter.log.debug('Start request ' + daliGetHex[i]);
                const transactionId = this.transactionIdentifier();
                let data;

                if (searchDevice[i].indexOf('e') === 0) {

                    for(const id in daliClass) {
                        
                        message = this.getMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryType.edali, daliSize[1], id);

                        this.adapter.log.debug(JSON.stringify(message));

                        data = await this.sendMessage(message);
                        this.adapter.log.debug('Data ' + JSON.stringify(data));
                        this.adapter.log.debug('Message received ' + daliGetHex[i]);

                        typeName = typeEDali[data[14]];

                        const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {
 
                            await this.createClass (typeName, searchDevice[i], daliGetHex[i], this.bus[bus].address, this.bus[bus].name, daliSize[1], id);
                
                        }
                                
                    }
                
                } else if (searchDevice[i].indexOf('a') === 0)  {

                    message = this.getMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryType.dali, daliSize[0], daliClass[0]);

                    this.adapter.log.debug(JSON.stringify(message));

                    data = await this.sendMessage(message);
                    this.adapter.log.debug('Data ' + JSON.stringify(data));
                    this.adapter.log.debug('Message received ' + daliGetHex[i]);

                    typeName = typeDali[data[14]];

                    const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {

                            await this.createClass (typeName, searchDevice[i], daliGetHex[i], this.bus[bus].address, this.bus[bus].name, daliSize[0], daliClass[0]);
                  
                        }

                } else if (searchDevice[i].indexOf('g') === 0){

                    message = this.getMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryType.dali, daliSize[0], daliClass[0]);
        
                    this.adapter.log.debug(JSON.stringify(message));

                    data = await this.sendMessage(message);
                    this.adapter.log.debug('Data ' + JSON.stringify(data));
                    this.adapter.log.debug('Message received ' + daliGetHex[i]);

                    typeName = 'Group';

                    const exists = this.deviceExists(data, searchDevice[i], typeName);

                        if(exists) {
       
                            await this.createClass (typeName, searchDevice[i], daliGetHex[i], this.bus[bus].address, this.bus[bus].name, daliSize[0], daliClass[0]);
            
                        }
                }  
            }
        this.adapter.log.debug('device result' + this.devices);
        return this.devices;
        }
    }

    async createClass (typeName, searchDevice, daliGetHex, busAdd, busName, size, daliClass){

        try {
             
            this.adapter.log.debug('info ' + typeName + ' ' + daliGetHex + ' ' + searchDevice);
           
            //this.devices.push(searchDevice);
            this.devices[searchDevice] = lib.daliDevice.fromType(this, typeName, searchDevice, daliGetHex, busAdd, busName, size, daliClass);
            
            await this.devices[searchDevice].getLevel();
            await this.devices[searchDevice].getMinLevel();
            await this.devices[searchDevice].getGroup07();
            await this.devices[searchDevice].getGroup815();
            await this.devices[searchDevice].getGroup();
            await this.devices[searchDevice].getLevelpos();
            await this.devices[searchDevice].getState();
            await this.devices[searchDevice].getSource();

        } catch(error) {
            this.adapter.log.error(error);
        }
    }
    
    async getInfo(bus, address, query, size, deviceClass){
  
            const transactionId = this.transactionIdentifier();

            const message = this.getMessage(bus, transactionId, '0x' + address, query, size, deviceClass);
            this.adapter.log.debug(JSON.stringify(message));

            const data = await this.sendMessage(message);
            this.adapter.log.debug('Data ' + JSON.stringify(data));

           return data
    }

    getGroup(info1, info2){

        if (info1 != 0 && info2 === 0){
            this.adapter.log.debug('loop 0');
            return (group07[info1]) ? group07[info1]: 0
        }
        else if (info1 === 0 && info2 != 0){
            this.adapter.log.debug('loop 1');
            return (group815[info2]) ? group815[info2]: 0
        }
        else if (info1 != 0 && info2 != 0){
            this.adapter.log.debug('loop 2');
            return (group07[info1] + ' ' + group815[info2]) ? (group07[info1] + ' ' + group815[info2]): 0
        }

    }

    getMessage(busAddress, transactionId, daliAddress, query, size, daliClass) {
            
        const hexData = [
            busAddress, transactionId, '0x00', '0x00', '0x00', '0x17', busAddress, '0x17', '0x00', '0x65', 
            '0x00', '0x05', '0x00', '0x64', '0x00', '0x06', '0x0c', '0x12', busAddress, '0x00', 
            size, '0x00', daliClass , daliAddress, query, '0x00', '0x00', '0x00', '0x00'
        ];

        return Buffer.from(hexData);
    }
    
    async sendMessage(data) {

        this.adapter.log.debug('Message ' + JSON.stringify(data));
        this.client.write(data);

        return new Promise((resolve)=> {
            this.client.once('data', (data) => {
                resolve(data);
            });
        });
    }

    transactionIdentifier() {
        const min = 0;
        const max = 253;
        const x = Math.floor(Math.random() * (max - min)) + min;
        return '0x' + x.toString(16);
    }

    deviceExists(data, name, typeName) {

        if(data && (data[10] == 130 || data[10] == '0x82')) {
            if (name.indexOf('g') === 0){
                this.adapter.log.info('find group ' + name);
            }else{
                this.adapter.log.info('find ' + name + ' type: ' + typeName);
            }
            return true;
        }
        
        this.adapter.log.debug('find not ' + name);
        return false;
    }

    
////////////////////////////////get State Dali Bus/////////////////////////////////////////////////


    startCounter() {
        
        this.schedule = setInterval(() => this.counterObjects(), 1000);
    }

    destroy() {
        if(this.schedule) {
            clearInterval(this.schedule);
        }

        this.client.destroy();
    }

    async counterObjects() {

        const lampStates = await this.messageLampStates(this.bus[0].address);
        this.adapter.log.info('lampStates ' + JSON.stringify(lampStates));

        try {
            for(const i in this.devices) {

                const device = this.devices[i];

                const name = device.getName();
                this.adapter.log.debug('name ' + name);

                const levelOld = await device.getLevel();
                this.adapter.log.debug('levelodl ' + levelOld);
        
                    if (levelOld != null){
                        
                        let levelNew = 0;
                        const pos = device.getLevelpos();
                        this.adapter.log.debug('pos ' + pos);
                        
                        if(pos != null){

                            levelNew = this.getLevel(lampStates, device.getLevelpos());
                            this.adapter.log.debug('newlevel ' + levelNew);
        
                        }else{

                            levelNew = await device.getNewLevel();
                            this.adapter.log.debug('newLevel ' + levelNew);
                            
                        }

                        if (levelNew != levelOld){

                            device.setNewLevel(levelNew);
                            const path = device.getPath();
                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(levelNew, name, path + name);
                        }
                    }
                
                const stateOld = await device.getState();
                this.adapter.log.debug('stateOld ' + stateOld);
            
                    if (stateOld != null){
                        
                        const stateNew = await device.getNewState();
                        this.adapter.log.debug('newstate ' + stateNew);

                        if (stateNew != stateOld){

                            device.setNewState(stateNew);
                            const path = device.getPath();

                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(stateNew, name, path + name);
                        }
                    }
                
                const relayOld = await device.getRelayState();
                this.adapter.log.debug('relayOld ' + relayOld);

                    if(relayOld != null){

                        const pos = device.getLevelpos();
                        this.adapter.log.debug('pos ' + pos);

                        const r = this.getLevel(lampStates, device.getLevelpos());
                        let relayNew;
                        if(r>0){relayNew = true}
                        else{relayNew = false};
                        this.adapter.log.debug('relayNew ' + relayNew);

                        if (relayNew != relayOld){

                            device.setNewRelayState(relayNew);
                            const path = device.getPath();

                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(relayNew, name, path + name);
                        }
                        
                    }

                const positionOld = await device.getJalState();
                this.adapter.log.debug('JalOld ' + positionOld);

                    if(positionOld != null){

                        const positionNew = await device.getNewJalState();
                        this.adapter.log.debug('newstate ' + positionNew);

                        if (positionNew != positionOld){

                            device.setNewJalState(positionNew);
                            const path = device.getPath();

                            this.adapter.log.debug('path ' + path + name);
                            this.responseState(positionNew, name, path + name);
                        }
                        
                    }
            }
        } catch(error) {
            this.adapter.log.error(error);
        }
    }

    async messageLampStates(busAddress) {
            
        const hexData = [
            busAddress, '0x13', '0x00', '0x00', '0x00', '0x17', busAddress, '0x17', '0x23', '0x28', 
            '0x00', '0x40', '0x00', '0x64', '0x00', '0x06', '0x0c', '0x12', busAddress, '0x00', 
            '0x03', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'
        ];

        const data = Buffer.from(hexData);
        this.adapter.log.debug('create Message lamp ' + JSON.stringify(data));
        this.client.write(data);

        return new Promise((resolve)=> {
            this.client.once('data', (data) => {
                resolve(data);
            });
        });
    }

    responseState (value, name, path) {
        
        this.adapter.setState(this.adapter.namespace + '.' + path, value, true)
            this.adapter.log.info('neu ' + name + ' ' + value)
    }

    getLevel(data, pos = 14) {

        const l = Math.round((data.toJSON().data[pos]/254)*100);

        return (l) ? l : 0;
    }

    ////////////////////////////////set State Dali Bus/////////////////////////////////////////////////


    async sendLampState(bus, value, name, folder) {
       
        let query;
        let lampId;

        if(name === folder){

            query = this.getLevelHex(value);
            this.adapter.log.info('lampLevelhex ' + query);
            lampId = '0x' + daliSetHex[daliName.indexOf(name)];

        }
        if (name === 'off'){


            query = queryDali.off;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }
        if (name === 'up'){


            query = queryDali.up;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }

        if (name === 'down'){


            query = queryDali.down;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }

        if (name === 'stepUp'){


            query = queryDali.stepUp;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }
     
        if (name === 'stepDown'){


            query = queryDali.stepDown;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }
        if (name === 'upstairs'){


            query = queryDali.recallMax;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }

        if (name === 'downstairs'){


            query = queryDali.recalMin;
            this.adapter.log.debug('lampLevelhex ' + query);
            lampId = '0x' + daliGetHex[daliName.indexOf(folder)];
        }

        const transactionId = this.transactionIdentifier();

        this.adapter.log.info('lampId ' + lampId);        
        this.adapter.log.info('lampLevelhex ' + query);

        const message = this.getMessage(this.bus[bus].address, transactionId, lampId, query, daliSize[0], daliClass[0]);
        this.adapter.log.info(JSON.stringify(message));
        
        this.sendMessage(message);
        
    }

    sendGroupState(bus, value, name) {
        
        const transactionId = this.transactionIdentifier();
       
        const groupId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('groupId ' + groupId);
        
        const groupLevel = this.getLevelHex(value);
     
        this.adapter.log.debug('groupLevel ' + groupLevel);

        const message = this.getMessage(this.bus[bus].address, transactionId, groupId, groupLevel, daliSize[0], daliClass[0]); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    }

    sendScene(bus, name) {
     
        const transactionId = this.transactionIdentifier();

        const broadcastScene = '0xfe';
    
        const sceneId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('sceneId ' + sceneId);

        const message = this.getMessage(this.bus[bus].address, transactionId, broadcastScene, sceneId, daliSize[0], daliClass[0]); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    }

    sendBroadcast(bus, value) {
        
        const transactionId = this.transactionIdentifier();
    
        const broadcast = '0xfe';

        const broadcastLevel = this.getLevelHex(value);

        const message = this.getMessage(this.bus[bus].address, transactionId, broadcast, broadcastLevel, daliSize[0], daliClass[0]); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);
    }

    getLevelHex (value) {
        return '0x' + (Math.round((value*254)/100)).toString(16);
    }



    
}

module.exports = Dali4Net;