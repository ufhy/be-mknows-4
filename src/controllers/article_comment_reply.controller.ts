import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Container } from "typedi";

import { ArticleCommentParsed, ArticleCommentReplyParsed, ArticleQueryParams } from '@interfaces/article.interface'
import { RequestWithUser } from "@interfaces/authentication/token.interface";

import { CreateArticleCommentDto, CreateArticleCommentReplyDto } from '@dtos/articles.dto'
import { apiResponse } from "@utils/apiResponse";
import { CommentReplyService } from '@/services/comment_reply.service';

export class ArticleCommentReplyController {
  private reply = Container.get(CommentReplyService);

  public getReplies = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    const query: ArticleQueryParams = req.query;
    const response = await this.reply.getCommentReplies(comment_id, query);
    res.status(200).json(apiResponse(200, "OK", "Get Replies Success", response.comments, response.pagination));
  });

  public createReply = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    const user_id = req.user.pk as number;
    const data: CreateArticleCommentReplyDto = req.body;

    const response: ArticleCommentReplyParsed = await this.reply.createCommentReply(comment_id, user_id, data);
    res.status(201).json(apiResponse(201, "OK", "Create Reply Success", response));
  });

  public updateReply = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { comment_id, reply_id } = req.params;
    const user_id = req.user.pk as number;
    const data: CreateArticleCommentReplyDto = req.body;

    const response: ArticleCommentReplyParsed = await this.reply.updateCommentReply(reply_id, comment_id, user_id, data)
    res.status(200).json(apiResponse(200, "OK", "Update Reply Success", response));
  });

  public deleteReply = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { comment_id, reply_id } = req.params;
    const user_id = req.user.pk as number;

    await this.reply.deleteCommentReply(reply_id, comment_id, user_id);
    res.status(200).json(apiResponse(200, "OK", "Delete Reply Success", {}));
  });

  public likeReply = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { comment_id, reply_id } = req.params;
    const user_id = req.user.pk as number;

    const response = await this.reply.likeReply(user_id, reply_id, comment_id)
    res.status(200).json(apiResponse(200, "OK", "Like Reply Success", response));
  });
}
