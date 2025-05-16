/*
  Warnings:

  - You are about to drop the `_userFollows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_userFollows" DROP CONSTRAINT "_userFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "_userFollows" DROP CONSTRAINT "_userFollows_B_fkey";

-- DropTable
DROP TABLE "_userFollows";

-- CreateTable
CREATE TABLE "Followship" (
    "followerId" TEXT NOT NULL,
    "followId" TEXT NOT NULL,

    CONSTRAINT "Followship_pkey" PRIMARY KEY ("followerId","followId")
);

-- AddForeignKey
ALTER TABLE "Followship" ADD CONSTRAINT "Followship_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followship" ADD CONSTRAINT "Followship_followId_fkey" FOREIGN KEY ("followId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
