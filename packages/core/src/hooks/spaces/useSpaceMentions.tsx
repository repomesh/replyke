import { useState, useEffect, useCallback, useRef } from "react";
import { Space } from "../../interfaces/models/Space";
import { Mention } from "../../interfaces/models/Mention";
import useFetchManySpaces from "./useFetchManySpaces";
import { handleError } from "../../utils/handleError";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface UseSpaceMentionsProps {
  content: string;
  setContent: (value: string) => void;
  focus: () => void;
  cursorPosition: number;
  isSelectionActive: boolean;
  trigger?: string;
  minChars?: number;
  debounceDelay?: number;
  validPattern?: string;
}

export interface UseSpaceMentionsValues {
  isSpaceMentionActive: boolean;
  loading: boolean;
  spaceMentionSuggestions: Space[];
  handleSpaceMentionClick: (space: Space) => void;
  mentions: Mention[];
  addSpaceMention: (space: Space) => void;
  resetSpaceMentions: () => void;
}

const useSpaceMentions = ({
  content,
  setContent,
  focus,
  cursorPosition,
  isSelectionActive,
  trigger = "#",
  minChars = 3,
  debounceDelay = 1000,
  validPattern = "[\\w.\\-]+",
}: UseSpaceMentionsProps): UseSpaceMentionsValues => {
  const fetchManySpaces = useFetchManySpaces();

  const [loadingState, setLoadingState] = useState(false);

  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isSpaceMentionActive, setIsSpaceMentionActive] = useState(false);
  const [mentionTrigger, setMentionTrigger] = useState("");
  const [spaceMentionSuggestions, setSpaceMentionSuggestions] = useState<
    Space[]
  >([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSpaceMentions = () => {
    setMentions([]);
    setIsSpaceMentionActive(false);
    setMentionTrigger("");
    setSpaceMentionSuggestions([]);
    setLoadingState(false);
  };

  const addSpaceMention = (space: Space) => {
    if (!space.slug) throw new Error("Space has no slug set");
    setMentions((prevMentions) => {
      if (prevMentions.some((mention) => mention.id === space.id)) {
        return prevMentions;
      }

      return [
        ...prevMentions,
        {
          id: space.id,
          slug: space.slug!,
          type: "space" as const,
        },
      ];
    });
  };

  const handleSpaceMentionClick = (space: Space) => {
    const mentionRegex = new RegExp(
      `${escapeRegex(trigger)}${escapeRegex(mentionTrigger)}(\\s|$)`
    );
    setContent(content.replace(mentionRegex, `${trigger}${space.slug} `));

    addSpaceMention(space);

    setIsSpaceMentionActive(false);
    setMentionTrigger("");
    setSpaceMentionSuggestions([]);
    setLoadingState(false);
    focus();
  };

  const handleFetchSpaceSuggestions = useCallback(
    async (query: string) => {
      try {
        const result = await fetchManySpaces({
          searchAny: query,
          limit: 5,
        });

        if (result.data && result.data.length > 0) {
          setSpaceMentionSuggestions(result.data);
        } else {
          setSpaceMentionSuggestions([]);
          setIsSpaceMentionActive(false);
        }
      } catch (err) {
        handleError(err, "Error fetching space suggestions");
      } finally {
        setLoadingState(false);
      }
    },
    [fetchManySpaces]
  );

  useEffect(() => {
    let start = cursorPosition - 1;

    // Move backward from cursor to find the word directly before the cursor
    while (start >= 0 && content[start] !== " ") {
      start--;
    }

    // Extract potential trigger word (start + 1 because `start` is on the space)
    const potentialTrigger = content.slice(start + 1, cursorPosition);

    const validMentionPattern = new RegExp(
      "^" + escapeRegex(trigger) + validPattern + "$"
    );

    if (
      !isSelectionActive &&
      validMentionPattern.test(potentialTrigger) &&
      potentialTrigger.length >= trigger.length + minChars
    ) {
      const triggerText = potentialTrigger.slice(trigger.length);
      setMentionTrigger(triggerText);
      setIsSpaceMentionActive(true);
      setLoadingState(true);

      // Clear the previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        handleFetchSpaceSuggestions(triggerText);
      }, debounceDelay);
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setMentionTrigger("");
      setIsSpaceMentionActive(false);
      setSpaceMentionSuggestions([]);
      setLoadingState(false);
    }

    // Cleanup on component unmount to clear any remaining timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    cursorPosition,
    isSelectionActive,
    handleFetchSpaceSuggestions,
    content,
    trigger,
    minChars,
    debounceDelay,
    validPattern,
  ]);

  return {
    isSpaceMentionActive,
    loading: loadingState,
    spaceMentionSuggestions,
    handleSpaceMentionClick,
    mentions,
    addSpaceMention,
    resetSpaceMentions,
  };
};

export default useSpaceMentions;
