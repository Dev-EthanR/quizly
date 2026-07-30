-- AlterTable
ALTER TABLE "GamePlayed" ADD COLUMN     "color" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Player';

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "completionRate" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionBreakdown" JSONB NOT NULL DEFAULT '[]';
