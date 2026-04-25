const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const khalid = await prisma.user.create({
    data: {
      username: "khalid",
      email: "khalid@example.com",
      password: "123456",
      bio: "Student user",
      profilePicture: "/images/default-avatar.png",
    },
  });

  const abdullah = await prisma.user.create({
    data: {
      username: "abdullah",
      email: "abdullah@example.com",
      password: "123456",
      bio: "Student user",
      profilePicture: "/images/default-avatar.png",
    },
  });

  const falah = await prisma.user.create({
    data: {
      username: "falah",
      email: "falah@example.com",
      password: "123456",
      bio: "Student user",
      profilePicture: "/images/default-avatar.png",
    },
  });

  const mujahid = await prisma.user.create({
    data: {
      username: "mujahid",
      email: "mujahid@example.com",
      password: "123456",
      bio: "Instructor account",
      profilePicture: "/images/default-avatar.png",
    },
  });

  const post1 = await prisma.post.create({
    data: {
      content: "Welcome to our social media platform",
      userId: khalid.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: "Working on Phase 2 project now",
      userId: abdullah.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      content: "Database and Prisma are ready",
      userId: falah.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: "Nice work!",
      userId: abdullah.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: "Looks good",
      userId: falah.id,
      postId: post2.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: "Great progress",
      userId: mujahid.id,
      postId: post3.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: abdullah.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: falah.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: khalid.id,
      postId: post2.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: mujahid.id,
      postId: post3.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: khalid.id,
      followingId: abdullah.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: khalid.id,
      followingId: falah.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: abdullah.id,
      followingId: khalid.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: falah.id,
      followingId: khalid.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: mujahid.id,
      followingId: khalid.id,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });