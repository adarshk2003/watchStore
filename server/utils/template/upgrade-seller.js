exports.upgradeToSellerTemplate = function (name, email, supportUrl) {
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
                            background-color: #218838;
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
                            <h2>Account Upgraded to Seller</h2>
                        </div>
                        <div class="content">
                            <strong>${email}</strong>
                            <p>Dear <strong>${name}</strong>,</p>
                            <p>Congratulations! Your account has been successfully upgraded to a seller account.</p>
                            <p>You can now start listing and selling your products on our platform.</p>
                            <p>If you have any questions or need assistance, feel free to contact our support team using the link below:</p>
                            <p style="text-align: center;">
                                <a href="${supportUrl}" class="button">Contact Support</a>
                            </p>
                            <p>We are excited to have you on board and look forward to your success as a seller!</p>
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
