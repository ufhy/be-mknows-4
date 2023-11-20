import { Op } from "sequelize";
import { Service } from "typedi";
import { DB } from "@database";

import { ArticleModel } from "@models/articles.model";

import { ArticleParsed, ArticleQueryParams } from "@interfaces/article.interface";
import { Pagination } from "@interfaces/common/pagination.interface";
import { CreateArticleDto, UpdateArticleDto } from "@dtos/articles.dto";
import { HttpException } from "@exceptions/HttpException";


@Service()
export class ArticleService {
  private articleParsed(article: ArticleModel): ArticleParsed {
    return {
      uuid: article.uuid,
      title: article.title,
      description: article.description,
      content: article.content,

      thumbnail: article.thumbnail?.uuid, 
      author: {
        uuid: article.author.uuid,
        full_name: article.author.full_name || null,
        avatar: article.author.avatar?.uuid || null, 
      },
      categories: article.categories.map((articleCategory) => articleCategory.category),
      likes: article.likes || 0,
      viewed: article.viewed || 0,
    };
  }

  public async getArticles(query: ArticleQueryParams): Promise<{ articles: ArticleParsed[], pagination: Pagination }> {
    const { page = "1", limit = "10", search, order, sort } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if(search) {
      where[Op.or] = [];

      where[Op.or].push({
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            description: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            content: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ],
      });

      where[Op.or].push({
        [Op.or]: [
          {
            "$author.full_name$": {
              [Op.iLike]: `%${search}%`,
            },
          }
        ],
      });
    }

    const orderClause = [];
    
    if (order && sort) {
      if (sort === "asc" || sort === "desc") {
        orderClause.push([order, sort]);
      }
    }

    const { rows: articles, count } = await DB.Articles.findAndCountAll({ 
      where,
      limit: parseInt(limit),
      offset,
      order: orderClause
    });

    const likeCountPromises = articles.map(article => {
      return DB.ArticlesLikes.count({
        where: { article_id: article.pk }
      });
    });
    
    const likeCounts = await Promise.all(likeCountPromises);
    
    articles.forEach((article, index) => {
      article.likes = likeCounts[index];
    });

    const pagination: Pagination = {
      current_page: parseInt(page),
      size_page: articles.length,
      max_page: Math.ceil(count / parseInt(limit)),
      total_data: count,
    };

    const transformedArticles = articles.map(article => this.articleParsed(article));
    return { articles: transformedArticles, pagination };
  }

  public async incrementViewed(article_id: string): Promise<void> {
    await DB.Articles.increment("viewed", { where: { uuid: article_id } });
  }

  public async getArticleById(article_id: string): Promise<ArticleParsed> {
    const article = await DB.Articles.findOne({
      where: { uuid: article_id },
    })

    if(!article) {
      throw new HttpException(false, 404, "Article is not found");
    }

    const likesCount = await DB.ArticlesLikes.count({
      where: { article_id: article.pk }
    });
        
    article.likes = likesCount;

    const response = this.articleParsed(article);
    return response;
  }

  public async getArticlesByCategory(query: ArticleQueryParams, category_id: string): Promise<{ articles: ArticleParsed[], pagination: Pagination }> {
    const category = await DB.Categories.findOne({ attributes: ["pk"], where:{ uuid: category_id } });
    if (!category) {
      throw new HttpException(false, 400, "Category is not found");
    }

    const articlesCategory = await DB.ArticlesCategories.findAll({ attributes: ["article_id"], where: { category_id: category.pk } });
    if(!articlesCategory) {
      throw new HttpException(false, 400, "Article with that category is not found");
    }

    const articleIds = articlesCategory.map(articleCategory => articleCategory.article_id);

    const { rows: articles } = await DB.Articles.findAndCountAll({ 
      attributes: { exclude: ["pk"] },
      where: { 
        pk: { [Op.in]: articleIds }
      }
    });
    
    const likeCountPromises = articles.map(article => {
      return DB.ArticlesLikes.count({
        where: { article_id: article.pk }
      });
    });
    
    const likeCounts = await Promise.all(likeCountPromises);
    
    articles.forEach((article, index) => {
      article.likes = likeCounts[index];
    });

    const transformedArticles = articles.map(article => this.articleParsed(article));
    return { articles: transformedArticles, pagination: null };
  }

  public async createArticle(author_id: number, data: CreateArticleDto): Promise<ArticleParsed> {
    const thumbnail = await DB.Files.findOne({ attributes: ["pk"], where: { uuid: data.thumbnail }});
    if(!thumbnail) throw new HttpException(false, 404, "File is not found");
    
    const categories = await DB.Categories.findAll({
      attributes: ["pk"],
      where: {
        uuid: { [Op.in]: data.categories }
      }
    })

    if (categories.length <= 0) {
      throw new HttpException(false, 404, "Categories is not found");
    }

    const transaction = await DB.sequelize.transaction();

    try {
      const article = await DB.Articles.create({
        title: data.title,
        description: data.description,
        content: data.content,
        thumbnail_id: thumbnail.pk,
        author_id
      });

      const categoryIds = categories.map(category => category.pk);

      await DB.ArticlesCategories.bulkCreate(
        categoryIds.map(categoryId => ({
          article_id: article.pk,
          category_id: categoryId
        }), { transaction })
      );

      await transaction.commit();
      return this.getArticleById(article.uuid);
    } catch (error) {
      await transaction.rollback();
      throw error; 
    }
  }
  
  public async updateArticle(article_id: string, author_id: number, data: UpdateArticleDto): Promise<ArticleParsed> {
    const article = await DB.Articles.findOne({ where: { uuid: article_id }});

    if(!article) {
      throw new HttpException(false, 400, "Article is not found");
    }
    
    const updatedData: any = {};
    
    if (data.title) updatedData.title = data.title;
    if (data.description) updatedData.description = data.description;
    if (data.content) updatedData.content = data.content;
    
    if (data.thumbnail) {
      const file = await DB.Files.findOne({ 
        attributes: ["pk"], 
        where: { 
          uuid: data.thumbnail, 
          user_id: author_id 
        } 
      });
      
      if (!file) {
        throw new HttpException(false, 400, "File is not found");
      }
  
      updatedData.thumbnail = file.pk;
    }

    if (Object.keys(updatedData).length === 0) {
      throw new HttpException(false, 400, "Some field is required");
    }

    const transaction = await DB.sequelize.transaction();
    try {
      if (data.categories) {
        const categories = await DB.Categories.findAll({
          attributes: ["pk"],
          where: {
            uuid: { [Op.in]: data.categories }
          }
        });

        if (!categories || categories.length !== data.categories.length) {
          throw new HttpException(false, 400, "Some categories are not found or duplicated");
        }

        if (categories.length >= 0) {
          await DB.ArticlesCategories.destroy({
            where: { article_id: article.pk },
            force: true,
            transaction
          });

          const categoryIds = categories.map(category => category.pk);

          await DB.ArticlesCategories.bulkCreate(
            categoryIds.map(categoryId => ({
              article_id: article.pk,
              category_id: categoryId
            })), { transaction }
          );
        }
      }

      if (Object.keys(updatedData).length > 0) {
        await DB.Articles.update(updatedData, {
          where: { uuid: article_id },
          returning: true,
          transaction,
        });
      }

      await transaction.commit();

      return this.getArticleById(article.uuid);
    } catch (error) {
      await transaction.rollback();
      throw error; 
    }
  }

  public async deleteArticle(article_id: string, author_id: number): Promise<boolean> {
    const article = await DB.Articles.findOne({ where: { uuid: article_id, author_id }});

    if (!article) {
      throw new HttpException(false, 400, "Article is not found");
    }

    const transaction = await DB.sequelize.transaction();
    try {
      await article.destroy({ transaction });

      await DB.ArticlesCategories.destroy({ 
        where: { article_id: article.pk }, 
        transaction,
      });

      await DB.ArticlesLikes.destroy({ 
        where: { article_id: article.pk }, 
        transaction,
      });

      await DB.ArticlesBookmarks.destroy({ 
        where: { article_id: article.pk }, 
        transaction,
      });
      
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw error; 
    }
  }

  public async likeArticle(user_id: number, article_id: string): Promise<object> {
    const article = await DB.Articles.findOne({ attributes: ["pk"], where: { uuid: article_id } });
    if (!article) {
      throw new HttpException(false, 400, "Article is not found");
    }

    const transaction = await DB.sequelize.transaction();
    try {
      const [articleLike, articleLikesCount] = await Promise.all([
        DB.ArticlesLikes.findOne({ where: { article_id: article.pk, user_id }, transaction }),
        DB.ArticlesLikes.count({ where: { article_id: article.pk, user_id }, transaction })
      ]);
  
      if (!articleLike) {
        await DB.ArticlesLikes.create({ article_id: article.pk, user_id }, { transaction });
        await transaction.commit();
        return { article_id, is_liked: true, likes: articleLikesCount + 1 }; 
      } else {
        await DB.ArticlesLikes.destroy({ where: { article_id: article.pk, user_id }, force: true, transaction });
        await transaction.commit();
        return { article_id, is_liked: false, likes: articleLikesCount - 1 }; 
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  public async bookmarkAdd(user_id: number, article_id: string): Promise<boolean> {
    const article = await DB.Articles.findOne({ attributes: ["pk"], where: { uuid: article_id } });
    if (!article) {
      throw new HttpException(false, 400, "Article is not found");
    }

    const findBookmark = await DB.ArticlesBookmarks.findOne({ where: { article_id: article.pk, user_id } })
    if (!findBookmark) {
      await DB.ArticlesBookmarks.create({ article_id: article.pk, user_id });
      return true;
    }

    return false;
  }

  public async bookmarkRemove(user_id: number, article_id: string): Promise<boolean> {
    const article = await DB.Articles.findOne({ attributes: ["pk"], where: { uuid: article_id } });
    if (!article) {
      throw new HttpException(false, 400, "Article is not found");
    }

    const findBookmark = await DB.ArticlesBookmarks.findOne({ where: { article_id: article.pk, user_id } })
    if (findBookmark) {
      await DB.ArticlesBookmarks.destroy({ where: { article_id: article.pk, user_id }, force: true });
      return true;
    }

    return false;
  }
}