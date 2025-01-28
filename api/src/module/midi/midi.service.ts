import { Injectable } from '@nestjs/common';
import { MidiDto, Crypto } from 'common';
import * as fs from 'fs';
import { ImageTools } from '../../utils/image-tools';
import { Midi } from './midi.entity';
import { In, Like } from 'typeorm';
import { CONFIG } from '../../config/configuration';

const FS_BASE_PATH = process.env.PRODUCTION == 'true' ? '/app/api' : '';
@Injectable()
export class MidiService {

    public async latestMidi(page = 0, limit = 10) {
      return await Midi.find({
        skip: page * limit,
        take: limit,
        order: {
          chart: 'ASC',
          id: 'DESC'
        }
      })
    }

    public async forYouMidi(page = 0, limit = 6) {
      return await Midi.find({
        skip: page * limit,
        take: limit,
        order: {
          chart: 'ASC',
          id: 'DESC'
        }
        // TODO
      })
    }

    public async searchMidi(query: string, page = 0, limit = 10) {
      return await Midi.createQueryBuilder()
            .select()
            .where(`MATCH(name) AGAINST (:query IN BOOLEAN MODE) or name LIKE :queryJoin`, {
              query: `+${query.trim().replaceAll(' ', ' +')}*`,
              queryJoin: `%${query.split(' ').map(i => i.trim()).join('')}%`
            })
            .skip(page * limit)
            .take(limit)
            .getMany();
    }
  
    public async getMidiItemsBySlugs(slugs: string[]) {
      return await Midi.find({
        where: {
          slug: In(slugs)
        }
      })
    }


    public async getMidi(slug: string) {
      return await Midi.findOne({
        where: {
          slug
        }
      })
    }
  
    public async getRelatedMidi(slug: string, page = 0, limit = 10) {
      const midi = await Midi.findOne({
        where: {
          slug
        },
        relations: ['related']
      })
      if (!midi) {
        return []
      }
      return midi.related.slice(page * limit, (page * limit) + limit).filter(m => m.id !== midi.id)
    }
  
    public async getMidiFile(slug: string) {
      if (slug) {
        let midi = await Midi.findOne({
          where: {
            slug
          }
        })
        let file: string = null
        if (!fs.existsSync(`${FS_BASE_PATH}/assets/midi/enc/${midi.file}.enc`)) {
          file = Crypto.encryptFile(fs.readFileSync(`${FS_BASE_PATH}/assets/midi/file/${midi.file}`), CONFIG().midi.enc_key)
          fs.writeFileSync(`${FS_BASE_PATH}/assets/midi/enc/${midi.file}.enc`, file, 'utf8')
        } else {
          file = fs.readFileSync(`${FS_BASE_PATH}/assets/midi/enc/${midi.file}.enc`, 'utf8')
        }
        return file
      }else{

        return null
      }
    }

    public async getMidiImage(midi: Midi|MidiDto, info: {x: number, y: number, format: string}) {
      if(Number.isNaN(info.x) || Number.isNaN(info.y) || !info.format){
        info = {x: 300, y: 300, format: 'webp'}
      }
      const file = `${FS_BASE_PATH}/assets/midi/img/${midi.slug}.${info.x}x${info.y}.${info.format}`;
      if (!fs.existsSync(file)) {
        // let image = ImageTools.generateTexture(midi.name, info.x, info.y)
        // if(image){
        //   fs.writeFileSync(file, image, 'utf8')
        // }
      }
      return fs.createReadStream(file)
    }

}
