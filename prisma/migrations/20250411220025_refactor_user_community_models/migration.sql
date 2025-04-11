/*
  Warnings:

  - You are about to drop the column `userId` on the `communities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "communities" DROP CONSTRAINT "communities_userId_fkey";

-- AlterTable
ALTER TABLE "communities" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UsersOnCommunities" (
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "isModerator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsersOnCommunities_pkey" PRIMARY KEY ("userId","communityId")
);

-- AddForeignKey
ALTER TABLE "UsersOnCommunities" ADD CONSTRAINT "UsersOnCommunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCommunities" ADD CONSTRAINT "UsersOnCommunities_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
