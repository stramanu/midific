import { DataSource } from "typeorm";
import { Midi } from "./module/midi/midi.entity";
import {CONFIG} from './config/configuration';


export const AppDataSource = new DataSource({
    type: "mysql",
    host: CONFIG().database.host,
    port: CONFIG().database.port,
    username: CONFIG().database.username,
    password: CONFIG().database.password,
    database: CONFIG().database.database,
    synchronize: CONFIG().database.synchronize,
    logging: false,
    entities: [
        Midi
    ],
    subscribers: [],
    migrations: [],
})

interface DATA {
  link: string,
  url: string,
  title: string,
  related: [{
    url: string,
    title: string
  }]
}

export const AppDataSourceInit = async () => {
    try {
        await AppDataSource.initialize()

        // const generateSecretKey = (): string => {
        //     const keyLength = 32; // 32 bytes = 256 bits (AES-256)
        //     const buffer = new Uint8Array(keyLength);
        //     crypto.getRandomValues(buffer);
        //     return Array.from(buffer, (byte) =>
        //         byte.toString(16).padStart(2, '0')
        //     ).join('');
        // };
        // console.log('Secret key:', generateSecretKey())
        
        // here you can start to work with your database
        // console.log('Database initializing...')
        
        // // init database data, read from storage directory
        // let data = midiData0 as DATA[] 
        // data = data.concat(midiData1 as DATA[])
        // data = data.concat(midiData2 as DATA[])

        // let createProgress = '0%'
        
        // for (let i = 0; i < data.length; i++) {
        //     let item = data[i]
        //     // let midi = new Midi()
        //     // midi.name = item.title.trim().replace(/^Download\ /, '').replace(/-mid$/, '').replace(/.mid$/, '').trim()
        //     // midi.slug = item.link.replace(/^(.*bitmidi.com\/)/, '').replace(/-mid$/, '').replace(/.mid$/, '').trim()
        //     // midi.file = item.url.replace('/uploads/', '')
        //     // midi.price = 2.99
        //     // await midi.save()

        //     let file = item.url.replace('/uploads/', '')
        //     // check if file exists
        //     if (fs.existsSync(`./assets/midi/file/${file}`)) {
        //         // append to file test.txt
        //         fs.appendFileSync('./assets/midi/test.txt', `${file}\n`)
        //     }

        //     createProgress = Math.floor((i / data.length) * 100) + '%'
        //     console.log('Create progress', createProgress)
        // }

        // let updateProgress = '0%'
        // for (let i = 0; i < data.length; i++) {
        //     let item = data[i]
        //     if (!item.related || item.related.length <= 0) {
        //         continue
        //     }
        //     let slug = item.link.replace(/^(.*bitmidi.com\/)/, '').replace(/^\//, '').replace(/-mid$/, '').replace(/.mid$/, '').trim()
        //     let midi = await Midi.findOneBy({
        //         slug
        //     })
        //     if (!midi) {
        //         console.log('Midi not found', slug)
        //         continue
        //     }
        //     let related = await Promise.all(item.related.map(async (relatedItem) => {
        //         return await Midi.findOneBy({
        //             slug: relatedItem.url.replace(/^\//, '').replace(/-mid$/, '').replace(/.mid$/, '').trim()
        //         })
        //     }))
        //     related = related.filter((midi) => midi)
        //     if (related.length <= 0) {
        //         continue
        //     }
        //     midi.related = related
        //     await midi.save()
        //     updateProgress = Math.floor((i / data.length) * 100) + '%'
        //     console.log('Update progress', updateProgress)
        // }


        // for (let i = 0; i < chart.length; i++) {
        //     let item = chart[i]
        //     try {
        //         let query = item.trim()
        //         if (query.length <= 0) {
        //             continue
        //         }
        //         let midis = await Midi.createQueryBuilder()
        //             .select()
        //             .where(`MATCH(name) AGAINST (:query IN BOOLEAN MODE)`, {
        //                 query: `+${query.replaceAll('"', ' ').replaceAll(' ', ' +')}*`
        //             })
        //             .getMany();
                
        //         if (midis.length <= 0) {
        //             continue
        //         }

        //         for (let j = 0; j < midis.length; j++) {
        //             let midi = midis[j]
        //             midi.price = 1.99
        //             midi.chart = (100000 - chart.length) + i
        //             await midi.save()
        //         }
        //     } catch (error) {
        //         console.log('Error', error)
        //     }
        // }


        console.log('Database initialized')


    } catch (error) {
        console.log('Database initialization error', error)
        // retry in 5 seconds
        console.log('Retry in 5 seconds...')
        setTimeout(AppDataSourceInit, 5000)
    }
}

// CREATE USER 'midific'@'%' IDENTIFIED BY 'Mf!4rE9z';
// GRANT ALL PRIVILEGES ON * . * TO 'midific'@'%';