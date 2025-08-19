import { useEffect, useState } from "react";

import { threadedBaseStyle } from "../threaded-base-style";
import {
  PartialThreadedStyleConfig,
  ThreadedStyleConfig,
} from "../interfaces/style-props/ThreadedStyleConfig";

import { mergeThreadedStyleData } from "../helpers/mergeThreadedStyleData";

export interface UseSocialStyleProps extends PartialThreadedStyleConfig {}

function useSocialStyle(props?: Partial<UseSocialStyleProps>) {
  const [styleConfig, setStyleConfig] =
    useState<ThreadedStyleConfig>(threadedBaseStyle);

  useEffect(() => {
    const mergedStyle = mergeThreadedStyleData(
      props?.commentFeedProps,
      props?.commentProps,
      props?.newCommentFormProps
    );
    setStyleConfig(mergedStyle);
  }, [props]);

  return styleConfig;
}

export default useSocialStyle;
