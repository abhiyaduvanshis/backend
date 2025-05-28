const emailTemplate=(req,res)=>{
    const htmlBody = `
        <!DOCTYPE html>
        <html>
            <head>
            <meta charset="UTF-8" />
            <title>Email Notification</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                }
                .container {
                background-color: #ffffff;
                margin: 30px auto;
                padding: 20px;
                max-width: 600px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333333;
                }
                .body {
                font-size: 16px;
                color: #555555;
                line-height: 1.6;
                }
                .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #999999;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">Verify Email</div>
                <div class="body">
                <p>Hi ${req?.fullName},</p>
                <p>Thank you for registering with us.</p>
                <p>Please verify your email address by clicking the link below:</p>
                <p><a href='https://gyanimeter.co.in/'>https://gyanimeter.co.in</a></p>
                <p>If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                Regards,<br />
                Todo List Team
                </div>
            </div>
            </body>
        </html>`;

    return htmlBody;
}

export {emailTemplate}