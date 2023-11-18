import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleModel } from "@models/articles.model";
import { UserModel } from "@models/users.model";

import { ArticleBookmark } from "@interfaces/article.interface";

export type ArticleBookmarkCreationAttributes = ArticleBookmark;

export class ArticleBookmarkModel extends Model<ArticleBookmark, ArticleBookmarkCreationAttributes> implements ArticleBookmark {
  public article_id: number;
  public user_id: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleBookmarkModel {
  ArticleBookmarkModel.init(
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
      tableName: "articles_bookmarks",
      timestamps: true,
      paranoid: true,
      sequelize,
    },
  );

  return ArticleBookmarkModel;
}