const net = require('net');

let query = 0xa0; //Actual level

const daliName = ['a00','a01','a02','a03','a04','a05','a06','a07','a08','a09','a10','a11','a12','a13',
    'a14','a15','a16','a17','a18','a19','a20','a21','a22','a23','a24','a25','a26','a27','a28','a29',
    'a30','a31','a32','a33','a34','a35','a36','a37','a38','a39','a40','a41','a42','a43','a44','a45',
    'a46','a47','a48','a49','a50','a51','a52','a53','a54','a55','a56','a57','a58','a59','a60','a61',
    'a62','a63','g00','g01','g02','g03','g04','g05','g06','g07','g08','g09','g10','g11','g12','g13',
    'g14','g15','s00','s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15'
];
const dalisetHex = ['00','02','04','06','08','0A','0C','0E','10','12','14','16','18','1A','1C','1E',
    '20','22','24','26','28','2A','2C','2E','30','32','34','36','38','3A','3C','3E','40','42','44','46',
    '48','4A','4C','4E','50','52','54','56','58','5A','5C','5E','60','62','64','66','68','6A','6C','6E',
    '70','72','74','76','78','7A','7C','7E','80','82','84','86','88','8A','8C','8E','90','92','94','96',
    '98','9A','9C','9E','10','11','12','13','14','15','16','17','18','19','1A','1B','1C','1D','1E','1F',
    '10','11','12','13','14','15','16','17','18','19','1A','1B','1C','1D','1E','1F'
];

class DaliSet {
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
    }
 
    sendMessage(message) {
        const client = net.connect({ host: this.host, port: this.port }, () => {
            this.adapter.log.info('Connected to server!');
            this.connected = true;
            client.write(message);
        });

        client.on('data', (data) => {
            this.adapter.log.debug('Response ' + data.toJSON().data);
            client.end();
        });

        client.on('end', () => {
            this.adapter.log.debug('Disconnected from server');
           
        });
        
        client.on('error', (error) => {
            this.adapter.log.error('Error: ' + error);
            client.end();
        });
    }

    async sendLampState(bus, value, name) {
       
        const transactionId = this.transactionIdentifier();
       
        const lampId = '0x' + dalisetHex[daliName.indexOf(name)];
        this.adapter.log.debug("lampId " + lampId);
        
        const lampLevel = this.getlevelHex(value);
       
        this.adapter.log.debug('lampLevelhex ' + lampLevel);

        const message = this.getMessageSet(this.bus[bus].address, transactionId, lampId, lampLevel);
        this.adapter.log.debug(JSON.stringify(message));
        
        this.sendMessage(message);
    }

    
    sendGroupState(bus, value, name){

        //if(value != ModbusSoll) {  // Soll ungleich Ist
        //this.adapter.log.debug("Neuer Istwert wird übernommen");
        
        const transactionId = this.transactionIdentifier();
       
        const groupId = '0x' + dalisetHex[daliName.indexOf(name)];
        this.adapter.log.debug('groupId ' + groupId);
        
        const groupLevel = this.getlevelHex(value);
        //DaliIst = value;
        this.adapter.log.debug('groupLevel ' + groupLevel);

        const message = this.getMessageSet(this.bus[bus].address, transactionId, groupId, groupLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    //    }
    //else {this.log.debug("Istwert ist gleich")}
    }

    sendScene(bus, name) {
     
        const transactionId = this.transactionIdentifier();

        const broadcastScene = '0xfe';
    
        const sceneId = '0x' + dalisetHex[daliName.indexOf(name)];
        this.adapter.log.debug('sceneId ' + sceneId);

        const message = this.getMessageSet(this.bus[bus].address, transactionId, broadcastScene, sceneId); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);

    }
    
    sendBroadcast(bus, value){
        
        const transactionId = this.transactionIdentifier();
    
        const broadcast = '0xfe';

        const broadcastLevel = this.getlevelHex(value);

        const message = this.getMessageSet(this.bus[bus].address, transactionId, broadcast, broadcastLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        this.sendMessage(message);
    }

    getMessageSet(busAddress, transactionId, daliAddress, level){        
        
        const hexData = [
                busAddress,transactionId,'0x00','0x00','0x00','0x17',busAddress,'0x17','0x00','0x65',
                '0x00','0x05','0x00','0x64','0x00','0x06','0x0c','0x12',busAddress,'0x00',
                '0x03','0x00','0x00',daliAddress,level,'0x00','0x00','0x00','0x00'
            ]; 
            return Buffer.from(hexData);

        }    

    getlevelHex (value){
        return '0x' + (Math.round((value*254)/100)).toString(16);
    }

    transactionIdentifier() {
        const min = 0;
        const max = 253;
        const x = Math.floor(Math.random() * (max - min)) + min;
        return '0x' + x.toString(16);
    }
}
module.exports = DaliSet;