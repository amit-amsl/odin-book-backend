-- CreateTable
CREATE TABLE "_UpvotesOnComments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UpvotesOnComments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DownvotesOnComments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DownvotesOnComments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UpvotesOnComments_B_index" ON "_UpvotesOnComments"("B");

-- CreateIndex
CREATE INDEX "_DownvotesOnComments_B_index" ON "_DownvotesOnComments"("B");

-- AddForeignKey
ALTER TABLE "_UpvotesOnComments" ADD CONSTRAINT "_UpvotesOnComments_A_fkey" FOREIGN KEY ("A") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UpvotesOnComments" ADD CONSTRAINT "_UpvotesOnComments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DownvotesOnComments" ADD CONSTRAINT "_DownvotesOnComments_A_fkey" FOREIGN KEY ("A") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DownvotesOnComments" ADD CONSTRAINT "_DownvotesOnComments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
