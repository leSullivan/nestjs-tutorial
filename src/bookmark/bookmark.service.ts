import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  getBookmarkByUser(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId: userId,
      },
    });
  }

  updateBookmark(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
        userId: userId,
      },
      data: {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  deleteBookmark(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId: userId,
      },
    });
  }
}
