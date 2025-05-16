/*
  Warnings:

  - You are about to drop the `Followship` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Followship" DROP CONSTRAINT "Followship_followId_fkey";

-- DropForeignKey
ALTER TABLE "Followship" DROP CONSTRAINT "Followship_followerId_fkey";

-- DropTable
DROP TABLE "Followship";

-- CreateTable
CREATE TABLE "_userFollows" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_userFollows_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_userFollows_B_index" ON "_userFollows"("B");

-- AddForeignKey
ALTER TABLE "_userFollows" ADD CONSTRAINT "_userFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFollows" ADD CONSTRAINT "_userFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
