'use strict';

const utils = require('@iobroker/adapter-core');
const net = require('net');
const tcpp = require('tcp-ping');

const first = require('./lib/dali');



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
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    
    
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        /*const t = new test(this);
        
        t.read();*/

        //this.setState('info.connection', true);

        this.device = new first(this, this.config.host, this.config.port, this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);
        this.log.debug('AFTER NEW');
        //const lamps = await this.device.startSearch(0);
        this.log.debug('AFTER SEARCHG');
        //this.log.debug(JSON.stringify(lamps));
        
      
        
        if(this.config.bus0) {
            this.log.info('Bus0 is select')
            this.createDATAPOINTS(0);
            const lamps = await this.device.startSearch(0);
            this.log.debug("respones light bus0 " + JSON.stringify(lamps))
 
            for (var i in lamps) {
                  this.log.info("id " + lamps[i].value)
                  this.log.info("id " + lamps[i].name)

               if (lamps[i].value === true && lamps[i].name.indexOf('a')===0) {
                    this.log.info('lamp ' + i + ' created');

                    const Pfad = this.namespace + ".bus0.lamps." + i;
                    this.setObjectNotExistsAsync(Pfad,{
                    _id: Pfad,
                    type: 'state',
                    common: {
                        name: 'lamp ' + i,
                        type: 'number',
                        role: 'level',
                        read: true,
                        write: true,
                        min: 0,
                        max: 100,
                        def: 0,
                        unit: "%"
                        },
                        "native": {}
                    });
                }
                else if(lamps[i].value === true){
                    this.log.info('group ' + i + ' created');

                    const Pfad = this.namespace + ".bus0.groups." + i;
                    this.setObjectNotExistsAsync(Pfad,{
                    _id: Pfad,
                    type: 'state',
                    common: {
                        name: 'lamp ' + i,
                        type: 'number',
                        role: 'level',
                        read: true,
                        write: true,
                        min: 0,
                        max: 100,
                        def: 0,
                        unit: "%"
                        },
                        "native": {}
                    });
                }
            }
        };
        


        this.device.getexistslamp();
            
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
            this.device.client.destroy();
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
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
            
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        this.device = new first(this, this.config.host, this.config.port, this.config.bus0, this.config.bus1, this.config.bus2, this.config.bus3);
        if (state && state.ack !== true) {

            if(id.startsWith(this.namespace + '.bus0.lamps.')) {
                const name = id.substring(id.lastIndexOf('.') + 1);
                this.device.sendlampState(0, state.val, name); 
            }
            else if(id.startsWith(this.namespace + '.bus0.groups.')) {
                const name = id.substring(id.lastIndexOf('.') + 1);
                this.device.sendGroupState(0, state.val, name); 
            }
            else if(id.startsWith(this.namespace + '.bus0.scenes.')) {
                const name = id.substring(id.lastIndexOf('.') + 1);
                if (state.val){
                this.device.sendScene(0, name); }
            }
            else if(id == this.namespace + '.bus0.broadcast0') {
                this.device.sendBroadcast(0, state.val);  
            }
            
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }


    createDATAPOINTS (bus){

        
                /*for (let g=0; g<16;g++){
                    let gn; if(g<10){gn ='0'+g;} else{gn=g;}

                    this.setObjectNotExistsAsync('bus'+ bus + '.groups.g' + gn, {
                        _id: 'bus'+ bus + '.groups.group' + gn,
                        type: 'state',
                        common: {
                            name: 'Group ' + gn,
                            role: 'level',
                            type: 'number',
                            read: true,
                            write: true,
                            min: 0,
                            max: 100,
                            def: 0,
                            unit: "%"
                        },
                            "native": {}
                    });
                }*/
                for (let s=0; s<16;s++){
                    let sn; if(s<10){sn ='0'+s;} else{sn=s;}

                    this.setObjectNotExistsAsync('bus'+ bus + '.scenes.scene' + sn, {
                        id: 'bus'+ bus + '.scenes.scene' + sn,
                        type: 'state',
                        common: {
                            name: "Scene " + sn,
                            type: 'boolean',
                            role: 'button',
                            read: false,
                            write: true,
                            def: false
                        },
                            "native": {}
                    });
                }
                this.setObjectNotExistsAsync('bus'+ bus + '.broadcast' + bus, {
                        _id: 'bus'+ bus + '.broadcast' + bus,
                        type: 'state',
                        common: {
                            name: "Broadcast " + bus,
                            role: 'level',
                            type: "number",
                            read: true,
                            write: true,
                            min: 0,
                            max: 100,
                            def: 0,
                            unit: "%"
                        },
                            "native": {}
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


