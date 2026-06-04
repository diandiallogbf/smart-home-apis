import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        try {
            // Ethereal is a fake SMTP service for testing
            const testAccount = await nodemailer.createTestAccount();

            this.transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            console.log('Test email account generated. You can view emails at https://ethereal.email');
        } catch (error) {
            console.error('Error initializing EmailService:', error);
        }
    }

    async sendTemporaryPassword(email: string, tempPassword: string) {
        if (!this.transporter) {
            console.warn('EmailService is not initialized yet. Cannot send email.');
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: '"Smart Home UFG" <noreply@smarthomeufg.com>',
                to: email,
                subject: "Bienvenue ! Votre mot de passe temporaire",
                text: `Bonjour,\n\nVotre compte Smart Home a été créé avec succès.\nVoici votre mot de passe temporaire : ${tempPassword}\n\nVous devrez le modifier lors de votre première connexion.\n\nCordialement,\nL'équipe Smart Home UFG`,
                html: `
                    <h2>Bienvenue sur Smart Home UFG !</h2>
                    <p>Votre compte a été créé avec succès.</p>
                    <p>Voici votre mot de passe temporaire : <strong>${tempPassword}</strong></p>
                    <p><em>Vous devrez le modifier lors de votre première connexion.</em></p>
                    <br/>
                    <p>Cordialement,<br/>L'équipe Smart Home UFG</p>
                `,
            });

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
