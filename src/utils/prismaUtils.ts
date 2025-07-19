export const prismaPostQueryFieldSelection = (userId: string) => {
  return {
    id: true,
    title: true,
    image_url: true,
    youtube_vid_id: true,
    author: {
      select: {
        id: true,
        username: true,
      },
    },
    community: {
      select: {
        normalizedName: true,
      },
    },
    isNSFW: true,
    isSpoiler: true,
    bookmarks: {
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    },
    upvotes: {
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    },
    downvotes: {
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    },
    createdAt: true,
    _count: {
      select: {
        upvotes: true,
        downvotes: true,
        comments: true,
      },
    },
  };
};
