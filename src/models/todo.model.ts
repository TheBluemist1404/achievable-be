// export type TodoType = {
//   id: number;
//   todoTitle: string;
//   description?: string;
//   tags: string []
//   remindOptions: string[]
//   isCompleted: boolean;
//   dueDate: Date;
//   slug: string;
//   completeDate? : Date | null;
//   completeStatus?: "early" | "late"
// };

import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  tags: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    default: [],
  },
  remindOptions: {
    type: [String],
    enum: ["2 days", "1 day", "1 hour"], 
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  slug: {
    type: String,
    required: true
  },
  completeDate: {
    type: Date,
    default: null,
  },
  completeStatus: {
    type: String,
    enum: ["early", "late"]
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {timestamps: true})

const Todo = mongoose.model("Todo", todoSchema)

export default Todo;
