const net = require('net');

//const daliSize [DALI 16bit, DALI 25bit (eDali)]
const daliSize = ['0x03', '0x04'];

const queryLevel = 0x90; //Actual level
//const query [device type, groups 0,7 , groups 8,15, physical min level, actual level]
const query = ['0x99', '0xc0', '0xc1', '0x9a', '0xa0']

const type = ['Fluoresecent Lamps', 'Emergency lighting', 'Discharge Lamps', 'Low Voltage Halogen Lamps', 'Supply Voltage Regulator', 'DALI to 1-10V', 'LED Modules', 'Relays', 'Color Controls', 'Sequencers','unknown' ,'unknown','unknown','unknown','unknown', 'Load referencing', 'Thermal Gear Protection', 'Dimming Curve Selection', 'unknown', 'unknown', 'Demand Response', 'Thermal Lamp Protection']

const group07 = {0: 0, 1: 'g00', 2: 'g01', 4: 'g02', 8: 'g03', 16: 'g04', 32: 'g05', 64: 'g06', 128: 'g07',
                3: 'g00 + g01', 5: 'g00 + g02', 9: 'g00 + g03', 17: 'g00 + g04', 33: 'g00 + g05', 65: 'g00 + 06', 
                129: 'g00 + g07', 6: 'g01 + g02', 10: 'g01 + g03', 18: 'g01 + g04', 34: 'g01 + g05', 66: 'g01 + g06', 
                130: 'g01 + g07', 12: 'g02 + g03', 20: 'g02 + g04', 36: 'g02 + g05', 68: 'g02 + g06', 132: 'g02 + g07', 
                24: 'g03 + g04', 40: 'g03 + g05', 72: 'g03 + g06', 136: 'go3 + g07', 48: 'g04 + g05', 80: 'g04 + g06', 
                144: 'g04 + g07', 96: 'g05 + g06', 160: 'g05 + g07', 192: 'g06 + g07'}
const group815 = {0: 0, 1: 'g08', 2: 'g09', 4: 'g10', 8: 'g11', 16: 'g12', 32: 'g13', 64: 'g14', 128: 'g15'}

const daliName = ['a00', 'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 
    'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 
    'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 
    'a46', 'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 
    'a62', 'a63', 'g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 
    'g14', 'g15', 's00', 's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15',
    'ea1'
];
const daliGetHex = ['01', '03', '05', '07', '09', '0B', '0D', '0F', '11', '13', '15', '17', '19', '1B', '1D', '1F', '21', 
    '23', '25', '27', '29', '2B', '2D', '2F', '31', '33', '35', '37', '39', '3B', '3D', '3F', '41', '43', '45', '47', '49', 
    '4B', '4D', '4F', '51', '53', '55', '57', '59', '5B', '5D', '5F', '61', '63', '65', '67', '69', '6B', '6D', '6F', '71', 
    '73', '75', '77', '79', '7B', '7D', '7F', '81', '83', '85', '87', '89', '8B', '8D', '8F', '91', '93', '95', '97', '99', 
    '9B', '9D', '9F'
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

        this.adapter = adapter;
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
            this.adapter.log.debug('Disconnected from server');
        });
        
        this.client.on('error', (error) => {
            this.adapter.log.error('Error: ' + error);
            this.client.end();
        });
    }

    
    async startSearch(bus) {
        
        this.result = {};

        this.adapter.log.debug('BUS ' + bus);
        this.adapter.log.debug(this.bus[bus] && this.bus[bus].status);

        if(this.bus[bus] && this.bus[bus].status) {

            for(const i in daliName) {
                let message;
                this.adapter.log.debug('Start request ' + daliGetHex[i]);
                const transactionId = this.transactionIdentifier();

                if (daliName[i].indexOf('e') === 0){
                    message = this.getMessage(this.bus[bus].address, transactionId, '0x' + '05', '0xc0', daliSize[1], '0x05');
                    
                    this.adapter.log.debug(JSON.stringify(message));

                    const data = await this.sendMessage(message);
    
                    this.adapter.log.debug('Data ' + JSON.stringify(data));
                    this.adapter.log.debug('Message received ' + daliGetHex[i]);
                    
                    const exists = this.lampExists(data, daliName[i]);
                    
                    if(exists) {

                        //const info = await this.moreInformation(this.bus[bus].address, daliGetHex[i])
                        this.result[daliName[i]] = {
                                                        name: daliName[i],
                                                        //value: Math.round((info[4]/254)*100),  //this.getLevel(data),
                                                        busname: this.bus[bus].name,
                                                        busadd: this.bus[bus].address,
                                                        address: daliGetHex[i],
                                                        //levelpos: daliLevel[i],
                                                        //device: type[info[0]],
                                                        //group: this.getGroup(info[1], info[2]),
                                                        //min: Math.round((info[3]/254)*100)
                        };
                    }

                }else{
                    message = this.getMessage(this.bus[bus].address, transactionId, '0x' + daliGetHex[i], queryLevel, daliSize[0]);
                
                    this.adapter.log.debug(JSON.stringify(message));

                    const data = await this.sendMessage(message);

                    this.adapter.log.debug('Data ' + JSON.stringify(data));
                    this.adapter.log.debug('Message received ' + daliGetHex[i]);
                    
                    const exists = this.lampExists(data, daliName[i]);

                    if(exists) {

                        const info = await this.moreInformation(this.bus[bus].address, daliGetHex[i])
                        this.result[daliName[i]] = {
                                                        name: daliName[i],
                                                        value: Math.round((info[4]/254)*100),  //this.getLevel(data),
                                                        busname: this.bus[bus].name,
                                                        busadd: this.bus[bus].address,
                                                        address: daliGetHex[i],
                                                        levelpos: daliLevel[i],
                                                        device: type[info[0]],
                                                        group: this.getGroup(info[1], info[2]),
                                                        min: Math.round((info[3]/254)*100)
                        };
                    }
                }
            }
        }
        
        return this.result;
    }

    async moreInformation(bus, address){
  
        let result = [];

        for(const i in query){

            this.adapter.log.debug('query ' + query[i])
            const transactionId = this.transactionIdentifier();

            const message = this.getMessage(bus, transactionId, '0x' + address, query[i]);
            this.adapter.log.debug(JSON.stringify(message));

            const data = await this.sendMessage(message);
            this.adapter.log.debug('Data ' + JSON.stringify(data));

                result[i] = data[14] 
        }

        this.adapter.log.debug('result ' + result)
        return result
    }


    getGroup(info1, info2){

        if (info1 != 0 && info2 === 0){
            this.adapter.log.debug('loop 0')
            return (group07[info1]) ? group07[info1]: 0
        }
        else if (info1 === 0 && info2 != 0){
            this.adapter.log.debug('loop 1')
            return (group815[info2]) ? group815[info2]: 0
        }
        else if (info1 != 0 && info2 != 0){
            this.adapter.log.debug('loop 2')
            return (group07[info1] + ' ' + group815[info2]) ? (group07[info1] + ' ' + group815[info2]): 0
        }

    }

    getMessage(busAddress, transactionId, daliAddress, query, size = '0x03', daliClass = '0x00') {
            
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

    lampExists(data, name) {

        if(data && (data[10] == 130 || data[10] == '0x82')) {
            this.adapter.log.info('find ' + name);
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

        this.newlevel = 0;
        this.adapter.log.debug('obj ' + JSON.stringify(this.result))
        const lampStates = await this.messageLampStates(this.bus[0].address)
        this.adapter.log.debug('lampStates ' + JSON.stringify(lampStates));

        for(const i in this.result) {
        
            const name = this.result[i].name;
            this.adapter.log.debug('name ' + name)

            if (name.indexOf('e')===0){

                const transactionId = this.transactionIdentifier();
                
                const message = this.getMessage(this.result[i].busadd, transactionId, '0x' + '05', '0xc0', daliSize[1], '0x05');
                this.adapter.log.debug('create Message group '+ JSON.stringify(message))

                const data = await this.sendMessage(message);
                this.adapter.log.debug('data ' + JSON.stringify(data))

                this.responseState(data[14], this.result[i].name, this.result[i].busname)

            } else {
            
                if(name.indexOf('a')===0) {

                    this.newlevel = this.getLevel(lampStates, daliLevel[daliName.indexOf(name)]);

                } else {
                    const transactionId = this.transactionIdentifier();
                    
                    const message = this.getMessage(this.result[i].busadd, transactionId, '0x' + this.result[i].address, queryLevel, daliSize[0]);
                    this.adapter.log.debug('create Message group '+ JSON.stringify(message))

                    const data = await this.sendMessage(message);
                    this.adapter.log.debug('data ' + JSON.stringify(data))
                    
                    this.newlevel = this.getLevel(data, daliLevel[daliName.indexOf(name)]);
                }
                
                if(this.result[i].value != this.newlevel) {  
                    this.adapter.log.debug('level change')
                    this.result[i].value = this.newlevel;
                    this.responseState(this.newlevel, this.result[i].name, this.result[i].busname); 
                } else {
                    this.adapter.log.debug('nothing change')
                };
            }
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

    responseState (level, address, bus) {
        
        if(address.indexOf('a')===0) {
          
            this.adapter.setState(this.adapter.namespace + '.' + bus + '.lamps.' + address + '.' + address, level, true)
            this.adapter.log.debug('neu ' + address + ' ' + level)
        } else {
            
            this.adapter.setState(this.adapter.namespace + '.' + bus + '.groups.' + address, level, true)
            this.adapter.log.debug('neu ' + address + ' ' + level)
        }
    }

    getLevel(data, pos = 14) {

        const l = Math.round((data.toJSON().data[pos]/254)*100);

        return (l) ? l : 0;
    }

    ////////////////////////////////set State Dali Bus/////////////////////////////////////////////////


    async sendLampState(bus, value, name) {
       
        const transactionId = this.transactionIdentifier();
       
        const lampId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('lampId ' + lampId);
        
        const lampLevel = this.getLevelHex(value);
       
        this.adapter.log.debug('lampLevelhex ' + lampLevel);

        const message = this.getMessage(this.bus[bus].address, transactionId, lampId, lampLevel);
        this.adapter.log.debug(JSON.stringify(message));
        
        this.sendMessage(message);
    }

    sendGroupState(bus, value, name) {
        
        const transactionId = this.transactionIdentifier();
       
        const groupId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('groupId ' + groupId);
        
        const groupLevel = this.getLevelHex(value);
     
        this.adapter.log.debug('groupLevel ' + groupLevel);

        const message = this.getMessage(this.bus[bus].address, transactionId, groupId, groupLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    }

    sendScene(bus, name) {
     
        const transactionId = this.transactionIdentifier();

        const broadcastScene = '0xfe';
    
        const sceneId = '0x' + daliSetHex[daliName.indexOf(name)];
        this.adapter.log.debug('sceneId ' + sceneId);

        const message = this.getMessage(this.bus[bus].address, transactionId, broadcastScene, sceneId); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    }

    sendBroadcast(bus, value) {
        
        const transactionId = this.transactionIdentifier();
    
        const broadcast = '0xfe';

        const broadcastLevel = this.getLevelHex(value);

        const message = this.getMessage(this.bus[bus].address, transactionId, broadcast, broadcastLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);
    }

    getLevelHex (value) {
        return '0x' + (Math.round((value*254)/100)).toString(16);
    }
}

module.exports = Dali4Net;