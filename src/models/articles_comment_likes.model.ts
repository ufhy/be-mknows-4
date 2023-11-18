import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleCommentLike } from "@interfaces/article.interface";

export type ArticleCommentLikeCreationAttributes = ArticleCommentLike;

export class ArticleCommentLikeModel extends Model<ArticleCommentLike, ArticleCommentLikeCreationAttributes> implements ArticleCommentLike {
  public comment_id: number;
  public user_id: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleCommentLikeModel {
  ArticleCommentLikeModel.init(
    {
      comment_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "articles_comment_likes",
      timestamps: true,
      paranoid: true,
      sequelize,
    },
  );

  return ArticleCommentLikeModel;
}