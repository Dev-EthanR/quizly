-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "QuizVisibility" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "difficulty" "QuizDifficulty",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visibility" "QuizVisibility";
