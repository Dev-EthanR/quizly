-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "SavedQuiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedQuiz_quizId_idx" ON "SavedQuiz"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedQuiz_userId_quizId_key" ON "SavedQuiz"("userId", "quizId");

-- AddForeignKey
ALTER TABLE "SavedQuiz" ADD CONSTRAINT "SavedQuiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuiz" ADD CONSTRAINT "SavedQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
