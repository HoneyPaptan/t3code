import { SymbolView } from "../components/AppSymbol";
import { cn } from "../lib/cn";
import { MOBILE_RADIUS } from "../lib/radius";
import { imageMimeType } from "@t3tools/shared/image";
import { videoMimeType } from "@t3tools/shared/video";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

import { AppText as Text } from "./AppText";
import { PierreEntryIcon } from "./PierreEntryIcon";
import {
  isFileBackedComposerAttachment,
  type DraftComposerAttachment,
  type DraftComposerFileAttachment,
  type DraftComposerImageAttachment,
} from "../lib/composerImages";
import { resolveOwnedComposerAttachmentFileUri } from "../lib/composerAttachmentFiles";
import { VideoAttachmentTile } from "./VideoAttachmentTile";
import { type MediaActionsSource } from "../lib/mediaActionsSource";
import { PresentationSource } from "./NativePresentation";
import type { FilePreviewSource } from "./FilePreviewModal";
import { isPdfFile } from "../lib/filePreview";
import type { EnvironmentId } from "@t3tools/contracts";
import {
  retryComposerAttachmentUpload,
  useComposerAttachmentUploadState,
} from "../state/composer-attachment-uploads";

export interface ComposerAttachmentStripProps {
  readonly environmentId?: EnvironmentId;
  /** Attachments to display. */
  readonly attachments: ReadonlyArray<DraftComposerAttachment>;
  /** Called when the user removes an attachment. */
  readonly onRemove: (imageId: string) => void;
  /** Called when the user taps an image or PDF to preview it. */
  readonly onPressPreview?: (source: FilePreviewSource) => void;
  readonly onPressVideo?: (
    attachment: DraftComposerFileAttachment,
    sourceIdentifier: string,
  ) => void;
  /** Called when the user taps a document that is not a picture, video or PDF. */
  readonly onPressDocument?: (attachment: DraftComposerFileAttachment) => void;
  readonly imageSize?: number;
  readonly imageBorderRadius?: number;
  /** Whether the remove button should sit in its own gutter instead of overlapping the image. */
  readonly removeButtonPlacement?: "overlay" | "gutter";
}

const DEFAULT_THUMBNAIL_SIZE = 56;
const REMOVE_BUTTON_GUTTER = 10;

type AttachmentKind = "image" | "video" | "file";

function resolveAttachmentKind(
  attachment: DraftComposerAttachment,
  canPlayVideo: boolean,
): AttachmentKind {
  if (attachment.type === "image" || imageMimeType(attachment) !== null) return "image";
  if (canPlayVideo && videoMimeType(attachment) !== null) return "video";
  return "file";
}

type ComposerAttachmentThumbnailProps = {
  readonly environmentId?: EnvironmentId;
  readonly attachment: DraftComposerAttachment;
  readonly size: number;
  readonly borderRadius: number;
  readonly compact?: boolean;
  readonly onPressPreview?: (source: FilePreviewSource) => void;
  readonly onPressVideo?: (
    attachment: DraftComposerFileAttachment,
    sourceIdentifier: string,
  ) => void;
  readonly onPressDocument?: (attachment: DraftComposerFileAttachment) => void;
};

export function ComposerAttachmentThumbnail(props: ComposerAttachmentThumbnailProps) {
  const upload = useComposerAttachmentUploadState(props.environmentId, props.attachment.id);
  const pendingUpload = upload && upload.status !== "ready" ? upload : null;
  const isFileTile =
    !props.compact &&
    resolveAttachmentKind(props.attachment, props.onPressVideo !== undefined) === "file";
  return (
    <View style={isFileTile ? undefined : { width: props.size, height: props.size }}>
      <ComposerAttachmentContent {...props} showsUploadState={pendingUpload !== null} />
      <View
        pointerEvents="none"
        className={cn(
          "absolute inset-0 border",
          pendingUpload?.status === "failed" ? "border-danger-border" : "border-border",
        )}
        style={{ borderRadius: props.borderRadius }}
      />
      {pendingUpload ? (
        <Pressable
          accessibilityRole={pendingUpload.status === "failed" ? "button" : "text"}
          accessibilityLabel={
            pendingUpload.status === "failed"
              ? `Retry uploading ${props.attachment.name}`
              : `Uploading ${props.attachment.name}, ${Math.floor(pendingUpload.progress * 100)}%`
          }
          accessibilityHint={pendingUpload.status === "failed" ? pendingUpload.reason : undefined}
          disabled={pendingUpload.status !== "failed"}
          onPress={() =>
            props.environmentId &&
            retryComposerAttachmentUpload(props.environmentId, props.attachment.id)
          }
          className="absolute inset-x-1 bottom-1 flex-row items-center justify-center gap-0.5 rounded-full bg-sheet px-1"
        >
          <SymbolView
            name={pendingUpload.status === "failed" ? "arrow.clockwise" : "arrow.up"}
            size={props.compact ? 8 : 10}
            tintColorClassName="accent-foreground"
            type="monochrome"
          />
          {!props.compact ? (
            <Text
              className="text-center text-[11px] leading-[14px] text-foreground"
              numberOfLines={1}
            >
              {pendingUpload.status === "failed"
                ? "Retry"
                : `${Math.floor(pendingUpload.progress * 100)}%`}
            </Text>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Thumbnail URI for a draft image. File-backed previews rebase into the
 * current iOS data container (its UUID changes across installs); the raw
 * persisted URI renders meanwhile, which is correct everywhere but after a
 * container move.
 */
const PREVIEW_CACHE_DIRECTORY = "t3-composer-previews";

/**
 * Fabric re-parses an image source URL on every layout pass of the node, and a
 * multi-megabyte data URL makes each Fabric commit slow enough that concurrent
 * UI-thread commits (the question card's coverage animation) win the race every
 * time until the renderer aborts. Inline bytes are written to the cache once and
 * the thumbnail renders from that file instead.
 */
/** Roughly 192KB of base64: small enough that re-parsing it per layout stays imperceptible. */
const INLINE_PREVIEW_FALLBACK_MAX_CHARS = 256_000;

async function materializeDataUrlPreview(id: string, dataUrl: string): Promise<string | null> {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const { Directory, File, Paths } = await import("expo-file-system");
  const mimeType = /^data:([^;,]+)/.exec(dataUrl)?.[1] ?? "image/jpeg";
  const extension = (mimeType.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
  const directory = new Directory(Paths.cache, PREVIEW_CACHE_DIRECTORY);
  directory.create({ idempotent: true, intermediates: true });
  const file = new File(directory, `${id}.${extension}`);
  if (!file.exists) {
    file.create();
    await file.write(dataUrl.slice(comma + 1), { encoding: "base64" });
  }
  return file.uri;
}

/** The thumbnail source for a draft image: an owned file when there is one, never a data URL. */
function useComposerImagePreviewUri(attachment: DraftComposerImageAttachment): string | null {
  const { id, fileUri, previewUri } = attachment;
  const [rebased, setRebased] = useState<{ fileUri: string; uri: string } | null>(null);
  const [materialized, setMaterialized] = useState<{ id: string; uri: string | null } | null>(null);
  const inlinePreview = fileUri === undefined && previewUri.startsWith("data:");
  useEffect(() => {
    if (fileUri === undefined) return;
    let cancelled = false;
    void (async () => {
      const { Paths } = await import("expo-file-system");
      const owned = resolveOwnedComposerAttachmentFileUri(fileUri, Paths.document.uri);
      // Re-render only when the container actually moved.
      if (!cancelled && owned !== null && owned !== previewUri) setRebased({ fileUri, uri: owned });
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUri, previewUri]);
  useEffect(() => {
    if (!inlinePreview) return;
    let cancelled = false;
    void materializeDataUrlPreview(id, previewUri)
      .then((uri) => {
        if (!cancelled && uri !== null) setMaterialized({ id, uri });
      })
      .catch((error: unknown) => {
        console.warn("[composer-attachments] could not cache an image preview", error);
        // Record the failure so the thumbnail stops waiting on a file that will never arrive.
        if (!cancelled) setMaterialized({ id, uri: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id, inlinePreview, previewUri]);
  if (fileUri !== undefined && rebased?.fileUri === fileUri) return rebased.uri;
  if (fileUri !== undefined) return previewUri.startsWith("data:") ? fileUri : previewUri;
  if (inlinePreview) {
    if (materialized?.id !== id) return null;
    // Falling back to the data URL is a last resort: a large one re-parses on every layout and
    // starves the Fabric commit, which is what the cache file exists to avoid. Small ones are
    // cheap enough to render directly rather than leaving the thumbnail blank forever.
    return (
      materialized.uri ??
      (previewUri.length <= INLINE_PREVIEW_FALLBACK_MAX_CHARS ? previewUri : null)
    );
  }
  return previewUri;
}

function ComposerImageAttachment(
  props: ComposerAttachmentThumbnailProps & { readonly attachment: DraftComposerImageAttachment },
) {
  const { attachment } = props;
  const style = { width: props.size, height: props.size, borderRadius: props.borderRadius };
  const previewUri = useComposerImagePreviewUri(attachment);
  const sourceIdentifier = `draft-image:${attachment.id}`;
  return (
    <PresentationSource identifier={sourceIdentifier}>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`Open ${attachment.name}`}
        disabled={!props.onPressPreview}
        onPress={() =>
          props.onPressPreview?.(
            // File-backed images open through the retain-lease + container
            // rebase path; legacy drafts still carry their inline bytes.
            isFileBackedComposerAttachment(attachment)
              ? { kind: "image", attachment, name: attachment.name, sourceIdentifier }
              : {
                  kind: "image",
                  uri: attachment.dataUrl ?? attachment.previewUri,
                  name: attachment.name,
                  sourceIdentifier,
                },
          )
        }
      >
        <Image
          source={previewUri === null ? undefined : { uri: previewUri }}
          style={style}
          className="bg-card"
          resizeMode="cover"
        />
      </Pressable>
    </PresentationSource>
  );
}

function ComposerAttachmentContent(
  props: ComposerAttachmentThumbnailProps & { readonly showsUploadState: boolean },
) {
  const { attachment, showsUploadState, ...thumbnailProps } = props;
  const kind = resolveAttachmentKind(attachment, props.onPressVideo !== undefined);
  if (attachment.type === "image" || kind === "image") {
    const { source: _droppedSource, ...rest } = attachment;
    return (
      <ComposerImageAttachment
        {...thumbnailProps}
        attachment={
          attachment.type === "image"
            ? attachment
            : { ...rest, type: "image", previewUri: attachment.fileUri }
        }
      />
    );
  }
  const onPressVideo = props.onPressVideo;
  if (kind === "video" && onPressVideo) {
    return (
      <ComposerVideoAttachment
        {...thumbnailProps}
        attachment={attachment}
        onPressVideo={onPressVideo}
      />
    );
  }
  return (
    <ComposerFileAttachment
      {...thumbnailProps}
      attachment={attachment}
      showsUploadState={showsUploadState}
    />
  );
}

function ComposerFileAttachment(
  props: ComposerAttachmentThumbnailProps & {
    readonly attachment: DraftComposerFileAttachment;
    readonly showsUploadState: boolean;
  },
) {
  const { attachment } = props;
  const compactStyle = { width: props.size, height: props.size, borderRadius: props.borderRadius };
  const canPreview = isPdfFile(attachment) && props.onPressPreview !== undefined;
  const sourceIdentifier = `draft-file:${attachment.id}`;
  const onPressDocument = props.onPressDocument;
  return (
    <>
      <PresentationSource identifier={sourceIdentifier}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${attachment.name}`}
          disabled={!canPreview && onPressDocument === undefined}
          onPress={() =>
            canPreview
              ? props.onPressPreview?.({
                  kind: "pdf",
                  name: attachment.name,
                  attachment,
                  sourceIdentifier,
                })
              : onPressDocument?.(attachment)
          }
          className={
            props.compact
              ? "items-center justify-center bg-card"
              : cn(
                  "min-h-14 max-w-56 flex-row items-center gap-2 bg-card px-2.5",
                  props.showsUploadState && "pb-4",
                )
          }
          style={props.compact ? compactStyle : { borderRadius: props.borderRadius }}
        >
          <PierreEntryIcon path={attachment.name} kind="file" size={props.compact ? 15 : 18} />
          {!props.compact ? (
            <Text
              className="min-w-0 shrink text-[13px] leading-[18px] text-foreground"
              numberOfLines={1}
            >
              {attachment.name}
            </Text>
          ) : null}
        </Pressable>
      </PresentationSource>
    </>
  );
}

function ComposerVideoAttachment(props: {
  readonly attachment: DraftComposerFileAttachment;
  readonly size: number;
  readonly borderRadius: number;
  readonly compact?: boolean;
  readonly onPressVideo: (
    attachment: DraftComposerFileAttachment,
    sourceIdentifier: string,
  ) => void;
}) {
  const { attachment } = props;
  const sourceIdentifier = `draft:${attachment.id}`;
  const style = { width: props.size, height: props.size, borderRadius: props.borderRadius };
  const actionsSource = useMemo<MediaActionsSource>(
    () => ({
      name: attachment.name,
      mimeType: videoMimeType(attachment) ?? attachment.mimeType,
      sourceIdentifier,
      attachment,
    }),
    [attachment, sourceIdentifier],
  );

  return (
    <VideoAttachmentTile
      name={attachment.name}
      sourceIdentifier={sourceIdentifier}
      thumbnailSource={attachment}
      compact={props.compact}
      onPress={() => props.onPressVideo(attachment, sourceIdentifier)}
      actionsSource={actionsSource}
      style={style}
    />
  );
}

/**
 * Attachment thumbnails used by the thread composer and the new-task draft screen.
 */
export function ComposerAttachmentStrip(props: ComposerAttachmentStripProps) {
  const size = props.imageSize ?? DEFAULT_THUMBNAIL_SIZE;
  const radius = props.imageBorderRadius ?? MOBILE_RADIUS.lg;
  const removeButtonPlacement = props.removeButtonPlacement ?? "overlay";
  const isGutterPlacement = removeButtonPlacement === "gutter";
  const removeButtonGutter = isGutterPlacement ? REMOVE_BUTTON_GUTTER : 0;

  if (props.attachments.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      className="grow-0"
      contentContainerClassName={isGutterPlacement ? undefined : "pr-1.5 pt-1.5"}
    >
      <View className="flex-row gap-2">
        {props.attachments.map((attachment) => (
          <View
            key={attachment.id}
            className="relative"
            style={{
              paddingTop: removeButtonGutter,
              paddingRight: removeButtonGutter,
            }}
          >
            <ComposerAttachmentThumbnail
              environmentId={props.environmentId}
              attachment={attachment}
              size={size}
              borderRadius={radius}
              onPressPreview={props.onPressPreview}
              onPressVideo={props.onPressVideo}
              onPressDocument={props.onPressDocument}
            />
            <Pressable
              className={cn(
                "absolute size-6 items-center justify-center rounded-full border border-border bg-subtle",
                isGutterPlacement ? "top-0 right-0" : "-top-1.5 -right-1.5",
              )}
              hitSlop={8}
              onPress={() => props.onRemove(attachment.id)}
            >
              <SymbolView
                name="xmark"
                size={12}
                tintColorClassName="accent-foreground"
                type="monochrome"
                weight="bold"
              />
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
