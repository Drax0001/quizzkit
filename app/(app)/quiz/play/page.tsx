import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { quizQuestionsOptions } from "@/features/quiz/queries";
import { quizSetupFromSearchParams } from "@/features/quiz/schemas";
import { QuizPlayClient } from "@/features/quiz/components/quiz-play-client";

export default async function QuizPlayPage({
  searchParams,
}: PageProps<"/quiz/play">) {
  const raw = await searchParams;
  const setup = quizSetupFromSearchParams(raw);

  // Prefetch on the server, hydrate the client query cache — avoids a
  // second network round trip for the same data. See docs/multi-domain-playbook.md.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(quizQuestionsOptions(setup));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizPlayClient setup={setup} />
    </HydrationBoundary>
  );
}
