import { Router } from "express";
import { Routes } from "@interfaces/routes.interface";

import { AuthMiddleware } from "@middlewares/auth.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { CategoryController } from '@/controllers/category.controller';
import { CreateCategoryDto, UpdateCategoryDto } from '@/dtos/categories.dto';

export class CategoryRoute implements Routes {
  public path = "categories";
  public router = Router();
  public controller = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/v1/${this.path}`, this.controller.getCategories);
    this.router.post(`/v1/${this.path}`, 
      AuthMiddleware, ValidationMiddleware(CreateCategoryDto), 
      this.controller.createCategory
    );
    this.router.put(
      `/v1/${this.path}/:category_id`, 
      AuthMiddleware, ValidationMiddleware(UpdateCategoryDto), 
      this.controller.updateCategory
    );
    this.router.delete(
      `/v1/${this.path}/:category_id`,
      AuthMiddleware,
      this.controller.deleteCategory
    )
  }
}