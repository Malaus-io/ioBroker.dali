'use strict';

const utils = require('@iobroker/adapter-core');
const net = require('net');
const tcpp = require('tcp-ping');

const dali = require('./lib/dali');



class Dali extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
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

        this.device = new dali(this, this.config.host, this.config.port, this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);

        if(this.config.bus0) {
            this.log.info('Bus0 is select');
            this.createDatapoints(0);
            const lamps = await this.device.startSearch(0);
            this.log.debug('Respones light bus0 ' + JSON.stringify(lamps));
 
            for(const i in lamps) {
                  this.log.debug("id " + lamps[i].value);
                  this.log.debug("id " + lamps[i].name);

                if(lamps[i].value === true && lamps[i].name.indexOf('a') === 0) {
                    this.log.info('lamp ' + i + ' created');

                    const path = this.namespace + ".bus0.lamps." + i;

                    this.createState(path, 'Lamp ' + i);

                } else if(lamps[i].value === true) {

                    this.log.info('group ' + i + ' created');

                    const path = this.namespace + ".bus0.groups." + i;

                    this.createState(path, 'Group ' + i);
                }
            }
        };

        this.device.getExistsLamp();
            
        //if(this.config.bus0.obj.state.val != this.config.bus0.obj.oldState.val) {
          
            //lamps[1] ? device.startSearchLamp(1);
        //}

        this.log.info('config Bus0: ' + this.config.bus0);
        this.log.info('config Bus1: ' + this.config.bus1);
        this.log.info('config Bus2: ' + this.config.bus2);
        this.log.info('config Bus3: ' + this.config.bus3);
        this.log.info('config IP: ' + this.config.host);
        this.log.info('config Port: ' + this.config.port);
      
     /*tcpp.probe(this.config.host, this.config.port, (err, available) =>{
     this.log.info("Verbindung " + available)
     this.setState('info.connection', available);});*/


        //this.setState('Bus0', { val: true, ack: true });

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

        this.device = new dali(this, this.config.host, this.config.port, this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);
        
        if(state && state.ack !== true) {

            const name = id.substring(id.lastIndexOf('.') + 1);

            if(id.startsWith(this.namespace + '.bus0.lamps.')) {

                this.device.sendLampState(0, state.val, name); 

            } else if(id.startsWith(this.namespace + '.bus0.groups.')) {

                this.device.sendGroupState(0, state.val, name); 

            } else if(id.startsWith(this.namespace + '.bus0.scenes.')) {

                if(state.val) {
                    this.device.sendScene(0, name);
                }

            } else if(id == this.namespace + '.bus0.broadcast0') {
                this.device.sendBroadcast(0, state.val);  
            }
            
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }


    createDatapoints(bus) {

        for (let s = 0; s < 16; s++) {

            const sn = (s < 10) ? '0' + s : s;

            this.setObjectNotExistsAsync('bus' + bus + '.scenes.scene' + sn, {
                type: 'state',
                common: {
                    name: "Scene " + sn,
                    type: 'boolean',
                    role: 'button',
                    read: false,
                    write: true,
                    def: false
                },
                native: {}
            });
        }

        this.createState('bus' + bus + '.broadcast' + bus, 'Broadcast ' + bus);
    }

    createState(id, name, role = 'level.dimmer', type = 'number', read = true, write = true) {
        this.setObjectNotExistsAsync(id, {
            type: 'state',
            common: {
                name: name,
                role: role,
                type: type,
                read: read,
                write: write,
                min: 0,
                max: 100,
                def: 0,
                unit: '%'
            },
            native: {}
        });
    }
}








if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Dali(options);
} else {
    // otherwise start the instance directly
    new Dali();
}


