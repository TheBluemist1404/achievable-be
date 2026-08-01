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
  title: {
    type: String,
    require: true
  },
  description: String,
  tags: [String],
  remindOptions: {
    type: [String],
    enum: ["2 days", "1 day", "1 hour"], 
    required: true
  },
  isCompleted: Boolean,
  dueDate: Date,
  slug: {
    type: String,
    require: true
  },
  completeDate: Date,
  completeStatus: {
    type: String,
    enum: ["early", "late"]
  }
}, {timestamps: true})

const Todo = mongoose.model("Todo", todoSchema)

export default Todo;