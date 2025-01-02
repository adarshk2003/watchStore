exports.unblockUserTemplate = function (name, email, supportUrl) {
    return new Promise(async (resolve, reject) => {
        try {
            let template = `
              <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body, html {
                            padding: 0 !important;
                            margin: 0 !important;
                            font-family: sans-serif !important;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background-color: #ffffff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            background-color: #28a745;
                            color: #ffffff;
                            padding: 10px 0;
                            border-radius: 8px 8px 0 0;
                        }
                        .header h2 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 20px;
                        }
                        .content p {
                            margin: 0 0 15px;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            color: #ffffff;
                            background-color: #28a745;
                            text-decoration: none;
                            border-radius: 4px;
                            font-size: 16px;
                        }
                        .button:hover {
                            background-color: #1e7e34;
                        }
                        .footer {
                            text-align: center;
                            padding: 10px 0;
                            font-size: 14px;
                            color: #777;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Your Account Has Been Unblocked</h2>
                        </div>
                        <div class="content">
                            <strong>${email}</strong>
                            <p>Dear <strong>${name}</strong>,</p>
                            <p>We are pleased to inform you that your account has been successfully unblocked. We sincerely apologize for any inconvenience caused by the temporary suspension of your account.</p>
                            <p>We understand how frustrating it can be, and we assure you that we are working hard to prevent such issues in the future. Your account is now fully accessible, and we appreciate your patience and understanding throughout this process.</p>
                            <p>If you have any further concerns or questions, please don't hesitate to reach out to our support team using the link below:</p>
                            <p style="text-align: center;">
                                <a href="${supportUrl}" class="button">Contact Support</a>
                            </p>
                            <p>Thank you once again for your patience. We truly appreciate your continued trust in us.</p>
                            <p>Best regards,</p>
                            <p>The Support Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} clyro. All rights reserved.</p>
                        </div>
                    </div>
                </body>
              </html>
            `;
            resolve(template);
        } catch (error) {
            reject(error);
        }
    });
};