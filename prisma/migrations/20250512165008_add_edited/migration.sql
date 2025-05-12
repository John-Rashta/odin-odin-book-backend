-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false;
