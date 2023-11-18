import { Sequelize, DataTypes, Model } from "sequelize";

import { ArticleModel } from "@models/articles.model";

import { ArticleCommentReply } from "@interfaces/article.interface";
import { UserModel } from './users.model';
import { ArticleCommentModel } from './articles_comments.model';
import { User } from '@/interfaces/user.interface';
import { FileModel } from './files.model';

export type ArticleCommentReplyCreationAttributes = ArticleCommentReply;

export class ArticleCommentReplyModel extends Model<ArticleCommentReply, ArticleCommentReplyCreationAttributes> implements ArticleCommentReply {
  public pk: number;
  public uuid: string;
  public article_id: number;
  public comment_id: number;
  public author_id: number;
  public reply: string;

  public readonly author: User;
  public likes: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleCommentReplyModel {
  ArticleCommentReplyModel.init(
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
      comment_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      article_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      author_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      reply: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "articles_comment_replies",
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

  ArticleCommentModel.hasMany(ArticleCommentReplyModel, { foreignKey: "comment_id", as: "replies" });

  ArticleCommentReplyModel.belongsTo(ArticleCommentModel, { foreignKey: "comment_id", as: "comment" });
  ArticleCommentReplyModel.belongsTo(ArticleModel, { foreignKey: "article_id", as: "article" });
  ArticleCommentReplyModel.belongsTo(UserModel, { foreignKey: "author_id", as: "author" });

  return ArticleCommentReplyModel;
}