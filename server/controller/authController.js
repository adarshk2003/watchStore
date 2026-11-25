const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const users = require('../db/models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
const user_type = require('../db/models/user_type');
const { sendEmail } = require('../utils/sendemail');
dotenv.config();

const resetOtpLifetimeMs = 10 * 60 * 1000;
const resetOtpCooldownMs = 60 * 1000;
const resetOtpMaxAttempts = 5;

function hashResetOtp(email, otp) {
    if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY must be configured to use password reset.');
    }

    return crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
        .update(`${email}:${otp}`)
        .digest('hex');
}

function findUserByEmail(email, { select, populate, caseInsensitive = false } = {}) {
    const query = users.findOne({ email });
    if (caseInsensitive) query.collation({ locale: 'en', strength: 2 });
    if (select) query.select(select);
    if (populate) query.populate(populate, 'user_type');
    return query.lean();
}

async function findUserByEmailWithLegacyFallback(email, options) {
    const user = await findUserByEmail(email, options);
    return user || findUserByEmail(email, { ...options, caseInsensitive: true });
}

exports.login = async function (req, res) {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

        let password = req.body.password;

        // Validations
        let user = await findUserByEmailWithLegacyFallback(email, {
            select: '_id user_type isBlocked +password',
            populate: 'user_type',
        });

        if (user) {
            if (user.isBlocked) {
                let response = error_function({
                    statusCode: 403,
                    message: "User is blocked",
                });
                res.status(response.statusCode).send(response);
                return;
            }

            let _id = user._id;
            let user_type_doc = user.user_type;
            let raw_user_type = user_type_doc?._id ? user_type_doc._id.toString() : (user.user_type ? user.user_type.toString() : '');
            let role_name = user_type_doc?.user_type || (raw_user_type === '675870dbae9c6b1dffa1a7ed' ? 'admin' : raw_user_type === '675870f3ae9c6b1dffa1a7ee' ? 'seller' : 'buyer');

            let db_password = user.password;

            let passwordMatch = await bcrypt.compare(password, db_password);

            if (passwordMatch) {
                let token = jwt.sign({ user_id: user._id, role: role_name }, process.env.PRIVATE_KEY, { expiresIn: "100d" });

                let response = success_function({
                    statusCode: 200,
                    data: {
                        token,
                        _id,
                        user_type: raw_user_type,
                        role: role_name,
                        isBlocked: Boolean(user.isBlocked),
                    },
                    message: "Login successful",
                });

                res.status(response.statusCode).send(response);
                return;
            } else {
                let response = error_function({
                    statusCode: 400,
                    message: "Invalid password",
                });

                res.status(response.statusCode).send(response);
                return;
            }

        } else {
            let response = error_function({
                statusCode: 404,
                message: "User not found",
            });

            res.status(response.statusCode).send(response);
            return;
        }

    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.requestPasswordReset = async function (req, res) {
    const genericResponse = {
        message: 'If an account exists for that email, a password reset code will be sent.',
    };

    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }

        const user = await findUserByEmailWithLegacyFallback(email, {
            select: '+passwordResetOtpSentAt',
        });
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const now = new Date();
        if (
            user.passwordResetOtpSentAt &&
            now.getTime() - user.passwordResetOtpSentAt.getTime() < resetOtpCooldownMs
        ) {
            return res.status(200).json(genericResponse);
        }

        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
        const otpHash = hashResetOtp(email, otp);
        await users.updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordResetOtpHash: otpHash,
                    passwordResetOtpExpiresAt: new Date(now.getTime() + resetOtpLifetimeMs),
                    passwordResetOtpSentAt: now,
                    passwordResetOtpAttempts: 0,
                },
            }
        );

        try {
            await sendEmail(
                user.email,
                'Your Clyro password reset code',
                `<p>Your password reset code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`
            );
        } catch (error) {
            await users.updateOne(
                { _id: user._id, passwordResetOtpHash: otpHash },
                {
                    $unset: {
                        passwordResetOtpHash: 1,
                        passwordResetOtpExpiresAt: 1,
                        passwordResetOtpSentAt: 1,
                    },
                    $set: { passwordResetOtpAttempts: 0 },
                }
            );
            console.error('Password reset email delivery failed:', error?.code || 'SMTP error');
            return res.status(200).json(genericResponse);
        }

        return res.status(200).json(genericResponse);
    } catch (error) {
        console.error('Password reset request failed:', error);
        return res.status(500).json({ message: 'Unable to process the password reset request.' });
    }
};

exports.resetPassword = async function (req, res) {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
        const password = req.body.password;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ message: 'Enter the 6-digit reset code.' });
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        const user = await findUserByEmailWithLegacyFallback(email, {
            select: '+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts',
        });
        const now = new Date();
        if (
            !user ||
            !user.passwordResetOtpHash ||
            !user.passwordResetOtpExpiresAt ||
            user.passwordResetOtpExpiresAt <= now ||
            user.passwordResetOtpAttempts >= resetOtpMaxAttempts
        ) {
            return res.status(400).json({ message: 'The reset code is invalid or expired. Request a new code.' });
        }

        const submittedHash = Buffer.from(hashResetOtp(email, otp), 'hex');
        const storedHash = Buffer.from(user.passwordResetOtpHash, 'hex');
        const validOtp =
            submittedHash.length === storedHash.length &&
            crypto.timingSafeEqual(submittedHash, storedHash);

        if (!validOtp) {
            const attemptUpdate = await users.updateOne(
                {
                    _id: user._id,
                    passwordResetOtpHash: user.passwordResetOtpHash,
                    passwordResetOtpExpiresAt: { $gt: now },
                    passwordResetOtpAttempts: { $lt: resetOtpMaxAttempts },
                },
                { $inc: { passwordResetOtpAttempts: 1 } }
            );
            if (attemptUpdate.modifiedCount) {
                await users.updateOne(
                    {
                        _id: user._id,
                        passwordResetOtpHash: user.passwordResetOtpHash,
                        passwordResetOtpAttempts: { $gte: resetOtpMaxAttempts },
                    },
                    {
                        $unset: {
                            passwordResetOtpHash: 1,
                            passwordResetOtpExpiresAt: 1,
                            passwordResetOtpSentAt: 1,
                        },
                        $set: { passwordResetOtpAttempts: 0 },
                    }
                );
            }
            return res.status(400).json({ message: 'The reset code is invalid or expired. Request a new code.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const updateResult = await users.updateOne(
            {
                _id: user._id,
                passwordResetOtpHash: user.passwordResetOtpHash,
                passwordResetOtpExpiresAt: { $gt: now },
                passwordResetOtpAttempts: { $lt: resetOtpMaxAttempts },
            },
            {
                $set: { password: hashedPassword, passwordResetOtpAttempts: 0 },
                $unset: {
                    passwordResetOtpHash: 1,
                    passwordResetOtpExpiresAt: 1,
                    passwordResetOtpSentAt: 1,
                },
            }
        );

        if (!updateResult.modifiedCount) {
            return res.status(400).json({ message: 'The reset code is invalid or expired. Request a new code.' });
        }

        return res.status(200).json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Password reset failed:', error);
        return res.status(500).json({ message: 'Unable to reset the password.' });
    }
};
