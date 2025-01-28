import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

    public readonly FS_BASE_PATH = process.env.PRODUCTION == 'true' ? '/app/api' : '';

}
