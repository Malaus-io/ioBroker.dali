'use strict';

const utils = require('@iobroker/adapter-core');

const dali = require('./lib/dali');
const lib = require('./lib/devicelist');

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


        this.log.info('config Bus0: ' + this.config.bus0);
        this.log.info('config Bus1: ' + this.config.bus1);
        this.log.info('config Bus2: ' + this.config.bus2);
        this.log.info('config Bus3: ' + this.config.bus3);
        this.log.info('config IP: ' + this.config.host);
        this.log.info('config Port: ' + this.config.port);


        if(this.config.bus0) {

            this.log.debug('Bus0 is select');
            this.log.info('Bus0 search start');
            
            this.lamps = await this.device.startSearch(0);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));
            this.log.info('Bus0 search end');

            this.searchDaliBus(0, this.lamps);
        };
        if(this.config.bus1) {

            this.log.debug('Bus1 is select');
            this.log.info('Bus1 search start');

            this.lamps = await this.device.startSearch(1);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));
            this.log.info('Bus1 search end');

            this.searchDaliBus(1, this.lamps);
        };
        if(this.config.bus2) {

            this.log.debug('Bus2 is select');
            this.log.info('Bus2 search start');

            this.lamps = await this.device.startSearch(2);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));
            this.log.info('Bus2 search end');

            this.searchDaliBus(2, this.lamps);
        };
        if(this.config.bus3) {

            this.log.debug('Bus3 is select');
            this.log.info('Bus3 search start');

            this.lamps = await this.device.startSearch(3);
            this.log.debug('Respones light bus0 ' + JSON.stringify(this.lamps));
            this.log.info('Bus3 search end');

            this.searchDaliBus(3, this.lamps);
        };
    
        if (this.config.bus0 || this.config.bus1 || this.config.bus2 || this.config.bus3) {
            this.device.startCounter();
        }

      
    



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


    async searchDaliBus(bus, devices) {

        this.createDatapoints(bus);       

        for(const i in devices) {
            
            const device = devices[i];
            
            const name = devices[device].getName()
            this.log.info('start create ' + name)
           
            const path = devices[device].getPath();
            this.log.info('path ' + path)

            const level = await devices[device].getLevel()
                if (level != null){

                    this.createStateData(path + name, lib.state.level, level);

                }

            const min = await devices[device].getMinLevel()
                if (min){

                    this.createStateData(path + 'min', lib.state.min, min);

                }

            const group = await devices[device].getGroup()
                if (group){

                    this.createStateData(path + 'group', lib.state.group, group);

                }

            const state = await devices[device].getState()
                if (state != null){

                    this.createStateData(path + name, lib.state.switchState, state);

                }

            const source = await devices[device].getSource()
                if (source){

                    this.createStateData(path + 'source', lib.state.eventSource, source);

                }

            const type = await devices[device].getType()
            if (type){

                this.createStateData(path + 'type', lib.state.type, type);

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

        this.createStateData('bus' + bus, lib.state.bus)
        this.createStateData('bus' + bus + '.lamps' , lib.state.lamps);
        this.createStateData('bus' + bus + '.groups', lib.state.groups);
        this.createStateData('bus' + bus + '.scenes', lib.state.scenes);
    
        for (let s = 0; s < 16; s++) {

            const sn = (s < 10) ? '0' + s : s;

            this.createStateData('bus' + bus + '.scenes.s' + sn, lib.state.scene);
        }

        this.createStateData('bus' + bus + '.broadcast' + bus, lib.state.level, 0);
    }

    createStateData(id, state, value) {

        this.setObjectNotExistsAsync(id, state,{
            native: {}
        });
        this.setState(id, value, true);
    }
    
}


// @ts-ignore
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


