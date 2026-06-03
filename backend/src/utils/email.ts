import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const buildTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  // Port 465 uses implicit TLS (secure); 587/25 use STARTTLS.
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions) => {
  const transporter = buildTransporter();

  // Many providers require the From address to match the authenticated mailbox.
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@oncorg.com';

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendCriticalIssueEmail = async (report: any, hospital: any, equipment: any) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@cms.com';
  
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #F43F5E;">🚨 CRITICAL ISSUE REPORTED</h2>
      <p>A new critical service report has been raised on the CMS Platform.</p>
      
      <div style="background: #F8FAFC; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Hospital:</strong> ${hospital.name} (${hospital.code})</p>
        <p><strong>Equipment:</strong> ${equipment.name} [${equipment.equipmentCode}]</p>
        <p><strong>Issue:</strong> ${report.issueDescription}</p>
        <p><strong>Reported By:</strong> ${report.reportedBy.name || 'Staff'}</p>
        <p><strong>SLA Target:</strong> ${new Date(report.sla.targetTime).toLocaleString()}</p>
      </div>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/super/service-reports/${report._id}" 
         style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Report Details
      </a>
      
      <p style="font-size: 12px; color: #94A3B8; margin-top: 30px;">
        This is an automated notification from Centralized Medical Solutions.
      </p>
    </div>
  `;

  await sendEmail({
    to: superAdminEmail,
    subject: `[CRITICAL] New Service Issue: ${hospital.name} - ${equipment.name}`,
    html
  });
};
