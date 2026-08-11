import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 30,
    },
  },
  { timestamps: true },
);

tagSchema.index({ ownerId: 1, name: 1 }, { unique: true });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
