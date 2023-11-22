import { Category } from "@interfaces/category.interface";

export interface Article {
  pk: number;
  uuid: string;

  title: string;
  description: string;
  content: string;

  thumbnail_id: number;
  author_id: number;

  categories?: ArticleCategory[];
  likes?: number;
}

export interface ArticleCategory {
  article_id: number;
  category_id: number;

  category?: Category;
}

export interface ArticleQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  order?: string;
  sort?: string;
}

export interface ArticleParsed {
  uuid: string;

  title: string;
  description: string;
  content: string;

  thumbnail: string;

  author: {
    uuid: string;
    full_name: string;
    avatar: string;
  },

  categories: Category[];
  likes: number;
}

export interface ArticleLike {
  article_id: number;
  user_id: number;
}
export interface ArticleBookmark {
  article_id: number;
  user_id: number;
}

export interface ArticleComment {
  pk: number;
  uuid: string;
  article_id: number;
  author_id: number;

  comment: string;
  likes?: number;
}

export interface ArticleCommentParsed {
  uuid: string;
  comment: string;
  author: {
    uuid: string;
    full_name: string;
    avatar: string;
  },
  likes: number;
}

export interface ArticleCommentReply {
  pk: number;
  uuid: string;
  comment_id: number;
  article_id: number;
  author_id: number;

  reply: string;
}

export interface ArticleCommentReplyParsed {
  uuid: string;
  reply: string;
  author: {
    uuid: string;
    full_name: string;
    avatar: string;
  },
  likes: number;
}

export interface ArticleCommentLike {
  comment_id: number;
  user_id: number;
}

export interface ArticleCommentReplyLike {
  reply_id: number;
  user_id: number;
}

export interface ArticlePopular {
  article_id: number;
  user_id: number;
}