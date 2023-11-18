import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleModel } from "@models/articles.model";

import { ArticleComment } from "@interfaces/article.interface";
import { UserModel } from './users.model';
import { FileModel } from './files.model';
import { User } from '@/interfaces/user.interface';

export type ArticleCommentCreationAttributes = ArticleComment;

export class ArticleCommentModel extends Model<ArticleComment, ArticleCommentCreationAttributes> implements ArticleComment {
  public pk: number;
  public uuid: string;
  public article_id: number;
  public author_id: number;
  public comment: string;

  public readonly author: User;
  public likes: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleCommentModel {
  ArticleCommentModel.init(
    {
      pk: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      article_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      author_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "articles_comments",
      timestamps: true,
      paranoid: true,
      sequelize,
      defaultScope: {
        include: [
          {
            attributes: ["uuid", "full_name", "display_picture"],
            model: UserModel,
            as: "author",
            include: [
              {
                attributes: ["uuid"],
                model: FileModel,
                as: "avatar"
              }
            ]
          }
        ]
      }
    },
  );

  ArticleModel.hasMany(ArticleCommentModel, { foreignKey: "article_id", as: "comments" });
  ArticleCommentModel.belongsTo(ArticleModel, { foreignKey: "article_id", as: "article" });
  ArticleCommentModel.belongsTo(UserModel, { foreignKey: "author_id", as: "author" });

  return ArticleCommentModel;
}