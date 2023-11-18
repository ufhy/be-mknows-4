import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";

import { ArticleController } from "@controllers/article.controller";
import { AuthMiddleware } from "@middlewares/auth.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { CreateArticleCommentDto, CreateArticleCommentReplyDto, CreateArticleDto, UpdateArticleDto } from '@dtos/articles.dto'
import { ArticleCommentController } from '@/controllers/article_comment.controller';
import { ArticleCommentReplyController } from '@/controllers/article_comment_reply.controller';

export class ArticleRoute implements Routes {
  public path = "articles";
  public router = Router();
  public article = new ArticleController();
  public comment = new ArticleCommentController();
  public reply = new ArticleCommentReplyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/v1/${this.path}/categories/:category_id`, this.article.getArticlesByCategory);
    this.router.get(`/v1/${this.path}`, this.article.getArticles);
    this.router.get(`/v1/${this.path}/:article_id`, this.article.getArticle);
    this.router.post(`/v1/${this.path}/:article_id/like`, AuthMiddleware, this.article.likeArticle);
    this.router.post(`/v1/${this.path}`,
      AuthMiddleware, ValidationMiddleware(CreateArticleDto),
      this.article.createArticle
    );
    this.router.put(
      `/v1/${this.path}/:article_id`,
      AuthMiddleware, ValidationMiddleware(UpdateArticleDto),
      this.article.updateArticle
    );
    this.router.delete(
      `/v1/${this.path}/:article_id`,
      AuthMiddleware,
      this.article.deleteArticle
    )

    // Bookmark
    this.router.post(`/v1/${this.path}/:article_id/bookmark`, AuthMiddleware, this.article.bookmarkAdd);
    this.router.delete(`/v1/${this.path}/:article_id/bookmark`, AuthMiddleware, this.article.bookmarkRemove);

    // Comments
    this.router.get(`/v1/${this.path}/:article_id/comments`, this.comment.getComments);
    this.router.post(`/v1/${this.path}/:article_id/comments`,
      AuthMiddleware, ValidationMiddleware(CreateArticleCommentDto),
      this.comment.createComment
    );
    this.router.put(`/v1/${this.path}/:article_id/comments/:comment_id`,
      AuthMiddleware, ValidationMiddleware(CreateArticleCommentDto),
      this.comment.updateComment
    );
    this.router.delete(`/v1/${this.path}/:article_id/comments/:comment_id`,
      AuthMiddleware,
      this.comment.deleteComment
    );
    this.router.post(`/v1/${this.path}/:article_id/comments/:comment_id/like`,
      AuthMiddleware,
      this.comment.likeComment
    );

    // Replies
    this.router.get(`/v1/${this.path}/:article_id/comments/:comment_id/replies`, this.reply.getReplies);
    this.router.post(`/v1/${this.path}/:article_id/comments/:comment_id/replies`,
      AuthMiddleware, ValidationMiddleware(CreateArticleCommentReplyDto),
      this.reply.createReply
    );
    this.router.put(`/v1/${this.path}/:article_id/comments/:comment_id/replies/:reply_id`,
      AuthMiddleware, ValidationMiddleware(CreateArticleCommentReplyDto),
      this.reply.updateReply
    );
    this.router.delete(`/v1/${this.path}/:article_id/comments/:comment_id/replies/:reply_id`,
      AuthMiddleware,
      this.reply.deleteReply
    );
    this.router.post(`/v1/${this.path}/:article_id/comments/:comment_id/replies/:reply_id/like`,
      AuthMiddleware,
      this.reply.likeReply
    );
  }
}
