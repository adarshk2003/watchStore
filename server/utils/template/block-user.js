exports.blockUserTemplate = function (name, reason, supportUrl) {
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
                            background-color: #dc3545;
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
                            background-color: #dc3545;
                            text-decoration: none;
                            border-radius: 4px;
                            font-size: 16px;
                        }
                        .button:hover {
                            background-color: #a71d2a;
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
                            <h2>Account Blocked</h2>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${name}</strong>,</p>
                            <p>We regret to inform you that your account has been temporarily blocked due to the following reason:</p>
                            <p><strong>${reason}</strong></p>
                            <p>If you believe this is a mistake or need assistance, please contact our support team using the link below:</p>
                            <p style="text-align: center;">
                                <a href="${supportUrl}" class="button">Contact Support</a>
                            </p>
                            <p>We appreciate your understanding and cooperation.</p>
                            <p>Best regards,</p>
                            <p>The Support Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
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
  