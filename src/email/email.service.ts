// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { GoogleOAuthService } from '../google/google-oauth.service';
import * as fs from 'fs';
import * as path from 'path';
import { OrderWithDetails } from "../models/orders/orders.repository";
import { EmailTemplateInterface } from './templates/email-template.interface';

const themeModules = {
    '1': () => import('./templates/1-email-templates'),
    '2': () => import('./templates/2-email.templates'),
};

@Injectable()
export class EmailService {
    private gmailUser: string;
    private appName: string;
    private logo: any;
    private templates: EmailTemplateInterface;

    constructor(
        private readonly configService: ConfigService,
        private readonly googleOAuthService: GoogleOAuthService,
    ) {
        this.gmailUser = String(
            this.configService.get<string>('google.gmailApi.user'),
        );
        this.appName = String(this.configService.get<string>('app.name'));
        this.googleOAuthService.setCredentials(
            String(
                this.configService.get<string>('google.gmailApi.refreshToken'),
            ),
        );

        this.init();
    }

    private async init() {
        const logoPath = String(
            this.configService.get<string>('app.logo.path'),
        );
        const logoFilename = String(
            this.configService.get<string>('app.logo.filename'),
        );
        this.logo = await this.readLogoFile(path.join(logoPath, logoFilename));

        await this.loadTemplates();
    }

    private async loadTemplates() {
        const themeId = this.configService.get<string>('APP_THEME_ID') || '1';

        try {
            if (!themeModules[themeId]) {
                console.warn(`Template for theme ID ${themeId} not found, using default theme 1`);
                this.templates = (await themeModules['1']()).default;
            } else {
                const module = await themeModules[themeId]();
                this.templates = module.default || module;
            }
        } catch (error) {
            console.error(`Error loading email templates for theme ${themeId}:`, error);
            const defaultModule = await import('./templates/1-email-templates');
            this.templates = defaultModule.default || defaultModule;
        }
    }

    private async readLogoFile(filePath: string): Promise<Buffer> {
        return fs.readFileSync(path.resolve(filePath));
    }

    private async readHtmlFile(filePath: string): Promise<string> {
        return fs.readFileSync(path.resolve(filePath), 'utf-8');
    }

    private async createTransport() {
        const themeId = Number(this.configService.get<string>('app.theme.id'));
        console.log(
            `Using transport: ${themeId === 2 ? 'Gmail' : 'Ethereal'}`,
        );

        if (themeId === 2) { // TODO: for presentation
            const accessToken = await this.googleOAuthService.getAccessToken();
            const oauthDetails = this.googleOAuthService.getOAuthCredentials();

            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: this.gmailUser,
                    clientId: oauthDetails.clientId,
                    clientSecret: oauthDetails.clientSecret,
                    refreshToken: oauthDetails.refreshToken,
                    redirectUri: oauthDetails.redirectUri,
                    accessToken,
                },
            });
        } else if (themeId === 1) {
            return nodemailer.createTransport({
                host: this.configService.get<string>('ETHEREAL_HOST'),
                port: this.configService.get<number>('ETHEREAL_PORT'),
                auth: {
                    user: this.configService.get<string>('ETHEREAL_USER'),
                    pass: this.configService.get<string>('ETHEREAL_PASS'),
                },
            });
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const transporter = await this.createTransport();

            const info = await transporter.sendMail({
                from: this.gmailUser,
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: String(
                            this.configService.get<string>('app.logo.path'),
                        ),
                        content: this.logo,
                        cid: 'logo@project',
                    },
                ],
            });
            console.log(`Email sent successfully: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }

    async sendConfirmationEmail(
        to: string,
        confirmationLink: string,
        fullName: string,
    ): Promise<void> {
        const html = this.templates.getConfirmationEmailTemplate(
            confirmationLink,
            this.appName,
            fullName
        );
        await this.sendEmail(
            to,
            `[Action Required] Confirm Email | ${this.appName}`,
            html,
        );
    }

    async sendResetPasswordEmail(to: string, resetLink: string, fullName: string): Promise<void> {
        const html = this.templates.getResetPasswordEmailTemplate(resetLink, this.appName, fullName);
        await this.sendEmail(
            to,
            `[Action Required] Password Reset | ${this.appName}`,
            html,
        );
    }

    async sendWelcomeCompanyEmail(
        to: string,
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
    ): Promise<void> {
        const html = this.templates.getWelcomeCompanyEmailTemplate(
            companyOwnerName,
            companyTitle,
            redirectLink,
            this.appName,
        );
        await this.sendEmail(
            to,
            `Welcome to ${this.appName} – Start Selling Tickets Today! 🎉`,
            html,
        );
    }

    async sendTicketConfirmationEmail(
        to: string,
        order: OrderWithDetails,
        ticketLinks: { itemId: number; ticketTitle: string; link: string }[],
        fullName: string,
    ): Promise<void> {
        const html = this.templates.getTicketConfirmationEmailTemplate(
            order,
            ticketLinks,
            this.appName,
            fullName,
        );
        await this.sendEmail(
            to,
            `[${this.appName}] Your Tickets for Order #${order.id}`,
            html,
        );
    }
}
