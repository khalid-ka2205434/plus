const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


//  USERS

async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
    },
  });
}

// ID
async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
    },
  });
}

// email
async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

// newuser
async function createUser({ username, email, password, bio, profilePicture }) {
  return prisma.user.create({
    data: {
      username,
      email,
      password,
      bio,
      profilePicture,
    },
  });
}

// bio
async function updateUserBio(id, bio) {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { bio },
  });
}

//updateUserPicture
async function updateUserPicture(id, profilePicture) {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { profilePicture },
  });
}


//  POSTS

//Bring all posts in the feed: user posts + posts from those they follow
async function getFeedPosts(userId) {
  const numericUserId = Number(userId);

  const following = await prisma.follow.findMany({
    where: { followerId: numericUserId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  return prisma.post.findMany({
    where: {
      userId: { in: [numericUserId, ...followingIds] },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// getPostsByUser
async function getPostsByUser(userId) {
  return prisma.post.findMany({
    where: { userId: Number(userId) },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ID
async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
  });
}

// New Post
async function createPost(userId, content) {
  return prisma.post.create({
    data: {
      userId: Number(userId),
      content,
    },
  });
}

// delete 
async function deletePost(id, userId) {
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });

  if (!post || post.userId !== Number(userId)) {
    throw new Error("Post not found or unauthorized");
  }

  return prisma.post.delete({
    where: { id: Number(id) },
  });
}

//  COMMENTS

async function addComment(userId, postId, text) {
  return prisma.comment.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
      text,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}


async function deleteComment(id, userId) {
  const comment = await prisma.comment.findUnique({
    where: { id: Number(id) },
  });

  if (!comment || comment.userId !== Number(userId)) {
    throw new Error("Comment not found or unauthorized");
  }

  return prisma.comment.delete({
    where: { id: Number(id) },
  });
}

//  LIKES

async function addLike(userId, postId) {
  return prisma.like.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });
}

async function removeLike(userId, postId) {
  return prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

//Check if the user liked it
async function isLiked(userId, postId) {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });

  return !!like;
}

//  FOLLOWS

async function followUser(followerId, followingId) {
  return prisma.follow.create({
    data: {
      followerId: Number(followerId),
      followingId: Number(followingId),
    },
  });
}

async function unfollowUser(followerId, followingId) {
  return prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    },
  });
}

async function isFollowing(followerId, followingId) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    },
  });

  return !!follow;
}

async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: Number(userId) },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          bio: true,
        },
      },
    },
  });
}

//getFollowers
async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: Number(userId) },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          bio: true,
        },
      },
    },
  });
}

//  EXPORTS

module.exports = {
  // Users
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUserBio,
  updateUserPicture,

  // Posts
  getFeedPosts,
  getPostsByUser,
  getPostById,
  createPost,
  deletePost,

  // Comments
  addComment,
  deleteComment,

  // Likes
  addLike,
  removeLike,
  isLiked,

  // Follows
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
};