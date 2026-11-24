import { prisma } from '../config/database';

export const categoryService = {
  async getAll() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { books: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
  }) {
    return prisma.category.create({ data });
  },

  async update(
    id: string,
    data: { name?: string; slug?: string; description?: string; image?: string; parentId?: string }
  ) {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
