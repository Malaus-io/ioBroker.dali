const dali = require('./dali');


//const query [device type, groups 0,7 , groups 8,15, physical min level, actual level]
//const queryDali = ['0x99', '0xc0', '0xc1', '0x9a', '0xa0'];
const queryDali = {
    level: '0xa0',
    min: '0x9a',
    group07: '0xc0',
    group815: '0xc1'
}
const queryEDali = {
    switchState: '0xc0',
    eventSource: '0xbe'
}
const daliSize = ['0x03', '0x04', '0x06'];
//const daliClass []
const daliClass = ['0x00', '0x05'];

const typeDali = ['Fluoresecent Lamps', 'Emergency lighting', 'Discharge Lamps', 'Low Voltage Halogen Lamps', 'Supply Voltage Regulator', 
                'DALI to 1-10V', 'LED Modules', 'Relays', 'Color Controls', 'Sequencers','unknown' ,'unknown','unknown','unknown','unknown', 
                'Load referencing', 'Thermal Gear Protection', 'Dimming Curve Selection', 'unknown', 'unknown', 'Demand Response',
                 'Thermal Lamp Protection'
];
const typeEDali = ['Dali CS Temp', 'Dali CS Irda', 'Dali CS LS', 'Dali Touch', 'Dali MC', 'Dali Switch', 'Dali MC+', 'wDali Receiver', 
                    'Dali 100k', 'Dali Bluetooth 4.0', 'Dali Corridor Module', 'Dali Daylight BE', 'Dali Sequencer'
];



const states = {

    level: {
        name: 'level',
        type: 'number',
        min: 0,
        max: 100, 
        unit: '%', 
        role: 'level.dimmer',
        read: true,
        write: true
    },

    switchState: {
        name: 'switchState',
        type: 'number',
        role: 'state',
        read: true,
        write: false
    },

    eventSource: {
        name: 'source',
        type: 'string',
        role: 'state',
        read: true,
        write: false
    },

    min: {
        name: 'min level',
        type: 'string',
        role: 'state',
        read: true,
        write: false
    },

    group: {
        name: 'group',
        type: 'string',
        role: 'state',
        read: true,
        write: false
    }
}

    const devices = {

        'LED Modules': {
            name: 'LED Modul',
            folder: '.lamps',
            size: daliSize[0],
            class: daliClass[0],
            info: {
                state: [queryDali.level, states.level],
                min: [queryDali.min, states.min],
                group07: queryDali.group07,
                group815: queryDali.group815,
                group: ['group', states.group],
                levelpos: 'levelpos'
            }
        },

        'Dali MC+': {
            name: 'Dali MC+',
            folder: '.device',
            size: daliSize[1],
            class: daliClass[1],
            info: {
                state: [queryEDali.switchState, states.switchState],
                source: [queryEDali.eventSource, states.eventSource]
            }
        },

        'Dali Switch': {
            name: 'Dali Switch',
            folder: '.device',
            size: daliSize[1],
            class: daliClass[1],
            info: {
                state: [queryEDali.switchState, states.switchState],
                source: [queryEDali.eventSource, states.eventSource]
            }
        }


    }
    


    class Device {

        constructor (name, folder, size, daliClass, info) {
        
            this.name = name;
            this.folder = folder;
            this.size = size;
            this.daliClass = daliClass;
            this.info = info;
       }
       /*
       getLevel() {
        const data =  await this.getInfo(bus, address, lib.devices[name].info[i], lib.devices[name].size, lib.devices[name].class);
        return Math.round((data[14]/254)*100);
       }*/
    }


this.d = [
    new Device (
    'LED Modules', '.lamps', daliSize[0], daliClass[0], 
       {
               level: [queryDali.level, states.level], 
               min: queryDali.min,
               group07: queryDali.group07,
               group815: queryDali.group815,
               group: 'group',
               levelpos: 'levelpos'
           }),
    new Device ('Dali MC+', '.device', daliSize[1], daliClass[1], 
    {
        state: queryEDali.switchState,
        source: queryEDali.eventSource
        }), 
    new Device ('Dali Switch', '.device', daliSize[1], daliClass[1], 
        {
            state: queryEDali.switchState,
            source: queryEDali.eventSource
            })
    ]



/*
    const d = getdevices();

    function getdevices(){

        let e = {}
        for (const i in devices){

            e[i] = new Device (devices[i].name, devices[i].folder, devices[i].size, devices[i].class, devices[i].info)
        }
        return e
    }
*/
  /*  
 const d = new Device ([
                             'LED Modules', '.lamps', daliSize[0], daliClass[0], 
                                {
                                        level: queryDali.level,
                                        min: queryDali.min,
                                        group07: queryDali.group07,
                                        group815: queryDali.group815,
                                        group: 'group',
                                        levelpos: 'levelpos'
                                    },
            'Dali MC+', '.device', daliSize[1], daliClass[1], 
                            {
                                state: queryEDali.switchState,
                                source: queryEDali.eventSource
                                },
            'Dali Switch', '.device', daliSize[1], daliClass[1], 
             {
                state: queryEDali.switchState,
                source: queryEDali.eventSource
                },
            
            ])

*/
   /*
        getLevel() {

           return Math.round((this.info.level...));
       } 
    }
*/
    



            


module.exports = {info: Device,
                    device: devices
}

/*{
    devices: devices,
    states: states
};*/