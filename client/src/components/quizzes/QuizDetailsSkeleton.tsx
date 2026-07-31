function QuizDetailsSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="flex flex-col gap-4">
        <div className="h-56 rounded-xl bg-chat" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-xl bg-chat" />
          <div className="h-24 rounded-xl bg-chat" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-8 w-2/3 rounded bg-chat" />
        <div className="h-4 w-1/3 rounded bg-chat" />
        <div className="h-20 rounded bg-chat" />
      </div>
    </div>
  );
}

export default QuizDetailsSkeleton;
