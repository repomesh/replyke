import { useEffect, useState } from "react";
import Tweet from "./Tweet";
import TweetComposer from "./TweetComposer";
import UserProfile from "./UserProfile";
import AuthModal from "./auth/AuthModal";
import {
  EntityListSortByOptions,
  EntityProvider,
  TimeFrame,
  useEntityListRedux,
  useUserRedux,
} from "@replyke/react-js";
import LoadingPlaceholder from "./LoadingPlaceholder";
import Filters from "./Filters";

export default function TweetFeed() {
  const {
    entities,
    fetchEntities,
    loading: loadingEntities,
    hasMore,
    loadMore,
  } = useEntityListRedux({
    listId: "home-tweets",
    sourceId: "tweets",
    limit: 2,
  });
  const { user } = useUserRedux();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [content, setContent] = useState<string>("");
  const [sortBy, setSortBy] = useState<EntityListSortByOptions>("new");
  const [timeFrame, setTimeFrame] = useState<TimeFrame | null>(null);

  useEffect(() => {
    const filters: any = { sortBy, timeFrame };

    if (content) {
      filters.contentFilters = { includes: [] };
    }
    fetchEntities(filters);
  }, [sortBy, timeFrame, content]);

  function handleShowAuthModal() {
    setShowAuthModal(true);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-sm border-x border-gray-200">
        {user && (
          <div className="p-4 bg-white">
            <UserProfile />
          </div>
        )}
        <TweetComposer onAuthRequired={handleShowAuthModal} />

        <Filters
          sortBy={sortBy}
          setSortBy={setSortBy}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          content={content}
          setContent={setContent}
        />

        <div className="divide-y divide-gray-100">
          {entities.map((entity) => (
            <EntityProvider entity={entity} key={entity.id}>
              <Tweet onAuthRequired={handleShowAuthModal} />
            </EntityProvider>
          ))}
        </div>

        {loadingEntities && <LoadingPlaceholder />}

        {hasMore ? (
          <div className="p-6 flex justify-center items-center bg-white border-t border-gray-100">
            <button
              onClick={loadMore}
              disabled={loadingEntities}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {loadingEntities ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : (
          <div className="p-6 flex justify-center items-center bg-white border-t border-gray-100">
            <span className="text-gray-500 text-sm">No more entities</span>
          </div>
        )}
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
