export interface EmailTemplateInterface {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
        link: string,
    ) => string;

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
        link: string,
    ) => string;

    getWelcomeCompanyEmailTemplate: (
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
        serviceName: string,
        serviceEmail: string,
        link: string,
    ) => string;

    getTicketConfirmationEmailTemplate: (
        order: any,
        ticketLinks: { itemId: number; ticketTitle: string; link: string }[],
        projectName: string,
        fullName: string,
        link: string,
    ) => string;
}
