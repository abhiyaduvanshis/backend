const forgetEmailTemplate=(req,res)=>{
    const htmlBody =`
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Reset Your Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                <td align="center" style="padding: 40px 0;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #0d6efd; color: white;">
                        <h1 style="margin: 0;">Reset Your Password</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                        <p style="font-size: 16px;">Hi ${req?.fullName},</p>
                        <p style="font-size: 16px;">We received a request to reset your password. Click the button below to choose a new password.</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${req?.reset_link}" style="padding: 12px 24px; background-color: #0d6efd; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px;">Reset Password</a>
                        </p>
                        <p style="font-size: 14px; color: #666;">If you didn’t request a password reset, you can safely ignore this email. Your password won’t change until you access the link above and create a new one.</p>
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">Thanks,<br>The TodoList Team</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
        </body>
    </html>`

    return htmlBody;
}

export {forgetEmailTemplate}