import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

    async sendEmail(html: string, subject: string, to: string) {
        // TODO
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: '',
                pass: ''
            }
        });

    }
}
