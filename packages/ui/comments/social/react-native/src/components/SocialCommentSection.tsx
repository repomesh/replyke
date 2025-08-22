import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SocialStyleCallbacks,
  useSocialStyle,
  PartialSocialStyleConfig,
} from "@replyke/comments-social-core";
import { Entity } from "@replyke/core";
import useSocialComments from "../hooks/useSocialComments";

type ButtonStyleContainer = {
  backgroundColor?: string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
};

type ButtonStyleText = {
  color?: string;
  fontSize?: number;
};

type ButtonStyles = {
  active?: ButtonStyleContainer;
  inactive?: ButtonStyleContainer;
  textActive?: ButtonStyleText;
  textInactive?: ButtonStyleText;
};

function SocialCommentSection({
  entity,
  entityId,
  foreignId,
  shortId,
  callbacks,
  styleConfig: styleConfigProp,
  isVisible = true,
  sortOptions = ["top", "new", "old"],
  header,
  withEmojis,
  children,
}: {
  entity?: Entity;
  entityId?: string | undefined | null;
  foreignId?: string | undefined | null;
  shortId?: string | undefined | null;
  callbacks?: SocialStyleCallbacks;
  styleConfig?: Partial<
    PartialSocialStyleConfig & { sortByStyleConfig: ButtonStyles }
  >;
  isVisible?: boolean;
  sortOptions?: Array<"top" | "new" | "old"> | null;
  header?: React.ReactNode;
  withEmojis?: boolean;
  children?: React.ReactNode;
}) {
  const styleConfig = useSocialStyle(styleConfigProp);

  const { CommentSectionProvider, SortByButton, CommentsFeed, NewCommentForm } =
    useSocialComments({
      entity,
      entityId,
      foreignId,
      shortId,
      styleConfig,
      callbacks,
    });

  const buttonStyles: ButtonStyles = {
    active: {
      backgroundColor: "black",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      ...(styleConfigProp?.sortByStyleConfig?.active ?? {}),
    },
    inactive: {
      backgroundColor: "#e5e7eb",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      ...(styleConfigProp?.sortByStyleConfig?.inactive ?? {}),
    },
    textActive: {
      color: "white",
      fontSize: 12,
      ...(styleConfigProp?.sortByStyleConfig?.textActive ?? {}),
    },
    textInactive: {
      color: "black",
      fontSize: 12,
      ...(styleConfigProp?.sortByStyleConfig?.textInactive ?? {}),
    },
  };

  const renderSortButtons = () => {
    if (!sortOptions) return null;

    const optionsMap: Record<
      "top" | "new" | "old",
      { label: string; priority: "top" | "new" | "old" }
    > = {
      top: { label: "Top", priority: "top" },
      new: { label: "New", priority: "new" },
      old: { label: "Old", priority: "old" },
    };

    return sortOptions.map((option, index) => {
      const { label, priority } = optionsMap[option];
      const isFirst = index === 0;
      const marginStyle = isFirst ? {} : { marginLeft: 4 };

      return (
        <SortByButton
          key={priority}
          priority={priority}
          activeView={
            <TouchableOpacity style={[buttonStyles.active, marginStyle]}>
              <Text style={buttonStyles.textActive}>{label}</Text>
            </TouchableOpacity>
          }
          nonActiveView={
            <TouchableOpacity style={[buttonStyles.inactive, marginStyle]}>
              <Text style={buttonStyles.textInactive}>{label}</Text>
            </TouchableOpacity>
          }
        />
      );
    });
  };

  return (
    <CommentSectionProvider>
      {(header || sortOptions) && (
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 24,
            paddingRight: 24,
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>{header}</View>
          {sortOptions !== null && renderSortButtons()}
        </View>
      )}

      <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <CommentsFeed>{children}</CommentsFeed>
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        }}
      >
        {isVisible && <NewCommentForm withEmojis={withEmojis} />}
      </View>
    </CommentSectionProvider>
  );
}

export default SocialCommentSection;
