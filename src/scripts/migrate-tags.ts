import connect from "@/config/database";
import Tag from "@/models/tag.model";
import Todo from "@/models/todo.model";
import User from "@/models/user.model";
import mongoose from "mongoose";

const normalizeLegacyTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0 && tag.length <= 30),
    ),
  ];
};

const migrateTags = async (): Promise<void> => {
  await connect();
  await Tag.init();

  const users = await User.collection.find({}).toArray();
  let migratedTodoCount = 0;

  for (const user of users) {
    const todos = await Todo.collection.find({ ownerId: user._id }).toArray();
    const names = new Set(normalizeLegacyTags(user.tags));

    for (const todo of todos) {
      for (const name of normalizeLegacyTags(todo.tags)) {
        names.add(name);
      }
    }

    const now = new Date();

    if (names.size > 0) {
      await Tag.collection.bulkWrite(
        [...names].map((name) => ({
          updateOne: {
            filter: { ownerId: user._id, name },
            update: {
              $setOnInsert: {
                ownerId: user._id,
                name,
                createdAt: now,
                updatedAt: now,
              },
            },
            upsert: true,
          },
        })),
      );
    }

    const tags = await Tag.collection
      .find({ ownerId: user._id, name: { $in: [...names] } })
      .toArray();
    const tagIdByName = new Map(tags.map((tag) => [tag.name, tag._id]));

    for (const todo of todos) {
      if (!Array.isArray(todo.tags) || !todo.tags.some((tag) => typeof tag === "string")) {
        continue;
      }

      const tagIds = todo.tags.flatMap((tag): mongoose.Types.ObjectId[] => {
        if (tag instanceof mongoose.Types.ObjectId) return [tag];
        if (typeof tag !== "string") return [];

        const tagId = tagIdByName.get(tag.trim().toLowerCase());
        return tagId ? [tagId] : [];
      });

      await Todo.collection.updateOne(
        { _id: todo._id },
        { $set: { tags: [...new Set(tagIds.map(String))].map((id) => new mongoose.Types.ObjectId(id)) } },
      );
      migratedTodoCount += 1;
    }

    if (Object.prototype.hasOwnProperty.call(user, "tags")) {
      await User.collection.updateOne(
        { _id: user._id },
        { $unset: { tags: "" } },
      );
    }
  }

  console.log(`Migrated ${migratedTodoCount} todos to tag references.`);
};

migrateTags()
  .catch((error: unknown) => {
    console.error("Tag migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
