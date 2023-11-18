import { Op } from "sequelize";
import { Service } from "typedi";
import { DB } from "@database";

import { ArticleCommentReplyParsed, ArticleQueryParams } from "@interfaces/article.interface";
import { Pagination } from "@interfaces/common/pagination.interface";
import { CreateArticleCommentReplyDto } from '@dtos/articles.dto'
import { HttpException } from "@exceptions/HttpException";
import { ArticleCommentModel } from '@/models/articles_comments.model';
import { ArticleCommentReplyModel } from '@/models/articles_comment_replies.model';


@Service()
export class CommentReplyService {
  private replyParsed(reply: ArticleCommentReplyModel): ArticleCommentReplyParsed {
    return {
      uuid: reply.uuid,
      reply: reply.reply,
      author: {
        uuid: reply.author.uuid,
        full_name: reply.author.full_name || null,
        avatar: reply.author.avatar?.uuid || null,
      },
      likes: reply.likes || 0
    };
  }

  public async getCommentReplies(comment_id: string, query: ArticleQueryParams): Promise<{ comments: ArticleCommentReplyParsed[], pagination: Pagination }> {
    const { page = "1", limit = "10", search, order, sort } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const comment = await DB.ArticleComments.findOne({ attributes: ['pk'], where: { uuid: comment_id }});

    if(!comment) {
      throw new HttpException(false, 400, "Comment is not found");
    }

    const where = { comment_id: comment.pk };

    if(search) {
      where[Op.or] = [];

      where[Op.or].push({
        [Op.or]: [
          {
            reply: {
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

    const { rows: replies, count } = await DB.ArticleCommentReplies.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: orderClause,
    });

    const likeCountPromises = replies.map(reply => {
      return DB.ArticleCommentReplyLike.count({
        where: { reply_id: reply.pk }
      });
    });

    const likeCounts = await Promise.all(likeCountPromises);

    replies.forEach((reply, index) => {
      reply.likes = likeCounts[index];
    });

    const pagination: Pagination = {
      current_page: parseInt(page),
      size_page: replies.length,
      max_page: Math.ceil(count / parseInt(limit)),
      total_data: count,
    };

    const transformedComments = replies.map(reply => this.replyParsed(reply));
    return { comments: transformedComments, pagination };
  }

  public async createCommentReply(comment_id: string, author_id: number, data: CreateArticleCommentReplyDto): Promise<ArticleCommentReplyParsed> {
    const comment = await DB.ArticleComments.findOne({
      attributes: ["pk", "article_id"],
      where: { uuid: comment_id }
    })

    if (!comment) {
      throw new HttpException(false, 404, "Comment is not found");
    }

    const reply = await DB.ArticleCommentReplies.create({
      reply: data.reply,
      comment_id: comment.pk,
      article_id: comment.article_id,
      author_id
    });

    return this.replyParsed(await reply.reload());
  }

  public async updateCommentReply(reply_id: string, comment_id: string, author_id: number, data: CreateArticleCommentReplyDto): Promise<ArticleCommentReplyParsed> {
    const findReply = await DB.ArticleCommentReplies.findOne({
      where: {
        uuid: reply_id,
        author_id,
      },
      include: [
        { model: ArticleCommentModel, as: "comment", where: { uuid: comment_id }, required: true },
      ]
    })

    if(!findReply) {
      throw new HttpException(false, 400, "Reply is not found");
    }

    await DB.ArticleCommentReplies.update({ reply: data.reply }, {
      where: { pk: findReply.pk },
      returning: true,
    });

    return this.replyParsed(await findReply.reload());
  }

  public async deleteCommentReply(reply_id: string, comment_id: string, author_id: number): Promise<boolean> {
    const findReply = await DB.ArticleCommentReplies.findOne({
      where: {
        uuid: reply_id,
        author_id,
      },
      include: [
        { model: ArticleCommentModel, as: "comment", where: { uuid: comment_id }, required: true },
      ]
    })
    if(!findReply) {
      throw new HttpException(false, 400, "Reply is not found");
    }

    await findReply.destroy();
    return true;
  }

  public async likeReply(user_id: number, reply_id: string, comment_id: string): Promise<object> {
    const findReply = await DB.ArticleCommentReplies.findOne({
      where: {
        uuid: reply_id,
      },
      include: [
        { model: ArticleCommentModel, as: "comment", where: { uuid: comment_id }, required: true },
      ]
    })
    if(!findReply) {
      throw new HttpException(false, 400, "Reply is not found");
    }

    const transaction = await DB.sequelize.transaction();
    try {
      const [replyLike, replyLikesCount] = await Promise.all([
        DB.ArticleCommentReplyLike.findOne({ where: { reply_id: findReply.pk, user_id }, transaction }),
        DB.ArticleCommentReplyLike.count({ where: { reply_id: findReply.pk, user_id }, transaction })
      ]);

      if (!replyLike) {
        await DB.ArticleCommentReplyLike.create({ reply_id: findReply.pk, user_id }, { transaction });
        await transaction.commit();
        return { comment_id, is_liked: true, likes: replyLikesCount + 1 };
      } else {
        await DB.ArticleCommentReplyLike.destroy({ where: { reply_id: findReply.pk, user_id }, force: true, transaction });
        await transaction.commit();
        return { comment_id, is_liked: false, likes: replyLikesCount - 1 };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
