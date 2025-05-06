-- CreateEnum
CREATE TYPE "Types" AS ENUM ('FOLLOW');

-- CreateEnum
CREATE TYPE "NotiTypes" AS ENUM ('USER', 'POST', 'COMMENT', 'REQUEST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "iconid" INTEGER NOT NULL,
    "aboutMe" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "creatorid" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "postid" TEXT,
    "commentid" TEXT,
    "senderid" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Icon" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomIcon" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadAt" TIMESTAMP(3) NOT NULL,
    "personid" TEXT NOT NULL,

    CONSTRAINT "CustomIcon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomImage" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadAt" TIMESTAMP(3) NOT NULL,
    "commentid" TEXT,
    "postid" TEXT,

    CONSTRAINT "CustomImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "targetid" TEXT NOT NULL,
    "senderid" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "type" "Types" NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotiTypes" NOT NULL,
    "typeid" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userFollows" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_userFollows_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_postLikes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_postLikes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_likedComment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_likedComment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_creatorid_key" ON "Post"("creatorid");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_postid_key" ON "Comment"("postid");

-- CreateIndex
CREATE UNIQUE INDEX "CustomIcon_personid_key" ON "CustomIcon"("personid");

-- CreateIndex
CREATE UNIQUE INDEX "CustomImage_commentid_key" ON "CustomImage"("commentid");

-- CreateIndex
CREATE UNIQUE INDEX "CustomImage_postid_key" ON "CustomImage"("postid");

-- CreateIndex
CREATE UNIQUE INDEX "Request_targetid_key" ON "Request"("targetid");

-- CreateIndex
CREATE UNIQUE INDEX "Request_senderid_key" ON "Request"("senderid");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userid_key" ON "Notification"("userid");

-- CreateIndex
CREATE INDEX "_userFollows_B_index" ON "_userFollows"("B");

-- CreateIndex
CREATE INDEX "_postLikes_B_index" ON "_postLikes"("B");

-- CreateIndex
CREATE INDEX "_likedComment_B_index" ON "_likedComment"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_iconid_fkey" FOREIGN KEY ("iconid") REFERENCES "Icon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorid_fkey" FOREIGN KEY ("creatorid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postid_fkey" FOREIGN KEY ("postid") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentid_fkey" FOREIGN KEY ("commentid") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_senderid_fkey" FOREIGN KEY ("senderid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomIcon" ADD CONSTRAINT "CustomIcon_personid_fkey" FOREIGN KEY ("personid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomImage" ADD CONSTRAINT "CustomImage_commentid_fkey" FOREIGN KEY ("commentid") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomImage" ADD CONSTRAINT "CustomImage_postid_fkey" FOREIGN KEY ("postid") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_targetid_fkey" FOREIGN KEY ("targetid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_senderid_fkey" FOREIGN KEY ("senderid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFollows" ADD CONSTRAINT "_userFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFollows" ADD CONSTRAINT "_userFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postLikes" ADD CONSTRAINT "_postLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postLikes" ADD CONSTRAINT "_postLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedComment" ADD CONSTRAINT "_likedComment_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedComment" ADD CONSTRAINT "_likedComment_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
