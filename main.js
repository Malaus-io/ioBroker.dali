'use strict';

const utils = require('@iobroker/adapter-core');
/*const net = require('net');
const tcpp = require('tcp-ping');*/

const dali = require('./lib/dali');

class Dali extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options= {}]
     */
    constructor(options) {
        super( {
            ...options, 
            name: 'dali', 
            //systemConfig:  true
            
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        this.device = new dali(this, this.config.host, this.config.port, 
            this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);

        if(this.config.bus0) {

            this.log.debug('Bus0 is select');

            this.lamps = await this.device.startSearch(0);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));
            
            this.searchDaliBus(0, this.lamps);
        };
        if(this.config.bus1) {

            this.log.debug('Bus1 is select');

            this.lamps = await this.device.startSearch(1);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));

            this.searchDaliBus(1, this.lamps);
        };
        if(this.config.bus2) {

            this.log.debug('Bus2 is select');

            this.lamps = await this.device.startSearch(2);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));

            this.searchDaliBus(2, this.lamps);
        };
        if(this.config.bus3) {

            this.log.debug('Bus3 is select');

            this.lamps = await this.device.startSearch(3);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));

            this.searchDaliBus(3, this.lamps);
        };
    
        if (this.config.bus0 || this.config.bus1 || this.config.bus2 || this.config.bus3) {
            this.device.startCounter();
        }


        this.log.info('config Bus0: ' + this.config.bus0);
        this.log.info('config Bus1: ' + this.config.bus1);
        this.log.info('config Bus2: ' + this.config.bus2);
        this.log.info('config Bus3: ' + this.config.bus3);
        this.log.info('config IP: ' + this.config.host);
        this.log.info('config Port: ' + this.config.port);
      
     /*tcpp.probe(this.config.host, this.config.port, (err, available) => {
     this.log.info('Verbindung ' + available)
     this.setState('info.connection', available);});*/



        this.subscribeStates('*');
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {

        if(this.device) {
            this.device.destroy();
            this.log.debug('Device destroyed');
        }

        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {

        if(state && state.ack !== true && this.device) {
            
            const busno = this.getbusnumber(id);
            const name = id.substring(id.lastIndexOf('.') + 1);

            if(id.startsWith(this.namespace + '.bus' + busno +'.lamps.')) {

                this.device.sendLampState(busno, state.val, name);

            } else if(id.startsWith(this.namespace + '.bus' + busno + '.groups.')) {

                this.device.sendGroupState(busno, state.val, name); 

            } else if(id.startsWith(this.namespace + '.bus' + busno + '.scenes.')) {

                if(state.val) {
                    this.device.sendScene(busno, name);
                    this.setState(this.namespace + '.bus' + busno + '.scenes.' + name, false);
                }

            } else if(id == this.namespace + '.bus' + busno + '.broadcast0') {
                this.device.sendBroadcast(busno, state.val);  
            }
            
            // The state was changed
            //this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            //this.log.info(`state ${id} deleted`);
        }
    }


    async searchDaliBus(bus, lamps) {

        this.createDatapoints(bus);
                
        for(const i in lamps) {
            this.log.debug('id name ' + lamps[i].value);
            this.log.debug('id value ' + lamps[i].name);

            if(lamps[i].name.indexOf('a') === 0) {
                this.log.debug('lamp ' + i + ' created');

                const path = 'bus' + bus + '.lamps.' + i;
                this.log.debug('path ' + path);
                this.createStateData(path, 'Lamp ' + i);

            } else {

                this.log.debug('group ' + i + ' created');

                const path = 'bus' + bus + '.groups.' + i;

                this.createStateData(path, 'Group ' + i);
            }
        }
    };

    getbusnumber(id) {
    
        if (id.indexOf('bus0')===7) { return 0}
        else if (id.indexOf('bus1')===7) { return 1}
        else if (id.indexOf('bus2')===7) { return 2}
        else if (id.indexOf('bus3')===7) { return 3};

    }

    async createDatapoints(bus) {

        this.setObjectNotExistsAsync('bus' + bus, {
            type: 'device', 
            common: {
                name: 'bus' + bus
            }, 
            native: {}
        });

        this.createChan('bus' + bus + '.lamps' , 'lamps');
        this.createChan('bus' + bus + '.groups', 'groups');
        this.createChan('bus' + bus + '.scenes', 'scenes');
    
        for (let s = 0; s < 16; s++) {

            const sn = (s < 10) ? '0' + s : s;

            this.setObjectNotExistsAsync('bus' + bus + '.scenes.s' + sn, {
                type: 'state', 
                common: {
                    name: 'Scene ' + sn, 
                    role: 'button', 
                    type: 'boolean', 
                    read: false, 
                    write: true, 
                    def: false
                }, 
                native: {}
            });
        }

        this.createStateData('bus' + bus + '.broadcast' + bus, 'Broadcast' + bus);
    }

    createStateData(id, name) {

        this.setObjectNotExistsAsync(id, {
            type: 'state', 
            common: {
                name: name, 
                role: 'level.dimmer', 
                type: 'number', 
                read: true, 
                write: true, 
                min: 0, 
                max: 100, 
                def: 0, 
                unit: '%'
            }, 
            native: {}
        });
    }
    
    async createChan(id, name) {
        
        this.setObjectNotExistsAsync(id, {
            type: 'channel', 
            common: {
                name: name
            }, 
            native: {}
        });
    }

}


if(module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options= {}]
     */
    module.exports = (options) => new Dali(options);
} else {
    // otherwise start the instance directly
    new Dali();
}


