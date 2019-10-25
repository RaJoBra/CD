import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

export const FROM = 'Eric Bender <bebe1020@hs-karlsruhe.de>';

export const MAIL_CONFIG: SMTPTransport.Options = {
    host: '127.0.0.1',
    port: 25000,
    secure: false,
    priority: 'normal',
    logger: true,
    headers: { 'X-ProvidesBy': 'Software Engineering'},

}