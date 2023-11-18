import { Service } from "typedi";
import { DB } from "@database";

import { Category } from '@interfaces/category.interface';
import { HttpException } from "@exceptions/HttpException";
import { CreateCategoryDto, UpdateCategoryDto } from '@dtos/categories.dto';


@Service()
export class CategoryService {
  public async getCategories(): Promise<Category[]> {
    return await DB.Categories.findAll({ 
      attributes: { 
        exclude: ["pk"],
      },
    });
  }

  public async createCategory(data: CreateCategoryDto): Promise<Category> {
    const category = await DB.Categories.create({ ...data });
    delete category.dataValues.pk;

    return category;
  }
  
  public async updateCategory(category_id: string, data: UpdateCategoryDto): Promise<Category> {
    const updatedData: any = {};
    
    if (data.name) updatedData.name = data.name;
    if (data.description) updatedData.description = data.description;

    if (Object.keys(updatedData).length === 0) {
      throw new HttpException(false, 400, "Some field is required");
    }

    const [_, [category]] = await DB.Categories.update(updatedData, {
      where: { uuid: category_id },
      returning: true,
    });
    
    delete category.dataValues.pk;

    return category;
  }

  public async deleteCategory(category_id: string): Promise<boolean> {
    const category = await DB.Categories.findOne({ where: { uuid: category_id }});

    if(!category) {
      throw new HttpException(false, 400, "Category is not found");
    }

    await category.destroy();
    return true;
  }
}