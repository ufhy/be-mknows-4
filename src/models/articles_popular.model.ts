import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleLike, ArticlePopular } from "@interfaces/article.interface";

export type ArticlePopularCreationAttributes = ArticlePopular;

export class ArticlePopularModel extends Model<ArticleLike, ArticlePopularCreationAttributes> implements ArticlePopular {
  public article_id: number;
  public user_id: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticlePopularModel {
  ArticlePopularModel.init(
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
      tableName: "articles_populars",
      timestamps: true,
      paranoid: true,
      sequelize,
    },
  );

  return ArticlePopularModel;
}