const net = require('net');

let BusNr = 0x01;
let query = 0xa0; //Actual level
let lightName = '00';
let i = 0;
let j = 0;
let obj = {};
const daliName = ['a00','a01','a02','a03','a04','a05','a06','a07','a08','a09','a10','a11','a12','a13',
    'a14','a15','a16','a17','a18','a19','a20','a21','a22','a23','a24','a25','a26','a27','a28','a29',
    'a30','a31','a32','a33','a34','a35','a36','a37','a38','a39','a40','a41','a42','a43','a44','a45',
    'a46','a47','a48','a49','a50','a51','a52','a53','a54','a55','a56','a57','a58','a59','a60','a61',
    'a62','a63','g00','g01','g02','g03','g04','g05','g06','g07','g08','g09','g10','g11','g12','g13',
    'g14','g15'
];
const daliAddresses = ['00','02','04','06','08','0A','0C','0E','10','12','14','16','18','1A','1C','1E',
    '20','22','24','26','28','2A','2C','2E','30','32','34','36','38','3A','3C','3E','40','42','44','46',
    '48','4A','4C','4E','50','52','54','56','58','5A','5C','5E','60','62','64','66','68','6A','6C','6E',
    '70','72','74','76','78','7A','7C','7E','80','82','84','86','88','8A','8C','8E','90','92','94','96',
    '98','9A','9C','9E'
];
const daligethex = ['01','03','05','07','09','0B','0D','0F','11','13','15','17','19','1B','1D','1F','21',
    '23','25','27','29','2B','2D','2F','31','33','35','37','39','3B','3D','3F','41','43','45','47','49',
    '4B','4D','4F','51','53','55','57','59','5B','5D','5F','61','63','65','67','69','6B','6D','6F','71',
    '73','75','77','79','7B','7D','7F','81','83','85','87','89','8B','8D','8F','91','93','95','97','99',
    '9B','9D','9F'
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
    

        this.transactions = {};

        this.client = net.connect({ host: host, port: port }, () => {
            this.adapter.log.info('Connected to server!');
            this.connected = true;
        });

        this.client.on('data', (data) => {
            this.adapter.log.debug('Response ' + data.toJSON().data);
            const transactionId = data.toJSON().data[1];
            this.adapter.log.debug("transid" + transactionId)
        });

        this.client.on('end', () => {
            this.adapter.log.debug('Disconnected from server');
        });
        
        this.client.on('error', (error) => {
            this.adapter.log.error('Error: ' + error);
            this.client.end();
        });
    }

    transactionIdentifier() {
        const min = 0;
        const max = 253;
        const x = Math.floor(Math.random() * (max - min)) + min;
        return '0x' + x.toString(16);
    }

    async startSearch(bus){
        
        this.result = {};

        this.adapter.log.debug('BUS ' + bus);
        this.adapter.log.debug(this.bus[bus].status);
        this.adapter.log.debug(this.bus[bus] && this.bus[bus].status);
        this.adapter.log.debug(JSON.stringify(daligethex));

        if(this.bus[bus] && this.bus[bus].status) {

            for(const i in daligethex) {
                
                const lampId = this.createLampId(i);
                
                this.adapter.log.debug('Start request ' + lampId);
                
                const transactionId = this.transactionIdentifier();
                const message = this.getMessage(this.bus[bus].address, transactionId, lampId);

                this.adapter.log.debug(JSON.stringify(message));

                const data = await this.sendMessage(message);

                this.adapter.log.debug("Data " + JSON.stringify(data));
                this.adapter.log.debug('Message received ' + lampId);
                
                this.result[daliName[i]] = {
                    name: daliName[i],
                    value: this.lampExists(data)
                };
            }
        }
        
        return this.result;
    }

    createLampId(i) {
        return '0x' + daligethex[i];
    }
 
    getMessage(busAddress, transactionId, daliAddress){
            
        const hexData = [
            busAddress, transactionId, "0x00", "0x00","0x00","0x17", busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12", busAddress,"0x00",
            "0x03","0x00","0x00",daliAddress, query,"0x00","0x00","0x00","0x00"
        ];

        return Buffer.from(hexData);  
    }

    async sendMessage(data) {

        this.adapter.log.debug('Message ' + JSON.stringify(data));
        this.client.write(data);

        return new Promise((resolve)=> {
            this.client.on('data', (data) => {
            
                resolve(data);
            });
        });
    }

    lampExists(data) {

        if(data && (data[10] == 130 || data[10] == '0x82')) {
            this.adapter.log.info('Lampe existiert: ' + lightName);
            return true;
        }
        
        this.adapter.log.info('Lampe nicht vorhanden');
        return false;
    }

//////////////////////////////////////////////////////////////

////////////////////////////////set State Dali Light/////////////////////////////////////////////////

    sendLampState(bus, value, name) {

        //if(value != ModbusSoll) {  // Soll ungleich Ist
        this.adapter.log.debug("Neuer Istwert wird übernommen");
        // Erstelle Transaction ID
        const transactionId = this.transactionIdentifier();
        //Lichtnummer in Hex umwandeln
        const lampId = this.getlampId(name);
        this.adapter.log.debug("lampId " + lampId);
        
        const lampLevel = this.getlevelHex(value);
        //DaliIst = value;
        this.adapter.log.debug("lampLevelhex " + lampLevel);

        const message = this.getMessageStatelamp(this.bus[bus].address, transactionId, lampId, lampLevel);
        this.adapter.log.debug(JSON.stringify(message));
        
        this.client.write(message);

        //return true;
        //    }
        //else {this.log.debug("Istwert ist gleich")}
    }

    getMessageStatelamp(busAddress, transactionId, daliAddress, level){        
        //Hex Nachricht erstellen
        const hexData = [
            busAddress,transactionId,"0x00","0x00","0x00","0x17",busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12",busAddress,"0x00",
            "0x03","0x00","0x00",daliAddress,level,"0x00","0x00","0x00","0x00"
        ];

        const data = Buffer.from(hexData);

        return data; 
    }

    sendGroupState(bus, value, name){

        //if(value != ModbusSoll) {  // Soll ungleich Ist
        this.adapter.log.debug("Neuer Istwert wird übernommen");
        // Erstelle Transaction ID
        const transactionId = this.transactionIdentifier();
        //Lichtnummer in Hex umwandeln
        const groupId = this.getgroupId(name);
        this.adapter.log.debug("groupId " + groupId);
        
        const groupLevel = this.getlevelHex(value);
        //DaliIst = value;
        this.adapter.log.debug("groupLevel" + groupLevel);

        const message = this.getMessageStategroup(this.bus[bus].address, transactionId, groupId, groupLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        const data = this.sendMessageStategroup(message, transactionId);

        return true
    //    }
    //else {this.log.debug("Istwert ist gleich")}
    }

    getMessageStategroup(busAddress, transactionId, daliAddress, level) {        
        //Hex Nachricht erstellen
        const hexData = [
            busAddress,transactionId,"0x00","0x00","0x00","0x17",busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12",busAddress,"0x00",
            "0x03","0x00",daliAddress,level,"0x00","0x00","0x00","0x00"] 

        const data = Buffer.from(hexData);

        return data; 
    }
    
    sendMessageStategroup(data, transactionId) {
        this.adapter.log.debug('Message ' + JSON.stringify(data));
        this.client.write(data);
    }
    
    sendScene(bus, name) {
        // Erstelle Transaction ID
        const transactionId = this.transactionIdentifier();
        //Lichtnummer in Hex umwandeln
        const broadcastScene = "0xfe";
        //Szenennummer in Hex umwandeln
        const sceneId = this.getsceneId(name);

        const message = this.getMessagescene(this.bus[bus].address, transactionId, broadcastScene, sceneId); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        const data = this.sendMessagescene(message, transactionId);

        return true;
    }
    
    getMessagescene(busAddress, transactionId, daliAddress, level) {        
        //Hex Nachricht erstellen
        const hexData = [
            busAddress,transactionId,"0x00","0x00","0x00","0x17",busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12",busAddress,"0x00",
                            "0x03","0x00","0x00",daliAddress,level,"0x00","0x00","0x00","0x00"] 

        const data = Buffer.from(hexData);

        return data; 
    }  

sendMessagescene(data, transactionId) {
    this.adapter.log.debug('Message ' + JSON.stringify(data));
    this.client.write(data);

    /*
    return new Promise((resolve)=> {
        this.client.on('data', (data) => {
        
            resolve(data);
        });
       
        this.adapter.log.debug('b '+JSON.stringify(data));
    });
    */
}    


    sendBroadcast(bus, value){
        // Erstelle Transaction ID
        const transactionId = this.transactionIdentifier();
        //Lichtnummer in Hex umwandeln
        const broadcast = "0xfe";
        //Prozentwert in Hex umwandeln
        const broadcastLevel = this.getlevelHex(value);

        const message = this.getMessagebroadcast(this.bus[bus].address, transactionId, broadcast, broadcastLevel); 
        this.adapter.log.debug(JSON.stringify(message));  
        
        const data = this.sendMessagebroadcast(message, transactionId);

        return true
    }

    getMessagebroadcast(busAddress, transactionId, daliAddress, level){        
        //Hex Nachricht erstellen
        const hexData = [busAddress,transactionId,"0x00","0x00","0x00","0x17",busAddress,"0x17","0x00","0x65",
                            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12",busAddress,"0x00",
                            "0x03","0x00","0x00",daliAddress,level,"0x00","0x00","0x00","0x00"] 

        const data = Buffer.from(hexData);

        return data; 
    }  


sendMessagebroadcast(data, transactionId) {
    this.adapter.log.debug('Message ' + JSON.stringify(data));
    this.client.write(data);

    /*
    return new Promise((resolve)=> {
        this.client.on('data', (data) => {
        
            resolve(data);
        });
       
        this.adapter.log.debug('b '+JSON.stringify(data));
    });
    */
}  


    getlevelHex (value){
        return '0x' + (Math.round((value*254)/100)).toString(16);
    }

    getlampId(name){
        const number = parseFloat(name.match(/\d+\.?\d*/gi)[0]);
        //const number = parseFloat(name);
        this.adapter.log.info("Parse " + number)
        return "0x" + (number*2).toString(16);
    }

    getgroupId(name){
        const number = parseFloat(name.match(/\d+\.?\d*/gi)[0]);
        return "0x" + ((number*2)+128).toString(16);
    }

    getsceneId(name){
        const number = parseFloat(name.match(/\d+\.?\d*/gi)[0]);
        return "0x" + (number+16).toString(16);
    }




////////////////////////////////get State Dali Bus/////////////////////////////////////////////////

    async getExistsLamp() {
        const daligetName = ['a00','a01','a02','a03','a04','a05','a06','a07','a08','a09','a10','a11','a12','a13','a14','a15','a16','a17','a18','a19','a20','a21','a22','a23','a24','a25','a26','a27','a28','a29','a30','a31','a32','a33','a34','a35','a36','a37','a38','a39','a40','a41','a42','a43','a44','a45','a46','a47','a48','a49','a50','a51','a52','a53','a54','a55','a56','a57','a58','a59','a60','a61','a62','a63','g00','g01','g02','g03','g04','g05','g06','g07','g08','g09','g10','g11','g12','g13','g14','g15']
        const daligethex = ['01','03','05','07','09','0B','0D','0F','11','13','15','17','19','1B','1D','1F','21','23','25','27','29','2B','2D','2F','31','33','35','37','39','3B','3D','3F','41','43','45','47','49','4B','4D','4F','51','53','55','57','59','5B','5D','5F','61','63','65','67','69','6B','6D','6F','71','73','75','77','79','7B','7D','7F','81','83','85','87','89','8B','8D','8F','91','93','95','97','99','9B','9D','9F']

        const lamp = await this.adapter.getStatesAsync(this.adapter.namespace +'.'+ 'bus0' + '.lamps.*');
        const group = await this.adapter.getStatesAsync(this.adapter.namespace +'.'+ 'bus0' + '.groups.*');
        
        // this.result;

        const states = {
            ...lamp,
            ...group
        };

        this.adapter.log.debug("states " + JSON.stringify(states));

        this.adapter.obj = {};
        let o = 0;
        
        for(const id in states) {
            
            this.adapter.obj['id' + o]= {
                name: id.substring(id.lastIndexOf('.') + 1),
                address: daligethex[daligetName.indexOf(id.substring(id.lastIndexOf('.') + 1))],
                level: states[id].val,
                bus: 'bus0'
            };
            
            o++;  
        }
        
        this.adapter.log.info("obj " +  JSON.stringify(this.adapter.obj));

        this.schedule = setInterval(() => this.counterObjects(), 1000);
    }

    destroy() {
        clearInterval(this.schedule);
        this.client.destroy();
    }

    async counterObjects() {

        this.adapter.log.debug("next")
        this.adapter.log.debug("obj " + this.adapter.obj)
        
        for(const i in this.adapter.obj){
            const bus = '0x01'
        
            this.adapter.log.info("name " + this.adapter.obj[i].address)
            const transactionId = this.transactionIdentifier();
            const message = this.getMessageState(bus, transactionId, this.adapter.obj[i].address);
            //this.adapter.log.debug("create Message " + JSON.stringify(message))

            const data = await this.sendMessageState(message, transactionId);
            this.adapter.log.debug("data " + JSON.stringify(data))
            
            const newlevel = this.getlevel(data);
            //const address = this.getdaliName(data);
            //this.adapter.log.info("newlevel " + newlevel)
            //this.adapter.log.info("address " + address)

            if(this.adapter.obj[i].level != newlevel) {  // Soll ungleich Ist
                this.adapter.log.debug("Level nicht gleich")
                this.adapter.obj[i].level = newlevel;
                const newState = this.responseState(newlevel, this.adapter.obj[i].name); 
            } else {
                this.adapter.log.debug("Level ist gleich")
            }
        }
    }
    
    getlevel(data){

        const l = Math.round((data.toJSON().data[14]/254)*100);

        return (l) ? l : 0;
    }

    getdaliName(data){
        return daliName[daligethex.indexOf(data.toJSON().data[13])+1];
    }


    getMessageState(busAddress, transactionId, daliAddress){
        
        const hexData = [busAddress, transactionId, "0x00","0x00","0x00","0x17", busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12", busAddress,"0x00","0x03","0x00","0x00",
            daliAddress, query,"0x00","0x00","0x00","0x00"];

        return Buffer.from(hexData);
    }

    async sendMessageState(data) {

        this.adapter.log.debug('Message ' + JSON.stringify(data));
        this.client.write(data);

        return new Promise((resolve)=> {
            this.client.on('data', (data) => {
            
                resolve(data);
            });
        });
    }

    responseState (level, address){

        if(address.indexOf('a')===0){
            this.adapter.log.info("lampe")
            this.adapter.setState(this.adapter.namespace + '.' + 'bus0' + '.lamps.' + address, level, true)
            this.adapter.log.debug('neu ' + address + (level))
        } else {
            this.adapter.log.info("gruppe")
            this.adapter.setState(this.adapter.namespace + '.' + 'bus0' + '.groups.' + address, level, true)
            this.adapter.log.debug('neu ' + address + (level))
        }
    }
}

module.exports = Dali4Net;