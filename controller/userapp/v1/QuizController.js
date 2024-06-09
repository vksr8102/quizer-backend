import { Quiz } from "../../../model/QuizSchema.js";
import { Question } from "../../../model/questionShema.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const getNextQuestion = async (quiz, answeredQuestions) => {
    let difficulty;
    if (answeredQuestions.length === 0) {
        difficulty = 1;
    } else {
        const correctCount = answeredQuestions.filter(q => q.isCorrect).length;
        const averageDifficulty = answeredQuestions.reduce((acc, q) => acc + q.difficulty, 0) / answeredQuestions.length;
        if (correctCount / answeredQuestions.length > 0.75) {
            difficulty = averageDifficulty + 1;
        } else if (correctCount / answeredQuestions.length < 0.25) {
            difficulty = averageDifficulty - 1;
        } else {
            difficulty = averageDifficulty;
        }

        difficulty = Math.max(1, Math.min(5, difficulty));
    }

    // Filter the questions from the quiz directly
    const remainingQuestions = quiz.questions.filter(q => !answeredQuestions.some(a => a._id.equals(q._id)));
    const nextQuestion = remainingQuestions.find(q => q.difficulty === difficulty) || remainingQuestions[0];

    return nextQuestion;
};




/**
 * Start a specific quiz
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const startQuiz = asyncHandler(async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId).populate('questions').exec();

        if (!quiz) {
            return res.recordNotFound({ message: 'Quiz not found' });
        }
        if (!quiz.allowedUsers.includes(req.user.id)) {
            return res.unAuthorized({ message: 'You do not have permission to start this quiz' });
        }

        // Ensure the quiz has at least 20 questions
        if (quiz.questions.length < 20) {
            return res.badRequest({ message: 'Quiz must contain at least 20 questions' });
        }

        // Initialize answeredQuestions array to keep track of user's progress
        req.session.answeredQuestions = [];

        const nextQuestion = await getNextQuestion(quiz, req.session.answeredQuestions);

        return res.success({ quiz, nextQuestion });
    } catch (error) {
        return res.internalServerError({ message: 'Error starting quiz', error });
    }
});



export const submitAnswer = asyncHandler(async (req, res) => {
    try {
        const { quizId, questionId, selectedOption } = req.body;
        const quiz = await Quiz.findById(quizId).populate('questions').exec();

        if (!quiz) {
            return res.recordNotFound({ message: 'Quiz not found' });
        }

        const question = await Question.findById(questionId).exec();
        if (!question) {
            return res.recordNotFound({ message: 'Question not found' });
        }

        // Check the answer
        const isCorrect = question.correctOptions.includes(selectedOption);

        // Update answeredQuestions array
        const answeredQuestions = req.session.answeredQuestions || [];
        answeredQuestions.push({
            _id: question._id,
            isCorrect,
            difficulty: question.difficulty
        });
        req.session.answeredQuestions = answeredQuestions;

        // Get the next question
        const nextQuestion = await getNextQuestion(quiz, answeredQuestions);
        if (!nextQuestion) {
            // Calculate quiz results
            const correctCount = answeredQuestions.filter(q => q.isCorrect).length;
            const totalQuestions = quiz.questions.length;
            const score = (correctCount / totalQuestions) * 100;

            // Generate suggestions for improvement
            const suggestions = [];
            if (score < 50) {
                suggestions.push("Consider reviewing the basics and try again.");
            } else if (score < 75) {
                suggestions.push("Good job! Review the questions you missed and improve.");
            } else {
                suggestions.push("Great work! Keep practicing to maintain your proficiency.");
            }

            return res.success({ message: 'Quiz completed', score, suggestions });
        }
        return res.success({ nextQuestion, isCorrect });
    } catch (error) {
        return res.internalServerError({ message: 'Error submitting answer', error });
    }
});



/**
 * @description : Find all documents of Quizs from collection based on query and options.
 * @param {Object} req : Request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : Response contains data found from collection.
 * @return {Object} : Found Quiz(s). {status, message, data}
 */
export const findAllQuizs = asyncHandler(async (req, res) => {
    try {
      let query = {};
      let options = {};
      
      const validateRequest = validateFilterWithJoi(
        req.body,
        findQuizFilterKeys,
        Quiz.schema.obj
      );
  
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid request: ${validateRequest.message}` });
      }
  
      if (typeof req.body.query === "object" && req.body.query !== null) {
        query = { ...req.body.query };
      }
  
      if (req.body.isCountOnly) {
        const totalRecord = await count(Quiz, query);
        return res.success({ data: { totalRecord } });
      }
  
      if (typeof req.body.options === "object" && req.body.options) {
        options = { ...req.body.options };
      }
  
      const foundQuizs = await paginate(Quiz, query, options);
      if (!foundQuizs || !foundQuizs.data || !foundQuizs.data.length) {
        return res.recordNotFound();
      }
  
      return res.success({ data: foundQuizs });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  });
