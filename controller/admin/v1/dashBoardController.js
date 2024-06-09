import { USER_TYPE } from "../../../constants/authConstant.js";
import { Quiz } from "../../../model/QuizSchema.js";
import { user } from "../../../model/user.js";
import { sendInvitationEamilforQuiz } from "../../../services/auth.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { schemaKeys } from "../../../utils/validation/userValidation.js";
import { validateParamsWithJoi } from "../../../utils/validationRequest.js";
import bcrypt from 'bcrypt'
export const givePermission = asyncHandler(async (req, res) => {
    try {
        const { email, phone, quizId } = req.body;

        if (!email || !phone || !quizId) {
            return res.badRequest({ message: 'Insufficient request parameters! Email, phone, and quizId are required.' });
        }

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.recordNotFound({ message: 'Quiz not found.' });
        }

        // Check if the user already exists
        let existingUser = await user.findOne({ email });

        if (existingUser) {
            // If user exists and already allowed, return a message
            if (quiz.allowedUsers.includes(existingUser._id.toString())) {
                return res.success({ message: `User ${email} already has permission to take the quiz ${quiz.title}` });
            }

            // If user exists and not already allowed, add to allowed users
            quiz.allowedUsers.push(existingUser._id.toString());
            await quiz.save();
            const mail =  await sendInvitationEamilforQuiz( email, phone ,quiz.title);
            console.log("mail",mail)

            const hashedPhone = await bcrypt.hash(phone, 8);
            await user.updateOne({ _id: existingUser._id }, { password: hashedPhone, resetPasswordLink: {}, loginRetryLimit: 0 });

            return res.success({ message: `User ${email} is successfully added to give the quiz ${quiz.title}` });
        } else {
            // If user does not exist, create a new user
            const newUser = {
                email,
                password: phone
            };

            let validationRequest = validateParamsWithJoi(newUser, schemaKeys);
            if (!validationRequest.isValid) {
                return res.validationError({ message: `Invalid values in parameters, ${validationRequest.message}` });
            }

            const createdUser = new user({
                email: newUser.email,
                password: newUser.password,
                userType: USER_TYPE.USER
            });

            const result = await createdUser.save();
            if (result) {
                quiz.allowedUsers.push(result._id.toString());
                await quiz.save();
             const mail =  await sendInvitationEamilforQuiz(email, phone ,quiz.title);
             console.log("mail",mail)


                return res.success({ message: `User ${email} is successfully created and added to give the quiz ${quiz.title}` });
            } else {
                return res.internalServerError({ message: 'Error creating the user.' });
            }
        }
    } catch (error) {
        console.log(error)
        return res.internalServerError({ message: error.message });
    }
});

export const revokePermission = asyncHandler(async (req, res) => {
    try {
        const { email, quizId } = req.body;

        if (!email || !quizId) {
            return res.badRequest({ message: 'Insufficient request parameters! Email and quizId are required.' });
        }

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.recordNotFound({ message: 'Quiz not found.' });
        }

        // Check if the user exists
        const existingUser = await user.findOne({ email });

        if (!existingUser) {
            return res.recordNotFound({ message: 'User not found.' });
        }

        // Check if the user has permission for the quiz
        const userIndex = quiz.allowedUsers.indexOf(existingUser._id.toString());
        if (userIndex === -1) {
            return res.success({ message: `User ${email} does not have permission for the quiz ${quiz.title}` });
        }

        // Remove the user from the allowed users list
        quiz.allowedUsers.splice(userIndex, 1);
        await quiz.save();

        return res.success({ message: `User ${email} is successfully removed from the quiz ${quiz.title}` });
    } catch (error) {
        console.log(error);
        return res.internalServerError({ message: error.message });
    }
});
