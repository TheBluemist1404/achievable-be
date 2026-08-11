import Tag from "@/models/tag.model";

export const getTags = async (userId: string) => {
  return Tag.find({ ownerId: userId }).sort({ name: 1 });
};

export const createTag = async (
  userId: string,
  name: string,
) => {
  let tag = await Tag.findOne({ ownerId: userId, name });

  if (!tag) {
    try {
      tag = await Tag.create({ ownerId: userId, name });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        tag = await Tag.findOne({ ownerId: userId, name });
      } else {
        throw error;
      }
    }
  }

  if (!tag) {
    throw new Error("Failed to create tag");
  }

  return { tag, tags: await getTags(userId) };
};
