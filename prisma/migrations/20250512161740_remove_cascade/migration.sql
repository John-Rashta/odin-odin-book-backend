-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentid_fkey";

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentid_fkey" FOREIGN KEY ("commentid") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
