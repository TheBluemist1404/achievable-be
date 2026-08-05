import User from "@/models/user.model";

export const getTags = async (userId: string): Promise<string[] | null> => {
  const user = await User.findById(userId).select("tags");
  return user?.tags ?? null;
};

export const createTag = async (
  userId: string,
  name: string,
): Promise<{ tag: string; tags: string[] } | null> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { tags: name } },
    { new: true, runValidators: true },
  ).select("tags");

  return user ? { tag: name, tags: user.tags } : null;
};
