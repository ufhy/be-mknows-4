import { Sequelize, DataTypes, Model, Optional } from "sequelize";

import { User } from "@interfaces/user.interface";
import { File } from "@interfaces/file.interface";
import { Article } from "@interfaces/article.interface";
import { ArticleCategory } from "@interfaces/article.interface";

import { UserModel } from "@models/users.model";
import { FileModel } from "@models/files.model";
import { CategoryModel } from '@models/categories.model';
import { ArticleCategoryModel } from '@models/articles_categories.model';

export type ArticleCreationAttributes = Optional<Article, "pk" | "uuid">;

export class ArticleModel extends Model<Article, ArticleCreationAttributes> implements Article {
  public pk: number;
  public uuid: string;
  
  public title: string;
  public description: string;
  public content: string;
  public viewed: number;

  public thumbnail_id: number;
  public author_id: number;

  // Assosication
  public readonly thumbnail: File;
  public readonly author: User;
  public readonly categories: ArticleCategory[];
  public likes: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at: Date;
}

export default function (sequelize: Sequelize): typeof ArticleModel {
  ArticleModel.init(
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      viewed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      thumbnail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: FileModel,
        //   key: "pk",
        // },
        // onDelete: "CASCADE",
        // onUpdate: "CASCADE",
      },  
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: UserModel,
        //   key: "pk",
        // },
        // onDelete: "CASCADE",
        // onUpdate: "CASCADE",
      },
    },
    {
      tableName: "articles",
      timestamps: true,
      paranoid: true,
      sequelize,
      defaultScope: {
        include: [
          {
            attributes: ["uuid"],
            model: FileModel,
            as: "thumbnail",
          },
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
          },
          {
            attributes: ["category_id"],
            model: ArticleCategoryModel,
            as: "categories",
            include: [{
              attributes: ["uuid", "name", "description"],
              model: CategoryModel, 
              as: "category"
            }]
          }
        ],
      }
    },
  );

  FileModel.hasOne(ArticleModel, {
    foreignKey: "thumbnail_id",
    as: "thumbnail"
  });

  ArticleModel.belongsTo(FileModel, {
    foreignKey: "thumbnail_id",
    as: "thumbnail"
  });

  UserModel.hasMany(ArticleModel, {
    foreignKey: "author_id",
    as: "author"
  });

  ArticleModel.belongsTo(UserModel, {
    foreignKey: "author_id",
    as: "author"
  });

  return ArticleModel;
}
