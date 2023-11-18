import { Op } from "sequelize";
import { Service } from "typedi";
import { DB } from "@database";

import { ArticleCommentParsed, ArticleQueryParams } from "@interfaces/article.interface";
import { Pagination } from "@interfaces/common/pagination.interface";
import { CreateArticleCommentDto } from '@dtos/articles.dto'
import { HttpException } from "@exceptions/HttpException";
import { ArticleCommentModel } from '@/models/articles_comments.model';
import { ArticleModel } from '@models/articles.model'


@Service()
export class CommentService {
  private commentParsed(comment: ArticleCommentModel): ArticleCommentParsed {
    return {
      uuid: comment.uuid,
      comment: comment.comment,
      author: {
        uuid: comment.author.uuid,
        full_name: comment.author.full_name || null,
        avatar: comment.author.avatar?.uuid || null,
      },
      likes: comment.likes || 0
    };
  }

  public async getComments(article_id: string, query: ArticleQueryParams): Promise<{ comments: ArticleCommentParsed[], pagination: Pagination }> {
    const { page = "1", limit = "10", search, order, sort } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const article = await DB.Articles.findOne({ attributes: ['pk'], where: { uuid: article_id }});

    if(!article) {
      throw new HttpException(false, 400, "Article is not found");
    }

    const where = { article_id: article.pk };

    if(search) {
      where[Op.or] = [];

      where[Op.or].push({
        [Op.or]: [
          {
            comment: {
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

    const { rows: comments, count } = await DB.ArticleComments.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: orderClause,
    });

    const likeCountPromises = comments.map(comment => {
      return DB.ArticleCommentLike.count({
        where: { comment_id: comment.pk }
      });
    });

    const likeCounts = await Promise.all(likeCountPromises);

    comments.forEach((comment, index) => {
      comment.likes = likeCounts[index];
    });

    const pagination: Pagination = {
      current_page: parseInt(page),
      size_page: comments.length,
      max_page: Math.ceil(count / parseInt(limit)),
      total_data: count,
    };

    const transformedComments = comments.map(article => this.commentParsed(article));
    return { comments: transformedComments, pagination };
  }

  public async createComment(article_id: string, author_id: number, data: CreateArticleCommentDto): Promise<ArticleCommentParsed> {
    const article = await DB.Articles.findOne({
      attributes: ["pk"],
      where: { uuid: article_id }
    })

    if (!article) {
      throw new HttpException(false, 404, "Article is not found");
    }

    const comment = await DB.ArticleComments.create({
      comment: data.comment,
      article_id: article.pk,
      author_id
    });

    return this.commentParsed(await comment.reload());
  }

  public async updateComment(comment_id: string, article_id: string, author_id: number, data: CreateArticleCommentDto): Promise<ArticleCommentParsed> {
    const findComment = await DB.ArticleComments.findOne({
      where: {
        uuid: comment_id,
        author_id,
      },
      include: [
        { model: ArticleModel, as: "article", where: { uuid: article_id }, required: true },
      ]
    })

    if(!findComment) {
      throw new HttpException(false, 400, "Comment is not found");
    }

    await DB.ArticleComments.update({ comment: data.comment }, {
      where: { pk: findComment.pk },
      returning: true,
    });

    return this.commentParsed(await findComment.reload());
  }

  public async deleteComment(comment_id: string, article_id: string, author_id: number): Promise<boolean> {
    const findComment = await DB.ArticleComments.findOne({
      where: {
        uuid: comment_id,
        author_id,
      },
      include: [
        { model: ArticleModel, as: "article", where: { uuid: article_id }, required: true },
      ]
    })
    if(!findComment) {
      throw new HttpException(false, 400, "Comment is not found");
    }

    await findComment.destroy();
    return true;
  }

  public async likeComment(user_id: number, comment_id: string, article_id: string,): Promise<object> {
    const findComment = await DB.ArticleComments.findOne({
      where: {
        uuid: comment_id,
      },
      include: [
        { model: ArticleModel, as: "article", where: { uuid: article_id }, required: true },
      ]
    })
    if(!findComment) {
      throw new HttpException(false, 400, "Comment is not found");
    }

    const transaction = await DB.sequelize.transaction();
    try {
      const [commentLike, commentLikesCount] = await Promise.all([
        DB.ArticleCommentLike.findOne({ where: { comment_id: findComment.pk, user_id }, transaction }),
        DB.ArticleCommentLike.count({ where: { comment_id: findComment.pk, user_id }, transaction })
      ]);

      if (!commentLike) {
        await DB.ArticleCommentLike.create({ comment_id: findComment.pk, user_id }, { transaction });
        await transaction.commit();
        return { comment_id, is_liked: true, likes: commentLikesCount + 1 };
      } else {
        await DB.ArticleCommentLike.destroy({ where: { comment_id: findComment.pk, user_id }, force: true, transaction });
        await transaction.commit();
        return { comment_id, is_liked: false, likes: commentLikesCount - 1 };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
