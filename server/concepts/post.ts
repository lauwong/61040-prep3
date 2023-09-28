import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError } from "./errors";

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
}

export default class PostConcept {
  public readonly posts = new DocCollection<PostDoc>("posts");

  async create(author: ObjectId, content: string) {
    const _id = await this.posts.createOne({ author, content });
    return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
  }

  async read(query: Filter<PostDoc>) {
    const posts = await this.posts.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return posts;
  }

  async delete(user: ObjectId, _id: ObjectId) {
    const post = await this.posts.readOne({ _id });

    if (post == null) {
      throw new BadValuesError("Post not found!")
    }

    const author: ObjectId = post.author;

    if (author !== user) {
      throw new PostAuthorNotMatchError(author, user)
    }
    
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
