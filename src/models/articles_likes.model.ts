import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleModel } from "@models/articles.model";
import { UserModel } from "@models/users.model";

import { ArticleLike } from "@interfaces/article.interface";

export type ArticleLikeCreationAttributes = ArticleLike;

export class ArticleLikeModel extends Model<ArticleLike, ArticleLikeCreationAttributes> implements ArticleLike {
  public article_id: number;
  public user_id: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleLikeModel {
  ArticleLikeModel.init(
    {
      article_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "articles_likes",
      timestamps: true,
      paranoid: true,
      sequelize,
    },
  );

  return ArticleLikeModel;
}