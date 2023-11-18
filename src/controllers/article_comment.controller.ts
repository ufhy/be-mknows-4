import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Container } from "typedi";

import { ArticleCommentParsed, ArticleQueryParams } from '@interfaces/article.interface'
import { RequestWithUser } from "@interfaces/authentication/token.interface";

import { CreateArticleCommentDto } from '@dtos/articles.dto'
import { apiResponse } from "@utils/apiResponse";
import { CommentService } from '@services/comments.service'

export class ArticleCommentController {
  private comment = Container.get(CommentService);

  public getComments = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { article_id } = req.params;
    const query: ArticleQueryParams = req.query;
    const response = await this.comment.getComments(article_id, query);
    res.status(200).json(apiResponse(200, "OK", "Get Comments Success", response.comments, response.pagination));
  });

  public createComment = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { article_id } = req.params;
    const user_id = req.user.pk as number;
    const data: CreateArticleCommentDto = req.body;

    const response: ArticleCommentParsed = await this.comment.createComment(article_id, user_id, data);
    res.status(201).json(apiResponse(201, "OK", "Create Comment Success", response));
  });

  public updateComment = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { article_id, comment_id } = req.params;
    const user_id = req.user.pk as number;
    const data: CreateArticleCommentDto = req.body;

    const response: ArticleCommentParsed = await this.comment.updateComment(comment_id, article_id, user_id, data)
    res.status(200).json(apiResponse(200, "OK", "Update Comment Success", response));
  });

  public deleteComment = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { article_id, comment_id } = req.params;
    const user_id = req.user.pk as number;

    await this.comment.deleteComment(comment_id, article_id, user_id);
    res.status(200).json(apiResponse(200, "OK", "Delete Comment Success", {}));
  });

  public likeComment = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { article_id, comment_id } = req.params;
    const user_id = req.user.pk as number;

    const response = await this.comment.likeComment(user_id, comment_id, article_id)
    res.status(200).json(apiResponse(200, "OK", "Like Comment Success", response));
  });
}
