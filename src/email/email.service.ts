// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
    getConfirmationEmailTemplate,
    getResetPasswordEmailTemplate, getWelcomeCompanyEmailTemplate,
} from './email.templates';
import { GoogleOAuthService } from '../google/google-oauth.service';
import * as fs from 'fs';
import * as path from 'path';
import { getTicketConfirmationEmailTemplate } from './email.templates';
import {Prisma} from "@prisma/client";
import {OrderWithDetails} from "../models/orders/orders.repository";

@Injectable()
export class EmailService {
    private gmailUser: string;
    private appName: string;
    private logo: any;

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
    }

    private async readLogoFile(filePath: string): Promise<Buffer> {
        return fs.readFileSync(path.resolve(filePath));
    }

    private async readHtmlFile(filePath: string): Promise<string> {
        return fs.readFileSync(path.resolve(filePath), 'utf-8');
    }

    private async createTransport() {
        const nodeEnv = this.configService.get<string>('app.nodeEnv');
        console.log(
            `Using transport: ${nodeEnv === 'production' ? 'Gmail' : 'Ethereal'}`,
        );
        if (nodeEnv === 'production') {
            // if (nodeEnv === 'development') { // TODO: for presentation
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
        } else if (nodeEnv === 'test' || nodeEnv === 'development') {
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

            // transporter.on("token", (token) => {
            //     console.log("A new access token was generated");
            //     console.log("User: %s", token.users);
            //     console.log("Access Token: %s", token.accessToken);
            //     console.log("Expires: %s", new Date(token.expires));
            // });

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
        const html = getConfirmationEmailTemplate(
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
        const html = getResetPasswordEmailTemplate(resetLink, this.appName, fullName);
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
        const html = getWelcomeCompanyEmailTemplate(
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
        const html = getTicketConfirmationEmailTemplate(
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
