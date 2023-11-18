import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleCommentReplyLike } from "@interfaces/article.interface";

export type ArticleCommentReplyLikeCreationAttributes = ArticleCommentReplyLike;

export class ArticleCommentReplyLikeModel extends Model<ArticleCommentReplyLike, ArticleCommentReplyLikeCreationAttributes> implements ArticleCommentReplyLike {
  public reply_id: number;
  public user_id: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleCommentReplyLikeModel {
  ArticleCommentReplyLikeModel.init(
    {
      reply_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "articles_comment_reply_likes",
      timestamps: true,
      paranoid: true,
      sequelize,
    },
  );

  return ArticleCommentReplyLikeModel;
}