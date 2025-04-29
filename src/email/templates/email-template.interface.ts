export interface EmailTemplateInterface {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
    ) => string;

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
    ) => string;

    getWelcomeCompanyEmailTemplate: (
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
        serviceName: string,
    ) => string;

    getTicketConfirmationEmailTemplate: (
        order: any, // заменить на OrderWithDetails
        ticketLinks: { itemId: number; ticketTitle: string; link: string }[],
        projectName: string,
        fullName: string,
    ) => string;
}
