import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import uniqueValidator from "mongoose-unique-validator";
import bcrypt from "bcrypt";

const myCustomLabels = {
    totalDocs: "itemsCount",
    docs: "data",
    limit: "perPage",
    page: "currentPage",
    nextPage: "next",
    prevPage: "prev",
    totalPages: "pageCount",
    pagingCounter: "slNo",
    meta: "paginator"
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionText: String,
    options: [String],
    correctOptions: [Number],
    difficulty: Number,
    category: String,
    weight: Number,
    tags: [String],
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Middleware to handle pre-save operations
QuestionSchema.pre('save', async function(next) {
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Middleware for insertMany operations
QuestionSchema.pre('insertMany', async function(next, docs) {
    if (docs && docs.length) {
        for (let i = 0; i < docs.length; i++) {
            const element = docs[i];
            element.isDeleted = false;
            element.isActive = true;
        }
    }
    next();
});

// Method to customize JSON output
QuestionSchema.method('toJSON', function() {
    const { _id, __v, ...object } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
});

// Applying plugins to the schema
QuestionSchema.plugin(mongoosePaginate);
QuestionSchema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });

export const Question = mongoose.model("question", QuestionSchema);
