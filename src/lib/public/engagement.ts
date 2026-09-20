import { and, asc, count, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { articleComments, pollOptions, polls, pollVotes } from "@/db/schema";

export async function getApprovedComments(articleId: string, limit = 20) {
  return db
    .select({
      id: articleComments.id,
      authorName: articleComments.authorName,
      body: articleComments.body,
      createdAt: articleComments.createdAt
    })
    .from(articleComments)
    .where(and(eq(articleComments.articleId, articleId), eq(articleComments.status, "approved")))
    .orderBy(desc(articleComments.createdAt))
    .limit(limit);
}

export async function getActiveArticlePoll(articleId: string) {
  const now = new Date();
  const [poll] = await db
    .select()
    .from(polls)
    .where(
      and(
        eq(polls.articleId, articleId),
        eq(polls.isActive, true),
        or(isNull(polls.startsAt), lte(polls.startsAt, now)),
        or(isNull(polls.endsAt), gte(polls.endsAt, now))
      )
    )
    .orderBy(desc(polls.createdAt))
    .limit(1);

  if (!poll) {
    return null;
  }

  const [options, voteCounts] = await Promise.all([
    db
      .select({
        id: pollOptions.id,
        labelBn: pollOptions.labelBn,
        sortOrder: pollOptions.sortOrder
      })
      .from(pollOptions)
      .where(eq(pollOptions.pollId, poll.id))
      .orderBy(asc(pollOptions.sortOrder), asc(pollOptions.createdAt)),
    db
      .select({
        optionId: pollVotes.optionId,
        votes: count(pollVotes.id)
      })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, poll.id))
      .groupBy(pollVotes.optionId)
  ]);

  const countsByOption = new Map(voteCounts.map((item) => [item.optionId, item.votes]));
  const optionsWithVotes = options.map((option) => ({
    ...option,
    votes: countsByOption.get(option.id) ?? 0
  }));

  return {
    ...poll,
    options: optionsWithVotes,
    totalVotes: optionsWithVotes.reduce((total, option) => total + option.votes, 0)
  };
}
