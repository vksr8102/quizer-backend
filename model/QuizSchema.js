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

const QuizSchema = new Schema({
    title: String,
    questions: [{
        type: Schema.Types.ObjectId,
        ref: "question"
    }
],
    updatedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    allowedUsers: [{ 
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

QuizSchema.pre('save', async function(next) {
    this.isDeleted = false;
    this.isActive = true;
    next();
});

QuizSchema.pre('insertMany', async function(next, docs) {
    if (docs && docs.length) {
        for (let i = 0; i < docs.length; i++) {
            const element = docs[i];
            element.isDeleted = false;
            element.isActive = true;
        }
    }
    next();
});

QuizSchema.method('toJSON', function() {
    const { _id, __v, ...object } = this.toObject({ virtuals: true });
    object.id = _id;
    return object;
});

QuizSchema.plugin(mongoosePaginate);
QuizSchema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });

export const Quiz = mongoose.model("quiz", QuizSchema);
