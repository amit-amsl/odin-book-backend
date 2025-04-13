/*
  Warnings:

  - A unique constraint covering the columns `[userId,communityId]` on the table `UsersOnCommunities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[normalizedName]` on the table `communities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedName` to the `communities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "communities_name_key";

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "normalizedName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnCommunities_userId_communityId_key" ON "UsersOnCommunities"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "communities_normalizedName_key" ON "communities"("normalizedName");
