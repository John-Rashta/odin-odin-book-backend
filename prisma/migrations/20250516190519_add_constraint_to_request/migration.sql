/*
  Warnings:

  - A unique constraint covering the columns `[targetid,senderid,type]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Request_targetid_senderid_type_key" ON "Request"("targetid", "senderid", "type");
