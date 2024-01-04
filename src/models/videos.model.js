import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videosSchema = new Schema(
  {
    video: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    thumbnail: {
      type: "String",
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublisherd: {
      type: Boolean,
    },
    views: {
      type: Number,
    },
  },
  { timestamps: true }
);

videosSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Videos", videosSchema);
