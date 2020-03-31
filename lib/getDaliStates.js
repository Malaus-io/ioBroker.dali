const net = require('net');

class Dali4Net {
    constructor(adapter, host, port, bus0, bus1, bus2, bus3) {

        adapter.log.debug('NEW Instanz');

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

        this.client = net.connect({ host: host, port: port }, () => {
            this.adapter.log.info('Connected to server!');
            this.connected = true;
        });

        this.client.on('data', (data) => {
            this.adapter.log.debug('Response ' + data.toJSON().data);
            //const transactionId = data.toJSON().data[1];
            //this.adapter.log.debug("transid" + transactionId)
            //this.adapter.log.info('a' + JSON.stringify(this.transactions));
        });

        this.client.on('end', () => {
            this.adapter.log.debug('Disconnected from server');
        });
        
        this.client.on('error', (error) => {
            this.adapter.log.error('Error: ' + error);
            this.client.end();
        });

        adapter.log.debug('ENDE NEW');
    }


    sendData(data, bus) {

        if(this.bus[bus].status) {

        }
        //senden(this.host, this.port, data);
    }

    transactionIdentifier() {
        const min = 0;
        const max = 253;
        const x = Math.floor(Math.random() * (max - min)) + min;
        return '0x' + x.toString(16);
    }

    async startSearch(bus){
        
        const result = {};

        this.adapter.log.debug('BUS ' + bus);
        this.adapter.log.debug(this.bus[bus].status);
        this.adapter.log.debug(this.bus[bus] && this.bus[bus].status);
        this.adapter.log.debug(JSON.stringify(daliAddresses));

        if(this.bus[bus] && this.bus[bus].status) {

            this.adapter.log.debug('IN IF');

            for(const i in daliAddresses) {
                this.adapter.log.debug('SCHLEIFE ' + i);
                const lampId = this.createLampId(i);
                
                this.adapter.log.debug('Start request ' + lampId);
                
                const transactionId = this.transactionIdentifier();
                const message = this.getMessage(this.bus[bus].address, transactionId, lampId);

                this.adapter.log.debug(JSON.stringify(message));

                const data = await this.sendMessage(message, transactionId);

                this.adapter.log.debug("data " + JSON.stringify(data))
                this.adapter.log.debug('Message received ' + lampId);

                result[daliName[i]] = this.lampExists(data);
            }
        }
        
        return result;
        
    }

    createLampId(i) {
        return '0x' + daliAddresses[i];
    }
 
    getMessage(busAddress, transactionId, daliAddress){
        
        //Hex Nachricht erstellen
        const hexData = [busAddress, transactionId, "0x00","0x00","0x00","0x17", busAddress,"0x17","0x00","0x65",
            "0x00","0x05","0x00","0x64","0x00","0x06","0x0c","0x12", busAddress,"0x00","0x03","0x00","0x00",
            daliAddress, query,"0x00","0x00","0x00","0x00"];

        const data = Buffer.from(hexData);
        
        return data;
    }

    async sendMessage(data, transactionId) {
        this.adapter.log.debug('Message ' + JSON.stringify(data));
        this.client.write(data);

        
        return new Promise((resolve)=> {
            this.client.on('data', (data) => {
            
                resolve(data);
            });
           
            this.adapter.log.debug('b '+JSON.stringify(data));
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
}

module.exports = Dali4Net;




}