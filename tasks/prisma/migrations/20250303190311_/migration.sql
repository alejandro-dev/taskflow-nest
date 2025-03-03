/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "assignedTo",
DROP COLUMN "author",
ADD COLUMN     "assignedUserId" TEXT,
ADD COLUMN     "authorId" TEXT NOT NULL;
